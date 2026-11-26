import json
import os
import sys
import tempfile
import unittest
from unittest.mock import MagicMock, patch

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_DIR)

from marketing_factory.core.influencer_gonggu_guard import (
    OFFICIAL_KOREAAGRO_URL,
    assert_gonggu_safe,
    find_forbidden_gonggu_tokens,
)
from marketing_factory.core.influencer_lead_scraper import (
    PIPELINE_STAGES,
    InfluencerCRMStore,
    InfluencerLeadScraper,
    filter_micro_influencer,
    parse_bio_contacts,
)
from marketing_factory.core.influencer_outreach_manager import InfluencerOutreachManager
from marketing_factory.core.influencer_pitch_generator import InfluencerPitchGenerator


class TestInfluencerGongguSystem(unittest.TestCase):
    def test_brand_and_compliance_guardrail(self):
        with self.assertRaises(ValueError):
            assert_gonggu_safe("몬스멕타 사은품 증정 이벤트")
        with self.assertRaises(ValueError):
            assert_gonggu_safe("에스앤제이 동물병원 공식 공구")
        with self.assertRaises(ValueError):
            assert_gonggu_safe("파보겔 500ml 대용량 공구")
        with self.assertRaises(ValueError):
            assert_gonggu_safe("질병 예방·치료에 도움")
        with self.assertRaises(ValueError):
            assert_gonggu_safe("일반 소비자 무료 샘플 이벤트")

        safe_text = (
            "서울대 수의대 출신 수의학 전문가 홍순일 수의사 설계 · 파보겔 100ml 정품 단독 "
            "장 건강·점막 보호 및 컨디션 관리에 도움 · https://smartstore.naver.com/koreaagro/products/11119190020"
        )
        assert_gonggu_safe(safe_text)

    def test_bio_parser_and_micro_influencer_filter(self):
        contacts = parse_bio_contacts("협찬/공구 문의: coco_mom@gmail.com | 오픈톡 https://open.kakao.com/o/abc123DM")
        self.assertEqual(contacts["email"], "coco_mom@gmail.com")
        self.assertEqual(contacts["kakao_openchat"], "https://open.kakao.com/o/abc123DM")
        self.assertTrue(contacts["dm_allowed"])

        blocked_dm = parse_bio_contacts("DM 금지 ❌ 문의는 work@test.kr 로만 주세요")
        self.assertEqual(blocked_dm["email"], "work@test.kr")
        self.assertFalse(blocked_dm["dm_allowed"])

        self.assertTrue(filter_micro_influencer({"keyword_group": "B", "followers": 12000, "engagement_rate": 4.2}))
        self.assertFalse(filter_micro_influencer({"keyword_group": "B", "followers": 1500, "engagement_rate": 6.0}))
        self.assertFalse(filter_micro_influencer({"keyword_group": "B", "followers": 20000, "engagement_rate": 1.5}))
        # 그룹 C 벤더사 바이패스
        self.assertTrue(filter_micro_influencer({"keyword_group": "C", "followers": 200, "email": "md@petmcn.kr"}))

    def test_personalized_pitch_and_safe_sanitization(self):
        gen = InfluencerPitchGenerator(use_llm=False)
        lead = {
            "lead_id": "instagram_bori_house",
            "channel": "instagram",
            "handle": "bori_house",
            "display_name": "보리네다견하우스",
            "keyword_group": "A",
            "pet_name": "보리",
            "recent_posts": ["어젯밤 보리 장염 치료 고민하며 묽은 변 케어한 기록"],
        }
        pitch = gen.generate_pitch(lead)
        self.assertIn("보리", pitch["dm_short"].splitlines()[0])
        self.assertIn("서울대 수의대 출신 수의학 전문가 홍순일 수의사 설계", pitch["email_body"])
        self.assertIn("파보겔 100ml 정품", pitch["email_body"])
        self.assertIn(OFFICIAL_KOREAAGRO_URL, pitch["email_body"])
        self.assertEqual(find_forbidden_gonggu_tokens(pitch), [])
        for b in pitch["recommended_bundles"]:
            self.assertIn("100ml", b["composition"])
            self.assertNotIn("500ml", b["composition"])

    def test_youtube_scraper_mocked_and_csv_import(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            crm_path = os.path.join(tmpdir, "crm.json")
            crm = InfluencerCRMStore(crm_path=crm_path, enable_firestore=False)
            scraper = InfluencerLeadScraper(crm_store=crm)

            search_resp = MagicMock(status_code=200)
            search_resp.json.return_value = {"items": [{"snippet": {"channelId": "UC_TEST_1"}}]}

            ch_resp = MagicMock(status_code=200)
            ch_resp.json.return_value = {
                "items": [{
                    "id": "UC_TEST_1",
                    "snippet": {
                        "title": "콩이네 펫팸일기",
                        "customUrl": "@kong_pet",
                        "description": "비즈니스 문의 kong@petmail.kr",
                    },
                    "statistics": {"subscriberCount": "15000", "viewCount": "600000", "videoCount": "100"},
                    "contentDetails": {"relatedPlaylists": {"uploads": "UU_TEST_1"}},
                }]
            }
            pl_resp = MagicMock(status_code=200)
            pl_resp.json.return_value = {"items": [{"snippet": {"title": "콩이 산책 후 컨디션 루틴"}}]}

            with patch.dict(os.environ, {"YOUTUBE_API_KEY": "fake_yt_key"}), \
                 patch("marketing_factory.core.influencer_lead_scraper.requests.get", side_effect=[search_resp, ch_resp, pl_resp]):
                yt_leads = scraper.scrape_youtube_targets(keywords=["#펫팸족"], keyword_group="B")
                self.assertEqual(len(yt_leads), 1)
                self.assertEqual(yt_leads[0]["email"], "kong@petmail.kr")
                self.assertEqual(yt_leads[0]["recent_posts"][0], "콩이 산책 후 컨디션 루틴")

            csv_path = os.path.join(tmpdir, "ig.csv")
            with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
                f.write("channel,handle,display_name,keyword_group,followers,engagement_rate,bio,pet_name,recent_posts\n")
                f.write("instagram,momo_family,모모네,A,22000,4.5,문의 DM 환영 momo@naver.com,모모,모모와 주말 애견운동장 나들이\n")
            csv_leads = scraper.import_leads_csv(csv_path)
            self.assertEqual(len(csv_leads), 1)
            self.assertEqual(csv_leads[0]["pet_name"], "모모")

    def test_outreach_dm_limit_email_send_stages_utm_and_dashboard(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            crm = InfluencerCRMStore(crm_path=os.path.join(tmpdir, "crm.json"), enable_firestore=False)
            crm.upsert_lead({
                "lead_id": "instagram_dubu_mom",
                "channel": "instagram",
                "handle": "dubu_mom",
                "display_name": "두부맘",
                "keyword_group": "B",
                "followers": 18000,
                "engagement_rate": 4.8,
                "email": "dubu@example.com",
                "pet_name": "두부",
                "recent_posts": ["두부 배변 컨디션 관리 일기"],
            })

            manager = InfluencerOutreachManager(crm_store=crm, pitch_generator=InfluencerPitchGenerator(use_llm=False), max_daily_dm=1)

            # 1) 이메일 드라이런 -> 실제 발송(SendGrid mock)
            dry_res = manager.send_pitch_emails(dry_run=True, window_label="10:00")
            self.assertEqual(dry_res["results"][0]["status"], "DRY_RUN_READY")

            sg_resp = MagicMock(status_code=202)
            with patch.dict(os.environ, {"SENDGRID_API_KEY": "sg_test", "GMAIL_USER": "", "GMAIL_APP_PASSWORD": ""}), \
                 patch("marketing_factory.core.influencer_outreach_manager.requests.post", return_value=sg_resp):
                live_res = manager.send_pitch_emails(dry_run=False, window_label="15:00")
                self.assertEqual(live_res["results"][0]["status"], "SENT")

            # 2) DM 일일 상한 테스트 (1건 기록 후 2번째 차단)
            manager.record_dm_dispatched("instagram_dubu_mom", date_str="2026-11-27")
            crm.upsert_lead({"lead_id": "instagram_second", "channel": "instagram", "handle": "second"})
            with self.assertRaises(RuntimeError):
                manager.record_dm_dispatched("instagram_second", date_str="2026-11-27")

            # 3) 6단계 파이프라인 전이 + koreaagro UTM 링크 + 수수료 정산
            for stage in PIPELINE_STAGES[2:5]:  # 파보겔100ml발송요청 -> 발송완료 -> 공구확정
                manager.transition_stage("instagram_dubu_mom", stage, commission_rate=0.25)

            lead_after_confirm = crm.get_lead("instagram_dubu_mom")
            self.assertEqual(lead_after_confirm["status"], "공구확정")
            self.assertIn("https://smartstore.naver.com/koreaagro/products/11119190020", lead_after_confirm["gonggu_url"])
            self.assertIn("utm_content=dubu_mom", lead_after_confirm["gonggu_url"])

            settled = manager.record_gonggu_sales("instagram_dubu_mom", units_sold=100, unit_price_krw=29000, mark_settled=True)
            self.assertEqual(settled["status"], "정산완료")
            self.assertEqual(settled["gross_sales_krw"], 2900000)
            self.assertEqual(settled["commission_payout_krw"], 725000)

            # 4) 대시보드 HTML 생성 및 브랜드 안전 검증
            dash_path = os.path.join(tmpdir, "dashboard.html")
            out_dash = manager.build_gonggu_dashboard(out_path=dash_path)
            self.assertTrue(os.path.exists(out_dash))
            with open(out_dash, "r", encoding="utf-8") as df:
                html_text = df.read()
            self.assertIn("koreaagro UTM 링크", html_text)
            self.assertIn("파보겔(ParvoGel) 100ml 정품 단독", html_text)
            self.assertEqual(find_forbidden_gonggu_tokens(html_text), [])


if __name__ == "__main__":
    unittest.main()
