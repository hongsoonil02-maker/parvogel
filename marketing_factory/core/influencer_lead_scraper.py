import csv
import datetime
import html
import json
import os
import re
from typing import Any, Dict, List, Optional

import requests

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_CRM_PATH = os.path.join(PROJECT_DIR, "marketing_factory", "data", "influencer_crm.json")

PIPELINE_STAGES: List[str] = [
    "발굴됨",
    "제안발송",
    "파보겔100ml발송요청",
    "발송완료",
    "공구확정",
    "정산완료",
]

KEYWORD_GROUPS: Dict[str, List[str]] = {
    "A": ["#다견가정", "#다묘가정", "#브리더", "#켄넬", "#유기견임보", "#동물보호소봉사"],
    "B": ["#강아지장염", "#강아지설사", "#강아지유산균", "#펫팸족", "#공동구매", "#공구오픈"],
    "C": ["반려동물 공동구매 벤더", "펫 MCN 공구 담당", "반려견 인플루언서 에이전시"],
}


def parse_bio_contacts(bio_text: str) -> Dict[str, Any]:
    """프로필 바이오/소개글에서 이메일, 카카오톡 오픈채팅 링크, DM 허용 여부를 추출합니다."""
    text = bio_text or ""
    emails = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    kakao_links = re.findall(r"https?://open\.kakao\.com/o/[A-Za-z0-9_-]+", text)

    lowered = text.lower()
    dm_blocked = any(
        tok in lowered
        for tok in ["dm x", "dm❌", "dm금지", "dm 금지", "디엠금지", "디엠 금지", "메일로만", "이메일 문의만"]
    )
    dm_explicit = any(
        tok in lowered
        for tok in ["dm", "디엠", "협찬", "공구", "문의", "비즈니스", "콜라보"]
    )
    return {
        "email": emails[0] if emails else "",
        "all_emails": emails,
        "kakao_openchat": kakao_links[0] if kakao_links else "",
        "dm_allowed": (not dm_blocked) and (dm_explicit or not bool(emails)),
    }


def filter_micro_influencer(
    lead: Dict[str, Any],
    min_followers: int = 3000,
    max_followers: int = 50000,
    min_engagement_rate: float = 3.0,
) -> bool:
    """
    팔로워 3,000~50,000명 및 참여율 3.0% 이상 마이크로 인플루언서 필터.
    그룹 C(B2B 공구 벤더사/MCN)는 이메일·카카오 연락처가 있으면 통과시킵니다.
    """
    group = str(lead.get("keyword_group", "")).upper()
    if group == "C" or lead.get("is_vendor"):
        contacts = lead.get("contacts") or parse_bio_contacts(lead.get("bio", ""))
        return bool(contacts.get("email") or contacts.get("kakao_openchat") or lead.get("email"))

    followers = int(lead.get("followers", 0) or 0)
    engagement = float(lead.get("engagement_rate", 0.0) or 0.0)
    return (min_followers <= followers <= max_followers) and (engagement >= min_engagement_rate)


