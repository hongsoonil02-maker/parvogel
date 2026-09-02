#!/usr/bin/env python3
"""
TikTok Content Posting Adapter — TikTok v2 API 비디오 업로드 (Inbox/Direct Post 지원)
- TIKTOK_REFRESH_TOKEN 기반 액세스 토큰 자동 갱신
- TikTok Direct Post / Inbox 비디오 업로드 완전 자동화
"""

import os
import time
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter


class TikTokAdapter(BaseMarketingAdapter):
    name = "TikTok"

    def validate_config(self) -> bool:
        return bool(
            os.getenv("TikTok_Client_key")
            and os.getenv("TikTok_Client_secret")
            and os.getenv("TIKTOK_REFRESH_TOKEN")
        )

    def publish(self, content_data: Dict[str, Any]) -> bool:
        client_key = os.getenv("TikTok_Client_key")
        client_secret = os.getenv("TikTok_Client_secret")
        refresh_token = os.getenv("TIKTOK_REFRESH_TOKEN")

        access_token = self._refresh_access_token(client_key, client_secret, refresh_token)
        if not access_token:
            print("[FAIL] TikTok token refresh failed")
            return False

        video_path = content_data.get("video_path") or ""
        title = content_data.get("title", "파보겔 임상 케이스 숏폼")

        if not video_path or not os.path.exists(video_path):
            print(f"[FAIL] TikTok video file not found: {video_path}")
            return False

        video_size = os.path.getsize(video_path)

        # 1. 틱톡 비디오 업로드 이니셜라이즈 (POST /v2/post/publish/inbox/video/init/ 또는 direct post)
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json; charset=UTF-8"
        }
        
        # Direct Post 시도 후 fallback으로 Inbox Upload
        init_url = "https://open.tiktokapis.com/v2/post/publish/video/init/"
        payload = {
            "post_info": {
                "title": title[:150],
                "privacy_level": "PUBLIC_TO_EVERYONE",
                "disable_duet": False,
                "disable_comment": False,
                "disable_stitch": False
            },
            "source_info": {
                "source": "FILE_UPLOAD",
                "video_size": video_size,
                "chunk_size": video_size,
                "total_chunk_count": 1
            }
        }

        try:
            init_resp = requests.post(init_url, json=payload, headers=headers, timeout=15)
            init_data = init_resp.json()
            
            # Direct post가 안 될 경우 Inbox 전송 시도
            if init_resp.status_code != 200 or init_data.get("error", {}).get("code") != "ok":
                inbox_url = "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/"
                inbox_payload = {
                    "source_info": {
                        "source": "FILE_UPLOAD",
                        "video_size": video_size,
                        "chunk_size": video_size,
                        "total_chunk_count": 1
                    }
                }
                init_resp = requests.post(inbox_url, json=inbox_payload, headers=headers, timeout=15)
                init_data = init_resp.json()

            if init_resp.status_code != 200 or init_data.get("error", {}).get("code") != "ok":
                print(f"[FAIL] TikTok Init Error: {init_resp.status_code} - {init_data}")
                return False

            upload_url = init_data.get("data", {}).get("upload_url")
            publish_id = init_data.get("data", {}).get("publish_id")

            if not upload_url:
                print("[FAIL] TikTok upload URL missing in response")
                return False

            # 2. 비디오 바이너리 업로드 (PUT upload_url)
            with open(video_path, "rb") as vf:
                video_bytes = vf.read()

            upload_headers = {
                "Content-Type": "video/mp4",
                "Content-Range": f"bytes 0-{video_size - 1}/{video_size}",
                "Content-Length": str(video_size)
            }
            upload_resp = requests.put(upload_url, data=video_bytes, headers=upload_headers, timeout=120)

            if upload_resp.status_code in [200, 201]:
                print(f"[SUCCESS] TikTok Video uploaded successfully (Publish ID: {publish_id})")
                return True
            else:
                print(f"[FAIL] TikTok upload binary error: {upload_resp.status_code} - {upload_resp.text[:200]}")
        except Exception as e:
            print(f"[EXCEPTION] TikTok publish: {e}")

        return False

    def _refresh_access_token(self, client_key: str, client_secret: str, refresh_token: str) -> str:
        tk_url = "https://open.tiktokapis.com/v2/oauth/token/"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "client_key": client_key,
            "client_secret": client_secret,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        }
        try:
            resp = requests.post(tk_url, headers=headers, data=data, timeout=10)
            if resp.status_code == 200:
                res_json = resp.json()
                return res_json.get("access_token", "")
            print(f"[FAIL] TikTok token refresh HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[EXCEPTION] TikTok token refresh: {e}")
        return ""
