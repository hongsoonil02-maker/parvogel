#!/usr/bin/env python3
"""
Instagram Reels Adapter — Meta Graph API 자동 업로드
- Instagram Business/Creator 계정에 Reels 업로드
- Resumable Upload 세션을 통해 로컬 비디오 파일을 직접 Instagram Reels로 업로드 지원
- META_ACCESS_TOKEN, META_IG_ACCOUNT_ID 필요 (영구 시스템 토큰 지원)
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
            os.getenv("META_ACCESS_TOKEN")
            and os.getenv("META_IG_ACCOUNT_ID")
        )

    def publish(self, content_data: Dict[str, Any]) -> bool:
        ig_account_id = os.getenv("META_IG_ACCOUNT_ID")
        access_token = os.getenv("META_ACCESS_TOKEN")

        video_path = content_data.get("video_path") or ""
        caption = content_data.get("caption", content_data.get("description", ""))
        title = content_data.get("title", "파보겔 임상 케이스")

        if not video_path or not os.path.exists(video_path):
            print(f"[FAIL] Instagram video file not found: {video_path}")
            return False

        container_id = self._upload_local_reel_container(ig_account_id, access_token, video_path, caption)
        if not container_id:
            return False

        return self._publish_reel(ig_account_id, access_token, container_id)

    def _upload_local_reel_container(self, ig_account_id: str, access_token: str, video_path: str, caption: str) -> str:
        """Meta Resumable Upload 프로토콜을 사용해 로컬 비디오 직접 업로드"""
        file_size = os.path.getsize(video_path)
        
        # 1. 컨테이너 초기화 (upload_type=resumable)
        init_url = f"https://graph.facebook.com/v18.0/{ig_account_id}/media"
        init_payload = {
            "media_type": "REELS",
            "upload_type": "resumable",
            "caption": caption[:2200],
            "share_to_feed": True,
            "access_token": access_token
        }
        
        try:
            init_resp = requests.post(init_url, data=init_payload, timeout=15)
            if init_resp.status_code not in [200, 201]:
                print(f"[FAIL] Instagram init error: {init_resp.status_code} - {init_resp.text[:200]}")
                return ""
                
            init_data = init_resp.json()
            container_id = init_data.get("id")
            upload_url = init_data.get("uri")
            
            if not upload_url:
                print(f"[FAIL] Instagram upload uri missing in response: {init_data}")
                return ""
                
            # 2. 로컬 비디오 바이너리 업로드 (rupload.facebook.com)
            with open(video_path, "rb") as vf:
                video_bytes = vf.read()
                
            upload_headers = {
                "Authorization": f"OAuth {access_token}",
                "offset": "0",
                "file_size": str(file_size),
                "Content-Type": "application/octet-stream"
            }
            
            up_resp = requests.post(upload_url, data=video_bytes, headers=upload_headers, timeout=120)
            if up_resp.status_code in [200, 201]:
                print(f"[INFO] Instagram local video uploaded to container: {container_id}")
                return container_id
            else:
                print(f"[FAIL] Instagram binary upload failed: {up_resp.status_code} - {up_resp.text[:200]}")
                return ""
        except Exception as e:
            print(f"[EXCEPTION] Instagram upload local reel: {e}")
            return ""

    def _publish_reel(self, ig_account_id: str, access_token: str, container_id: str) -> bool:
        url = f"https://graph.facebook.com/v18.0/{ig_account_id}/media_publish"
        payload = {
            "creation_id": container_id,
            "access_token": access_token
        }
        max_retries = 15
        print("[INFO] Waiting for Instagram Reel processing...")
        for attempt in range(max_retries):
            time.sleep(6)
            try:
                resp = requests.post(url, data=payload, timeout=15)
                if resp.status_code in [200, 201]:
                    media_id = resp.json().get("id", "unknown")
                    print(f"[SUCCESS] Instagram Reel published (ID: {media_id})")
                    return True
                
                resp_data = resp.json()
                error_msg = resp_data.get("error", {}).get("message", "")
                if "processing" in error_msg.lower() or "not ready" in error_msg.lower():
                    continue
                else:
                    print(f"[FAIL] Instagram publish error: {resp.status_code} - {resp.text[:200]}")
                    return False
            except Exception as e:
                print(f"[EXCEPTION] Instagram publish attempt {attempt+1}: {e}")
                
        print("[FAIL] Instagram Reel publishing timed out")
        return False
