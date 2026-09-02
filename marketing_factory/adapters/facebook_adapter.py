#!/usr/bin/env python3
"""
Facebook Page Adapter — Meta Graph API 자동 포스팅 및 릴스 발행
- 페이스북 페이지 피드 포스팅 및 숏폼 비디오 업로드
- META_FB_PAGE_TOKEN, META_FB_PAGE_ID 필요 (영구 토큰 지원)
"""

import os
import time
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter


class FacebookAdapter(BaseMarketingAdapter):
    name = "Facebook_Page"

    def validate_config(self) -> bool:
        return bool(
            os.getenv("META_FB_PAGE_TOKEN")
            and os.getenv("META_FB_PAGE_ID")
        )

    def publish(self, content_data: Dict[str, Any]) -> bool:
        page_id = os.getenv("META_FB_PAGE_ID")
        page_token = os.getenv("META_FB_PAGE_TOKEN")

        video_path = content_data.get("video_path") or ""
        caption = content_data.get("caption") or content_data.get("text") or content_data.get("description", "")
        title = content_data.get("title", "파보겔 임상 케이스")

        # 1. 비디오 파일이 로컬에 있으면 동영상/릴스로 직접 업로드
        if video_path and os.path.exists(video_path):
            return self._upload_video(page_id, page_token, video_path, title, caption)
        else:
            # 2. 비디오가 없으면 텍스트 및 링크 포스팅
            return self._publish_feed_post(page_id, page_token, caption, content_data.get("links", {}).get("landing", ""))

    def _publish_feed_post(self, page_id: str, page_token: str, message: str, link: str = "") -> bool:
        url = f"https://graph.facebook.com/v18.0/{page_id}/feed"
        payload = {
            "message": message,
            "access_token": page_token
        }
        if link:
            payload["link"] = link

        try:
            resp = requests.post(url, data=payload, timeout=15)
            if resp.status_code in [200, 201]:
                post_id = resp.json().get("id", "unknown")
                print(f"[SUCCESS] Facebook Feed Post published (ID: {post_id})")
                return True
            else:
                print(f"[FAIL] Facebook feed error: {resp.status_code} - {resp.text[:200]}")
        except Exception as e:
            print(f"[EXCEPTION] Facebook publish feed: {e}")
        return False

    def _upload_video(self, page_id: str, page_token: str, video_path: str, title: str, description: str) -> bool:
        url = f"https://graph-video.facebook.com/v18.0/{page_id}/videos"
        payload = {
            "title": title[:100],
            "description": description[:5000],
            "access_token": page_token
        }
        
        try:
            with open(video_path, "rb") as vf:
                files = {"source": vf}
                resp = requests.post(url, data=payload, files=files, timeout=120)
                
            if resp.status_code in [200, 201]:
                video_id = resp.json().get("id", "unknown")
                print(f"[SUCCESS] Facebook Video/Reels uploaded (ID: {video_id})")
                return True
            else:
                print(f"[FAIL] Facebook video error: {resp.status_code} - {resp.text[:200]}")
        except Exception as e:
            print(f"[EXCEPTION] Facebook upload video: {e}")
        return False
