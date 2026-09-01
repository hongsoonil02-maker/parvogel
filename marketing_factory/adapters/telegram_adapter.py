#!/usr/bin/env python3
"""
Telegram Marketing Adapter — 텔레그램 채널 및 그룹 브로드캐스트
- PEER_FLOOD / 429 에 대한 지수 백오프 재시도 포함
"""

import os
import time
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter

MAX_RETRIES = 3
BASE_BACKOFF_SEC = 30

class TelegramAdapter(BaseMarketingAdapter):
    name = "Telegram"

    def validate_config(self) -> bool:
        return bool(os.getenv("TELEGRAM_BOT_TOKEN") and os.getenv("TELEGRAM_CHAT_ID"))

    def _send_with_retry(self, url: str, payload: dict) -> requests.Response:
        for attempt in range(1, MAX_RETRIES + 1):
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                return res
            body = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            retry_after = body.get("parameters", {}).get("retry_after")
            err_desc = body.get("description", "")
            if res.status_code == 429 or "PEER_FLOOD" in err_desc.upper():
                wait = retry_after if retry_after else BASE_BACKOFF_SEC * attempt
                print(f"[WARN] Telegram rate-limited (attempt {attempt}/{MAX_RETRIES}). Waiting {wait}s...")
                time.sleep(wait)
                continue
            return res
        return res

    def publish(self, content_data: Dict[str, Any]) -> bool:
        token = os.getenv("TELEGRAM_BOT_TOKEN")
        chat_id = os.getenv("TELEGRAM_CHAT_ID")
        msg = content_data.get("content") or content_data.get("text", "")

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": msg,
            "parse_mode": "Markdown",
            "disable_web_page_preview": False
        }

        try:
            res = self._send_with_retry(url, payload)
            if res.status_code == 200:
                print(f"[SUCCESS] Published to Telegram (Chat: {chat_id})")
                return True
            body = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            err_desc = body.get("description", "")
            if "PEER_FLOOD" in err_desc.upper() or res.status_code == 429:
                print(f"[FAIL] Telegram still rate-limited after {MAX_RETRIES} retries: {err_desc}")
                return False
            payload.pop("parse_mode")
            fallback_res = self._send_with_retry(url, payload)
            if fallback_res.status_code == 200:
                print(f"[SUCCESS] Published to Telegram (Plaintext fallback)")
                return True
            print(f"[FAIL] Telegram API Error: {fallback_res.status_code} - {fallback_res.text}")
            return False
        except Exception as e:
            print(f"[EXCEPTION] TelegramAdapter: {e}")
            return False
