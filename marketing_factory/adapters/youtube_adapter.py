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

        publish_at = (content_data.get("publish_at") or "").strip()
        status_block: Dict[str, Any] = {
            "privacyStatus": "private" if publish_at else "public",
            "selfDeclaredMadeForKids": False,
            "embeddable": True,
        }
        if publish_at:
            status_block["publishAt"] = publish_at

        metadata = {
            "snippet": {
                "title": title[:100],
                "description": description[:5000],
                "tags": tags[:10],
                "categoryId": "15",
                "defaultLanguage": "ko",
            },
            "status": status_block,
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

        upload_headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "video/mp4",
            "Content-Length": str(video_size),
            "Content-Range": f"bytes 0-{video_size - 1}/{video_size}"
        }

        with open(video_path, "rb") as f:
            upload_resp = requests.put(upload_url, data=f, headers=upload_headers, timeout=300)

        if upload_resp.status_code in [200, 201]:
            video_id = upload_resp.json().get("id", "unknown")
            self.last_result = {
                "id": video_id,
                "url": f"https://youtube.com/shorts/{video_id}",
                "watch_url": f"https://www.youtube.com/watch?v={video_id}",
                "publish_at": publish_at or None,
            }
            print(f"[SUCCESS] YouTube Shorts uploaded (ID: {video_id})")

            pinned_comment = (content_data.get("pinned_comment") or "").strip()
            if pinned_comment and video_id != "unknown":
                comment_res = self._post_top_level_comment(access_token, video_id, pinned_comment)
                self.last_result["comment_id"] = comment_res.get("comment_id")
                self.last_result["comment_status"] = comment_res.get("status")

            # Auto-sync live ParvoGel Short to ParvoGel PetCare VIP Firestore `shorts_feed`
            try:
                from core.firebase_shorts_sync import sync_short_to_firestore
                product_tag = content_data.get("product_tag", "parvogel")
                reward_points = int(content_data.get("reward_points", 50))
                campaign_id = content_data.get("campaign_id")
                synced = sync_short_to_firestore(
                    video_id=video_id,
                    title=title,
                    product_tag=product_tag,
                    reward_points=reward_points,
                    campaign_id=campaign_id,
                )
                self.last_result["firestore_synced"] = synced
            except Exception as sync_err:
                print(f"[WARN] Firestore shorts_feed auto-sync skipped: {sync_err}")
                self.last_result["firestore_synced"] = False
            return True
        else:
            print(f"[FAIL] YouTube upload error: {upload_resp.status_code} - {upload_resp.text[:200]}")
            return False

    def _post_top_level_comment(self, access_token: str, video_id: str, text: str) -> Dict[str, Any]:
        """
        구매 링크 안내 최상단 댓글 등록 (YouTube Data API v3 commentThreads.insert).
        참고: 채널 고정(Pin) 상태는 API 미제공으로 Studio에서 1클릭 고정 필요하며, youtube.force-ssl 권한 미보유 시 경고 후 non-fatal 스킵합니다.
        """
        url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json; charset=utf-8",
        }
        payload = {
            "snippet": {
                "videoId": video_id,
                "topLevelComment": {
                    "snippet": {
                        "textOriginal": text[:9000],
                    }
                },
            }
        }
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            if resp.status_code in (200, 201):
                cid = resp.json().get("id", "")
                print(f"[SUCCESS] YouTube purchase-link comment posted (Comment ID: {cid})")
                return {"status": "posted", "comment_id": cid}
            print(f"[PINNED_COMMENT_WARN] commentThreads HTTP {resp.status_code}: {resp.text[:200]}")
            return {"status": f"http_{resp.status_code}", "comment_id": None}
        except Exception as e:
            print(f"[PINNED_COMMENT_WARN] Failed to post comment: {e}")
            return {"status": "error", "comment_id": None}

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
