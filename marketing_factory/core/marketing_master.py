#!/usr/bin/env python3
"""
Marketing Master — 파보겔(Parvogel) 마케팅 자동화 공장 총괄 오케스트레이터
- 매일 아침 자동 실행되어 당일 테마 선별
- AI 내러티브 생성 -> 8개 채널 포맷팅 -> 9:16 숏폼 비디오 렌더링 -> 멀티채널 병렬 배포
- 배포 장부(published_ledger.json) 기록 및 drafts/ 아카이브 저장
"""

import os
import sys
import json
import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, List

# UTF-8 보장
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(FACTORY_DIR, "data")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")
DRAFTS_DIR = os.path.join(FACTORY_DIR, "drafts")

sys.path.insert(0, FACTORY_DIR)

from core.content_enricher import ParvogelContentEnricher
from core.content_formatter import ParvogelContentFormatter
from core.video_maker import ParvogelVideoMaker
from adapters.telegram_adapter import TelegramAdapter
from adapters.discord_adapter import DiscordAdapter
from adapters.twitter_adapter import TwitterAdapter
from adapters.file_draft_adapter import FileDraftAdapter


class ParvogelMarketingMaster:
    """파보겔 마케팅 공장 총괄 지휘 엔진"""

    def __init__(self):
        self.enricher = ParvogelContentEnricher()
        self.formatter = ParvogelContentFormatter()
        self.video_maker = ParvogelVideoMaker()
        self.draft_adapter = FileDraftAdapter(DRAFTS_DIR)
        
        self.adapters = [
            TelegramAdapter(),
            DiscordAdapter(),
            TwitterAdapter()
        ]
        self.ledger_path = os.path.join(DATA_DIR, "published_ledger.json")

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

    def run_daily_pipeline(self, target_day: str = None) -> Dict[str, Any]:
        start_time = datetime.datetime.now()
        date_str = start_time.strftime("%Y-%m-%d")
        print("=" * 65)
        print(f"🏭 [PARVOGEL MARKETING FACTORY] Starting Daily Run: {date_str}")
        print("=" * 65)

        # 1. AI 임상 내러티브 생성
        print("\n[STEP 1/4] Generating clinical narrative...")
        narrative = self.enricher.generate_narrative(target_day)
        print(f"✓ Theme: {narrative.get('headline')}")
        print(f"✓ Source: {narrative.get('source')}")

        # 2. 8대 채널별 포맷팅 및 UTM 링크 주입
        print("\n[STEP 2/4] Formatting content for 8 distribution channels...")
        formatted_channels = self.formatter.format_all_channels(narrative)
        print(f"✓ Formatted channels: {list(formatted_channels.keys())}")

        # 3. 9:16 숏폼 비디오 자동 렌더링
        print("\n[STEP 3/4] Rendering 9:16 Shorts/Reels video...")
        target_video = narrative.get("video_file", "parvogel_case_01_seizure.mp4")
        top_title = narrative.get("headline", "55일령 아기 강아지 급성 장염")[:24]
        rendered_video = self.video_maker.generate_daily_shorts(
            video_filename=target_video,
            top_title=top_title,
            bottom_sub="주사기 없이 1초 펌프 급여 | 파보겔",
            date_tag=start_time.strftime("%Y%m%d")
        )
        if rendered_video:
            print(f"✓ Rendered video: {os.path.basename(rendered_video)}")
        else:
            print("! Video rendering skipped or fallback used.")

        # 4. 멀티스레드 병렬 배포 및 아카이브 저장
        print("\n[STEP 4/4] Publishing and archiving content...")
        results = {}

        # 4-1. 소셜 API 직접 배포 (Telegram, Discord, Twitter)
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_adapter = {}
            for adapter in self.adapters:
                if adapter.validate_config():
                    ch_key = "Twitter_X" if adapter.name == "Twitter_X" else adapter.name
                    data = formatted_channels.get(ch_key, {})
                    future = executor.submit(adapter.publish, data)
                    future_to_adapter[future] = adapter.name
                else:
                    results[adapter.name] = "SKIPPED_NO_KEY"

            for future in as_completed(future_to_adapter):
                ad_name = future_to_adapter[future]
                try:
                    success = future.result()
                    results[ad_name] = "SUCCESS" if success else "FAILED"
                except Exception as e:
                    results[ad_name] = f"ERROR: {e}"

        # 4-2. 포스팅 원고 drafts/ 폴더 보관 (블로그, 숏폼, 릴스, 링크드인, DM)
        for ch_name, ch_content in formatted_channels.items():
            draft_path = self.draft_adapter.publish_draft(ch_name, ch_content, date_str)
            if ch_name not in results:
                results[ch_name] = f"ARCHIVED_DRAFT: {os.path.basename(draft_path)}"

        # 5. 배포 장부 업데이트
        ledger = self._load_ledger()
        ledger_entry = {
            "timestamp": start_time.isoformat(),
            "date": date_str,
            "theme": narrative.get("headline"),
            "video_file": target_video,
            "rendered_video": rendered_video,
            "publish_results": results
        }
        ledger.append(ledger_entry)
        self._save_ledger(ledger)

        duration = (datetime.datetime.now() - start_time).total_seconds()
        print("\n" + "=" * 65)
        print(f"🎉 [FACTORY RUN COMPLETE] Elapsed: {duration:.2f}s")
        for ch, status in results.items():
            print(f"  • {ch:16}: {status}")
        print(f"📁 Drafts archived in: {DRAFTS_DIR}")
        print("=" * 65)

        return ledger_entry


if __name__ == "__main__":
    master = ParvogelMarketingMaster()
    master.run_daily_pipeline()
