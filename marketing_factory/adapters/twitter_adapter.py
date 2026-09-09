#!/usr/bin/env python3
"""
Twitter/X Marketing Adapter — X API v2 스레드 포스팅
"""

import os
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter

try:
    from requests_oauthlib import OAuth1
    HAS_OAUTH = True
except ImportError:
    HAS_OAUTH = False

class TwitterAdapter(BaseMarketingAdapter):
    name = "Twitter_X"

    def validate_config(self) -> bool:
        return HAS_OAUTH and bool(
            os.getenv("TWITTER_API_KEY") and 
            os.getenv("TWITTER_API_SECRET") and 
            os.getenv("TWITTER_ACCESS_TOKEN") and 
            os.getenv("TWITTER_ACCESS_SECRET")
        )

    def publish(self, content_data: Dict[str, Any]) -> bool:
        import time
        auth = OAuth1(
            os.getenv("TWITTER_API_KEY"),
            os.getenv("TWITTER_API_SECRET"),
            os.getenv("TWITTER_ACCESS_TOKEN"),
            os.getenv("TWITTER_ACCESS_SECRET")
        )
        url = "https://api.twitter.com/2/tweets"
        thread = content_data.get("thread", [])

        if not thread:
            first_tweet = content_data.get("first_tweet") or content_data.get("text", "")
            thread = [first_tweet]

        last_id = None
        for i, text in enumerate(thread):
            # 트위터 Free Tier 분당/스레드 Rate-Limit 방지를 위해 2초 간격 유지
            if i > 0:
                time.sleep(2.5)

            payload = {"text": text[:280]}
            if last_id:
                payload["reply"] = {"in_reply_to_tweet_id": last_id}

            posted = False
            for attempt in range(1, 3):
                try:
                    res = requests.post(url, auth=auth, json=payload, timeout=15)
                    if res.status_code in [200, 201]:
                        last_id = res.json().get("data", {}).get("id")
                        print(f"[SUCCESS] Posted Tweet {i+1}/{len(thread)} (ID: {last_id})")
                        posted = True
                        break
                    elif res.status_code == 429:
                        print(f"[WARN] Twitter Rate Limit (429). Waiting 10s before retry {attempt}...")
                        time.sleep(10)
                        continue
                    elif res.status_code == 403 and "duplicate" in res.text.lower():
                        # 중복 내용일 경우 타임스탬프를 살짝 추가하여 통과
                        payload["text"] = (text[:260] + f"\n({int(time.time())})")[:280]
                        time.sleep(2)
                        continue
                    else:
                        print(f"[FAIL] Twitter API Error on Tweet {i+1}: {res.status_code} - {res.text}")
                        return False
                except Exception as e:
                    print(f"[EXCEPTION] TwitterAdapter on Tweet {i+1}: {e}")
                    time.sleep(2)

            if not posted:
                return False

        return True
