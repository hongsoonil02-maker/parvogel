#!/usr/bin/env python3
"""
Telegram Marketing Adapter — 텔레그램 채널 및 그룹 브로드캐스트
"""

import os
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter

class TelegramAdapter(BaseMarketingAdapter):
    name = "Telegram"

    def validate_config(self) -> bool:
        return bool(os.getenv("TELEGRAM_BOT_TOKEN") and os.getenv("TELEGRAM_CHAT_ID"))

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
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                print(f"[SUCCESS] Published to Telegram (Chat: {chat_id})")
                return True
            else:
                # Markdown 파싱 에러 시 일반 텍스트 재전송
                payload.pop("parse_mode")
                fallback_res = requests.post(url, json=payload, timeout=10)
                if fallback_res.status_code == 200:
                    print(f"[SUCCESS] Published to Telegram (Plaintext fallback)")
                    return True
                print(f"[FAIL] Telegram API Error: {res.status_code} - {res.text}")
                return False
        except Exception as e:
            print(f"[EXCEPTION] TelegramAdapter: {e}")
            return False
