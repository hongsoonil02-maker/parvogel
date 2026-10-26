#!/usr/bin/env python3
"""
Content Formatter — 파보겔(Parvogel) 8대 채널별 최적화 포매터
- 각 채널의 규격과 알고리즘에 맞춘 자동 텍스트 & 해시태그 변환
- 네이버 스마트스토어 및 쿠팡 로켓배송 전용 UTM 어트리뷰션 자동 주입
- 숏폼 비디오(쇼츠/릴스/틱톡) 메타데이터 및 핀 고정 댓글 생성
"""

import os
import sys
import json
from datetime import datetime
from typing import List, Dict, Any

# UTF-8 출력 보장
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(FACTORY_DIR, "data")
CONFIG_DIR = os.path.join(FACTORY_DIR, "config")
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

try:
    from .humanizer_engine import BlogHumanizer
except (ImportError, ValueError):
    from core.humanizer_engine import BlogHumanizer

try:
    from .threads_generator import ThreadsContentGenerator
except (ImportError, ValueError):
    from core.threads_generator import ThreadsContentGenerator


class ParvogelContentFormatter:
    """8대 채널별 맞춤형 포맷팅 및 트래픽 유도 링크 주입기"""

    def __init__(self):
        self.config = self._load_json(os.path.join(CONFIG_DIR, "channels_config.json"))
        self.keywords = self._load_json(os.path.join(DATA_DIR, "keywords_seo.json"))
        self.papers_data = self._load_json(os.path.join(DATA_DIR, "scientific_papers.json"))
        
        self.landing_base = self.config.get("site_landing_url", "https://parvogel.kr/")
        self.smartstore_base = self.config.get("smartstore_url", "https://smartstore.naver.com/petschury/products/13718496355")
        self.coupang_base = self.config.get("coupang_url", "https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090")

    def _load_json(self, path: str) -> Dict[str, Any]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def _build_utm_links(self, channel: str, theme_id: str = "daily") -> Dict[str, str]:
        """채널별·테마별 UTM 추적 파라미터가 결합된 구매 및 B2B 무료샘플 링크 생성"""
        from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
        ch_lower = channel.lower().replace(" ", "_").replace("(", "").replace(")", "")
        def _append(base: str, extra: Dict[str, str] = None) -> str:
            parsed = urlparse(base)
            qs = dict(parse_qsl(parsed.query))
            qs.update({
                "utm_source": ch_lower,
                "utm_medium": "auto_factory",
                "utm_campaign": "parvogel_2040_d2c",
                "utm_content": theme_id or "daily"
            })
            if extra:
                qs.update(extra)
            new_q = urlencode(qs)
            return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_q, parsed.fragment))
        return {
            "landing": _append(self.landing_base),
            "smartstore": _append(self.smartstore_base),
            "coupang": _append(self.coupang_base),
            "b2b_sample": _append(self.landing_base, {"sample": "petshop"}),
            "b2b_breeder": _append(self.landing_base, {"sample": "breeder"}),
            "b2b_wholesale": _append(self.landing_base, {"sample": "b2b"})
        }

    def format_all_channels(self, narrative: Dict[str, Any]) -> Dict[str, Any]:
        """모든 활성 채널 포맷 일괄 생성"""
        return {
            "Telegram": self._format_telegram(narrative),
            "Discord": self._format_discord(narrative),
            "Twitter_X": self._format_twitter(narrative),
            "Naver_Blog": self._format_naver_blog(narrative),
            "YouTube_Shorts": self._format_youtube_shorts(narrative),
            "Instagram_Reels": self._format_instagram_reels(narrative),
            "Facebook_Page": self._format_facebook_page(narrative),
            "TikTok": self._format_tiktok(narrative),
            "Threads": self._format_threads(narrative),
            "LinkedIn_B2B": self._format_linkedin(narrative),
            "Clinic_Cold_DM": self._format_cold_dm(narrative)
        }

    # Facebook 페이지 포맷팅
    def _format_facebook_page(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("facebook_page", n.get("theme_id", "daily"))
        tags = " ".join(self.keywords.get("hashtags", {}).get("b2c_general", [])[:6])
        text = f"""🐾 {n.get('headline')}

{n.get('subheadline')}

✅ 1초 원터치 펌프 급여: 주사기 거부하는 아이도 스트레스 없이 안전 케어!
✅ 1-deoxinojirimycin 특허성분 + 천연 몬모릴로나이트 장 점막 실크 코팅
✅ 급여 3일 만에 그릇까지 싹싹 핥아먹는 기적의 식욕 회복!

📹 7일간의 무편집 회복 영상 & 무료 샘플 안내: {links['landing']}
🚀 쿠팡 로켓배송 즉시 구매: {links['coupang']}
🟢 네이버 스마트스토어 구매: {links['smartstore']}

{tags}"""
        return {
            "title": n.get('headline', '파보겔 1초 펌프 장 케어'),
            "caption": text,
            "text": text,
            "links": links
        }

    # TikTok 포맷팅
    def _format_tiktok(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("tiktok", n.get("theme_id", "daily"))
        tags = "#파보겔 #강아지설사 #고양이설사 #새끼강아지 #반려동물상비약 #shorts"
        title = f"{n.get('headline', '55일령 아기 강아지의 기적')} {tags}"[:150]
        return {
            "title": title,
            "links": links
        }

    # Threads(스레드) 포맷팅 — 링크 없는 본문 + 90초 지연 첫댓글 전환 타래
    def _format_threads(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("threads", n.get("theme_id", "daily"))
        try:
            gen = ThreadsContentGenerator()
            thread_data = gen.generate_single_thread()
            if thread_data:
                thread_data["links"] = links
                return thread_data
        except Exception:
            pass

        headline = n.get("headline", "새끼 강아지 설사한다고 무작정 굶기는 집사들, 제발 멈춰라.")
        main_post = f"""{headline}

성견이야 반나절 금식이 장을 쉬게 해줄 수 있지만, 2~3개월 새끼나 소형견은 12시간만 굶어도 저혈당 쇼크로 위험해질 수 있습니다.

장벽을 부드럽게 코팅해주면서 전해질과 장내 독소만 물리적으로 흡착 배출해주는 상비 케어가 필수입니다.

월령별 안심 금식 가이드와 응급 상비 정보는 아래 첫 댓글에 남겨둘게요."""

        first_comment = f"""DM 문의가 많아서 바로 보실 수 있게 남겨둡니다.

간·신장 부담 없이 전해질 보충과 장 점막 보호를 돕는 초미세 나노 몬모릴로나이트 겔(파보겔)입니다.

👉 파보겔 공식 스토어: {links['smartstore']}
(아이 체온이 떨어지거나 기립이 어려우면 지체 없이 응급 병원으로 가셔야 합니다.)"""

        return {
            "content_id": f"thread_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "main_post": main_post.strip(),
            "first_comment": first_comment.strip(),
            "delay_seconds": 90,
            "links": links
        }

    # 1. 텔레그램 (실시간 공지)
    def _format_telegram(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("telegram", n.get("theme_id", "daily"))
        # 텔레그램 봇 API의 특정 오픈마켓 도메인 스팸필터(PEER_FLOOD) 회피를 위해 공식 랜딩 구매 안내 링크 사용
        telegram_coupang_link = f"{self.landing_base}?target=coupang&utm_source=telegram&utm_medium=auto_factory&utm_campaign=parvogel_2040_d2c"
        tags = " ".join(self.keywords.get("hashtags", {}).get("b2c_general", [])[:5])
        msg = f"""🚨 *[긴급 케어 속보]* {n.get('headline')}

💡 *{n.get('badge', '파보겔 1초 펌프 장 케어')}*
{n.get('subheadline')}

⚠️ *보호자가 반드시 알아야 할 골든타임:*
{n.get('pain_point')}

🛡️ *파보겔 핵심 케어 기전:*
• 1-deoxinojirimycin & 특허균주(Patent No. 2011B0042620.8)
• 초미세 몬모릴로나이트 장 점막 즉각 물리적 코팅 (체내 흡수 0%)
• 주사기 없이 원터치 펌프 1초 급여 (스트레스 0)

📹 *실제 7일 무편집 직캠 & 펫샵/브리더 무료샘플 확인:*
{links['landing']}

🛒 *공식 직영 구매처 (익일 특급 수령):*
🟢 네이버 스마트스토어: {links['smartstore']}
🚀 쿠팡 로켓배송: {telegram_coupang_link}

{tags}
"""
        return {"content": msg.strip(), "links": links}

    # 2. 디스코드 (웹훅 임베드용)
    def _format_discord(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("discord", n.get("theme_id", "daily"))
        return {
            "title": f"🐾 {n.get('headline')}",
            "description": f"**{n.get('subheadline')}**\n\n{n.get('video_highlight')}",
            "fields": [
                {"name": "⚠️ 위급 증상 & 고민", "value": n.get('pain_point')[:200], "inline": False},
                {"name": "🔬 1초 펌프 솔루션", "value": n.get('clinical_solution')[:200], "inline": False},
                {"name": "🛒 즉시 구매 & 무료샘플", "value": f"[네이버 스마트스토어]({links['smartstore']}) | [쿠팡 로켓배송]({links['coupang']}) | [펫샵·브리더 무료샘플]({links['b2b_sample']})", "inline": False}
            ],
            "color": 0x10b981,
            "url": links["landing"],
            "links": links
        }

    # 3. 트위터 / X (스레드)
    def _format_twitter(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("twitter", n.get("theme_id", "daily"))
        tags = " #파보겔 #강아지설사 #고양이설사 #쿠팡로켓배송"
        
        tweet1 = f"""🚨 {n.get('headline')}

{n.get('pain_point', '')[:110]}...

주사기 실랑이 없이 1초 만에 해결하는 홈 케어 비결을 공개합니다. 👇 (1/3)"""

        tweet2 = f"""💡 주사기 없이 입가에 대고 1초 펌프 누르면 꿀꺽!

• 1-deoxinojirimycin + Patent No. 2011B0042620.8
• 초미세 몬모릴로나이트의 장 점막 실크 코팅 (체내 흡수 0%)
• 급여 3일 만에 밥그릇까지 싹싹 핥아먹는 기적의 식욕 회복! 👇 (2/3)"""

        tweet3 = f"""📹 55일령 아기 푸들의 7일간 무편집 회복 영상 & 펫샵/브리더 무료샘플 확인:
{links['landing']}

🛒 쿠팡 로켓배송: {links['coupang']}
🟢 네이버 스마트스토어: {links['smartstore']}
{tags} (3/3)"""

        return {
            "thread": [tweet1, tweet2, tweet3],
            "first_tweet": tweet1,
            "links": links
        }

    # 4. 네이버 블로그 (C-Rank / D.I.A.+ / GEO AI브리핑 최적화 5단계 전문 포스팅)
    def _format_naver_blog(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("naver_blog", n.get("theme_id", "daily"))
        
        # 요일별 동적 GEO 키워드 및 토픽 연동
        geo_keyword = n.get("geo_keyword", "강아지 파보 장염 초기증상")
        geo_topic = n.get("geo_topic", "급성 설사 대처 및 파보겔을 활용한 장 점막 보호 관리")
        sub_keywords = n.get("sub_keywords", ["강아지 설사", "파보겔", "몬모릴로나이트"])
        all_keywords = list(dict.fromkeys([geo_keyword] + sub_keywords + self.keywords.get("search_intent_groups", {}).get("emergency_care", [])[:3]))
        keywords_str = ", ".join(all_keywords[:6])

        badge = n.get('badge', '임상 수의학 리포트')
        headline = n.get('headline', f"{geo_keyword}: {geo_topic}")
        title = f"[{badge}] {geo_keyword}: {geo_topic}"
        pain_point = n.get('pain_point', f'{geo_keyword} 상황에서 갑작스러운 수양성 설사와 기력 저하로 보호자의 불안감이 극에 달하는 순간입니다.')
        clinical_solution = n.get('clinical_solution', '초미세 나노 몬모릴로나이트와 특허균주 복합체가 장 점막을 즉시 물리적으로 실크 코팅합니다.')

        post_content = f"""# {title}

{n.get('subheadline', f'동물병원 응급 내원 전 보호자가 반드시 확인해야 할 {geo_keyword} 골든타임 응급처치 수칙')}

---

## 1. {geo_keyword} 발생 시 즉시 체크해야 할 3대 위험 신호
**{geo_keyword} 상황에서 가장 먼저 무엇을 확인해야 할까요?** 단순 식이성 설사와 응급 바이러스 장염을 구분하는 기준은 '탈수 속도와 활력'이며, 보호자는 즉시 3대 생체 징후를 체크해야 합니다.

{pain_point}
어린 강아지나 소형견은 체내 수분량이 적어 단 몇 시간의 수양성 설사(Bristol Stool Scale Type 7)만으로도 치명적인 순환 혈액량 감소를 겪을 수 있습니다.

> 🩺 **[가정 내 1분 자가진단 3대 체크포인트]:**
> 1. **피부 텐팅(Skin Turgor) 탈수 검사:** 등덜미 피부를 살짝 잡아당겼다 놓았을 때 1초 이내로 즉시 원복되지 않고 서서히 내려간다면 중등도 이상의 탈수 상태입니다.
> 2. **잇몸 점막 색 & 모세혈관 재충만 시간(CRT):** 잇몸을 손가락으로 눌렀다 뗄 때 창백한 흰색에서 선홍색으로 돌아오는 시간이 2초 이상 걸린다면 말초 순환 저하를 의미합니다.
> 3. **직장 체온 확인:** 체온이 39.5℃ 이상 고열이거나 37.5℃ 이하 저체온으로 떨어진다면 즉각적인 응급 처치가 필요합니다.

[사진/영상 배치 지점 1: 탈수 피부 텐팅 검사 및 잇몸 CRT 진료실 실사]

---

## 2. 수의학적 병태생리: 융모(Villi) 파괴와 단순 금식의 치명적 위험
**설사한다고 무작정 하루 종일 굶기는 것이 과연 안전할까요?** 성견의 일시적 소화기 휴식과 달리, 2~3개월령 자견이나 소형견은 장기간 금식 시 장 융모 위축과 치명적인 저혈당 쇼크를 유발할 수 있습니다.

파보바이러스나 병원성 세균은 장 상피세포의 기저부(Crypt)를 공격하여 영양분을 흡수하는 융모(Villi)를 깎아내고 점막 장벽을 무너뜨립니다. 이로 인해 장관 내 삼투압이 무너지며 체액과 혈액이 장강으로 쏟아져 나오는 수양성 설사(Bristol Type 7)가 발생합니다.

- **단순 맹물 급여의 위험:** 장 상피세포가 파괴된 상태에서 맹물만 강제로 급여하면 장내 삼투압 불균형이 심화되어 오히려 설사가 더 뿜어져 나오는 '삼투성 설사 악화'가 일어납니다.
- **가루약 투약 스트레스:** 구토 반사가 올라온 아이에게 가루약이나 강제 주사기 피딩을 시도하면 기도로 넘어가는 흡인성 폐렴이나 극심한 거품 토해냄 쇼크가 발생할 수 있습니다.

---

## 3. 파보겔(ParvoGel)의 과학적 작용 메커니즘과 체중별 급여 기준표
**파보겔은 화학 지사제와 무엇이 다르며 장을 어떻게 보호할까요?** 화학적으로 장 운동을 억지로 마비시키는 것이 아니라, 체내 흡수율 0%의 초미세 나노 몬모릴로나이트가 짓무른 장 점막에 물리적 실크 코팅막을 형성하여 독소와 바이러스 부산물만 자석처럼 흡착 배출합니다.

{clinical_solution}
- **체내 흡수 0%의 안전성:** 혈액이나 간·신장으로 대사되지 않고 장관 내에서만 물리적으로 작용한 뒤 대변과 함께 100% 안전하게 배출됩니다.
- **1-deoxinojirimycin (DNJ) & Patent No. 2011B0042620.8 특허균주:** 장내 유해 세균 증식을 억제하고 장내 미생물총 정상화를 지원합니다.
- **1초 에어리스 오일펌프:** 쓴맛 없는 고기호성 겔 제형으로, 주사기 없이 입가에 대고 가볍게 1초만 펌핑해주면 스스로 핥아먹습니다.

### 📋 [파보겔 체중별 1일 권장 급여량 기준표]
(1펌핑 = 약 2ml 기준)

| 반려동물 구분 / 체중 | 1일 권장 급여량 | 1회 권장 펌핑 횟수 | 급여 팁 및 관리 요령 |
| :--- | :---: | :---: | :--- |
| **초소형견 (1kg 미만 ~ 3kg)** | 1 ~ 2 ml | 1회 (0.5 ~ 1펌프) | 입가에 톡 발라주거나 주둥이에 도포 |
| **소형견 (3kg ~ 5kg)** | 2 ~ 4 ml | 1 ~ 2회 펌핑 | 아침·저녁 1펌프씩 2회 분할 급여 |
| **중·대형견 (5kg ~ 15kg 이상)** | 4 ~ 8 ml | 2 ~ 4회 펌핑 | 체중 5kg당 2~4ml 비례 급여 |
| **고양이 (전 연령)** | 1 ~ 2 ml | 1회 펌핑 | 잇몸 또는 앞발에 살짝 묻혀주면 자가 완식 |

[사진/영상 배치 지점 2: 파보겔 실물 펌핑 장면 및 체중별 급여 사진]

---

## 4. 임상 케이스 관찰 흐름 & 동물병원 응급 내원 골든타임
**파보겔 급여 후 분변 상태는 어떻게 회복되며, 언제 즉시 병원으로 달려가야 할까요?** 실제 임상 현장에서는 급여 24~48시간 내에 수양성 설사(Type 7)가 연변(Type 6)을 거쳐 3일 차에 식욕을 회복하고 단단한 유구형 정상변(Type 3~4)으로 전환되는 케이스가 다수 확인됩니다.

> 📅 **[실제 55일령 토이푸들(0.6kg) 회복 관찰 일지]:**
> - **1일 차:** 기립 불능, 수양성 설사 -> 파보겔 1초 펌프 급여 후 탈수 방지 안정화
> - **3일 차:** 복통 경감, 구토 반사 멈춤, 캔사료 밥그릇 싹싹 비워내며 기력 회복
> - **7일 차:** 단단한 정상 황금변 형성, 네 발로 활발히 보행하며 퇴원 판정

🚨 **[즉시 24시 동물병원 응급실로 가야 하는 3대 레드 플래그]:**
1. **출혈성 구토 동반:** 설사뿐 아니라 커피색 또는 붉은 피를 토하는 경우
2. **저체온증:** 체온계 측정 시 37.5℃ 미만으로 체온이 떨어지고 사지가 차가운 경우
3. **완전 기립 불능:** 이름을 불러도 반응이 없고 고개를 들지 못하는 혼수 상태

---

## 5. 💡 핵심 3줄 요약 (네이버 AI 브리핑 스니펫)
> 1. {geo_keyword} 대처 시 무작정 굶기면 저혈당 쇼크 위험이 있으므로, 탈수 징후를 체크하고 장 점막을 보호하는 응급 상비 대처가 필수적입니다.
> 2. 파보겔(ParvoGel)은 체내 흡수 0%의 초미세 나노 몬모릴로나이트 복합체로 장벽을 실크 코팅하고 유해 독소를 물리적으로 흡착 배출하는 1초 펌프 상비약입니다.
> 3. 출혈성 구토, 체온 37.5℃ 미만 저체온, 기립 불능 등 3대 위험 신호가 동반될 경우 지체 없이 24시 동물병원 응급 진료를 병행해야 합니다.

---

### 🏥 파보겔 공식 정보 및 상비 안내
- 🟢 **네이버 스마트스토어 공식몰**: {links['smartstore']}
- 🚀 **쿠팡 로켓배송 즉시 구매**: {links['coupang']}
- 📹 **하남 사랑동물병원 김동준 원장 7일 회복 직캠 확인**: {links['landing']}
- 🏢 **전국 인허가 펫샵·브리더 본품 1병 무료 샘플 신청**: {links['b2b_sample']}

*연관 검색어 키워드: {keywords_str}*
"""
        raw_draft = {
            "title": title,
            "body": post_content.strip(),
            "links": links
        }

        # 수의학 학술 논문 및 공인 특허 인용 리스트 결합
        citations = []
        if self.papers_data and "papers" in self.papers_data:
            for p in self.papers_data.get("papers", []):
                fmt = p.get("blog_citation_format")
                if fmt:
                    citations.append(fmt)

        # AI 기계적 문체 제거 및 논문 출처 박스 결합
        return BlogHumanizer.enhance_naver_draft(raw_draft, paper_citations=citations)

    # 5. 유튜브 쇼츠 메타데이터
    def _format_youtube_shorts(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("youtube_shorts", n.get("theme_id", "daily"))
        title = n.get('headline', '0.6kg 아기 강아지가 7일 만에 일어선 기적')[:100]
        description = f"""{n.get('subheadline', '쓰러진 55일령 강아지의 기적의 7일 회복 실화 직캠!')}
주사기 없이 1초 펌프로 입안에 꿀꺽!

📹 풀영상 & 펫샵/브리더 무료샘플 확인: {links['landing']}
🚀 쿠팡 로켓배송: {links['coupang']}
🟢 네이버 스마트스토어: {links['smartstore']}

#파보겔 #강아지설사 #고양이설사 #토이푸들 #새끼강아지 #shorts #반려동물상비약"""
        return {
            "title": title,
            "description": description[:5000],
            "pinned_comment": f"우리 아이 급성 물설사 골든타임 파보겔 1초 케어! 쿠팡 로켓배송으로 내일 아침 도착: {links['coupang']} | 펫샵·브리더 1병 무료샘플: {links['b2b_sample']}",
            "tags": ["파보겔", "강아지설사", "고양이설사", "토이푸들", "새끼강아지", "shorts", "반려동물상비약"],
            "links": links
        }

    # 6. 인스타그램 릴스
    def _format_instagram_reels(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("instagram_reels", n.get("theme_id", "daily"))
        tags = " ".join(self.keywords.get("hashtags", {}).get("b2c_general", []) + self.keywords.get("hashtags", {}).get("b2c_story", []))
        caption = f"""옆으로 쓰러져 발작하던 55일령 아기 강아지.. 
김동준 원장님의 7일간의 진료실 직캠 기록 📹

주사기 들이대면 거품 물고 거부하는데, 
파보겔은 입가에 대고 1초 펌프 누르니까 꿀꺽 삼키네요!

투약 3일 차에 캔사료를 그릇까지 싹싹 핥아먹더니 
7일 만에 네 발로 씩씩하게 걸어서 완치 퇴원했습니다 🐾

프로필 링크에서 7일간 무편집 원본 직캠을 확인하세요! 
👉 @parvogel_official

구매처 안내:
🚀 쿠팡 로켓배송 / 🟢 네이버 스마트스토어 (펫츄리)

.
.
.
{tags}
"""
        return {"caption": caption.strip(), "links": links}

    # 7. 링크드인 (수의학 B2B)
    def _format_linkedin(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("linkedin_b2b")
        text = f"""[Clinical Case Study: Canine Acute Enteritis & Seizure Recovery]

Subject: 55-day-old male Toy Poodle (0.6 kg)
Presenting Condition: Severe hemorrhagic enteritis, endotoxin shock, and generalized seizures.
Clinical Observation by Dr. Dong-jun Kim (Hanam Sarang Animal Hospital).

Therapeutic Protocol:
- Oral administration of Parvo Gel (Parvogel) via one-touch pump.
- Key Actives: 1-deoxinojirimycin (DNJ), Bacillus subtilis MORI (Patent No. 2011B0042620.8), and ultra-fine Montmorillonite mucosal protectant.

Key Outcomes:
1. Cessation of generalized seizures and neurological stabilization within 48h.
2. Complete restoration of appetite (full meal consumption) on Day 3 post-administration.
3. Full quadrupedal weight-bearing ambulation and discharge clearance on Day 7.

Learn more about Parvo Gel veterinary formulation & clinical data:
{links['landing']}

#VeterinaryMedicine #CanineEnteritis #Parvovirus #ClinicalCase #AnimalHealth #ParvoGel"""
        return {"content": text.strip(), "links": links}

    # 8. 전국 인허가 펫샵 · 전문 브리더(켄넬) B2B 모바일 메시지 (LMS / 카카오 알림톡 최적화)
    def _format_cold_dm(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("petshop_breeder_b2b", n.get("theme_id", "b2b"))
        badge = n.get('badge', '🏢 펫샵 · 브리더 파트너 라운지')
        l1 = n.get('line1', '분양 직후·이유기 아기 강아지 설사 비상!')
        l2 = n.get('line2', '견사와 매장에 상비하는 1초 펌프 장 케어')
        l3 = n.get('line3', '인허가 사업자 본품 1병 무료 샘플 지원')

        letter = f"""[펫샵·브리더 대표님 전용] 아기 강아지·고양이 1초 펌프 장 케어 '파보겔' 본품 1병 무료 샘플 지원 안내

대표님 안녕하십니까, (주)한국아그로 파보겔 B2B 파트너팀입니다.

이유식 전환기나 분양 직후 낯선 환경 스트레스로 발생하는 아기 강아지·고양이의 급성 물설사·장염 케어를 위해, 주사기 실랑이 없이 입가에 1초 톡 짜주면 스스로 핥아먹는 [파보겔(ParvoGel)] 정품 1병 무료 체험 캠페인을 진행하고 있습니다.

📌 [{badge}]
- {l1}
- {l2}
- {l3}

💡 [전국 펫샵·켄넬 대표님들이 파보겔을 선택하신 이유]:
1. [주사기 스트레스 ZERO]: 가루약 거품 토해냄 없이 오일펌프로 1초 만에 급여 완료!
2. [체내 흡수 0% 안전성]: 생후 30일령 초소형 자견·자묘도 간·신장 부담 없이 안심 급여
3. [과학적 특허 조성물]: 1-deoxinojirimycin(DNJ) + 특허 제2011B0042620.8호 유익균 + 초미세 나노 몬모릴로나이트
4. [매장 홍보물 100% 무상 지원]: 상호명·연락처가 인쇄된 A4 알림판 및 하드 폼보드 POP 쇼카드 무료 발송

🎁 [인허가 펫샵·브리더 본품 1병 무료 샘플 즉시 신청]:
👉 {links['b2b_sample']}

📦 [기존 샘플 수령 거래처 VIP 도매 발주 (10병/50병 특가)]:
👉 {links['b2b_wholesale']}

고객센터: 02-6949-5708 / 010-5407-5708
(주)한국아그로 파보겔 파트너팀 드림"""
        return {"content": letter.strip(), "links": links}


if __name__ == "__main__":
    formatter = ParvogelContentFormatter()
    sample_narrative = {
        "headline": "새벽에 아기 강아지가 피똥 싸고 쓰러졌을 때: 골든타임 72시간 대처법",
        "subheadline": "쓰러진 55일령 강아지의 기적의 7일 회복 실화 — 1초 펌프로 입안에 꿀꺽!",
        "pain_point": "급성 장염과 탈진으로 쓰러진 아기 강아지, 가루약을 억지로 먹이다 거품을 물 때 보호자의 가슴은 무너집니다.",
        "clinical_solution": "파보겔은 1-deoxinojirimycin과 특허균주(Patent No. 2011B0042620.8) 성분이 무너진 장 점막을 즉시 코팅합니다.",
        "video_highlight": "김동준 원장님 직캠 속 주사기 없이 한 손 펌핑으로 꿀꺽 삼키는 감동의 순간.",
        "cta_text": "네이버 스마트스토어 및 쿠팡 로켓배송으로 내일 아침 즉시 받아보세요."
    }
    res = formatter.format_all_channels(sample_narrative)
    print("Formatted channels:", list(res.keys()))
    print("\n--- SAMPLE TELEGRAM ---")
    print(res["Telegram"]["content"][:300])
