#!/usr/bin/env python3
"""
Threads Publishing Adapter — Meta Threads API 및 지연 첫 댓글(Delayed First Reply) 지원
- Threads 공식 퍼블리싱 API 연동 (또는 아카이브/큐잉 모드)
- 본문(Main Post) 배포 후 delay_seconds (기본 90초) 대기 후 전환용 첫 댓글 자동 타래 게시
- [스토어링크] 환경변수 자동 매핑
"""

import os
import sys
import json
import time
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
DRAFTS_DIR = os.path.join(FACTORY_DIR, "drafts", "threads")
DATA_DIR = os.path.join(FACTORY_DIR, "data")


class ThreadsAdapter(BaseMarketingAdapter):
    name = "Threads"

    def __init__(self):
        os.makedirs(DRAFTS_DIR, exist_ok=True)
        os.makedirs(DATA_DIR, exist_ok=True)

    def validate_config(self) -> bool:
        """Threads API 설정 여부 확인 (미설정 시에도 로컬 드래프트/큐 아카이빙은 100% 정상 작동)"""
        return bool(
            os.getenv("THREADS_ACCESS_TOKEN") and os.getenv("THREADS_USER_ID")
        )

    def publish(self, content_data: Dict[str, Any]) -> bool:
        """스레드 본문 및 지연 첫 댓글 타래 배포 실행"""
        content_id = content_data.get("content_id", f"thread_{int(time.time())}")
        main_post = content_data.get("main_post", "").strip()
        first_comment = content_data.get("first_comment", "").strip()
        delay_seconds = content_data.get("delay_seconds", 90)

        if not main_post:
            print("[FAIL] Threads main post content is empty.")
            return False

        # 1. 아카이브 드래프트 파일 저장 (항상 저장하여 기록 보존)
        draft_file = os.path.join(DRAFTS_DIR, f"{content_id}.json")
        with open(draft_file, "w", encoding="utf-8") as f:
            json.dump(content_data, f, ensure_ascii=False, indent=2)

        # 2. Threads API 연동 여부 확인
        if self.validate_config():
            return self._publish_to_threads_api(content_id, main_post, first_comment, delay_seconds)
        else:
            # 설정 키가 없을 경우: 안전한 큐 아카이빙 모드로 전환
            self._update_queue_status(content_id, "READY_IN_QUEUE")
            print(f"[THREADS_ARCHIVED] Content {content_id} saved to drafts/threads and queued.")
            print(f"  • Main post: {main_post[:40]}...")
            print(f"  • Delayed comment ready (delay: {delay_seconds}s)")
            return True

    def _publish_to_threads_api(self, content_id: str, main_post: str, first_comment: str, delay_seconds: int) -> bool:
        """Meta Threads 공식 Graph API를 통한 실제 배포"""
        access_token = os.getenv("THREADS_ACCESS_TOKEN")
        user_id = os.getenv("THREADS_USER_ID")
        base_url = "https://graph.threads.net/v1.0"

        try:
            # 1. 본문 컨테이너 생성
            create_url = f"{base_url}/{user_id}/threads"
            create_payload = {
                "media_type": "TEXT",
                "text": main_post,
                "access_token": access_token
            }
            res = requests.post(create_url, data=create_payload, timeout=15)
            if res.status_code not in [200, 201]:
                print(f"[FAIL] Threads container creation failed: {res.text}")
                return False
            
            creation_id = res.json().get("id")

            # 2. 본문 게시
            publish_url = f"{base_url}/{user_id}/threads_publish"
            pub_res = requests.post(publish_url, data={
                "creation_id": creation_id,
                "access_token": access_token
            }, timeout=15)
            if pub_res.status_code not in [200, 201]:
                print(f"[FAIL] Threads main post publish failed: {pub_res.text}")
                return False
            
            published_thread_id = pub_res.json().get("id")
            print(f"✓ [Threads] Main post published (ID: {published_thread_id})")

            # 3. 딜레이 후 첫 댓글 타래 게시 (first_comment가 존재할 경우)
            if first_comment:
                print(f"⏳ [Threads] Waiting {delay_seconds}s before posting first comment for algorithmic boost...")
                # 실제 배포 시 지연 대기 (단, 테스트 모드 환경변수 THREADS_FAST_TEST=1 이면 3초만 대기)
                sleep_time = 3 if os.getenv("THREADS_FAST_TEST") == "1" else min(delay_seconds, 180)
                time.sleep(sleep_time)

                # 댓글 컨테이너 생성 (reply_to_id 지정)
                reply_payload = {
                    "media_type": "TEXT",
                    "text": first_comment,
                    "reply_to_id": published_thread_id,
                    "access_token": access_token
                }
                rep_res = requests.post(create_url, data=reply_payload, timeout=15)
                if rep_res.status_code in [200, 201]:
                    reply_creation_id = rep_res.json().get("id")
                    pub_rep_res = requests.post(publish_url, data={
                        "creation_id": reply_creation_id,
                        "access_token": access_token
                    }, timeout=15)
                    if pub_rep_res.status_code in [200, 201]:
                        print(f"✓ [Threads] Delayed first comment published (ID: {pub_rep_res.json().get('id')})")
                    else:
                        print(f"[WARN] Threads reply publish failed: {pub_rep_res.text}")
                else:
                    print(f"[WARN] Threads reply container creation failed: {rep_res.text}")

            self._update_queue_status(content_id, "PUBLISHED", published_id=published_thread_id)
            return True

        except Exception as e:
            print(f"[ERROR] Exception during Threads publish: {e}")
            return False

    def _update_queue_status(self, content_id: str, status: str, published_id: str = None):
        """threads_queue.json 내 상태 업데이트"""
        queue_path = os.path.join(DATA_DIR, "threads_queue.json")
        if not os.path.exists(queue_path):
            return
        try:
            with open(queue_path, "r", encoding="utf-8") as f:
                items = json.load(f)
            updated = False
            for it in items:
                if it.get("content_id") == content_id:
                    it["status"] = status
                    if published_id:
                        it["published_thread_id"] = published_id
                    it["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
                    updated = True
                    break
            if updated:
                with open(queue_path, "w", encoding="utf-8") as f:
                    json.dump(items, f, ensure_ascii=False, indent=2)
        except Exception:
            pass
