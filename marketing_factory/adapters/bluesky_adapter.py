#!/usr/bin/env python3
"""
Bluesky Marketing Adapter — AT Protocol 공식 포스팅
- 트위터(X) API 크레딧 제한 대안으로 글로벌 탈중앙 소셜 피드 즉시 자동 발행
"""

import os
import datetime
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter


class BlueskyAdapter(BaseMarketingAdapter):
    name = "Bluesky"

    def validate_config(self) -> bool:
        return bool(
            os.getenv("BLUESKY_HANDLE")
            and os.getenv("BLUESKY_PASSWORD")
        )

    def publish(self, content_data: Dict[str, Any]) -> bool:
        handle = os.getenv("BLUESKY_HANDLE")
        password = os.getenv("BLUESKY_PASSWORD")

        # 1. 세션 생성
        sess_url = "https://bsky.social/xrpc/com.atproto.server.createSession"
        try:
            sess_resp = requests.post(sess_url, json={"identifier": handle, "password": password}, timeout=10)
            if sess_resp.status_code != 200:
                print(f"[FAIL] Bluesky login failed: {sess_resp.status_code}")
                return False
            sess_data = sess_resp.json()
            access_jwt = sess_data.get("accessJwt")
            did = sess_data.get("did")
        except Exception as e:
            print(f"[EXCEPTION] Bluesky login: {e}")
            return False

        # 2. 포스트 본문 생성
        text = content_data.get("first_tweet") or content_data.get("caption") or content_data.get("title", "")
        links = content_data.get("links", {})
        smartstore = links.get("smartstore", "https://smartstore.naver.com/petschury/products/13718496355")
        
        post_text = f"""🐾 [파보겔 임상 실화] 55일령 아기 강아지 급성 장염 7일 완치

- 주사기 없이 1초 펌프로 스트레스 제로 급여
- 1-deoxinojirimycin 특허 성분 & 장 점막 코팅
- 3일 만에 그릇까지 싹싹 핥아먹는 기적의 식욕 회복!

🛒 스마트스토어/쿠팡 정식 입점:
{smartstore}"""[:300]

        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
        post_record = {
            "$type": "app.bsky.feed.post",
            "text": post_text,
            "createdAt": now_iso
        }

        # 3. 레코드 생성 (포스팅)
        create_url = "https://bsky.social/xrpc/com.atproto.repo.createRecord"
        headers = {"Authorization": f"Bearer {access_jwt}"}
        payload = {
            "repo": did,
            "collection": "app.bsky.feed.post",
            "record": post_record
        }

        try:
            resp = requests.post(create_url, json=payload, headers=headers, timeout=10)
            if resp.status_code in [200, 201]:
                uri = resp.json().get("uri", "")
                print(f"[SUCCESS] Bluesky Post published (URI: {uri})")
                return True
            else:
                print(f"[FAIL] Bluesky post error: {resp.status_code} - {resp.text[:200]}")
        except Exception as e:
            print(f"[EXCEPTION] Bluesky publish: {e}")
        return False
