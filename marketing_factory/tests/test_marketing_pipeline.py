#!/usr/bin/env python3
"""
Test Suite — 파보겔 마케팅 파이프라인 무결성 검증 테스트
- 7개 요일별 내러티브 생성 무결성 검증
- 8대 채널별 포맷팅 및 UTM 링크 유효성 검증
- 법적 금지 단어(정식허가) 필터링 및 권장 단어(정식등록) 사용 확인
"""

import os
import sys
import unittest
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, FACTORY_DIR)

from core.content_enricher import ParvogelContentEnricher
from core.content_formatter import ParvogelContentFormatter


class TestParvogelMarketingPipeline(unittest.TestCase):

    def setUp(self):
        self.enricher = ParvogelContentEnricher()
        self.formatter = ParvogelContentFormatter()

    def test_7_days_themes(self):
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for day in days:
            narrative = self.enricher.generate_narrative(day)
            self.assertIsNotNone(narrative.get("headline"))
            self.assertIsNotNone(narrative.get("clinical_solution"))
            # clinical_solution 또는 전체 내러티브에 DNJ 언급이 있어야 함 (sanitize 후에도 유지)
            full_for_dnj = narrative.get("clinical_solution", "") + json.dumps(narrative, ensure_ascii=False)
            self.assertIn("deoxinojirimycin", full_for_dnj.lower())
            
            # 법적 리스크 사전 차단 ("정식허가" 금지)
            full_text = json.dumps(narrative, ensure_ascii=False)
            self.assertNotIn("정식허가", full_text, f"Banned phrase '정식허가' found in {day} narrative!")

    def test_8_channels_formatting_and_utms(self):
        narrative = self.enricher.generate_narrative("Wednesday")
        channels = self.formatter.format_all_channels(narrative)
        
        expected_channels = [
            "Telegram", "Discord", "Twitter_X", "Naver_Blog",
            "YouTube_Shorts", "Instagram_Reels", "LinkedIn_B2B", "Clinic_Cold_DM"
        ]
        for ch in expected_channels:
            self.assertIn(ch, channels, f"Channel {ch} missing from formatted output!")
            ch_data = channels[ch]
            self.assertIn("links", ch_data, f"Links missing for channel {ch}")
            links = ch_data["links"]
            self.assertIn("utm_source", links["smartstore"])
            self.assertIn("utm_source", links["coupang"])
            self.assertIn("utm_source", links["landing"])

    def test_patent_number_accuracy(self):
        narrative = self.enricher.generate_narrative("Thursday")
        channels = self.formatter.format_all_channels(narrative)
        naver_blog_body = channels["Naver_Blog"]["body"]
        self.assertIn("2011B0042620.8", naver_blog_body)

    def test_video_maker_has_drawtext(self):
        import inspect
        from core.video_maker import ParvogelVideoMaker
        src = inspect.getsource(ParvogelVideoMaker.generate_daily_shorts)
        self.assertIn("drawtext", src, "video_maker must use drawtext for titles")
        self.assertIn("top_title", src)

    def test_utm_valid_url(self):
        narrative = self.enricher.generate_narrative("Monday")
        channels = self.formatter.format_all_channels(narrative)
        from urllib.parse import urlparse, parse_qs
        for ch in ["Telegram", "Naver_Blog"]:
            links = channels[ch]["links"]
            for key in ["landing", "smartstore", "coupang"]:
                u = links[key]
                self.assertIn("utm_source", u)
                parsed = urlparse(u)
                self.assertTrue(parsed.scheme.startswith("http"))
                # smartstore must contain ? not & after product id
                if key == "smartstore":
                    self.assertIn("?", u)

    def test_no_absolute_windows_path(self):
        import marketing_factory.core.marketing_master as mm
        import inspect
        src = inspect.getsource(mm.ParvogelMarketingMaster._save_ledger)
        # ledger should not hardcode C:\
        self.assertNotIn("C:\\\\", src)

    def test_banned_phrase_sanitized(self):
        narrative = self.enricher.generate_narrative("Friday")
        full = json.dumps(narrative, ensure_ascii=False)
        for banned in ["정식허가", "완치 보장", "100% 치료"]:
            self.assertNotIn(banned, full)


if __name__ == "__main__":
    unittest.main()
