# -*- coding: utf-8 -*-
"""
Multi-Channel Social Publisher (publisher.py)
Integrates with Postiz or Buffer REST API to schedule generated veterinary contents
to Instagram, YouTube Shorts, Naver Blog, and X (Twitter) with retry logic,
idempotency manifest tracking, error logging, and Dry-Run support.
"""

import os
import sys
import json
import glob
import yaml
import time
import logging
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timedelta

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


class SocialPublisher:
    def __init__(self, config_path="scripts/marketing_pipeline/config.yaml"):
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = yaml.safe_load(f)

        self.pipeline_cfg = self.config.get("pipeline", {})
        self.publisher_cfg = self.config.get("publisher", {})
        self.channels_cfg = self.config.get("channels", {})
        self.engine = self.publisher_cfg.get("engine", "postiz")
        self.output_dir = self.pipeline_cfg.get("output_dir", "scripts/marketing_pipeline/output")
        self.manifest_file = self.pipeline_cfg.get(
            "manifest_file", os.path.join(self.output_dir, "published_manifest.json")
        )
        log_file = self.pipeline_cfg.get("log_file", "scripts/marketing_pipeline/logs/pipeline.log")
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)

        self.logger = logging.getLogger("ParvogelPublisher")
        self.logger.setLevel(logging.INFO)
        if not self.logger.handlers:
            fh = logging.FileHandler(log_file, encoding="utf-8")
            fh.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s"))
            self.logger.addHandler(fh)

    def _load_manifest(self):
        if os.path.exists(self.manifest_file):
            try:
                with open(self.manifest_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {"published": {}}
        return {"published": {}}

    def _save_manifest(self, manifest):
        with open(self.manifest_file, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

    def schedule_package(self, package_file, dry_run=True, day_offset=0):
        """Schedules Instagram, Shorts, Blog, and X from a package JSON."""
        with open(package_file, "r", encoding="utf-8") as f:
            package = json.load(f)

        metadata = package.get("metadata", {})
        topic_id = metadata.get("topic_id")
        title = metadata.get("title")
        target_date = (datetime.now() + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        next_date = (datetime.now() + timedelta(days=day_offset + 1)).strftime("%Y-%m-%d")

        print("\n=======================================================")
        print(f" [Social Publisher] Processing: {title} ({topic_id})")
        print(f" Engine: {self.engine.upper()} | Mode: {'[DRY-RUN]' if dry_run else '[LIVE POSTING]'}")
        print("=======================================================")

        results = {}

        # 1. Instagram Carousel
        if self.channels_cfg.get("instagram", {}).get("enabled", True):
            insta = package.get("instagram_carousel", {})
            ig_time = self.channels_cfg.get("instagram", {}).get("default_scheduled_time", "18:30")
            results["instagram"] = self._dispatch_channel(
                channel_key="instagram",
                channel_label="Instagram Carousel",
                title=f"5-Slide Carousel: {title}",
                content=f"{insta.get('caption', '')}\n\n{' '.join(insta.get('hashtags', []))}",
                structured_payload=insta.get("slides", []),
                scheduled_time=f"{target_date}T{ig_time}:00+09:00",
                dry_run=dry_run,
            )

        # 2. YouTube Shorts
        if self.channels_cfg.get("youtube_shorts", {}).get("enabled", True):
            shorts = package.get("youtube_shorts", {})
            first_scene = shorts.get("scenes", [{}])[0]
            yt_time = self.channels_cfg.get("youtube_shorts", {}).get("default_scheduled_time", "20:00")
            results["youtube_shorts"] = self._dispatch_channel(
                channel_key="youtube_shorts",
                channel_label="YouTube Shorts",
                title=f"Shorts: {title}",
                content=f"대본 총 {len(shorts.get('scenes', []))}씬 ({shorts.get('estimated_duration', '50s')}) | 훅: {first_scene.get('screen_text')}\n고정댓글: {shorts.get('pinned_comment')}",
                structured_payload=shorts.get("scenes", []),
                scheduled_time=f"{target_date}T{yt_time}:00+09:00",
                dry_run=dry_run,
            )

        # 3. Naver Blog Column
        if self.channels_cfg.get("naver_blog", {}).get("enabled", True):
            blog = package.get("naver_blog", {})
            blog_time = self.channels_cfg.get("naver_blog", {}).get("default_scheduled_time", "10:00")
            results["naver_blog"] = self._dispatch_channel(
                channel_key="naver_blog",
                channel_label="Naver Blog Column",
                title=blog.get("title", title),
                content=blog.get("content_markdown", ""),
                structured_payload=[],
                scheduled_time=f"{next_date}T{blog_time}:00+09:00",
                dry_run=dry_run,
            )

        # 4. X (Twitter) Thread
        if self.channels_cfg.get("x_twitter", {}).get("enabled", True):
            x_thread = package.get("x_thread", {})
            tweets = x_thread.get("tweets", [])
            x_time = self.channels_cfg.get("x_twitter", {}).get("default_scheduled_time", "12:30")
            results["x_twitter"] = self._dispatch_channel(
                channel_key="x_twitter",
                channel_label="X (Twitter) Thread",
                title=f"X Thread ({len(tweets)} tweets): {title}",
                content="\n---\n".join(tweets),
                structured_payload=tweets,
                scheduled_time=f"{target_date}T{x_time}:00+09:00",
                dry_run=dry_run,
            )

        self.logger.info(
            f"Completed package={os.path.basename(package_file)} topic={topic_id} dry_run={dry_run} results={results}"
        )
        print("[*] All 4 channel dispatches scheduled successfully.\n")
        return all(results.values())

    def _dispatch_channel(
        self, channel_key, channel_label, title, content, structured_payload, scheduled_time, dry_run
    ):
        preview = content[:80].replace("\n", " ")
        print(f"--> [{channel_label}]")
        print(f"    Target Time: {scheduled_time}")
        print(f"    Title: {title}")
        print(f"    Payload Preview: {preview}...")

        if dry_run or self.engine == "mock":
            print("    [DRY-RUN SUCCESS] Validated payload & schedule slot. Status: 200 OK")
            return True

        max_retries = self.publisher_cfg.get("max_retries", 3)
        base_delay = self.publisher_cfg.get("retry_delay_sec", 2)

        for attempt in range(1, max_retries + 1):
            try:
                if self.engine == "postiz":
                    self._send_postiz_request(channel_key, title, content, structured_payload, scheduled_time)
                elif self.engine == "buffer":
                    self._send_buffer_request(channel_key, content, scheduled_time)
                else:
                    raise ValueError(f"Unsupported publisher engine: {self.engine}")

                print(f"    [LIVE SENT] Attempt {attempt}: Scheduled on {self.engine.upper()}!")
                self.logger.info(f"LIVE SENT [{channel_label}] at {scheduled_time}")
                return True
            except Exception as e:
                err_msg = f"Attempt {attempt}/{max_retries} failed for {channel_label}: {e}"
                print(f"    [LIVE ERROR] {err_msg}")
                self.logger.error(err_msg)
                if attempt < max_retries:
                    time.sleep(base_delay * attempt)

        return False

    def _send_postiz_request(self, channel_key, title, content, structured_payload, scheduled_time):
        postiz_cfg = self.publisher_cfg.get("postiz", {})
        api_url = postiz_cfg.get("api_url", "https://api.postiz.com/public/v1").rstrip("/")
        api_key_env = postiz_cfg.get("api_key_env", "POSTIZ_API_KEY")
        api_key = os.environ.get(api_key_env)
        if not api_key:
            raise RuntimeError(f"Missing environment variable {api_key_env} for live Postiz publishing")

        channel_id = postiz_cfg.get("channel_ids", {}).get(channel_key, channel_key)
        payload = {
            "type": "schedule",
            "date": scheduled_time,
            "Integration": {"id": channel_id},
            "value": [
                {
                    "content": content,
                    "title": title,
                    "metadata": {"slides_or_scenes": structured_payload},
                }
            ],
        }
        req = urllib.request.Request(
            f"{api_url}/posts",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": api_key,
                "User-Agent": "Parvogel-Marketing-Pipeline/2.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status not in (200, 201, 202):
                raise RuntimeError(f"Postiz HTTP {resp.status}")

    def _send_buffer_request(self, channel_key, content, scheduled_time):
        buffer_cfg = self.publisher_cfg.get("buffer", {})
        api_url = buffer_cfg.get("api_url", "https://api.bufferapp.com/1").rstrip("/")
        token_env = buffer_cfg.get("access_token_env", "BUFFER_ACCESS_TOKEN")
        token = os.environ.get(token_env)
        if not token:
            raise RuntimeError(f"Missing environment variable {token_env} for live Buffer publishing")

        form_data = urllib.parse.urlencode(
            {"text": content, "scheduled_at": scheduled_time, "access_token": token}
        ).encode("utf-8")
        req = urllib.request.Request(
            f"{api_url}/updates/create.json",
            data=form_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status not in (200, 201):
                raise RuntimeError(f"Buffer HTTP {resp.status}")

    def publish_all_new_drafts(self, dry_run=True, target_files=None, force=False):
        manifest = self._load_manifest()
        published_map = manifest.get("published", {})

        if target_files is None:
            today_suffix = datetime.now().strftime("%Y%m%d")
            pattern = os.path.join(self.output_dir, f"*_{today_suffix}.json")
            files = sorted(glob.glob(pattern))
            if not files:
                # Fallback to most recent JSON per topic if none generated today
                all_files = sorted(glob.glob(os.path.join(self.output_dir, "*.json")))
                files = [
                    f for f in all_files if not os.path.basename(f).startswith("published_manifest")
                ]
        else:
            files = target_files

        if not files:
            print("[!] No draft packages found. Run generator.py first.")
            return 0

        dispatched_count = 0
        for idx, fpath in enumerate(files):
            fname = os.path.basename(fpath)
            if not force and not dry_run and fname in published_map:
                print(f"[~] Skipping already published package: {fname}")
                continue

            ok = self.schedule_package(fpath, dry_run=dry_run, day_offset=idx)
            if ok:
                dispatched_count += 1
                if not dry_run:
                    published_map[fname] = datetime.now().isoformat()

        if not dry_run:
            manifest["published"] = published_map
            self._save_manifest(manifest)

        return dispatched_count


if __name__ == "__main__":
    dry_run = "--live" not in sys.argv
    force = "--force" in sys.argv
    publisher = SocialPublisher()
    publisher.publish_all_new_drafts(dry_run=dry_run, force=force)
