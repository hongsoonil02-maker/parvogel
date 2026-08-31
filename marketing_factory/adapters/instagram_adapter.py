#!/usr/bin/env python3
"""
Instagram Reels Adapter — Meta Graph API 자동 업로드
- Instagram Business/Creator 계정에 Reels 업로드
- META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN, META_IG_ACCOUNT_ID 필요
"""

import os
import json
import time
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter


class InstagramAdapter(BaseMarketingAdapter):
    name = "Instagram_Reels"

    def validate_config(self) -> bool:
        return bool(
            os.getenv("META_APP_ID")
            and os.getenv("META_APP_SECRET")
            and os.getenv("META_ACCESS_TOKEN")
            and os.getenv("META_IG_ACCOUNT_ID")
        )

    def publish(self, content_data: Dict[str, Any]) -> bool:
        ig_account_id = os.getenv("META_IG_ACCOUNT_ID")
        access_token = os.getenv("META_ACCESS_TOKEN")
        app_id = os.getenv("META_APP_ID")
        app_secret = os.getenv("META_APP_SECRET")

        valid_token = self._validate_token(access_token, app_id, app_secret)
        if not valid_token:
            access_token = self._refresh_facebook_token(access_token, app_id, app_secret)
            if not access_token:
                print("[FAIL] Instagram token refresh failed")
                return False

        video_url = content_data.get("video_url") or content_data.get("video_path", "")
        caption = content_data.get("caption", content_data.get("description", ""))
        title = content_data.get("title", "파보겔 임상 케이스")

        if video_url and video_url.startswith("http"):
            container_id = self._create_reel_container(ig_account_id, access_token, video_url, caption)
        else:
            print("[INFO] Instagram Reels requires a publicly accessible video URL. Skipping auto-upload.")
            print(f"        Upload '{video_url}' manually or host it on a CDN.")
            return False

        if not container_id:
            return False

        return self._publish_reel(ig_account_id, access_token, container_id)

    def _validate_token(self, token: str, app_id: str, app_secret: str) -> bool:
        url = f"https://graph.facebook.com/debug_token?input_token={token}&access_token={app_id}|{app_secret}"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                return data.get("is_valid", False)
        except Exception:
            pass
        return False

    def _refresh_facebook_token(self, token: str, app_id: str, app_secret: str) -> str:
        url = f"https://graph.facebook.com/v18.0/oauth/access_token"
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": app_id,
            "client_secret": app_secret,
            "fb_exchange_token": token
        }
        try:
            resp = requests.get(url, params=params, timeout=10)
            if resp.status_code == 200:
                return resp.json().get("access_token", "")
        except Exception as e:
            print(f"[EXCEPTION] Instagram token refresh: {e}")
        return ""

    def _create_reel_container(self, ig_account_id: str, access_token: str, video_url: str, caption: str) -> str:
        url = f"https://graph.facebook.com/v18.0/{ig_account_id}/media"
        payload = {
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption[:2200],
            "share_to_feed": True,
            "access_token": access_token
        }
        try:
            resp = requests.post(url, data=payload, timeout=15)
            if resp.status_code in [200, 201]:
                container_id = resp.json().get("id", "")
                if container_id:
                    print(f"[INFO] Instagram reel container created: {container_id}")
                    return container_id
            else:
                print(f"[FAIL] Instagram container error: {resp.status_code} - {resp.text[:200]}")
        except Exception as e:
            print(f"[EXCEPTION] Instagram create container: {e}")
        return ""

    def _publish_reel(self, ig_account_id: str, access_token: str, container_id: str) -> bool:
        url = f"https://graph.facebook.com/v18.0/{ig_account_id}/media_publish"
        payload = {
            "creation_id": container_id,
            "access_token": access_token
        }
        max_retries = 12
        for attempt in range(max_retries):
            try:
                resp = requests.post(url, data=payload, timeout=15)
                if resp.status_code in [200, 201]:
                    media_id = resp.json().get("id", "unknown")
                    print(f"[SUCCESS] Instagram Reel published (ID: {media_id})")
                    return True
                elif resp.status_code == 400 and "processing" in resp.text.lower():
                    time.sleep(5)
                    continue
                else:
                    print(f"[FAIL] Instagram publish error: {resp.status_code} - {resp.text[:200]}")
                    return False
            except Exception as e:
                print(f"[EXCEPTION] Instagram publish: {e}")
                time.sleep(5)
        print("[FAIL] Instagram Reel publishing timed out")
        return False
