#!/usr/bin/env python3
"""
Custom Flagship Video Auto-Distribution Pipeline
- Routes finished custom videos (9:16 + 16:9) directly through Parvogel's
  verified marketing_factory adapters (YouTube Shorts, Instagram Reels,
  Facebook Page, TikTok, Bluesky, Discord, Naver Blog Hybrid Queue).
- Enforces strict Korea Agro / ParvoGel brand isolation (blocks any SNJ / Monsmecta leakage).
- Uploads YouTube Shorts first so the real live URL is automatically injected into
  downstream social posts, blog queue items, and Aligo LMS campaign manifests.
"""

import os
import sys
import json
import time
import shutil
import subprocess
from datetime import datetime
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_DIR = os.path.dirname(FACTORY_DIR)
sys.path.insert(0, FACTORY_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_DIR, ".env"))
load_dotenv(os.path.join(FACTORY_DIR, ".env"), override=True)

from core.queue_server import push_post_to_queue
from core.dashboard_service import DashboardService
from adapters.youtube_adapter import YouTubeAdapter
from adapters.instagram_adapter import InstagramAdapter
from adapters.facebook_adapter import FacebookAdapter
from adapters.tiktok_adapter import TikTokAdapter
from adapters.bluesky_adapter import BlueskyAdapter
from adapters.discord_adapter import DiscordAdapter
from adapters.threads_adapter import ThreadsAdapter
from adapters.file_draft_adapter import FileDraftAdapter

DATA_DIR = os.path.join(FACTORY_DIR, "data")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")
DRAFTS_DIR = os.path.join(FACTORY_DIR, "drafts")
LEDGER_PATH = os.path.join(DATA_DIR, "published_ledger.json")
CAMPAIGN_STATE_PATH = os.path.join(OUTPUT_DIR, "golden_time_deploy_result.json")

OFFICIAL_LINKS = {
    "landing": "https://parvogel.kr",
    "smartstore": "https://smartstore.naver.com/petschury/products/13718496355",
    "coupang": "https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090",
}

FORBIDDEN_BRAND_TOKENS = [
    "에스앤제이",
    "031-321-6562",
    "0313216562",
    "080-881-1289",
    "0808811289",
    "monsmecta",
    "몬스멕타",
    "몽모릴로나이트",
]


def assert_brand_isolation(text_blob: str, context: str = "payload"):
    lowered = text_blob.lower()
    for token in FORBIDDEN_BRAND_TOKENS:
        if token.lower() in lowered:
            raise ValueError(f"[BRAND GUARD VIOLATION] Forbidden token '{token}' detected in {context}!")


def probe_media(video_path: str) -> Dict[str, Any]:
    if not video_path or not os.path.exists(video_path):
        raise FileNotFoundError(f"Video not found: {video_path}")
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "stream=width,height,codec_type,sample_rate,channels",
        "-show_entries", "format=duration,size",
        "-of", "json",
        video_path,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {video_path}: {res.stderr}")
    data = json.loads(res.stdout)
    streams = data.get("streams", [])
    v = next((s for s in streams if s.get("codec_type") == "video"), {})
    a = next((s for s in streams if s.get("codec_type") == "audio"), {})
    fmt = data.get("format", {})
    return {
        "width": int(v.get("width", 0)),
        "height": int(v.get("height", 0)),
        "has_audio": bool(a),
        "sample_rate": a.get("sample_rate"),
        "channels": a.get("channels"),
        "duration": float(fmt.get("duration", 0)),
        "size_mb": round(os.path.getsize(video_path) / (1024 * 1024), 2),
    }


