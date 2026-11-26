import json
import os
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import MagicMock, patch

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FACTORY_DIR = os.path.join(PROJECT_DIR, "marketing_factory")
sys.path.insert(0, PROJECT_DIR)
sys.path.insert(0, FACTORY_DIR)

from marketing_factory.core.higgsfield_broll_client import HiggsfieldBrollClient
from marketing_factory.core.review_shorts_generator import ReviewShortsGenerator
from marketing_factory.core.shortform_renderer import ShortformAutoRenderer
from marketing_factory.mcp.higgsfield_mcp_server import handle_jsonrpc_message
from marketing_factory.adapters.youtube_adapter import YouTubeAdapter


class TestReviewHiggsfieldPipeline(unittest.TestCase):
    def setUp(self):
        self.gen = ReviewShortsGenerator()
        self.sample_reviews_path = os.path.join(FACTORY_DIR, "data", "sample_reviews_parvogel.json")
        self.sample_master_path = os.path.join(FACTORY_DIR, "data", "review_shorts_master_sample.json")

    def test_load_reviews_text_csv_json(self):
        # 1) JSON
        json_reviews = self.gen.load_reviews(self.sample_reviews_path)
        self.assertEqual(len(json_reviews), 5)

        # 2) Text
        raw_txt = "1. 새벽에 토해서 급히 먹였는데 잘 먹어요\n2. 병원 문 닫은 밤 큰 도움 됐습니다"
        txt_reviews = self.gen.load_reviews(raw_txt)
        self.assertEqual(len(txt_reviews), 2)

        # 3) CSV
        with tempfile.NamedTemporaryFile("w", suffix=".csv", encoding="utf-8-sig", delete=False, newline="") as tf:
            tf.write("platform,rating,content\n")
            tf.write("smartstore,5,갑자기 묽은 변 봐서 급여했는데 기호성이 좋아요\n")
            tf.write("coupang,4.5,사료 거부하던 아이가 다음날 밥을 먹어요\n")
            csv_path = tf.name
        try:
            csv_reviews = self.gen.load_reviews(csv_path)
            self.assertEqual(len(csv_reviews), 2)
            self.assertEqual(csv_reviews[0]["platform"], "smartstore")
        finally:
            os.remove(csv_path)

    def test_hook_patterns_and_compliance_sanitization(self):
        dirty_reviews = [
            "새벽에 강아지가 갑자기 토해서 당황했어요. 치료제처럼 완치 수준이고 상비약으로 딱이며 부작용 없음입니다. 처방약 대용으로 몽모릴로나이트 짱.",
        ]
        for pattern in ("empathy_question", "review_metric", "contrast_crisis"):
            master = self.gen.generate_master_json(
                product_name="ParvoGel",
                reviews_source=dirty_reviews,
                hook_pattern=pattern,
                date_str="2026-11-26",
            )
            self.assertEqual(master["episode_type"], "review_hook")
            self.assertEqual(master["hook_pattern"], pattern)
            self.assertEqual(len(master["scenes"]), 4)
            self.assertTrue(master["compliance_status"]["passed"])
            self.assertGreater(master["compliance_status"]["filtered_terms_count"], 0)

            serialized = json.dumps(master, ensure_ascii=False)
            for bad in ["완치", "치료제", "처방약", "상비약", "부작용 없음", "몽모릴로나이트", "몬스멕타", "에스앤제이", "031-321-6562", "무료 샘플"]:
                self.assertNotIn(bad, serialized)

            # Scene 3은 반드시 공식 실사 레퍼런스 전용 & AI 생성 차단
            scene3 = master["scenes"][2]
            self.assertEqual(scene3["broll_source"], "official_reference_asset")
            self.assertFalse(scene3["use_ai_broll"])
            self.assertEqual(scene3["official_asset_path"], "public/images/bottle_front.png")

    def test_brand_isolation_all_five_products(self):
        snj_products = ["Monsmecta", "Hepamax", "Renaldetox", "Heartcare Gel"]
        sample_txt = "밤에 갑자기 컨디션이 떨어져서 급여했는데 잘 먹고 다음 날 한결 편해졌어요."
        for prod in snj_products:
            master = self.gen.generate_master_json(prod, sample_txt, date_str="2026-11-26")
            self.assertEqual(master["brand_profile"]["brand_group"], "SNJ")
            self.assertEqual(master["brand_profile"]["phone"], "031-321-6562")
            serialized = json.dumps(master, ensure_ascii=False).lower()
            self.assertNotIn("parvogel", serialized)
            self.assertNotIn("파보겔", serialized)
            self.assertNotIn("02-6949-5708", serialized)

    def test_higgsfield_720p_lock_product_guard_cache_and_cost(self):
        self.assertEqual(HiggsfieldBrollClient.enforce_720p("1080p"), "720p")
        self.assertEqual(HiggsfieldBrollClient.enforce_720p("4k"), "720p")

        with tempfile.TemporaryDirectory() as cache_dir:
            client = HiggsfieldBrollClient(cache_dir=cache_dir, api_key="", api_secret="")
            # 제품 용기/라벨 생성 시도 차단 검증
            with self.assertRaises(ValueError):
                client.get_or_generate_broll(
                    prompt="Parvogel bottle close up on table",
                    scene_role="dog_situation_cut",
                )
            with self.assertRaises(ValueError):
                client.get_or_generate_broll(
                    prompt="happy dog running in living room",
                    scene_role="official_reference_asset",
                )

            # 오프라인/키 미설정 시 720p 잠금 + 로컬 검증 클립 폴백 검증
            res = client.get_or_generate_broll(
                prompt="small Maltese sitting quietly on living room pad at night",
                scene_role="hook_2s",
                resolution="1080p",
                model="kling-3.0",
                fallback_file="public/assets/parvogel_case_01_seizure.mp4",
            )
            self.assertEqual(res["resolution"], "720p")
            self.assertEqual(res["model"], "kling-3.0-720p")
            self.assertEqual(res["source"], "local_fallback")
            self.assertTrue(os.path.exists(res["video_path"]))

            # 디스크 캐시 히트 검증
            key = client._compute_cache_key("kling-3.0-720p", "720p", 5, "small Maltese wagging tail")
            dummy_mp4 = os.path.join(cache_dir, f"{key}.mp4")
            with open(dummy_mp4, "wb") as f:
                f.write(b"fake-720p-mp4")
            cached_res = client.get_or_generate_broll(
                prompt="small Maltese wagging tail",
                scene_role="conclusion",
                resolution="4k",
                model="kling-3.0-720p",
            )
            self.assertEqual(cached_res["source"], "disk_cache")
            self.assertEqual(cached_res["estimated_credits"], 0)
            self.assertEqual(cached_res["resolution"], "720p")

        cost = HiggsfieldBrollClient.estimate_monthly_cost(30, 2, 5, "kling-3.0-720p")
        self.assertEqual(cost["monthly_credits_720p"], 1200.0)
        self.assertEqual(cost["estimated_monthly_usd"], 5.4)
        self.assertEqual(cost["savings_vs_1080p_full_ai_pct"], 77.8)

    def test_option3_budget_cap_and_role_cache_reuse(self):
        with tempfile.TemporaryDirectory() as cache_dir:
            client = HiggsfieldBrollClient(cache_dir=cache_dir, api_key="hf_key", max_new_generations_per_run=1)
            self.assertEqual(client.check_auth_status()["max_new_generations_per_run"], 1)

            def _fake_api(prompt, model, resolution, duration_sec, out_mp4_path):
                with open(out_mp4_path, "wb") as f:
                    f.write(b"fake-720p-api-clip")
                return out_mp4_path

            with patch.object(client, "_call_higgsfield_api", side_effect=_fake_api) as mock_api:
                # 1번째 신규 상황 컷 -> API 생성 허용 (20 cr)
                r1 = client.get_or_generate_broll(
                    prompt="night living room small dog resting on pad",
                    scene_role="hook_2s",
                    model="kling-3.0-720p",
                )
                self.assertEqual(r1["source"], "higgsfield_api")
                self.assertEqual(r1["estimated_credits"], 20.0)

                # 동일 run 내 2번째 다른 프롬프트(동일 scene_role) -> 편당 1컷 상한 도달로 역할 캐시 재사용 (0 cr)
                r2 = client.get_or_generate_broll(
                    prompt="different prompt same hook role at midnight",
                    scene_role="hook_2s",
                    model="kling-3.0-720p",
                )
                self.assertEqual(r2["source"], "disk_cache_role_reuse")
                self.assertEqual(r2["estimated_credits"], 0)
                self.assertEqual(mock_api.call_count, 1)

        opt3 = HiggsfieldBrollClient.estimate_monthly_cost(30, 2, 5, "kling-3.0-720p", cache_hit_ratio=0.5)
        self.assertEqual(opt3["monthly_credits_720p"], 600.0)
        self.assertEqual(opt3["estimated_monthly_usd"], 2.7)
        self.assertEqual(opt3["estimated_monthly_krw"], 3780)
        self.assertEqual(opt3["savings_vs_1080p_full_ai_pct"], 88.9)

    def test_mcp_server_jsonrpc_protocol(self):
        init_resp = handle_jsonrpc_message({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}})
        self.assertEqual(init_resp["result"]["serverInfo"]["name"], "parvogel-higgsfield-broll-mcp")

        list_resp = handle_jsonrpc_message({"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}})
        tool_names = [t["name"] for t in list_resp["result"]["tools"]]
        self.assertIn("check_higgsfield_auth", tool_names)
        self.assertIn("estimate_broll_cost", tool_names)
        self.assertIn("generate_720p_broll", tool_names)
        self.assertIn("generate_review_shorts_master", tool_names)

        guard_resp = handle_jsonrpc_message({
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "generate_720p_broll",
                "arguments": {"prompt": "Parvogel bottle label close-up"},
            },
        })
        self.assertTrue(guard_resp["result"]["isError"])

    def test_youtube_adapter_scheduled_and_pinned_comment_mocked(self):
        adapter = YouTubeAdapter()
        with tempfile.NamedTemporaryFile("wb", suffix=".mp4", delete=False) as tf:
            tf.write(b"dummy-video-bytes")
            vid_path = tf.name

        try:
            init_resp = MagicMock(status_code=200, headers={"Location": "https://upload.example/session"})
            up_resp = MagicMock(status_code=201)
            up_resp.json.return_value = {"id": "yt_test_123"}
            comment_resp = MagicMock(status_code=201)
            comment_resp.json.return_value = {"id": "cmt_abc"}

            with patch.dict(os.environ, {
                "YOUTUBE_CLIENT_ID": "cid",
                "YOUTUBE_CLIENT_SECRET": "csec",
                "YOUTUBE_REFRESH_TOKEN": "rtok",
            }), patch.object(adapter, "_refresh_access_token", return_value="access_tok"), \
                 patch("marketing_factory.adapters.youtube_adapter.requests.post", side_effect=[init_resp, comment_resp]) as mock_post, \
                 patch("marketing_factory.adapters.youtube_adapter.requests.put", return_value=up_resp), \
                 patch("core.firebase_shorts_sync.sync_short_to_firestore", return_value=True):
                ok = adapter.publish({
                    "video_path": vid_path,
                    "title": "파보겔 실제 리뷰",
                    "description": "설명",
                    "publish_at": "2026-11-27T09:00:00+09:00",
                    "pinned_comment": "공식 구매처: https://smartstore.naver.com/koreaagro/products/11119190020",
                })
                self.assertTrue(ok)
                self.assertEqual(adapter.last_result["id"], "yt_test_123")
                self.assertEqual(adapter.last_result["comment_id"], "cmt_abc")
                self.assertEqual(adapter.last_result["publish_at"], "2026-11-27T09:00:00+09:00")

                # 1차 POST(resumable init)에 publishAt + private 확인
                init_json = mock_post.call_args_list[0].kwargs["json"]
                self.assertEqual(init_json["status"]["privacyStatus"], "private")
                self.assertEqual(init_json["status"]["publishAt"], "2026-11-27T09:00:00+09:00")

                # 2차 POST(commentThreads.insert)에 구매 링크 댓글 확인
                cmt_json = mock_post.call_args_list[1].kwargs["json"]
                self.assertEqual(cmt_json["snippet"]["videoId"], "yt_test_123")
                self.assertIn("smartstore.naver.com", cmt_json["snippet"]["topLevelComment"]["snippet"]["textOriginal"])
        finally:
            os.remove(vid_path)

    def test_e2e_render_sample_review_master_ffmpeg(self):
        with open(self.sample_master_path, "r", encoding="utf-8") as f:
            master_obj = json.load(f)

        renderer = ShortformAutoRenderer()
        with tempfile.TemporaryDirectory() as out_dir:
            renderer.output_dir = out_dir
            mp4_path = renderer.render_shortform_video(master_obj)
            self.assertIsNotNone(mp4_path)
            self.assertTrue(os.path.exists(mp4_path))
            self.assertGreater(os.path.getsize(mp4_path), 10000)

            # ffprobe로 실제 해상도(1080x1920)와 오디오/비디오 스트림 검증
            probe = subprocess.run(
                [
                    "ffprobe", "-v", "error",
                    "-show_entries", "stream=codec_type,width,height:format=duration",
                    "-of", "json",
                    mp4_path,
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                encoding="utf-8",
                check=True,
            )
            info = json.loads(probe.stdout)
            video_streams = [s for s in info.get("streams", []) if s.get("codec_type") == "video"]
            audio_streams = [s for s in info.get("streams", []) if s.get("codec_type") == "audio"]
            self.assertTrue(video_streams)
            self.assertTrue(audio_streams)
            self.assertEqual(video_streams[0]["width"], 1080)
            self.assertEqual(video_streams[0]["height"], 1920)
            dur = float(info["format"]["duration"])
            self.assertGreaterEqual(dur, 12.0)
            self.assertLessEqual(dur, 25.0)


if __name__ == "__main__":
    unittest.main()
