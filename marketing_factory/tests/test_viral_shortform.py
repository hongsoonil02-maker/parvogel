#!/usr/bin/env python3
"""
Test Suite — 파보겔 바이럴 숏폼 역설계 및 퍼널 엔진 검증 테스트
"""

import os
import sys
import unittest
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, FACTORY_DIR)

from core.viral_shortform_engine import ViralShortformEngine


class TestViralShortformEngine(unittest.TestCase):

    def setUp(self):
        self.engine = ViralShortformEngine()

    def test_reverse_engineering_and_generation(self):
        sample_stt = """
        강아지 키우시는 분들 절대 하지 말아야 할 최악의 행동 1가지 알려드립니다.
        설사한다고 주사기 억지로 쑤셔 넣으면 기도로 넘어가서 폐렴 옵니다.
        1초 펌프로 입가에 쓱 대주면 핥아먹고 끝납니다.
        댓글로 파보 남겨주시면 가이드북 보내드립니다.
        """
        pkg = self.engine.generate_full_package(sample_stt)

        # 1. 3가지 버전 존재 검증
        scripts = pkg.get("scripts", {})
        self.assertIn("version_a", scripts)
        self.assertIn("version_b", scripts)
        self.assertIn("version_c", scripts)

        # 2. 러닝타임 검증 (30~50초 범위)
        for v_key in ["version_a", "version_b", "version_c"]:
            sec = scripts[v_key].get("running_time_sec", 0)
            self.assertTrue(30 <= sec <= 50, f"{v_key} running time {sec} out of 30~50s bounds")

        # 3. 법적 금지 단어 필터링 검증
        dumped = json.dumps(pkg, ensure_ascii=False)
        self.assertNotIn("100% 완치", dumped)
        self.assertNotIn("정식허가", dumped)
        self.assertNotIn("특효약", dumped)

        # 4. 키워드 트리거 및 퍼널 검증
        self.assertEqual(scripts["version_a"]["trigger_keyword"], "파보")
        self.assertEqual(scripts["version_b"]["trigger_keyword"], "골든타임")
        self.assertEqual(scripts["version_c"]["trigger_keyword"], "송아지")

        # 5. 옵션 A/B 어셈블러 페이로드 검증
        payloads = pkg.get("assembler_payloads", {})
        for v_key in ["version_a", "version_b", "version_c"]:
            self.assertIn("option_a_render", payloads[v_key])
            self.assertIn("option_b_outsource", payloads[v_key])
            self.assertEqual(payloads[v_key]["option_b_outsource"]["unit_price_krw"], 15000)

    def test_comment_funnel(self):
        from core.comment_funnel import CommentFunnelEngine
        funnel = CommentFunnelEngine()
        res = funnel.process_incoming_comment("테스트_보호자", "파보 증상 가이드북 부탁드려요")
        self.assertIsNotNone(res)
        self.assertEqual(res["matched_keyword"], "파보")
        self.assertIn("https://parvogel.kr/guidebook-puppy", res["dm_sent"])
        self.assertIn("smartstore.naver.com", res["dm_sent"])

    def test_outsource_dispatcher(self):
        from core.outsource_dispatcher import OutsourceDispatcher
        dispatcher = OutsourceDispatcher()
        pkg = self.engine.generate_full_package("외주 발주 테스트 대본")
        tsv_path = dispatcher.export_batch_spreadsheet_rows([pkg])
        self.assertTrue(os.path.exists(tsv_path))
        with open(tsv_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        self.assertGreater(len(lines), 3)

    def test_shortform_release_manager(self):
        from core.shortform_release_manager import ShortformReleaseManager
        rel_mgr = ShortformReleaseManager()
        matrix = rel_mgr.build_ab_test_matrix()
        self.assertIn("version_a", matrix)
        self.assertIn("version_b", matrix)
        self.assertIn("version_c", matrix)
        self.assertTrue(os.path.exists(matrix["version_a"]["video_file"]))


if __name__ == "__main__":
    unittest.main()
