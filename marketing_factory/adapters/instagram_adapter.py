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
        ig_id = os.getenv("META_IG_ACCOUNT_ID")
        # 100-Bagger Instagram 계정(17841400565015107) 오발송 원천 차단
        if not ig_id or str(ig_id).strip() == "17841400565015107":
            return False
        return bool(
            os.getenv("META_ACCESS_TOKEN")
            and ig_id
        )

    def publish(self, content_data: Dict[str, Any]) -> bool:
        ig_account_id = os.getenv("META_IG_ACCOUNT_ID")
        access_token = os.getenv("META_ACCESS_TOKEN")

        # Strict Brand Guard: 100Bagger Instagram 계정(17841400565015107 / 100baggerquantlab) 오배포 원천 차단
        if str(ig_account_id).strip() == "17841400565015107":
            print(f"[Strict Brand Guard] 🚨 차단됨: 100-Bagger Instagram 계정({ig_account_id})으로 파보겔 영상이 배포되는 것을 원천 차단했습니다.")
            return False

        video_path = content_data.get("video_path") or ""
        video_url = content_data.get("video_url") or ""
        caption = content_data.get("caption", content_data.get("description", ""))
        title = content_data.get("title", "파보겔 임상 케이스")

        # Auto-resolve canonical HTTPS URL on parvogel.kr if already hosted in public/assets
        if not video_url and video_path:
            candidate = f"https://parvogel.kr/assets/{os.path.basename(video_path)}"
            try:
                head_resp = requests.head(candidate, timeout=6, allow_redirects=True)
                if head_resp.status_code == 200 and "video" in head_resp.headers.get("Content-Type", "").lower():
                    video_url = candidate
            except Exception:
                pass

        container_id = ""
        if video_url:
            container_id = self._create_remote_reel_container(ig_account_id, access_token, video_url, caption)

        if not container_id and video_path and os.path.exists(video_path):
            container_id = self._upload_local_reel_container(ig_account_id, access_token, video_path, caption)

        if not container_id:
            if not video_url and (not video_path or not os.path.exists(video_path)):
                print(f"[FAIL] Instagram video source missing (video_url={video_url}, video_path={video_path})")
            return False

        return self._publish_reel(ig_account_id, access_token, container_id)

    def _create_remote_reel_container(self, ig_account_id: str, access_token: str, video_url: str, caption: str) -> str:
        """Meta가 공개 HTTPS URL에서 MP4를 직접 다운로드하여 릴스 컨테이너 생성 (rupload 오류 우회)"""
        init_url = f"https://graph.facebook.com/v20.0/{ig_account_id}/media"
        payload = {
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption[:2200],
            "share_to_feed": True,
            "access_token": access_token,
        }
        try:
            print(f"[INFO] Creating Instagram Reel via remote HTTPS fetch: {video_url}")
            resp = requests.post(init_url, data=payload, timeout=20)
            if resp.status_code in [200, 201]:
                cid = resp.json().get("id", "")
                if cid:
                    print(f"[INFO] Instagram remote Reel container created: {cid}")
                    return cid
            print(f"[WARN] Instagram remote URL init failed: {resp.status_code} - {resp.text[:200]}")
        except Exception as e:
            print(f"[WARN] Instagram remote URL exception: {e}")
        return ""

    def _ensure_faststart(self, video_path: str):
        """Meta rupload 서버가 moov 아톰 후방 배치 MP4를 거부하는 문제 방지용 faststart 리먹스"""
        try:
            with open(video_path, "rb") as f:
                head = f.read(4096)
            if b"moov" in head:
                return video_path, None
            import subprocess, tempfile
            fd, tmp_path = tempfile.mkstemp(suffix=".mp4", prefix="ig_faststart_")
            os.close(fd)
            res = subprocess.run(
                ["ffmpeg", "-y", "-i", video_path, "-c", "copy", "-movflags", "+faststart", tmp_path],
                capture_output=True, text=True
            )
            if res.returncode == 0 and os.path.exists(tmp_path) and os.path.getsize(tmp_path) > 0:
                print("[INFO] Applied +faststart MP4 optimization for Instagram Reels")
                return tmp_path, tmp_path
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception as e:
            print(f"[WARN] Faststart helper skipped: {e}")
        return video_path, None

    def _upload_local_reel_container(self, ig_account_id: str, access_token: str, video_path: str, caption: str) -> str:
        """Meta Resumable Upload 프로토콜을 사용해 로컬 비디오 직접 업로드"""
        upload_src_path, tmp_faststart = self._ensure_faststart(video_path)
        file_size = os.path.getsize(upload_src_path)
        
        # 1. 컨테이너 초기화 (upload_type=resumable) — v20.0 + 토큰 만료 핸들링
        init_url = f"https://graph.facebook.com/v20.0/{ig_account_id}/media"
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
                # 토큰 만료(190) 감지
                try:
                    err = init_resp.json().get("error", {})
                    if err.get("code") == 190:
                        print(f"[FAIL] Instagram token expired (190): {err.get('message')[:150]}")
                        return ""
                except Exception:
                    pass
                print(f"[FAIL] Instagram init error: {init_resp.status_code} - {init_resp.text[:200]}")
                return ""
                
            init_data = init_resp.json()
            container_id = init_data.get("id")
            upload_url = init_data.get("uri")
            
            if not upload_url:
                print(f"[FAIL] Instagram upload uri missing in response: {init_data}")
                return ""
                
            # 2. 로컬 비디오 바이너리 업로드 (rupload.facebook.com)
            with open(upload_src_path, "rb") as vf:
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
        finally:
            if tmp_faststart and os.path.exists(tmp_faststart):
                try:
                    os.remove(tmp_faststart)
                except Exception:
                    pass

    def _publish_reel(self, ig_account_id: str, access_token: str, container_id: str) -> bool:
        url = f"https://graph.facebook.com/v20.0/{ig_account_id}/media_publish"
        payload = {
            "creation_id": container_id,
            "access_token": access_token
        }
        max_retries = 25
        print("[INFO] Waiting for Instagram Reel processing...")
        for attempt in range(max_retries):
            time.sleep(6)
            try:
                resp = requests.post(url, data=payload, timeout=15)
                if resp.status_code in [200, 201]:
                    media_id = resp.json().get("id", "unknown")
                    self.last_result = {"id": media_id}
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
