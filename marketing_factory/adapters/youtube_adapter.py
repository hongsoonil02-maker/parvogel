#!/usr/bin/env python3
"""
YouTube Shorts Adapter — YouTube Data API v3 자동 업로드
- 9:16 숏폼 MP4를 YouTube Shorts로 자동 업로드
- OAuth2 refresh_token 기반 액세스 토큰 자동 갱신
"""

import os
import json
import time
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter


class YouTubeAdapter(BaseMarketingAdapter):
    name = "YouTube_Shorts"

    def validate_config(self) -> bool:
        return bool(
            os.getenv("YOUTUBE_CLIENT_ID")
            and os.getenv("YOUTUBE_CLIENT_SECRET")
            and os.getenv("YOUTUBE_REFRESH_TOKEN")
        )

    def publish(self, content_data: Dict[str, Any]) -> bool:
        client_id = os.getenv("YOUTUBE_CLIENT_ID")
        client_secret = os.getenv("YOUTUBE_CLIENT_SECRET")
        refresh_token = os.getenv("YOUTUBE_REFRESH_TOKEN")

        access_token = self._refresh_access_token(client_id, client_secret, refresh_token)
        if not access_token:
            print("[FAIL] YouTube token refresh failed")
            return False

        video_path = content_data.get("video_path") or content_data.get("video_url", "")
        title = content_data.get("title", "파보겔 임상 케이스 스토리")
        description = content_data.get("description", "")
        tags = content_data.get("tags", ["파보겔", "강아지", "반려동물", "수의학"])

        if not video_path or not os.path.exists(video_path):
            print(f"[FAIL] YouTube video file not found: {video_path}")
            return False

        video_size = os.path.getsize(video_path)

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json; charset=utf-8"
        }

        metadata = {
            "snippet": {
                "title": title[:100],
                "description": description[:5000],
                "tags": tags[:10],
                "categoryId": "15",
                "defaultLanguage": "ko"
            },
            "status": {
                "privacyStatus": "public",
                "selfDeclaredMadeForKids": False,
                "embeddable": True
            }
        }

        init_url = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status"
        init_resp = requests.post(init_url, headers=headers, json=metadata, timeout=15)

        if init_resp.status_code not in [200, 201]:
            print(f"[FAIL] YouTube init error: {init_resp.status_code} - {init_resp.text[:200]}")
            return False

        upload_url = init_resp.headers.get("Location")
        if not upload_url:
            print("[FAIL] YouTube upload URL not found in response")
            return False

        with open(video_path, "rb") as f:
            video_data = f.read()

        upload_headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/octet-stream",
            "Content-Length": str(video_size)
        }

        upload_resp = requests.put(upload_url, data=video_data, headers=upload_headers, timeout=120)

        if upload_resp.status_code in [200, 201]:
            video_id = upload_resp.json().get("id", "unknown")
            print(f"[SUCCESS] YouTube Shorts uploaded (ID: {video_id})")
            return True
        else:
            print(f"[FAIL] YouTube upload error: {upload_resp.status_code} - {upload_resp.text[:200]}")
            return False

    def _refresh_access_token(self, client_id: str, client_secret: str, refresh_token: str) -> str:
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        try:
            resp = requests.post(token_url, data=payload, timeout=10)
            if resp.status_code == 200:
                return resp.json().get("access_token", "")
            err_body = resp.text[:300]
            print(f"[FAIL] YouTube token refresh HTTP {resp.status_code}: {err_body}")
        except Exception as e:
            print(f"[EXCEPTION] YouTube token refresh: {e}")
        return ""
