#!/usr/bin/env python3
"""
Marketing Master — 파보겔(Parvogel) 순수 B2C 멀티채널 마케팅 자동화 총괄 오케스트레이터
- KST(Asia/Seoul) 기준 매일 1회 자동 실행 (GitHub Actions 단일 운영)
- 요일별·ISO 주차별 비중복 숏폼 자동 제작:
  · 월요일: 170회 검증 리얼 임상 28초 다큐(주차별 훅 변주) + 1초 펌프 가이드
  · 화/목/금/토/일: 노마드크리스형 랭킹 TOP 5 (ISO 주차 구간 시프트로 매주 다른 컷) + 실사/펌프 쇼츠
  · 수요일: 반려조 '꼬미' 실제 전·후 24시간 배변 회복 사진 실증 쇼츠 + 조류 랭킹 TOP 5
- 엄격한 브랜드 분리 & 정책 가드 (SNJ/몬스멕타/축산/B2B 무료샘플/상비약 원천 차단)
- 배포 실패 시 Discord 알림 + 엄격 종료코드(False Green 차단)
"""

import os
import sys
import json
import datetime
import math
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, List, Optional

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

KST = datetime.timezone(datetime.timedelta(hours=9))

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(FACTORY_DIR, "data")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")
DRAFTS_DIR = os.path.join(FACTORY_DIR, "drafts")
CONFIG_DIR = os.path.join(FACTORY_DIR, "config")

sys.path.insert(0, FACTORY_DIR)

from core.content_enricher import ParvogelContentEnricher, now_kst
from core.content_formatter import ParvogelContentFormatter
from core.video_maker import ParvogelVideoMaker
from core.viral_shortform_engine import ViralShortformEngine
from core.outsource_dispatcher import OutsourceDispatcher
from core.dashboard_service import DashboardService
from core.ranking_shorts_generator import ParvogelRankingShortsGenerator
from core.pump_shorts_generator import PumpShortsGenerator
from core.queue_server import push_post_to_queue
from adapters.telegram_adapter import TelegramAdapter
from adapters.discord_adapter import DiscordAdapter
from adapters.twitter_adapter import TwitterAdapter
from adapters.youtube_adapter import YouTubeAdapter
from adapters.instagram_adapter import InstagramAdapter
from adapters.facebook_adapter import FacebookAdapter
from adapters.tiktok_adapter import TikTokAdapter
from adapters.bluesky_adapter import BlueskyAdapter
from adapters.naver_blog_adapter import NaverBlogBrowserAdapter
from adapters.file_draft_adapter import FileDraftAdapter
from adapters.threads_adapter import ThreadsAdapter
from adapters.kakao_channel_adapter import KakaoChannelAdapter


FORBIDDEN_PUBLISH_TOKENS = [
    "몬스멕타", "monsmecta", "에스앤제이", "031-321-6562", "0313216562",
    "080-881-1289", "0808811289", "로타갈", "베타콜", "송아지", "자돈",
    "엠오바이오", "무료 샘플", "무료샘플", "정식허가", "몽모릴로나이트",
    "상비약", "상비제", "?sample=petshop", "?sample=breeder",
]


def assert_payload_safe(payload: Any, context: str = "publish"):
    blob = json.dumps(payload, ensure_ascii=False).lower()
    for tok in FORBIDDEN_PUBLISH_TOKENS:
        if tok.lower() in blob:
            raise ValueError(f"[BRAND/POLICY GUARD VIOLATION] Forbidden token '{tok}' found in {context}!")


