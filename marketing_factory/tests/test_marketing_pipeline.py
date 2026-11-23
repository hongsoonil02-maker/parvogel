#!/usr/bin/env python3
"""
Test Suite — 파보겔 순수 B2C 마케팅 파이프라인 무결성 & 브랜드 분리 검증 테스트
- 7개 요일별 B2C 내러티브 생성 및 주차별 변주 무결성 검증
- 전 채널 포맷팅, UTM 링크 유효성, 카카오쇼핑 링크 포함 확인
- 브랜드 분리 금지어(몬스멕타/SNJ/축산/무료샘플/상비약/정식허가/몽모릴로나이트) 전수 차단 검증
- 랭킹 쇼츠 7개 시나리오 전수 브랜드 정화 검증
- 로컬 스케줄러 .bat 파일 CRLF 줄바꿈 검증 (Exit Code 255 재발 방지)
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
from core.ranking_shorts_generator import ParvogelRankingShortsGenerator

STRICT_FORBIDDEN = [
    "정식허가", "완치 보장", "100% 치료",
    "몬스멕타", "monsmecta", "에스앤제이",
    "031-321-6562", "080-881-1289",
    "로타갈", "베타콜", "송아지", "자돈", "엠오바이오",
    "무료 샘플", "무료샘플", "?sample=petshop",
    "몽모릴로나이트", "상비약", "상비제",
]


class TestParvogelMarketingPipeline(unittest.TestCase):

    def setUp(self):
        self.enricher = ParvogelContentEnricher()
        self.formatter = ParvogelContentFormatter()

    def test_7_days_themes_and_brand_isolation(self):
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for day in days:
            narrative = self.enricher.generate_narrative(day)
            self.assertIsNotNone(narrative.get("headline"))
            self.assertIsNotNone(narrative.get("clinical_solution"))
            full_for_dnj = narrative.get("clinical_solution", "") + json.dumps(narrative, ensure_ascii=False)
            self.assertIn("deoxinojirimycin", full_for_dnj.lower())

            full_text = json.dumps(narrative, ensure_ascii=False).lower()
            for banned in STRICT_FORBIDDEN:
                self.assertNotIn(banned.lower(), full_text, f"Forbidden token '{banned}' found in {day} narrative!")

    def test_all_channels_formatting_utms_and_brand_guard(self):
        days = ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"]
        expected_channels = [
            "Telegram", "Discord", "Twitter_X", "Bluesky", "Naver_Blog",
            "YouTube_Shorts", "Instagram_Reels", "Facebook_Page", "TikTok",
            "Threads", "LinkedIn_B2B", "Clinic_Cold_DM"
        ]
        for day in days:
            narrative = self.enricher.generate_narrative(day)
            channels = self.formatter.format_all_channels(narrative)
            for ch in expected_channels:
                self.assertIn(ch, channels, f"Channel {ch} missing for {day}!")
                ch_data = channels[ch]
                self.assertIn("links", ch_data, f"Links missing for channel {ch}")
                links = ch_data["links"]
                self.assertIn("utm_source", links["smartstore"])
                self.assertIn("utm_source", links["coupang"])
                self.assertIn("utm_source", links["landing"])
                self.assertIn("kakao_store", links)
                blob = json.dumps(ch_data, ensure_ascii=False).lower()
                for banned in STRICT_FORBIDDEN:
                    self.assertNotIn(banned.lower(), blob, f"Forbidden token '{banned}' found in {day}/{ch}!")

    def test_ranking_scenarios_pure_b2c(self):
        gen = ParvogelRankingShortsGenerator()
        self.assertEqual(len(gen.scenarios), 7)
        blob = json.dumps(gen.scenarios, ensure_ascii=False).lower()
        for banned in STRICT_FORBIDDEN:
            self.assertNotIn(banned.lower(), blob, f"Forbidden token '{banned}' found in ranking scenarios!")

    def test_patent_number_accuracy(self):
        narrative = self.enricher.generate_narrative("Thursday")
        channels = self.formatter.format_all_channels(narrative)
        naver_blog_body = channels["Naver_Blog"]["body"]
        self.assertIn("2011B0042620.8", naver_blog_body)

    def test_video_maker_has_drawtext_and_gomi_support(self):
        import inspect
        from core.video_maker import ParvogelVideoMaker
        src = inspect.getsource(ParvogelVideoMaker.generate_daily_shorts)
        self.assertIn("drawtext", src, "video_maker must use drawtext for titles")
        self.assertIn("top_title", src)
        self.assertTrue(hasattr(ParvogelVideoMaker, "generate_gomi_parrot_shorts"))
        self.assertTrue(hasattr(ParvogelVideoMaker, "generate_real_clinical_docu_shorts"))

    def test_utm_valid_url(self):
        narrative = self.enricher.generate_narrative("Monday")
        channels = self.formatter.format_all_channels(narrative)
        from urllib.parse import urlparse
        for ch in ["Telegram", "Naver_Blog", "YouTube_Shorts"]:
            links = channels[ch]["links"]
            for key in ["landing", "smartstore", "coupang"]:
                u = links[key]
                self.assertIn("utm_source", u)
                parsed = urlparse(u)
                self.assertTrue(parsed.scheme.startswith("http"))
                if key == "smartstore":
                    self.assertIn("?", u)

    def test_no_absolute_windows_path(self):
        import core.marketing_master as mm
        import inspect
        src = inspect.getsource(mm.ParvogelMarketingMaster._save_ledger)
        self.assertNotIn("C:\\\\", src)

    def test_local_scheduler_bat_is_crlf(self):
        bat_path = os.path.join(FACTORY_DIR, "scheduler", "run_marketing_factory.bat")
        with open(bat_path, "rb") as f:
            raw = f.read()
        crlf_count = raw.count(b"\r\n")
        lf_only_count = raw.count(b"\n") - crlf_count
        self.assertGreater(crlf_count, 5, "run_marketing_factory.bat must have CRLF lines")
        self.assertEqual(lf_only_count, 0, "run_marketing_factory.bat must have ZERO LF-only lines to prevent cmd.exe Exit Code 255!")


if __name__ == "__main__":
    unittest.main()