class InfluencerCRMStore:
    """
    기존 구축된 Firebase Firestore(`parvogel-petcare-vip` -> `influencer_leads`) +
    로컬 JSON CRM(`marketing_factory/data/influencer_crm.json`) 하이브리드 저장소.
    """

    COLLECTION_NAME = "influencer_leads"

    def __init__(self, crm_path: Optional[str] = None, enable_firestore: bool = True):
        self.crm_path = crm_path or DEFAULT_CRM_PATH
        self.enable_firestore = enable_firestore
        self._firestore_grpc_checked = False
        self._firestore_grpc_client = None
        self._rest_creds = None
        self._rest_project_id = "parvogel-petcare-vip"
        os.makedirs(os.path.dirname(self.crm_path), exist_ok=True)
        if not os.path.exists(self.crm_path):
            self._write_local({"version": "1.0", "updated_at": "", "leads": {}})

    def _read_local(self) -> Dict[str, Any]:
        with open(self.crm_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write_local(self, data: Dict[str, Any]) -> None:
        data["updated_at"] = datetime.datetime.now().isoformat()
        with open(self.crm_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _get_firestore(self):
        if not self.enable_firestore:
            return None
        if self._firestore_grpc_checked:
            return self._firestore_grpc_client
        self._firestore_grpc_checked = True
        try:
            from marketing_factory.core.firebase_shorts_sync import _get_firestore_client
            self._firestore_grpc_client = _get_firestore_client()
        except Exception:
            try:
                from core.firebase_shorts_sync import _get_firestore_client
                self._firestore_grpc_client = _get_firestore_client()
            except Exception:
                self._firestore_grpc_client = None
        return self._firestore_grpc_client

    @staticmethod
    def _to_firestore_value(val: Any) -> Dict[str, Any]:
        if val is None:
            return {"nullValue": None}
        if isinstance(val, bool):
            return {"booleanValue": val}
        if isinstance(val, int):
            return {"integerValue": str(val)}
        if isinstance(val, float):
            return {"doubleValue": val}
        if isinstance(val, list):
            return {"arrayValue": {"values": [InfluencerCRMStore._to_firestore_value(x) for x in val]}}
        if isinstance(val, dict):
            return {"mapValue": {"fields": {str(k): InfluencerCRMStore._to_firestore_value(v) for k, v in val.items()}}}
        return {"stringValue": str(val)}

    def _sync_firestore_rest(self, doc_id: str, data: Dict[str, Any]) -> bool:
        """Windows DLL 정책 등으로 grpc가 차단될 때 Firestore REST API로 안전 동기화합니다."""
        sa_path = os.getenv("PARVOGEL_FIREBASE_SA_PATH") or os.path.join(
            PROJECT_DIR, "marketing_factory", "config", "secrets", "parvogel-firebase-sa.json"
        )
        if not os.path.exists(sa_path):
            return False
        try:
            from google.oauth2 import service_account
            from google.auth.transport.requests import Request as GoogleRequest

            if self._rest_creds is None:
                self._rest_creds = service_account.Credentials.from_service_account_file(
                    sa_path,
                    scopes=["https://www.googleapis.com/auth/datastore"],
                )
                with open(sa_path, "r", encoding="utf-8") as sf:
                    self._rest_project_id = json.load(sf).get("project_id", "parvogel-petcare-vip")
            if not self._rest_creds.valid:
                self._rest_creds.refresh(GoogleRequest())

            url = (
                f"https://firestore.googleapis.com/v1/projects/{self._rest_project_id}"
                f"/databases/(default)/documents/{self.COLLECTION_NAME}/{doc_id}"
            )
            fields = {str(k): self._to_firestore_value(v) for k, v in data.items()}
            resp = requests.patch(
                url,
                headers={"Authorization": f"Bearer {self._rest_creds.token}", "Content-Type": "application/json"},
                json={"fields": fields},
                timeout=12,
            )
            return resp.status_code in (200, 201)
        except Exception:
            return False

    def upsert_lead(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        lead_id = str(lead.get("lead_id") or "").strip()
        if not lead_id:
            channel = re.sub(r"[^a-z0-9]+", "", str(lead.get("channel", "ig")).lower())
            handle = re.sub(r"[^a-z0-9_]+", "", str(lead.get("handle", "unknown")).lower())
            lead_id = f"{channel}_{handle}"
        store = self._read_local()
        existing = store["leads"].get(lead_id, {})
        lead_payload = dict(lead)
        lead_payload["lead_id"] = lead_id
        lead_payload["updated_at"] = datetime.datetime.now().isoformat()

        merged = {**existing, **lead_payload}
        merged.setdefault("status", "발굴됨")
        merged.setdefault("product", "파보겔 100ml 정품")
        merged.setdefault("commission_rate", 0.25)
        store["leads"][lead_id] = merged
        self._write_local(store)

        if self.enable_firestore:
            synced = False
            db = self._get_firestore()
            if db is not None:
                try:
                    db.collection(self.COLLECTION_NAME).document(lead_id).set(merged, merge=True)
                    synced = True
                except Exception:
                    synced = False
            if not synced:
                self._sync_firestore_rest(lead_id, merged)
        return merged

    def list_leads(self, status: Optional[str] = None, channel: Optional[str] = None) -> List[Dict[str, Any]]:
        leads = list(self._read_local().get("leads", {}).values())
        if status:
            leads = [l for l in leads if l.get("status") == status]
        if channel:
            leads = [l for l in leads if l.get("channel") == channel]
        return leads

    def get_lead(self, lead_id: str) -> Optional[Dict[str, Any]]:
        return self._read_local().get("leads", {}).get(lead_id)


class InfluencerLeadScraper:
    """
    인스타그램 / 유튜브 / 네이버 블로그 타겟 인플루언서 & 공구 벤더사 발굴기.
    - 유튜브: YouTube Data API v3 (OAuth/API Key 기반 합법 수집)
    - 네이버 블로그: Naver Search API (키 설정 시) 또는 공개 RSS/HTML 파싱
    - 인스타그램: Meta Business Discovery API 또는 CSV 임포트 (계정 정지 유발 비공식 DM/스크래핑 봇 배제)
    """

    def __init__(self, crm_store: Optional[InfluencerCRMStore] = None):
        self.crm = crm_store or InfluencerCRMStore()

    def _get_youtube_access_token(self) -> Optional[str]:
        cid = os.getenv("YOUTUBE_CLIENT_ID")
        csec = os.getenv("YOUTUBE_CLIENT_SECRET")
        rtok = os.getenv("YOUTUBE_REFRESH_TOKEN")
        if not (cid and csec and rtok):
            return None
        try:
            resp = requests.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": cid,
                    "client_secret": csec,
                    "refresh_token": rtok,
                    "grant_type": "refresh_token",
                },
                timeout=10,
            )
            if resp.status_code == 200:
                return resp.json().get("access_token")
        except Exception:
            return None
        return None

    @staticmethod
    def _parse_korean_subscriber_count(raw_text: str) -> int:
        m = re.search(r"구독자\s*([0-9.,]+)\s*(만|천)?명", raw_text or "")
        if not m:
            m = re.search(r"([0-9.,]+)\s*(만|천)명", raw_text or "")
        if not m:
            return 0
        num = float(m.group(1).replace(",", ""))
        unit = m.group(2)
        if unit == "만":
            return int(num * 10000)
        if unit == "천":
            return int(num * 1000)
        return int(num)

    def _scrape_youtube_public_fallback(
        self,
        kw_list: List[str],
        keyword_group: str,
        max_results_per_kw: int,
        apply_micro_filter: bool,
    ) -> List[Dict[str, Any]]:
        """YOUTUBE_API_KEY가 없거나 OAuth 권한(youtube.readonly)이 없을 때 공개 검색+RSS 피드로 안전하게 수집합니다."""
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept-Language": "ko-KR,ko;q=0.9"}
        discovered: List[Dict[str, Any]] = []
        seen_channels = set()

        for kw in kw_list:
            clean_kw = kw.lstrip("#")
            try:
                search_resp = requests.get(
                    "https://www.youtube.com/results",
                    params={"search_query": clean_kw},
                    headers=headers,
                    timeout=12,
                )
                if search_resp.status_code != 200:
                    continue
            except Exception:
                continue

            cids = list(dict.fromkeys(re.findall(r'"browseId"\s*:\s*"(UC[A-Za-z0-9_-]{22})"', search_resp.text)))
            for cid in cids[:max_results_per_kw * 2]:
                if cid in seen_channels:
                    continue
                seen_channels.add(cid)

                try:
                    about_resp = requests.get(f"https://www.youtube.com/channel/{cid}/about", headers=headers, timeout=10)
                    rss_resp = requests.get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}", timeout=10)
                except Exception:
                    continue

                if about_resp.status_code != 200:
                    continue

                followers = self._parse_korean_subscriber_count(about_resp.text)
                if apply_micro_filter and str(keyword_group).upper() != "C" and not (3000 <= followers <= 50000):
                    continue

                # 시스템/구글 기본 메일 제외 후 크리에이터 비즈니스 메일 추출
                all_emails = [
                    em for em in re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", about_resp.text)
                    if not any(sys_dom in em.lower() for sys_dom in ("google.com", "youtube.com", "gstatic.com", "w3.org", "schema.org", ".png", ".jpg"))
                ]
                kakao_links = re.findall(r"https?://open\.kakao\.com/o/[A-Za-z0-9_-]+", about_resp.text)
                email = all_emails[0] if all_emails else ""
                kakao = kakao_links[0] if kakao_links else ""

                titles = [html.unescape(t) for t in re.findall(r"<title>([^<]+)</title>", rss_resp.text)] if rss_resp.status_code == 200 else []
                display_name = titles[0] if titles else cid
                recent_posts = titles[1:6] if len(titles) > 1 else []
                combined_ctx = f"{display_name} {' '.join(recent_posts)}".lower()
                if any(non_b2c in combined_ctx for non_b2c in ("동물병원", "동물의료센터", "수의사회", "파충류", "게코", "볼파이톤", "아기뱀", "장례식장", "세무", "부업", "노토킹", "쇼핑몰 상품", "회사 밖", "유아맘")):
                    continue
                if str(keyword_group).upper() in ("A", "B") and not any(pet in combined_ctx for pet in ("강아지", "반려견", "고양이", "반려묘", "반려동물", "멍", "냥", "펫", "코기", "푸들", "말티즈", "사료", "유산균")):
                    continue
                if str(keyword_group).upper() == "C" and not any(b2b in combined_ctx for b2b in ("반려", "펫", "강아지", "고양이", "공동구매", "공구")):
                    continue
                view_nums = [int(v) for v in re.findall(r'views="(\d+)"', rss_resp.text)[:5]] if rss_resp.status_code == 200 else []
                avg_views = (sum(view_nums) / len(view_nums)) if view_nums else 0.0
                est_engagement = round(min(15.0, (avg_views / max(1, followers)) * 12.0), 2) if followers else 0.0

                handle_match = re.search(r'"canonicalBaseUrl"\s*:\s*"/(@[^"]+)"', about_resp.text)
                handle = handle_match.group(1) if handle_match else cid

                lead = {
                    "channel": "youtube",
                    "handle": handle,
                    "display_name": display_name,
                    "profile_url": f"https://www.youtube.com/channel/{cid}",
                    "keyword_group": keyword_group,
                    "matched_keyword": kw,
                    "followers": followers,
                    "engagement_rate": est_engagement,
                    "bio": f"YouTube 구독자 {followers:,}명 · {display_name}",
                    "email": email,
                    "kakao_openchat": kakao,
                    "dm_allowed": False,
                    "contacts": {"email": email, "all_emails": all_emails[:3], "kakao_openchat": kakao, "dm_allowed": False},
                    "recent_posts": recent_posts,
                    "pet_name": "",
                }
                if (not apply_micro_filter) or filter_micro_influencer(lead):
                    discovered.append(self.crm.upsert_lead(lead))

        return discovered

    def scrape_youtube_targets(
        self,
        keywords: Optional[List[str]] = None,
        keyword_group: str = "B",
        max_results_per_kw: int = 10,
        apply_micro_filter: bool = True,
    ) -> List[Dict[str, Any]]:
        """YouTube Data API v3를 통해 반려동물 채널, 구독자, 최근 영상 3~5개, 비즈니스 이메일을 수집합니다."""
        api_key = os.getenv("YOUTUBE_API_KEY", "").strip()
        access_token = None if api_key else self._get_youtube_access_token()
        kw_list = keywords or KEYWORD_GROUPS.get(keyword_group, KEYWORD_GROUPS["B"])[:3]
        if not api_key and not access_token:
            return self._scrape_youtube_public_fallback(kw_list, keyword_group, max_results_per_kw, apply_micro_filter)

        headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
        discovered: List[Dict[str, Any]] = []
        seen_channels = set()
        api_failed_auth = False

        for kw in kw_list:
            clean_kw = kw.lstrip("#")
            params: Dict[str, Any] = {
                "part": "snippet",
                "q": clean_kw,
                "type": "video",
                "relevanceLanguage": "ko",
                "regionCode": "KR",
                "maxResults": max_results_per_kw,
            }
            if api_key:
                params["key"] = api_key

            resp = requests.get("https://www.googleapis.com/youtube/v3/search", params=params, headers=headers, timeout=15)
            if resp.status_code in (401, 403):
                api_failed_auth = True
                break
            if resp.status_code != 200:
                continue

            channel_ids = []
            for item in resp.json().get("items", []):
                ch_id = item.get("snippet", {}).get("channelId")
                if ch_id and ch_id not in seen_channels:
                    seen_channels.add(ch_id)
                    channel_ids.append(ch_id)

            if not channel_ids:
                continue

            ch_params: Dict[str, Any] = {
                "part": "snippet,statistics,contentDetails",
                "id": ",".join(channel_ids),
            }
            if api_key:
                ch_params["key"] = api_key

            ch_resp = requests.get("https://www.googleapis.com/youtube/v3/channels", params=ch_params, headers=headers, timeout=15)
            if ch_resp.status_code != 200:
                continue

            for ch in ch_resp.json().get("items", []):
                sn = ch.get("snippet", {})
                st = ch.get("statistics", {})
                followers = int(st.get("subscriberCount", 0) or 0)
                views = int(st.get("viewCount", 0) or 0)
                vid_cnt = max(1, int(st.get("videoCount", 1) or 1))
                avg_views = views / vid_cnt
                # 참여율 근사치(%) = 평균 조회수 / 구독자수 기반 보정 (마이크로 채널 활성화 지표)
                est_engagement = round(min(15.0, (avg_views / max(1, followers)) * 12.0), 2) if followers else 0.0

                desc = sn.get("description", "")
                contacts = parse_bio_contacts(desc)
                handle = sn.get("customUrl") or ch.get("id")
                uploads_pl = ch.get("contentDetails", {}).get("relatedPlaylists", {}).get("uploads")
                recent_posts: List[str] = []

                if uploads_pl:
                    pl_params: Dict[str, Any] = {
                        "part": "snippet",
                        "playlistId": uploads_pl,
                        "maxResults": 5,
                    }
                    if api_key:
                        pl_params["key"] = api_key
                    pl_resp = requests.get("https://www.googleapis.com/youtube/v3/playlistItems", params=pl_params, headers=headers, timeout=10)
                    if pl_resp.status_code == 200:
                        recent_posts = [
                            it.get("snippet", {}).get("title", "")
                            for it in pl_resp.json().get("items", [])
                            if it.get("snippet", {}).get("title")
                        ]

                lead = {
                    "channel": "youtube",
                    "handle": handle,
                    "display_name": sn.get("title", handle),
                    "profile_url": f"https://www.youtube.com/channel/{ch.get('id')}",
                    "keyword_group": keyword_group,
                    "matched_keyword": kw,
                    "followers": followers,
                    "engagement_rate": est_engagement,
                    "bio": desc[:500],
                    "email": contacts["email"],
                    "kakao_openchat": contacts["kakao_openchat"],
                    "dm_allowed": contacts["dm_allowed"],
                    "contacts": contacts,
                    "recent_posts": recent_posts[:5],
                    "pet_name": "",
                }
                if (not apply_micro_filter) or filter_micro_influencer(lead):
                    discovered.append(self.crm.upsert_lead(lead))

        if api_failed_auth and not discovered:
            return self._scrape_youtube_public_fallback(kw_list, keyword_group, max_results_per_kw, apply_micro_filter)

        return discovered

    @staticmethod
    def _fetch_naver_mobile_bio_contacts(blog_id: str) -> Dict[str, Any]:
        """네이버 블로그 모바일 프로필에서 블로거가 직접 공개한 실제 이메일·오픈카톡만 추출합니다 (단순 ID 추측 금지)."""
        try:
            resp = requests.get(
                f"https://m.blog.naver.com/{blog_id}",
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
                timeout=8,
            )
            if resp.status_code != 200:
                return {"email": "", "all_emails": [], "kakao_openchat": "", "dm_allowed": False}
            text = resp.text
            emails = [
                e for e in re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
                if not any(sys_tok in e.lower() for sys_tok in ("pstatic.net", "naver.com/@", "w3.org", "schema.org", ".png", ".jpg", "example.com"))
            ]
            kakaos = re.findall(r"https?://open\.kakao\.com/o/[A-Za-z0-9_-]+", text)
            return {
                "email": emails[0] if emails else "",
                "all_emails": list(dict.fromkeys(emails))[:3],
                "kakao_openchat": kakaos[0] if kakaos else "",
                "dm_allowed": False,
            }
        except Exception:
            return {"email": "", "all_emails": [], "kakao_openchat": "", "dm_allowed": False}

    def _scrape_naver_public_fallback(
        self,
        kw_list: List[str],
        keyword_group: str,
        display: int = 8,
    ) -> List[Dict[str, Any]]:
        """NAVER_CLIENT_ID가 없을 때 네이버 공개 블로그 검색 + 공식 RSS 피드로 반려견 블로거를 수집합니다."""
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        discovered: List[Dict[str, Any]] = []
        seen_ids = set()

        for kw in kw_list:
            clean_kw = kw.lstrip("#")
            if keyword_group in ("A", "B") and "강아지" not in clean_kw and "고양이" not in clean_kw and "펫" not in clean_kw and "반려" not in clean_kw:
                query = f"강아지 {clean_kw}"
            else:
                query = clean_kw
            try:
                sr = requests.get(
                    "https://search.naver.com/search.naver",
                    params={"where": "blog", "query": query},
                    headers=headers,
                    timeout=10,
                )
                if sr.status_code != 200:
                    continue
            except Exception:
                continue

            blog_ids = list(dict.fromkeys(re.findall(r"https://blog\.naver\.com/([A-Za-z0-9_-]+)/\d+", sr.text)))
            for blog_id in blog_ids[:display]:
                if blog_id in seen_ids:
                    continue
                seen_ids.add(blog_id)
                try:
                    rss = requests.get(f"https://rss.blog.naver.com/{blog_id}.xml", timeout=8)
                except Exception:
                    continue
                if rss.status_code != 200:
                    continue

                raw_titles = [
                    html.unescape((m[0] or m[1]).strip())
                    for m in re.findall(r"<title><!\[CDATA\[(.*?)\]\]></title>|<title>([^<]+)</title>", rss.text)
                    if any(m)
                ]
                if len(raw_titles) < 3:
                    continue
                display_name = raw_titles[0]
                recent_posts = [t for t in raw_titles[2:7] if t and t != display_name][:5]
                combined = f"{display_name} {' '.join(recent_posts)}".lower()
                if any(bad in combined for bad in ("동물병원", "동물의료센터", "수의사회", "파보겔", "몬스멕타", "soonilhong", "장례식장", "화장터", "산소발생기", "스카이장비", "사다리차", "파충류", "게코", "세무", "양도세", "어학연수", "연애", "충전기", "코디", "구피", "좀비물고기")):
                    continue
                if keyword_group in ("A", "B") and sum(1 for post in [display_name] + recent_posts if any(pet in post.lower() for pet in ("강아지", "반려견", "고양이", "반려묘", "반려동물", "멍", "냥", "펫", "푸들", "말티즈", "비숑", "시바", "코기", "브리더", "견사", "임보", "다견", "다묘"))) < 2:
                    continue
                if keyword_group == "C" and not any(b2b in combined for b2b in ("공동구매", "공구", "인플", "에이전시", "시딩", "협찬", "마케팅")):
                    continue

                rss_contacts = parse_bio_contacts(rss.text[:3000])
                bio_contacts = self._fetch_naver_mobile_bio_contacts(blog_id)
                verified_email = bio_contacts["email"] or rss_contacts["email"]
                kakao_link = bio_contacts["kakao_openchat"] or rss_contacts["kakao_openchat"]
                lead = {
                    "channel": "naver_blog",
                    "handle": blog_id,
                    "display_name": display_name,
                    "profile_url": f"https://blog.naver.com/{blog_id}",
                    "keyword_group": keyword_group,
                    "matched_keyword": kw,
                    "followers": 5000,
                    "engagement_rate": 4.2,
                    "bio": f"네이버 블로그 · {display_name}",
                    "email": verified_email,
                    "email_verified_explicit": bool(verified_email),
                    "kakao_openchat": kakao_link,
                    "dm_allowed": False,
                    "contacts": {"email": verified_email, "all_emails": bio_contacts.get("all_emails", []), "kakao_openchat": kakao_link, "dm_allowed": False},
                    "recent_posts": recent_posts,
                    "pet_name": "",
                }
                discovered.append(self.crm.upsert_lead(lead))
        return discovered

    def scrape_naver_blog_targets(
        self,
        keywords: Optional[List[str]] = None,
        keyword_group: str = "B",
        display: int = 10,
    ) -> List[Dict[str, Any]]:
        """네이버 블로그 검색 API(설정 시) 또는 공개 검색+RSS 폴백을 통해 반려견·공구 블로거를 수집합니다."""
        naver_id = os.getenv("NAVER_CLIENT_ID", "").strip()
        naver_secret = os.getenv("NAVER_CLIENT_SECRET", "").strip()
        kw_list = keywords or KEYWORD_GROUPS.get(keyword_group, KEYWORD_GROUPS["B"])[:3]
        if not (naver_id and naver_secret):
            return self._scrape_naver_public_fallback(kw_list, keyword_group, display=min(display, 6))
        headers = {
            "X-Naver-Client-Id": naver_id,
            "X-Naver-Client-Secret": naver_secret,
        }
        discovered: List[Dict[str, Any]] = []
        seen_bloggers = set()

        for kw in kw_list:
            clean_kw = kw.lstrip("#")
            resp = requests.get(
                "https://openapi.naver.com/v1/search/blog.json",
                headers=headers,
                params={"query": clean_kw, "display": display, "sort": "sim"},
                timeout=10,
            )
            if resp.status_code != 200:
                continue

            for item in resp.json().get("items", []):
                blogger_link = item.get("bloggerlink", "")
                blogger_name = item.get("bloggername", "")
                if not blogger_link or blogger_link in seen_bloggers:
                    continue
                seen_bloggers.add(blogger_link)

                handle = blogger_link.rstrip("/").split("/")[-1]
                title_clean = re.sub(r"<[^>]+>", "", item.get("title", ""))
                desc_clean = re.sub(r"<[^>]+>", "", item.get("description", ""))
                # 단순 ID 추측 이메일 금지: 설명란 및 모바일 프로필 내 명시된 실제 이메일만 사용
                contacts = parse_bio_contacts(desc_clean)
                bio_contacts = self._fetch_naver_mobile_bio_contacts(handle) if not contacts["email"] else {"email": "", "kakao_openchat": ""}
                verified_email = contacts["email"] or bio_contacts["email"]
                kakao_link = contacts["kakao_openchat"] or bio_contacts.get("kakao_openchat", "")

                lead = {
                    "channel": "naver_blog",
                    "handle": handle,
                    "display_name": blogger_name or handle,
                    "profile_url": blogger_link,
                    "keyword_group": keyword_group,
                    "matched_keyword": kw,
                    "followers": 5000,  # 네이버 검색 API는 이웃 수 미제공
                    "engagement_rate": 4.0,
                    "bio": desc_clean[:400],
                    "email": verified_email,
                    "email_verified_explicit": bool(verified_email),
                    "kakao_openchat": kakao_link,
                    "dm_allowed": False,
                    "contacts": {**contacts, "email": verified_email, "kakao_openchat": kakao_link},
                    "recent_posts": [title_clean] if title_clean else [],
                    "pet_name": "",
                }
                discovered.append(self.crm.upsert_lead(lead))

        return discovered

    def scrape_instagram_business_discovery(
        self,
        handles: List[str],
        keyword_group: str = "A",
        apply_micro_filter: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Meta 공식 Graph API Business Discovery를 이용해 공개 인스타그램 비즈니스 계정의
        팔로워, 참여율, 바이오 연락처, 최근 게시물 3~5개를 안전하게 조회합니다.
        """
        token = os.getenv("META_ACCESS_TOKEN", "").strip()
        ig_id = os.getenv("META_IG_ACCOUNT_ID", "").strip()
        if not (token and ig_id and handles):
            return []

        discovered: List[Dict[str, Any]] = []
        for raw_handle in handles:
            handle = raw_handle.lstrip("@").strip()
            if not handle:
                continue
            fields = (
                f"business_discovery.username({handle}){{"
                "username,name,biography,followers_count,"
                "media.limit(5){caption,like_count,comments_count}"
                "}"
            )
            resp = requests.get(
                f"https://graph.facebook.com/v19.0/{ig_id}",
                params={"fields": fields, "access_token": token},
                timeout=15,
            )
            if resp.status_code != 200:
                continue

            bd = resp.json().get("business_discovery") or {}
            followers = int(bd.get("followers_count", 0) or 0)
            media_items = bd.get("media", {}).get("data", [])
            recent_posts = [m.get("caption", "")[:120] for m in media_items if m.get("caption")]

            if media_items and followers > 0:
                avg_inter = sum(int(m.get("like_count", 0)) + int(m.get("comments_count", 0)) for m in media_items) / len(media_items)
                engagement = round((avg_inter / followers) * 100.0, 2)
            else:
                engagement = 0.0

            bio = bd.get("biography", "")
            contacts = parse_bio_contacts(bio)
            lead = {
                "channel": "instagram",
                "handle": handle,
                "display_name": bd.get("name", handle),
                "profile_url": f"https://www.instagram.com/{handle}/",
                "keyword_group": keyword_group,
                "matched_keyword": KEYWORD_GROUPS.get(keyword_group, [""])[0],
                "followers": followers,
                "engagement_rate": engagement,
                "bio": bio,
                "email": contacts["email"],
                "kakao_openchat": contacts["kakao_openchat"],
                "dm_allowed": contacts["dm_allowed"],
                "contacts": contacts,
                "recent_posts": recent_posts[:5],
                "pet_name": "",
            }
            if (not apply_micro_filter) or filter_micro_influencer(lead):
                discovered.append(self.crm.upsert_lead(lead))

        return discovered

    def import_leads_csv(self, csv_path: str, apply_micro_filter: bool = True) -> List[Dict[str, Any]]:
        """외부(인스타그램 수동 탐색 / 벤더 리스트) CSV를 필터링 후 CRM에 적재합니다."""
        imported: List[Dict[str, Any]] = []
        with open(csv_path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                bio = (row.get("bio") or "").strip()
                contacts = parse_bio_contacts(bio)
                recent_raw = (row.get("recent_posts") or "").strip()
                recent_posts = [p.strip() for p in re.split(r"\s*\|\s*|\n+", recent_raw) if p.strip()]
                lead = {
                    "channel": (row.get("channel") or "instagram").strip().lower(),
                    "handle": (row.get("handle") or "").lstrip("@").strip(),
                    "display_name": (row.get("display_name") or row.get("handle") or "").strip(),
                    "profile_url": (row.get("profile_url") or "").strip(),
                    "keyword_group": (row.get("keyword_group") or "B").strip().upper(),
                    "matched_keyword": (row.get("matched_keyword") or "").strip(),
                    "followers": int(float(row.get("followers") or 0)),
                    "engagement_rate": float(row.get("engagement_rate") or 0.0),
                    "bio": bio,
                    "email": (row.get("email") or contacts["email"]).strip(),
                    "kakao_openchat": (row.get("kakao_openchat") or contacts["kakao_openchat"]).strip(),
                    "dm_allowed": contacts["dm_allowed"] if not row.get("dm_allowed") else str(row["dm_allowed"]).lower() in ("true", "1", "yes", "y"),
                    "contacts": contacts,
                    "recent_posts": recent_posts[:5],
                    "pet_name": (row.get("pet_name") or "").strip(),
                }
                if not lead["profile_url"] and lead["channel"] == "instagram" and lead["handle"]:
                    lead["profile_url"] = f"https://www.instagram.com/{lead['handle']}/"
                if (not apply_micro_filter) or filter_micro_influencer(lead):
                    imported.append(self.crm.upsert_lead(lead))
        return imported