def load_channel_strategy() -> Dict[str, Any]:
    """채널별 차별화 전략 설정 로드"""
    strategy_path = os.path.join(CONFIG_DIR, "channel_strategy.json")
    if os.path.exists(strategy_path):
        try:
            with open(strategy_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[WARN] Failed to load channel strategy: {e}")
    return {}


class ParvogelMarketingMaster:
    """파보겔 마케팅 공장 총괄 지휘 엔진 (GitHub Actions 단일 소스 기준)"""

    DAY_TO_INDEX = {
        "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
        "Friday": 4, "Saturday": 5, "Sunday": 6,
    }

    def __init__(self):
        self.enricher = ParvogelContentEnricher()
        self.formatter = ParvogelContentFormatter()
        self.video_maker = ParvogelVideoMaker()
        self.ranking_generator = ParvogelRankingShortsGenerator()
        self.pump_generator = PumpShortsGenerator()
        self.viral_engine = ViralShortformEngine()
        self.outsource_dispatcher = OutsourceDispatcher()
        self.dashboard_service = DashboardService()
        self.draft_adapter = FileDraftAdapter(DRAFTS_DIR)

        self.adapters = [
            TelegramAdapter(),
            DiscordAdapter(),
            TwitterAdapter(),
            BlueskyAdapter(),
            YouTubeAdapter(),
            InstagramAdapter(),
            FacebookAdapter(),
            TikTokAdapter(),
            NaverBlogBrowserAdapter(),
            ThreadsAdapter(),
            KakaoChannelAdapter()
        ]
        self.ledger_path = os.path.join(DATA_DIR, "published_ledger.json")
        
        # 자동화 업그레이드: 크리에이티브 피로도 추적
        self.fatigue_tracker_path = os.path.join(DATA_DIR, "creative_fatigue.json")
        self.fatigue_data = self._load_fatigue_data()
        
        # 자동화 업그레이드: 경쟁사 모니터링
        self.competitor_data_path = os.path.join(DATA_DIR, "competitor_monitoring.json")
        self.competitor_data = self._load_competitor_data()
        
        # 자동화 업그레이드: A/B 테스트 결과 추적
        self.ab_test_path = os.path.join(DATA_DIR, "ab_test_results.json")
        self.ab_test_data = self._load_ab_test_data()

    def _load_fatigue_data(self) -> Dict[str, Any]:
        """크리에이티브 피로도 데이터 로드"""
        if os.path.exists(self.fatigue_tracker_path):
            try:
                with open(self.fatigue_tracker_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {"creatives": {}, "thresholds": {"impression_frequency": 5, "ctr_drop_pct": 30, "engagement_drop_pct": 25}}
        return {"creatives": {}, "thresholds": {"impression_frequency": 5, "ctr_drop_pct": 30, "engagement_drop_pct": 25}}

    def _save_fatigue_data(self):
        with open(self.fatigue_tracker_path, "w", encoding="utf-8") as f:
            json.dump(self.fatigue_data, f, indent=2, ensure_ascii=False)

    def _load_competitor_data(self) -> Dict[str, Any]:
        """경쟁사 모니터링 데이터 로드"""
        if os.path.exists(self.competitor_data_path):
            try:
                with open(self.competitor_data_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {"competitors": [], "last_check": None}
        return {"competitors": [], "last_check": None}

    def _save_competitor_data(self):
        with open(self.competitor_data_path, "w", encoding="utf-8") as f:
            json.dump(self.competitor_data, f, indent=2, ensure_ascii=False)

    def _load_ab_test_data(self) -> Dict[str, Any]:
        """A/B 테스트 결과 데이터 로드"""
        if os.path.exists(self.ab_test_path):
            try:
                with open(self.ab_test_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {"tests": {}, "completed": []}
        return {"tests": {}, "completed": []}

    def _save_ab_test_data(self):
        with open(self.ab_test_path, "w", encoding="utf-8") as f:
            json.dump(self.ab_test_data, f, indent=2, ensure_ascii=False)

    def check_creative_fatigue(self, creative_id: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """크리에이티브 피로도 체크 및 교체 권장"""
        creative = self.fatigue_data["creatives"].get(creative_id, {
            "impressions": 0,
            "clicks": 0,
            "engagements": 0,
            "first_seen": datetime.datetime.now(KST).isoformat(),
            "versions_shown": 1
        })
        
        # 메트릭 업데이트
        creative["impressions"] += metrics.get("impressions", 0)
        creative["clicks"] += metrics.get("clicks", 0)
        creative["engagements"] += metrics.get("engagements", 0)
        creative["last_updated"] = datetime.datetime.now(KST).isoformat()
        
        # 피로도 계산
        ctr = creative["clicks"] / max(creative["impressions"], 1)
        engagement_rate = creative["engagements"] / max(creative["impressions"], 1)
        
        thresholds = self.fatigue_data["thresholds"]
        fatigue_signals = []
        
        # 빈도 체크
        freq = creative["impressions"] / max(1, (datetime.datetime.now(KST) - datetime.datetime.fromisoformat(creative["first_seen"])).days)
        if freq > thresholds["impression_frequency"]:
            fatigue_signals.append(f"High frequency: {freq:.1f} impressions/day")
        
        # CTR 하락 체크 (초기 대비)
        if creative["versions_shown"] > 1:
            # 이전 버전 대비 비교 로직 필요
            pass
        
        creative["fatigue_score"] = len(fatigue_signals) * 25  # 0-100
        creative["fatigue_signals"] = fatigue_signals
        creative["recommend_refresh"] = creative["fatigue_score"] >= 50
        
        self.fatigue_data["creatives"][creative_id] = creative
        self._save_fatigue_data()
        
        return {
            "creative_id": creative_id,
            "fatigue_score": creative["fatigue_score"],
            "signals": fatigue_signals,
            "recommend_refresh": creative["recommend_refresh"],
            "ctr": ctr,
            "engagement_rate": engagement_rate
        }

    def auto_retry_failed_channels(self, failed_channels: List[str], content_data: Dict[str, Any], max_retries: int = 3) -> Dict[str, Any]:
        """실패한 채널 자동 재시도 (지수 백오프)"""
        results = {}
        for channel_name in failed_channels:
            adapter = next((a for a in self.adapters if a.name == channel_name), None)
            if not adapter:
                results[channel_name] = "ADAPTER_NOT_FOUND"
                continue
            
            for attempt in range(max_retries):
                try:
                    wait_time = (2 ** attempt) * 5  # 5s, 10s, 20s
                    if attempt > 0:
                        print(f"[RETRY] {channel_name} attempt {attempt + 1}/{max_retries} after {wait_time}s")
                        time.sleep(wait_time)
                    
                    success = adapter.publish(content_data)
                    if success:
                        results[channel_name] = f"SUCCESS_ON_RETRY_{attempt + 1}"
                        break
                    else:
                        results[channel_name] = f"FAILED_ATTEMPT_{attempt + 1}"
                except Exception as e:
                    results[channel_name] = f"ERROR_ATTEMPT_{attempt + 1}: {str(e)}"
            
            if channel_name not in results:
                results[channel_name] = "MAX_RETRIES_EXCEEDED"
        
        return results

    def run_competitor_monitoring(self) -> Dict[str, Any]:
        """경쟁사 모니터링 실행 (키워드 순위, 콘텐츠 트렌드)"""
        # 실제 구현 시: SerpAPI, Ahrefs API, 또는 수동 크롤링 활용
        # 여기서는 프레임워크만 제공
        monitoring_result = {
            "timestamp": datetime.datetime.now(KST).isoformat(),
            "keywords_checked": [
                "강아지 설사 보조사료",
                "파보장염 치료제",
                "강아지 장 건강 영양제",
                "반려동물 설사약",
                "고양이 설사 영양제"
            ],
            "competitors": [
                {
                    "name": "경쟁사 A",
                    "product": "장케어 영양제",
                    "ranking_changes": {"강아지 설사 보조사료": "+2", "파보장염 치료제": "-1"},
                    "content_trends": ["수의사 추천 강조", "임상 데이터 공개", "무료 샘플 이벤트"]
                },
                {
                    "name": "경쟁사 B",
                    "product": "프로바이오틱스",
                    "ranking_changes": {"강아지 장 건강 영양제": "+3"},
                    "content_trends": ["유산균 수 강조", "맛 기호성 마케팅", "정기구독 할인"]
                }
            ],
            "insights": [
                "경쟁사 A가 '무료 샘플' 이벤트로 신규 유입 증가 중",
                "수의사 추천 콘텐츠가 상위 노출 핵심 요소",
                "임상 데이터 공개 브랜드가 신뢰도 우위"
            ],
            "recommended_actions": [
                "파보겔도 수의사 임상 케이스 콘텐츠 강화",
                "체험단/리뷰 이벤트 검토 (단, 사료관리법 준수)",
                "차별화 포인트: '1초 펌프', '체내 흡수 0%', '전 연령 안심' 강조"
            ]
        }
        
        self.competitor_data["last_check"] = monitoring_result["timestamp"]
        self.competitor_data["history"] = self.competitor_data.get("history", []) + [monitoring_result]
        # 최근 30일만 유지
        cutoff = datetime.datetime.now(KST) - datetime.timedelta(days=30)
        self.competitor_data["history"] = [
            h for h in self.competitor_data["history"]
            if datetime.datetime.fromisoformat(h["timestamp"]) > cutoff
        ]
        self._save_competitor_data()
        
        return monitoring_result

    def run_ab_test_analysis(self) -> Dict[str, Any]:
        """A/B 테스트 결과 분석 및 승자 결정"""
        # 진행 중인 테스트 확인
        active_tests = {k: v for k, v in self.ab_test_data["tests"].items() if v.get("status") == "running"}
        completed = []
        
        for test_id, test in active_tests.items():
            # 최소 샘플 수 체크 (예: 변형당 100회 노출)
            min_samples = test.get("min_samples_per_variant", 100)
            variants_ready = all(
                v.get("impressions", 0) >= min_samples 
                for v in test["variants"].values()
            )
            
            if variants_ready:
                # 통계적 유의성 검정 (간단한 z-test)
                winner = self._determine_ab_winner(test)
                test["status"] = "completed"
                test["winner"] = winner
                test["completed_at"] = datetime.datetime.now(KST).isoformat()
                completed.append(test_id)
                
                # 승자 버전을 기본으로 승격 권장
                if winner:
                    print(f"[A/B TEST] {test_id} completed. Winner: {winner['variant']} (p-value: {winner['p_value']:.4f})")
        
        # 완료된 테스트 이동
        for test_id in completed:
            self.ab_test_data["completed"][test_id] = self.ab_test_data["tests"].pop(test_id)
        
        self._save_ab_test_data()
        
        return {
            "active_tests": len(active_tests),
            "completed_this_run": completed,
            "total_completed": len(self.ab_test_data["completed"])
        }

    def _determine_ab_winner(self, test: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """A/B 테스트 승자 결정 (단순 전환율 비교)"""
        variants = test["variants"]
        if len(variants) != 2:
            return None
        
        var_names = list(variants.keys())
        var_a, var_b = variants[var_names[0]], variants[var_names[1]]
        
        conv_a = var_a.get("conversions", 0) / max(var_a.get("impressions", 1), 1)
        conv_b = var_b.get("conversions", 0) / max(var_b.get("impressions", 1), 1)
        
        # 단순 비교 (실제로는 통계적 유의성 검정 필요)
        if abs(conv_a - conv_b) < 0.001:  # 0.1% 미만 차이는 무승부
            return None
        
        winner_name = var_names[0] if conv_a > conv_b else var_names[1]
        winner_data = var_a if conv_a > conv_b else var_b
        loser_data = var_b if conv_a > conv_b else var_a
        
        # 간단한 p-value 근사 (두 비율 z-test)
        p_a = conv_a
        p_b = conv_b
        n_a = var_a.get("impressions", 1)
        n_b = var_b.get("impressions", 1)
        p_pool = (var_a.get("conversions", 0) + var_b.get("conversions", 0)) / (n_a + n_b)
        se = math.sqrt(p_pool * (1 - p_pool) * (1/n_a + 1/n_b))
        z = abs(p_a - p_b) / max(se, 0.0001)
        p_value = 2 * (1 - 0.5 * (1 + math.erf(z / math.sqrt(2)))) if se > 0 else 1.0
        
        return {
            "variant": winner_name,
            "conversion_rate": winner_data.get("conversions", 0) / max(winner_data.get("impressions", 1), 1),
            "lift_pct": ((winner_data.get("conversions", 0) / max(winner_data.get("impressions", 1), 1)) / 
                        max(loser_data.get("conversions", 0) / max(loser_data.get("impressions", 1), 1), 0.0001) - 1) * 100,
            "p_value": p_value,
            "statistically_significant": p_value < 0.05
        }

    def start_ab_test(self, test_id: str, variants: Dict[str, Dict[str, Any]], min_samples: int = 100) -> bool:
        """새 A/B 테스트 시작"""
        if test_id in self.ab_test_data["tests"]:
            return False
        
        self.ab_test_data["tests"][test_id] = {
            "status": "running",
            "started_at": datetime.datetime.now(KST).isoformat(),
            "variants": {k: {"impressions": 0, "clicks": 0, "conversions": 0, **v} for k, v in variants.items()},
            "min_samples_per_variant": min_samples,
            "metric": "conversion_rate"
        }
        self._save_ab_test_data()
        return True

    def record_ab_test_event(self, test_id: str, variant: str, event_type: str):
        """A/B 테스트 이벤트 기록 (노출/클릭/전환)"""
        if test_id not in self.ab_test_data["tests"]:
            return
        if variant not in self.ab_test_data["tests"][test_id]["variants"]:
            return
        
        var_data = self.ab_test_data["tests"][test_id]["variants"][variant]
        if event_type == "impression":
            var_data["impressions"] = var_data.get("impressions", 0) + 1
        elif event_type == "click":
            var_data["clicks"] = var_data.get("clicks", 0) + 1
        elif event_type == "conversion":
            var_data["conversions"] = var_data.get("conversions", 0) + 1
        
        self._save_ab_test_data()

    def _load_ledger(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.ledger_path):
            try:
                with open(self.ledger_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save_ledger(self, ledger: List[Dict[str, Any]]):
        with open(self.ledger_path, "w", encoding="utf-8") as f:
            json.dump(ledger, f, indent=2, ensure_ascii=False)

    def _is_duplicate_today(self, date_str: str) -> bool:
        lock_path = os.path.join(DATA_DIR, "last_published_date.txt")
        if os.path.exists(lock_path):
            try:
                with open(lock_path, "r", encoding="utf-8") as lf:
                    if lf.read().strip() == date_str:
                        return True
            except Exception:
                pass
        ledger = self._load_ledger()
        entry = next((e for e in reversed(ledger) if e.get("date") == date_str), None)
        if not entry:
            return False
        pub = entry.get("publish_results", {})
        yt_ok = str(pub.get("YouTube_Shorts", "")).startswith("SUCCESS")
        core_success = sum(1 for k in ("YouTube_Shorts", "Instagram_Reels", "TikTok", "Bluesky", "Discord") if str(pub.get(k, "")).startswith("SUCCESS"))
        if yt_ok and core_success >= 3:
            return True
        return False

    def run_daily_pipeline(
        self,
        target_day: Optional[str] = None,
        force: bool = False,
        dry_run: bool = False,
        strict_youtube: bool = False,
        track: Optional[str] = None,
        reviews_file: Optional[str] = None,
        hook_pattern: str = "auto",
        publish_at: Optional[str] = None,
    ) -> Dict[str, Any]:
        start_time = now_kst()
        date_str = start_time.strftime("%Y-%m-%d")
        date_tag = start_time.strftime("%Y%m%d")
        iso_week = start_time.isocalendar()[1]
        active_day = target_day or start_time.strftime("%A")
        raw_track = (track or os.getenv("MARKETING_TRACK", "standard")).strip().lower()
        review_days_env = os.getenv("REVIEW_HOOK_DAYS", "Tuesday,Friday")
        review_days = {d.strip().lower() for d in review_days_env.split(",") if d.strip()}
        if raw_track == "auto_mix":
            active_track = "review_hook" if active_day.lower() in review_days else "standard"
        else:
            active_track = raw_track

        if not force and not target_day and not dry_run and self._is_duplicate_today(date_str):
            print(f"⏭️  Duplicate run blocked: {date_str} already completed successfully. Use --force to override.")
            return {"date": date_str, "status": "SKIP_DUPLICATE", "publish_results": {}}

        print("=" * 68)
        print(f"🏭 [PARVOGEL MARKETING FACTORY] Daily Run: {date_str} ({active_day}, W{iso_week:02d}) {'[DRY-RUN]' if dry_run else '[LIVE]'}")
        print("=" * 68)

        # 1. AI / 주차 변주 B2C 내러티브 생성
        print("\n[STEP 1/5] Generating B2C companion-pet clinical narrative...")
        narrative = self.enricher.generate_narrative(target_day)
        print(f"✓ Theme  : {narrative.get('headline')}")
        print(f"✓ Source : {narrative.get('source')}")
        print(f"✓ Format : YouTube={narrative.get('youtube_format', 'ranking')} | Reels={narrative.get('reels_format', 'daily_shorts')}")

        # 2. 전 채널 포맷팅 + 브랜드/정책 가드 검증
        print("\n[STEP 2/5] Formatting content & verifying Brand/Policy Guard...")
        formatted_channels = self.formatter.format_all_channels(narrative)
        for ch_name, ch_payload in formatted_channels.items():
            assert_payload_safe(ch_payload, context=f"channel:{ch_name}")
        print(f"✓ Brand/Policy Guard PASSED across {len(formatted_channels)} channels")

        # 3. 요일별·주차별 맞춤형 비중복 숏폼 렌더링
        print("\n[STEP 3/5] Rendering day-specific non-duplicate 9:16 Shorts...")
        target_video = narrative.get("video_file", "parvogel_real_clinical_28s_landing.mp4")
        yt_format = narrative.get("youtube_format", "ranking")
        reels_format = narrative.get("reels_format", "daily_shorts")
        ranking_idx = narrative.get("ranking_day_index")
        if ranking_idx is None:
            ranking_idx = self.DAY_TO_INDEX.get(active_day, start_time.weekday())

        top_title = narrative.get("headline", "우리 집 펫 구급함 1순위 파보겔")[:26]
        rendered_video = self.video_maker.generate_daily_shorts(
            video_filename=target_video,
            top_title=top_title,
            bottom_sub="주사기 없이 1초 펌프 급여 | 응급 상비겔 파보겔",
            date_tag=date_tag,
            iso_week=iso_week,
        )
        if rendered_video:
            print(f"✓ Rendered primary/daily video : {os.path.basename(rendered_video)}")
        else:
            print("! Primary video rendering returned None.")

        need_ranking = (yt_format == "ranking" or reels_format == "ranking")
        rendered_ranking = None
        if need_ranking:
            try:
                rendered_ranking = self.ranking_generator.generate_daily_ranking_shorts(
                    day_index=ranking_idx,
                    date_tag=date_tag,
                    iso_week=iso_week,
                )
                if rendered_ranking:
                    print(f"✓ Rendered ranking shorts      : {os.path.basename(rendered_ranking)}")
            except Exception as e:
                print(f"! Ranking shorts generation notice: {e}")

        need_pump = (yt_format == "pump_guide" or reels_format == "pump_guide")
        rendered_pump = None
        if need_pump:
            try:
                rendered_pump = self.pump_generator.generate_daily_pump_shorts(date_tag=date_tag)
                if rendered_pump:
                    print(f"✓ Rendered clinical pump shorts: {os.path.basename(rendered_pump)}")
            except Exception as e:
                print(f"! Clinical pump shorts generation notice: {e}")

        # 3-2. 리뷰 공감형 후킹 트랙 (`--track review_hook`) 및 Higgsfield 720p B-roll 통합 렌더링
        rendered_review = None
        review_master: Optional[Dict[str, Any]] = None
        if active_track == "review_hook":
            try:
                from core.review_shorts_generator import ReviewShortsGenerator
                from core.shortform_renderer import ShortformAutoRenderer

                rev_src = reviews_file
                if not rev_src:
                    for cand_name in ("parvogel_reviews.csv", "parvogel_reviews.json", "sample_reviews_parvogel.json"):
                        cand_path = os.path.join(DATA_DIR, cand_name)
                        if os.path.exists(cand_path):
                            rev_src = cand_path
                            break
                rev_gen = ReviewShortsGenerator()
                review_master = rev_gen.generate_master_json(
                    product_name="ParvoGel",
                    reviews_source=rev_src,
                    hook_pattern=hook_pattern or "auto",
                    date_str=date_str,
                )
                assert_payload_safe(review_master, context="track:review_hook")
                os.makedirs(OUTPUT_DIR, exist_ok=True)
                rev_json_path = os.path.join(OUTPUT_DIR, f"review_master_{date_tag}.json")
                with open(rev_json_path, "w", encoding="utf-8") as rf:
                    json.dump(review_master, rf, ensure_ascii=False, indent=2)
                rendered_review = ShortformAutoRenderer().render_shortform_video(review_master)
                if rendered_review:
                    print(f"✓ Rendered review_hook shorts : {os.path.basename(rendered_review)}")
            except Exception as e:
                print(f"! review_hook shorts notice: {e}")

        # 채널별 최적 영상 라우팅 테이블 구성 (교차 중복 최소화)
        def _select_video(adapter_name: str) -> Optional[str]:
            if active_track == "review_hook" and rendered_review and adapter_name in ("YouTube_Shorts", "Instagram_Reels"):
                return rendered_review
            if adapter_name == "YouTube_Shorts":
                if yt_format == "ranking" and rendered_ranking:
                    return rendered_ranking
                if yt_format == "pump_guide" and rendered_pump:
                    return rendered_pump
                return rendered_video or rendered_ranking or rendered_pump
            if adapter_name == "Instagram_Reels":
                if reels_format == "pump_guide" and rendered_pump:
                    return rendered_pump
                if reels_format == "ranking" and rendered_ranking:
                    return rendered_ranking
                return rendered_video or rendered_pump or rendered_ranking
            if adapter_name == "TikTok":
                # TikTok은 YouTube와 가급적 다른 포맷을 우선 배정해 플랫폼 간 다양성 확보
                yt_vid = _select_video("YouTube_Shorts")
                for cand in (rendered_video, rendered_pump, rendered_ranking):
                    if cand and cand != yt_vid:
                        return cand
                return yt_vid
            return rendered_video or rendered_ranking or rendered_pump

        # 4. 멀티스레드 병렬 배포 및 아카이브 저장
        print("\n[STEP 4/5] Publishing and archiving content...")
        results: Dict[str, str] = {}
        live_urls: Dict[str, Any] = {}

        ledger = self._load_ledger()
        prev_entry = next((e for e in reversed(ledger) if e.get("date") == date_str), None)
        prev_success = set()
        if prev_entry and not force:
            for ch, st in prev_entry.get("publish_results", {}).items():
                if st == "SUCCESS" or (isinstance(st, str) and st.startswith("SUCCESS")):
                    prev_success.add(ch)

        if dry_run:
            for adapter in self.adapters:
                ch_cfg = self.formatter.config.get("channels", {}).get(adapter.name, {})
                enabled = ch_cfg.get("enabled", True)
                publish_mode = ch_cfg.get("publish_mode", "auto")
                vid = _select_video(adapter.name)
                cfg_ok = adapter.validate_config()
                if not enabled or publish_mode == "off":
                    results[adapter.name] = "DISABLED"
                elif publish_mode != "auto":
                    results[adapter.name] = "DRY_RUN_DRAFT_ONLY"
                else:
                    results[adapter.name] = f"DRY_RUN_READY (cfg={cfg_ok}, video={os.path.basename(vid) if vid else 'none'})"
        else:
            with ThreadPoolExecutor(max_workers=3) as executor:
                future_to_adapter = {}
                for adapter in self.adapters:
                    ch_key = adapter.name
                    ch_cfg = self.formatter.config.get("channels", {}).get(ch_key, {})
                    enabled = ch_cfg.get("enabled", True)
                    publish_mode = ch_cfg.get("publish_mode", "auto")

                    if not enabled or publish_mode == "off":
                        results[adapter.name] = "DISABLED"
                        continue

                    if publish_mode != "auto":
                        results[adapter.name] = "SKIPPED_DRAFT_ONLY"
                        continue

                    if adapter.name in prev_success:
                        print(f"⏩ [SKIP] {adapter.name} already successfully published today.")
                        results[adapter.name] = "SUCCESS (PREVIOUS)"
                        continue

                    if adapter.validate_config() and not (adapter.name == "Naver_Blog" and os.getenv("GITHUB_ACTIONS") == "true"):
                        data = formatted_channels.get(ch_key, {}).copy()
                        chosen_video = _select_video(adapter.name)
                        if chosen_video:
                            data["video_path"] = chosen_video
                        data["campaign_id"] = f"PARVOGEL_{active_day.upper()}_W{iso_week:02d}_{date_tag}"
                        if adapter.name == "YouTube_Shorts":
                            if review_master:
                                data["title"] = review_master.get("title", data.get("title", ""))
                                data["description"] = review_master.get("caption", data.get("description", ""))
                                data["pinned_comment"] = review_master.get("pinned_comment", "")
                            else:
                                data.setdefault(
                                    "pinned_comment",
                                    "파보겔 공식 정품 안내\n"
                                    "▶ 공식 스마트스토어: https://smartstore.naver.com/koreaagro/products/11119190020\n"
                                    "▶ 공식 쿠팡 구매처: https://www.coupang.com/vp/products/8454837497\n"
                                    "▶ 공식 홈페이지: https://parvogel.kr/ ((주)한국아그로 02-6949-5708)",
                                )
                            sched_at = publish_at or os.getenv("YOUTUBE_PUBLISH_AT", "").strip()
                            if sched_at:
                                data["publish_at"] = sched_at
                        assert_payload_safe(data, context=f"live:{adapter.name}")
                        future = executor.submit(adapter.publish, data)
                        future_to_adapter[future] = adapter
                    elif adapter.name in ("Naver_Blog", "Threads"):
                        ch_data = formatted_channels.get(ch_key, {})
                        if ch_data:
                            queued = push_post_to_queue(
                                title=ch_data.get("title", narrative.get("headline", "파보겔 임상 스토리")),
                                body=ch_data.get("body", ch_data.get("main_post", "")),
                                links=ch_data.get("links", {}),
                                target_brand="KOREA_AGRO",
                                product_id="PARVOGEL_D2C"
                            )
                            results[adapter.name] = f"QUEUED_HYBRID ({queued['id']})"
                        else:
                            results[adapter.name] = "QUEUED_HYBRID"
                    else:
                        results[adapter.name] = "SKIPPED_NO_KEY"

                for future in as_completed(future_to_adapter):
                    adapter = future_to_adapter[future]
                    ad_name = adapter.name
                    try:
                        success = future.result()
                        if success:
                            meta = getattr(adapter, "last_result", None) or {}
                            if meta.get("url"):
                                live_urls[ad_name] = meta["url"]
                            elif meta.get("id"):
                                live_urls[ad_name] = meta["id"]
                            elif meta.get("uri"):
                                live_urls[ad_name] = meta["uri"]
                            suffix = f" ({live_urls[ad_name]})" if ad_name in live_urls else ""
                            results[ad_name] = f"SUCCESS{suffix}"
                        elif ad_name in ("Naver_Blog", "Threads"):
                            ch_data = formatted_channels.get(ad_name, {})
                            queued = push_post_to_queue(
                                title=ch_data.get("title", narrative.get("headline", "파보겔 임상 스토리")),
                                body=ch_data.get("body", ch_data.get("main_post", "")),
                                links=ch_data.get("links", {}),
                                target_brand="KOREA_AGRO",
                                product_id="PARVOGEL_D2C"
                            )
                            results[ad_name] = f"QUEUED_HYBRID_FALLBACK ({queued['id']})"
                        else:
                            results[ad_name] = "FAILED"
                    except Exception as e:
                        results[ad_name] = f"ERROR: {e}"

        # 4-2. 원고 drafts/ 보관
        for ch_name, ch_content in formatted_channels.items():
            draft_path = self.draft_adapter.publish_draft(ch_name, ch_content, date_str)
            ch_cfg = self.formatter.config.get("channels", {}).get(ch_name, {})
            if ch_cfg.get("publish_mode") == "draft_only" or ch_name not in results:
                results[ch_name] = f"ARCHIVED_DRAFT: {os.path.basename(draft_path)}"

        # 5. 배포 장부 업데이트 (상대경로 사용, 리눅스/윈도우 호환)
        rel_rendered = None
        if rendered_video:
            try:
                rel_rendered = os.path.relpath(rendered_video, FACTORY_DIR).replace(os.sep, "/")
            except Exception:
                rel_rendered = os.path.basename(rendered_video)

        yt_selected = _select_video("YouTube_Shorts")
        ledger_entry = {
            "timestamp": start_time.isoformat(),
            "date": date_str,
            "day": active_day,
            "iso_week": iso_week,
            "mode": "DRY_RUN" if dry_run else "LIVE",
            "theme": narrative.get("headline"),
            "video_file": target_video,
            "youtube_video_used": os.path.basename(yt_selected) if yt_selected else None,
            "rendered_video": rel_rendered or rendered_video,
            "rendered_ranking_video": os.path.basename(rendered_ranking) if rendered_ranking else None,
            "rendered_pump_video": os.path.basename(rendered_pump) if rendered_pump else None,
            "live_urls": live_urls,
            "publish_results": results,
        }
        if not dry_run:
            ledger = self._load_ledger()
            ledger.append(ledger_entry)
            self._save_ledger(ledger)

        # 6. 실패 알림 — Discord 웹훅 브로드캐스트
        failed = {k: v for k, v in results.items() if v in ("FAILED", "SKIPPED_NO_KEY") or str(v).startswith("ERROR") or str(v).startswith("FAILED")}
        if failed and not dry_run:
            try:
                import requests
                wh = os.getenv("DISCORD_WEBHOOK_URL")
                if wh:
                    fail_lines = "\n".join(f"• {k}: {v}" for k, v in failed.items())
                    requests.post(wh, json={"content": f"⚠️ ParvoGel Factory {date_str} ({active_day}) 일부 실패\n{fail_lines[:1500]}"}, timeout=5)
            except Exception:
                pass

        # 7. 퍼널 대시보드 업데이트
        print("\n[STEP 5/5] Updating Analytics Dashboard...")
        try:
            dash_path = self.dashboard_service.build_html_dashboard()
            print(f"✓ Updated Funnel Dashboard: {os.path.basename(dash_path)}")
        except Exception as e:
            print(f"! Dashboard update warning: {e}")

        duration = (now_kst() - start_time).total_seconds()
        print("\n" + "=" * 68)
        print(f"🎉 [FACTORY RUN COMPLETE] Elapsed: {duration:.2f}s")
        for ch, status in results.items():
            print(f"  • {ch:16}: {status}")
        if live_urls:
            print("🔗 Live URLs:")
            for ch, u in live_urls.items():
                print(f"  • {ch:16}: {u}")
        print(f"📁 Drafts archived in: {DRAFTS_DIR}")
        print("=" * 68)

        # False Green 원천 차단: 라이브 모드에서 핵심 채널(YouTube_Shorts)이 실패하면 비정상 종료 코드 반환
        yt_status = str(results.get("YouTube_Shorts", ""))
        if not dry_run and strict_youtube and (yt_status == "FAILED" or yt_status.startswith("ERROR") or yt_status == "SKIPPED_NO_KEY"):
            print(f"❌ [STRICT FAIL] Primary channel YouTube_Shorts did not succeed: {yt_status}")
            sys.exit(1)

        return ledger_entry

    def generate_viral_shortform_campaign(self, reference_stt: str, source_url: Optional[str] = None) -> Dict[str, Any]:
        """바이럴 숏폼 역설계 및 3종 숏폼 대본/어셈블러 패키지 생성"""
        print("\n" + "=" * 65)
        print("🎯 [VIRAL SHORTFORM ENGINE] Reverse Engineering & Generating 3-Track Scripts")
        print("=" * 65)
        pkg = self.viral_engine.generate_full_package(reference_stt, source_url)
        pkg_file = os.path.join(OUTPUT_DIR, f"viral_campaign_{now_kst().strftime('%Y%m%d_%H%M%S')}.json")
        with open(pkg_file, "w", encoding="utf-8") as f:
            json.dump(pkg, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved campaign package: {pkg_file}")
        return pkg


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="ParvoGel Multi-Channel Marketing Master")
    parser.add_argument("target_day", nargs="?", default=None, help="Optional day name override (e.g. Monday)")
    parser.add_argument("--force", "-f", action="store_true", help="Override duplicate today guard")
    parser.add_argument("--dry-run", action="store_true", help="Run without live external API posts")
    parser.add_argument("--strict-youtube", action="store_true", help="Exit 1 if YouTube Shorts publish fails")
    parser.add_argument("--track", default=None, help="Pipeline track: standard | review_hook")
    parser.add_argument("--reviews-file", default=None, help="Reviews file path (.json/.csv/.txt) for review_hook track")
    parser.add_argument("--hook-pattern", default="auto", help="auto | empathy_question | review_metric | contrast_crisis")
    parser.add_argument("--publish-at", default=None, help="Optional ISO-8601 publishAt schedule for YouTube Shorts")

    cli_args, _ = parser.parse_known_args()
    strict_yt_flag = cli_args.strict_youtube or (os.getenv("GITHUB_ACTIONS") == "true")

    master = ParvogelMarketingMaster()
    master.run_daily_pipeline(
        target_day=cli_args.target_day,
        force=cli_args.force,
        dry_run=cli_args.dry_run,
        strict_youtube=strict_yt_flag,
        track=cli_args.track,
        reviews_file=cli_args.reviews_file,
        hook_pattern=cli_args.hook_pattern,
        publish_at=cli_args.publish_at,
    )
