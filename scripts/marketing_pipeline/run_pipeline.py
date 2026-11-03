# -*- coding: utf-8 -*-
"""
Parvogel Multi-Channel Marketing Pipeline Orchestrator (run_pipeline.py)
Runs content generation and multi-channel scheduling (Instagram, Shorts, Naver Blog, X).
"""

import sys
import argparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from generator import ParvogelContentGenerator
from publisher import SocialPublisher


def main():
    parser = argparse.ArgumentParser(description="Parvogel Multi-Channel Marketing Pipeline")
    parser.add_argument("--live", action="store_true", help="Execute real live publishing (default is Dry-run)")
    parser.add_argument("--llm", action="store_true", help="Use Gemini LLM API if GEMINI_API_KEY is set")
    parser.add_argument("--topic", type=str, default=None, help="Filter by specific topic_id")
    parser.add_argument("--force", action="store_true", help="Force re-publish even if already in manifest")
    args = parser.parse_args()

    dry_run = not args.live

    print("=================================================================")
    print(" 🚀 PARVOGEL MULTI-CHANNEL VETERINARY MARKETING PIPELINE v2.0")
    print(f" Mode: {'[DRY-RUN (Safe Simulation)]' if dry_run else '[LIVE POSTING]'}")
    print("=================================================================")

    # Step 1: Content Generation
    print("\n[STEP 1] Generating Content Packages with Clinical Testimonials...")
    generator = ParvogelContentGenerator()
    packages, generated_files = generator.generate_all_queued_topics(
        topic_filter=args.topic, use_llm=args.llm
    )
    print(f"[+] Total {len(packages)} unique topic packages generated.")

    # Step 2: Multi-Channel Social Publishing (Only newly generated files!)
    print("\n[STEP 2] Scheduling to Instagram, YouTube Shorts, Naver Blog, and X...")
    publisher = SocialPublisher()
    dispatched = publisher.publish_all_new_drafts(
        dry_run=dry_run, target_files=generated_files, force=args.force
    )

    print("=================================================================")
    print(f" ✅ MARKETING PIPELINE FINISHED ({dispatched}/{len(generated_files)} packages scheduled)")
    print("=================================================================")


if __name__ == "__main__":
    main()
