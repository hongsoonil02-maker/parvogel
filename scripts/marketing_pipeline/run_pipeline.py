import sys
import argparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from generator import ParvogelContentGenerator
from publisher import SocialPublisher

def main():
    parser = argparse.ArgumentParser(description="Parvogel Multi-Channel Marketing Pipeline")
    parser.add_argument("--live", action="store_true", help="Execute real live publishing (default is Dry-run)")
    args = parser.parse_args()

    dry_run = not args.live

    print("=================================================================")
    print(" 🚀 PARVOGEL MULTI-CHANNEL VETERINARY MARKETING PIPELINE")
    print(f" Mode: {'[DRY-RUN (Safe Simulation)]' if dry_run else '[LIVE POSTING]'}")
    print("=================================================================")

    # Step 1: Content Generation
    print("\n[STEP 1] Generating Content Packages with Clinical Testimonials...")
    generator = ParvogelContentGenerator()
    packages = generator.generate_all_queued_topics()
    print(f"[+] Total {len(packages)} packages generated.")

    # Step 2: Multi-Channel Social Publishing
    print("\n[STEP 2] Scheduling to Instagram, YouTube Shorts, and Naver Blog...")
    publisher = SocialPublisher()
    publisher.publish_all_new_drafts(dry_run=dry_run)

    print("=================================================================")
    print(" ✅ MARKETING PIPELINE EXECUTION FINISHED SUCCESSFULLY!")
    print("=================================================================")

if __name__ == "__main__":
    main()