def load_ledger() -> List[Dict[str, Any]]:
    if os.path.exists(LEDGER_PATH):
        try:
            with open(LEDGER_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_ledger(ledger: List[Dict[str, Any]]):
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(ledger, f, indent=2, ensure_ascii=False)


def default_golden_time_campaign() -> Dict[str, Any]:
    video_dir = r"C:\Users\master\OneDrive\동영상"
    v_916 = os.path.join(video_dir, "파보겔_기적의골든타임_애니메이션다큐_35초_쇼츠(9x16).mp4")
    v_169 = os.path.join(video_dir, "파보겔_기적의골든타임_애니메이션다큐_35초(16x9).mp4")
    return {
        "campaign_id": "PARVOGEL_GOLDEN_TIME_ANIM_DOCU_35S",
        "title": "한밤중 피설사·구토 골든타임 35초 다큐 | 우리 아이 비상 상비약 파보겔",
        "video_916": v_916,
        "video_916_url": "https://parvogel.kr/assets/parvogel_golden_time_35s_9x16.mp4",
        "video_169": v_169,
        "youtube_title": "🚨 한밤중 피설사·구토 골든타임! 15분 만에 찾아온 기적 🐾 파보겔 #shorts",
        "youtube_description": (
            "병원 문이 닫힌 깊은 밤, 갑작스러운 구토와 피설사로 당황하셨던 적 있으신가요?\n"
            "응급실 가기 전 1분 1초가 소중한 골든타임을 지켜주는 가정 내 필수 1차 비상 상비약 '파보겔'의 35초 다큐멘터리입니다.\n\n"
            "🧲 체내 흡수 0%! 초미세 나노 몬모릴로나이트 장 점막 코팅 & 독소 선택 흡착\n"
            "🐾 달콤한 기호성 + 주사기 없는 1초 원터치 펌프로 스트레스 없는 급여\n\n"
            f"▶ 공식 안내/신청 (주)한국아그로: {OFFICIAL_LINKS['landing']}\n"
            f"▶ 네이버 스마트스토어: {OFFICIAL_LINKS['smartstore']}\n"
            f"▶ 쿠팡 로켓배송: {OFFICIAL_LINKS['coupang']}\n"
            "☎ 고객센터: 02-6949-5708 ((주)한국아그로)\n\n"
            "#파보겔 #강아지설사 #강아지혈변 #강아지구토 #파보장염 #반려견상비약 #강아지응급처치 #shorts"
        ),
        "youtube_tags": ["파보겔", "강아지설사", "강아지혈변", "파보장염", "반려견상비약", "몬모릴로나이트", "한국아그로", "shorts"],
        "reels_caption": (
            "🚨 한밤중 갑자기 시작된 피설사와 구토… 응급실 문은 닫혔고, 아이는 점점 차가워질 때.\n\n"
            "서랍 속 비상 상비약 '파보겔'을 먹였습니다.\n"
            "🧲 체내 흡수 0% 고순도 나노 몬모릴로나이트 장 점막 물리 코팅\n"
            "✨ 15분 만에 복통 완화 & 다음 날 아침 기적처럼 꼬리를 흔드는 아이!\n\n"
            f"🏠 말 못 하는 우리 아이의 골든타임 지킴이: {OFFICIAL_LINKS['landing']}\n"
            "💬 지금 프로필 링크 또는 포털에서 '파보겔'을 검색해 비상 상비약을 준비하세요.\n"
            "문의: 02-6949-5708 │ (주)한국아그로\n\n"
            "#파보겔 #강아지설사 #강아지혈변 #파보장염 #강아지응급상비약 #반려견건강 #댕댕이 #펫케어"
        ),
        "tiktok_title": "🚨 한밤중 강아지 피설사·구토 골든타임 35초 다큐 🐾 비상 상비약 파보겔 #파보겔 #강아지설사 #반려견상비약",
        "facebook_caption": (
            "🎬 [35초 다큐] 〈기적의 골든타임〉 — 한밤중 피설사·구토, 말 못 하는 우리 아이를 지킨 서랍 속 1초 비상 상비약\n\n"
            "병원 문이 닫힌 야간, 1분 1초가 급박한 순간에 체내 흡수 0% 장 점막 나노 코팅과 독소 흡착 기전으로 골든타임을 지켜주는 파보겔 이야기를 확인하세요.\n\n"
            f"▶ 파보겔 공식 홈페이지 ((주)한국아그로): {OFFICIAL_LINKS['landing']}\n"
            f"▶ 스마트스토어: {OFFICIAL_LINKS['smartstore']}\n"
            f"▶ 쿠팡 공식: {OFFICIAL_LINKS['coupang']}\n"
            "☎ 고객센터: 02-6949-5708"
        ),
        "naver_blog_title": "[35초 다큐 공개] 한밤중 우리 아이 피설사·구토 골든타임을 지킨 가정 내 필수 상비약 '파보겔'",
        "naver_blog_body": (
            "# 한밤중 우리 아이 피설사·구토 골든타임을 지킨 35초의 기적\n\n"
            "병원 문이 닫힌 깊은 새벽, 갑자기 시작된 물설사·혈변·구토 앞에 발을 동동 굴러보신 적 있으신가요?\n\n"
            "## 01. 왜 단순 지사제가 아니라 '장 점막 코팅 + 독소 흡착'인가?\n\n"
            "장 운동을 억지로 멈추는 방식이 아니라, 체내 흡수 0%의 고순도 초미세 나노 **몬모릴로나이트**가 손상된 장 점막 융모를 감싸 보호하고 바이러스·세균 독소만 선택적으로 흡착해 몸 밖으로 배출합니다.\n\n"
            "## 02. 주사기 실랑이 없는 1초 펌핑\n\n"
            "아파서 예민해진 아이에게 강제로 주사기를 들이댈 필요 없이, 기호성 좋은 부드러운 겔 제형을 입가에 1초 톡 짜주면 아이 스스로 꿀꺽 삼킵니다.\n\n"
            "## 03. (주)한국아그로 파보겔 공식 안내\n\n"
            f"- 공식 홈페이지: {OFFICIAL_LINKS['landing']}\n"
            f"- 네이버 스마트스토어: {OFFICIAL_LINKS['smartstore']}\n"
            f"- 쿠팡 로켓배송: {OFFICIAL_LINKS['coupang']}\n"
            "- 고객센터 문의: 02-6949-5708 ((주)한국아그로)"
        ),
    }


def dispatch_campaign(campaign: Dict[str, Any], live: bool = False, force: bool = False) -> Dict[str, Any]:
    campaign_id = campaign["campaign_id"]
    today = datetime.now().strftime("%Y-%m-%d")

    # 1. Strict Brand Isolation Verification across ALL text fields
    all_text = json.dumps(campaign, ensure_ascii=False)
    assert_brand_isolation(all_text, context=f"campaign:{campaign_id}")

    # 2. Verify video assets via ffprobe
    info_916 = probe_media(campaign["video_916"])
    info_169 = probe_media(campaign["video_169"])
    if info_916["width"] != 1080 or info_916["height"] != 1920 or not info_916["has_audio"]:
        raise ValueError(f"9:16 video validation failed: {info_916}")
    if info_169["width"] != 1920 or info_169["height"] != 1080 or not info_169["has_audio"]:
        raise ValueError(f"16:9 video validation failed: {info_169}")

    print("=" * 68)
    print(f"🚀 [CUSTOM VIDEO AUTO-DISPATCHER] Campaign: {campaign_id}")
    print(f"   Mode: {'🔴 LIVE EXECUTION' if live else '🟡 DRY-RUN VALIDATION'}")
    print(f"   9:16 Shorts : {os.path.basename(campaign['video_916'])} ({info_916['duration']:.2f}s, {info_916['size_mb']}MB, {info_916['sample_rate']}Hz ch={info_916['channels']})")
    print(f"   16:9 Master : {os.path.basename(campaign['video_169'])} ({info_169['duration']:.2f}s, {info_169['size_mb']}MB, {info_169['sample_rate']}Hz ch={info_169['channels']})")
    print("=" * 68)

    # Check ledger duplicate for this exact campaign_id
    ledger = load_ledger()
    prev_success = set()
    prev_urls: Dict[str, Any] = {}
    if not force:
        for entry in ledger:
            if entry.get("campaign_id") == campaign_id:
                for ch, st in entry.get("publish_results", {}).items():
                    if isinstance(st, str) and st.startswith("SUCCESS"):
                        prev_success.add(ch)
                if entry.get("live_urls"):
                    prev_urls.update(entry["live_urls"])

    # Copy assets into marketing_factory/output so factory archive/dashboard tracks them
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    staged_916 = os.path.join(OUTPUT_DIR, os.path.basename(campaign["video_916"]))
    staged_169 = os.path.join(OUTPUT_DIR, os.path.basename(campaign["video_169"]))
    shutil.copyfile(campaign["video_916"], staged_916)
    shutil.copyfile(campaign["video_169"], staged_169)

    yt = YouTubeAdapter()
    ig = InstagramAdapter()
    fb = FacebookAdapter()
    tk = TikTokAdapter()
    bs = BlueskyAdapter()
    dc = DiscordAdapter()
    th = ThreadsAdapter()

    results: Dict[str, str] = {}
    live_urls: Dict[str, Any] = dict(prev_urls)

    # Validate adapter configs first
    configs = {
        "YouTube_Shorts": yt.validate_config(),
        "Instagram_Reels": ig.validate_config(),
        "Facebook_Page": fb.validate_config(),
        "TikTok": tk.validate_config(),
        "Bluesky": bs.validate_config(),
        "Discord": dc.validate_config(),
        "Threads": th.validate_config(),
    }
    print("\n[Adapter Config Check]")
    for k, ok in configs.items():
        print(f"  • {k:16}: {'READY' if ok else 'NOT CONFIGURED'}")

    if not live:
        print("\n[DRY-RUN] Payloads passed brand isolation guard, media probe, and adapter validation.")
        return {"status": "DRY_RUN_OK", "configs": configs, "video_916": info_916, "video_169": info_169}

    # STEP 1: Upload YouTube Shorts first to obtain canonical Shorts URL
    if "YouTube_Shorts" in prev_success and live_urls.get("youtube_shorts"):
        results["YouTube_Shorts"] = "SUCCESS (PREVIOUS)"
        print(f"\n⏩ [SKIP] YouTube_Shorts already published: {live_urls['youtube_shorts']}")
    elif configs["YouTube_Shorts"]:
        print("\n[1/6] Uploading 9:16 Video to YouTube Shorts...")
        ok = yt.publish({
            "video_path": staged_916,
            "title": campaign["youtube_title"],
            "description": campaign["youtube_description"],
            "tags": campaign["youtube_tags"],
        })
        if ok:
            res_meta = getattr(yt, "last_result", {}) or {}
            if res_meta.get("url"):
                live_urls["youtube_shorts"] = res_meta["url"]
                live_urls["youtube_id"] = res_meta.get("id")
            results["YouTube_Shorts"] = f"SUCCESS ({res_meta.get('url', 'uploaded')})"
        else:
            results["YouTube_Shorts"] = "FAILED"
    else:
        results["YouTube_Shorts"] = "SKIPPED_NO_KEY"

    yt_url = live_urls.get("youtube_shorts", OFFICIAL_LINKS["landing"])

    # STEP 2: Dispatch Instagram Reels (9:16), TikTok (9:16), Facebook Page (16:9) in parallel
    video_tasks = {}
    if "Instagram_Reels" in prev_success:
        results["Instagram_Reels"] = "SUCCESS (PREVIOUS)"
    elif os.getenv("SKIP_IG") == "1":
        results["Instagram_Reels"] = "SKIPPED_BY_FLAG"
    elif configs["Instagram_Reels"]:
        ig_payload = {
            "video_path": staged_916,
            "title": campaign["title"],
            "caption": campaign["reels_caption"],
        }
        if campaign.get("video_916_url"):
            ig_payload["video_url"] = campaign["video_916_url"]
        video_tasks["Instagram_Reels"] = (ig, ig_payload)
    else:
        results["Instagram_Reels"] = "SKIPPED_NO_KEY"

    if "TikTok" in prev_success:
        results["TikTok"] = "SUCCESS (PREVIOUS)"
    elif configs["TikTok"]:
        video_tasks["TikTok"] = (tk, {
            "video_path": staged_916,
            "title": campaign["tiktok_title"],
        })
    else:
        results["TikTok"] = "SKIPPED_NO_KEY"

    if "Facebook_Page" in prev_success:
        results["Facebook_Page"] = "SUCCESS (PREVIOUS)"
    elif configs["Facebook_Page"]:
        fb_caption = campaign["facebook_caption"] + f"\n\n▶ 유튜브 쇼츠 보기: {yt_url}"
        assert_brand_isolation(fb_caption, "Facebook caption")
        video_tasks["Facebook_Page"] = (fb, {
            "video_path": staged_169,
            "title": campaign["title"],
            "caption": fb_caption,
            "links": OFFICIAL_LINKS,
        })
    else:
        results["Facebook_Page"] = "SKIPPED_NO_KEY"

    if video_tasks:
        print(f"\n[2/6] Uploading concurrently to: {list(video_tasks.keys())}...")
        with ThreadPoolExecutor(max_workers=3) as pool:
            futs = {pool.submit(ad.publish, payload): (name, ad) for name, (ad, payload) in video_tasks.items()}
            for fut in as_completed(futs):
                name, ad = futs[fut]
                try:
                    ok = fut.result()
                    if ok:
                        meta = getattr(ad, "last_result", {}) or {}
                        if name == "Facebook_Page" and meta.get("url"):
                            live_urls["facebook"] = meta["url"]
                        elif name == "Instagram_Reels" and meta.get("id"):
                            live_urls["instagram_media_id"] = meta["id"]
                        elif name == "TikTok" and meta.get("id"):
                            live_urls["tiktok_publish_id"] = meta["id"]
                        results[name] = f"SUCCESS ({meta.get('id', 'ok')})"
                    else:
                        results[name] = "FAILED"
                except Exception as e:
                    results[name] = f"ERROR: {e}"

    # STEP 3: Dispatch Bluesky & Discord with live YouTube Shorts URL
    if "Bluesky" in prev_success:
        results["Bluesky"] = "SUCCESS (PREVIOUS)"
    elif configs["Bluesky"]:
        bs_text = (
            "🚨 한밤중 피설사·구토 골든타임 35초 다큐 [파보겔]\n\n"
            "체내 흡수 0% 장 점막 나노 코팅!\n"
            "▶ 35초 영상 보기:\n"
            f"{yt_url}\n\n"
            f"🏠 공식 안내((주)한국아그로): {OFFICIAL_LINKS['landing']}\n"
            "#파보겔 #강아지설사 #반려견상비약"
        )
        assert_brand_isolation(bs_text, "Bluesky text")
        ok = bs.publish({"bluesky_text": bs_text, "links": OFFICIAL_LINKS})
        if ok:
            bs_meta = getattr(bs, "last_result", {}) or {}
            if bs_meta.get("uri"):
                live_urls["bluesky_uri"] = bs_meta["uri"]
            results["Bluesky"] = "SUCCESS"
        else:
            results["Bluesky"] = "FAILED"

    if "Discord" in prev_success:
        results["Discord"] = "SUCCESS (PREVIOUS)"
    elif configs["Discord"]:
        dc_desc = (
            f"🎬 **〈기적의 골든타임〉 35초 애니메이션 다큐멘터리 자동배포 완료**\n\n"
            f"• **YouTube Shorts**: {yt_url}\n"
            f"• **Instagram Reels ID**: {live_urls.get('instagram_media_id', results.get('Instagram_Reels'))}\n"
            f"• **Facebook**: {live_urls.get('facebook', results.get('Facebook_Page'))}\n"
            f"• **TikTok Publish ID**: {live_urls.get('tiktok_publish_id', results.get('TikTok'))}\n"
            f"• **공식 홈페이지**: {OFFICIAL_LINKS['landing']}\n"
            f"• **스마트스토어**: {OFFICIAL_LINKS['smartstore']}\n"
            f"• **쿠팡 로켓배송**: {OFFICIAL_LINKS['coupang']}"
        )
        assert_brand_isolation(dc_desc, "Discord webhook")
        ok = dc.publish({
            "title": campaign["title"],
            "description": dc_desc,
            "url": yt_url,
            "color": 0x10B981,
        })
        results["Discord"] = "SUCCESS" if ok else "FAILED"

    # STEP 3.5: Threads (API live if THREADS_ACCESS_TOKEN & THREADS_USER_ID exist, otherwise archive+queue ready draft)
    if "Threads" in prev_success:
        results["Threads"] = "SUCCESS (PREVIOUS)"
    else:
        th_main = (
            "🚨 한밤중 갑자기 강아지가 피설사와 구토를 시작했는데 병원 문은 이미 닫혀있을 때…\n\n"
            "응급실 가기 전 1분 1초가 소중한 골든타임!\n"
            "체내 흡수 0% 나노 몬모릴로나이트로 장 점막을 코팅하고 독소만 흡착해 배출하는 1초 펌프 상비약 '파보겔' 35초 다큐를 공개합니다.\n\n"
            f"🎬 35초 다큐 바로보기: {yt_url}\n"
            "#파보겔 #강아지설사 #강아지혈변 #반려견상비약 #파보장염"
        )
        th_reply = (
            f"🐾 파보겔 공식 안내((주)한국아그로): {OFFICIAL_LINKS['landing']}\n"
            f"🛒 네이버 스마트스토어: {OFFICIAL_LINKS['smartstore']}\n"
            f"🚀 쿠팡 로켓배송: {OFFICIAL_LINKS['coupang']}\n"
            "☎ 문의: 02-6949-5708"
        )
        assert_brand_isolation(th_main + "\n" + th_reply, "Threads payload")
        th_ok = th.publish({
            "content_id": f"golden_time_35s_{today.replace('-', '')}",
            "main_post": th_main,
            "first_comment": th_reply,
            "delay_seconds": 90,
            "links": OFFICIAL_LINKS,
        })
        if configs["Threads"]:
            results["Threads"] = "SUCCESS" if th_ok else "FAILED"
        else:
            results["Threads"] = "ARCHIVED_DRAFT_NO_TOKEN" if th_ok else "FAILED"

    # STEP 4: Queue Naver Blog article in Hybrid Queue with YouTube URL + Save Campaign State
    blog_body = campaign["naver_blog_body"] + f"\n\n### ▶ 35초 다큐멘터리 영상 바로보기\n{yt_url}\n"
    assert_brand_isolation(blog_body, "Naver Blog body")
    if "Naver_Blog_Queue" not in prev_success:
        queued = push_post_to_queue(
            title=campaign["naver_blog_title"],
            body=blog_body,
            links=OFFICIAL_LINKS,
            tags=["파보겔", "강아지설사", "강아지혈변", "파보장염", "몬모릴로나이트", "반려견상비약", "한국아그로"],
            target_brand="KOREA_AGRO",
            product_id="PARVOGEL_D2C",
        )
        results["Naver_Blog_Queue"] = f"QUEUED_HYBRID ({queued['id']})"
    else:
        results["Naver_Blog_Queue"] = "QUEUED_HYBRID (PREVIOUS)"

    # Archive copy in drafts/
    draft_adapter = FileDraftAdapter(DRAFTS_DIR)
    draft_adapter.publish_draft("GoldenTime_35s_Campaign", {
        "campaign_id": campaign_id,
        "live_urls": live_urls,
        "results": results,
        "youtube_description": campaign["youtube_description"],
        "reels_caption": campaign["reels_caption"],
        "naver_blog_title": campaign["naver_blog_title"],
        "naver_blog_body": blog_body,
    }, today)

    # Save ledger & dedicated state file
    ledger_entry = {
        "timestamp": datetime.now().isoformat(),
        "date": today,
        "campaign_id": campaign_id,
        "theme": campaign["title"],
        "video_file": os.path.basename(staged_916),
        "rendered_video": os.path.relpath(staged_916, FACTORY_DIR).replace(os.sep, "/"),
        "rendered_video_169": os.path.relpath(staged_169, FACTORY_DIR).replace(os.sep, "/"),
        "live_urls": live_urls,
        "publish_results": results,
    }
    ledger.append(ledger_entry)
    save_ledger(ledger)

    with open(CAMPAIGN_STATE_PATH, "w", encoding="utf-8") as sf:
        json.dump(ledger_entry, sf, indent=2, ensure_ascii=False)

    try:
        DashboardService().build_html_dashboard()
    except Exception as e:
        print(f"[WARN] Dashboard update skipped: {e}")

    print("\n" + "=" * 68)
    print("🎉 [CUSTOM VIDEO AUTO-DISPATCH COMPLETE]")
    for ch, st in results.items():
        print(f"  • {ch:18}: {st}")
    if live_urls:
        print("\n🔗 [CAPTURED LIVE URLs / IDs]")
        for k, v in live_urls.items():
            print(f"  • {k:20}: {v}")
    print("=" * 68)
    return ledger_entry


if __name__ == "__main__":
    live_flag = "--live" in sys.argv
    force_flag = "--force" in sys.argv
    if "--skip-ig" in sys.argv:
        os.environ["SKIP_IG"] = "1"
    campaign = default_golden_time_campaign()
    dispatch_campaign(campaign, live=live_flag, force=force_flag)
