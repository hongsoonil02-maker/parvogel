import argparse
import os
import sys

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(PROJECT_DIR, "marketing_factory", ".env"))
    load_dotenv(os.path.join(PROJECT_DIR, ".env"))
except Exception:
    pass

from marketing_factory.core.influencer_lead_scraper import InfluencerCRMStore, InfluencerLeadScraper
from marketing_factory.core.influencer_outreach_manager import InfluencerOutreachManager
from marketing_factory.core.influencer_pitch_generator import InfluencerPitchGenerator


def main() -> None:
    parser = argparse.ArgumentParser(description="ParvoGel 100ml 정품 단독 인플루언서 공구 매칭 & 아웃리치 CLI")
    parser.add_argument("--scrape-youtube", action="store_true", help="YouTube 타겟 채널 발굴")
    parser.add_argument("--scrape-naver", action="store_true", help="네이버 블로그 타겟 블로거 발굴")
    parser.add_argument("--scrape-all", action="store_true", help="그룹 A·B·C 전체 YouTube+네이버 블로그 일괄 발굴")
    parser.add_argument("--import-csv", default="", help="인스타그램/벤더 수동 CSV 임포트 경로")
    parser.add_argument("--group", default="B", choices=["A", "B", "C"], help="타겟 키워드 그룹 (A|B|C)")
    parser.add_argument("--generate-pitches", action="store_true", help="발굴된 리드에 대해 초개인화 DM/이메일 제안서 생성")
    parser.add_argument("--send-emails", action="store_true", help="이메일 분할 발송 실행")
    parser.add_argument("--window", default="10:00", choices=["10:00", "15:00"], help="이메일 발송 타임슬롯")
    parser.add_argument("--live", action="store_true", help="실제 이메일 발송 활성화 (미지정 시 dry-run)")
    parser.add_argument("--dashboard", action="store_true", help="메시지 자판기 & 6단계 트래킹 HTML 대시보드 생성")
    args = parser.parse_args()

    crm = InfluencerCRMStore()
    scraper = InfluencerLeadScraper(crm_store=crm)
    pitch_gen = InfluencerPitchGenerator(use_llm=True)
    manager = InfluencerOutreachManager(crm_store=crm, pitch_generator=pitch_gen)

    if args.scrape_all:
        total_new = 0
        for grp in ("A", "B", "C"):
            yt_res = scraper.scrape_youtube_targets(keyword_group=grp)
            nv_res = scraper.scrape_naver_blog_targets(keyword_group=grp)
            total_new += len(yt_res) + len(nv_res)
            print(f"[SCRAPE:ALL:{grp}] YouTube={len(yt_res)} | NaverBlog={len(nv_res)}")
        print(f"[SCRAPE:ALL] Total processed leads across A/B/C: {total_new}")

    if args.scrape_youtube:
        yt_leads = scraper.scrape_youtube_targets(keyword_group=args.group)
        print(f"[SCRAPE:YouTube] Added/Updated {len(yt_leads)} micro-influencer/vendor leads")

    if args.scrape_naver:
        nv_leads = scraper.scrape_naver_blog_targets(keyword_group=args.group)
        print(f"[SCRAPE:NaverBlog] Added/Updated {len(nv_leads)} blogger leads")

    if args.import_csv:
        csv_leads = scraper.import_leads_csv(args.import_csv)
        print(f"[IMPORT:CSV] Added/Updated {len(csv_leads)} leads from {args.import_csv}")

    if args.generate_pitches:
        leads = crm.list_leads()
        for ld in leads:
            manager.ensure_pitch_for_lead(ld["lead_id"])
        print(f"[PITCH] Verified & generated personalized pitches for {len(leads)} leads")

    if args.send_emails:
        out = manager.send_pitch_emails(dry_run=not args.live, window_label=args.window)
        print(f"[OUTREACH:Email] {out}")

    if args.dashboard or not any([args.scrape_all, args.scrape_youtube, args.scrape_naver, args.import_csv, args.generate_pitches, args.send_emails]):
        dash_path = manager.build_gonggu_dashboard()
        print(f"[DASHBOARD] Generated vending-machine & tracking board: {dash_path}")


if __name__ == "__main__":
    main()
