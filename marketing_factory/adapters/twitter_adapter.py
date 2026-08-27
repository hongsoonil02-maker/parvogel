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
            payload = {"text": text[:280]}
            if last_id:
                payload["reply"] = {"in_reply_to_tweet_id": last_id}

            try:
                res = requests.post(url, auth=auth, json=payload, timeout=10)
                if res.status_code in [200, 201]:
                    last_id = res.json().get("data", {}).get("id")
                    print(f"[SUCCESS] Posted Tweet {i+1}/{len(thread)} (ID: {last_id})")
                else:
                    print(f"[FAIL] Twitter API Error on Tweet {i+1}: {res.status_code} - {res.text}")
                    return False
            except Exception as e:
                print(f"[EXCEPTION] TwitterAdapter: {e}")
                return False

        return True
