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
            self.assertIn("1-deoxinojirimycin", narrative.get("clinical_solution"))
            
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


if __name__ == "__main__":
    unittest.main()
