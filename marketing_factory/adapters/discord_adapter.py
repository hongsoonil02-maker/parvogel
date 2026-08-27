#!/usr/bin/env python3
"""
Discord Marketing Adapter — 디스코드 웹훅 알림 임베드 전송
"""

import os
import requests
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter

class DiscordAdapter(BaseMarketingAdapter):
    name = "Discord"

    def validate_config(self) -> bool:
        return bool(os.getenv("DISCORD_WEBHOOK_URL"))

    def publish(self, content_data: Dict[str, Any]) -> bool:
        webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
        
        embed = {
            "title": content_data.get("title", "파보겔 임상 업데이트"),
            "description": content_data.get("description", ""),
            "color": content_data.get("color", 0x3b82f6),
            "url": content_data.get("url", "https://hongsoonil02-maker.github.io/parvogel/"),
            "fields": content_data.get("fields", []),
            "footer": {"text": "파보겔(Parvo Gel) 공식 마케팅 자동화 팩토리"}
        }

        payload = {
            "username": "파보겔 닥터 봇",
            "embeds": [embed]
        }

        try:
            res = requests.post(webhook_url, json=payload, timeout=10)
            if res.status_code in [200, 204]:
                print("[SUCCESS] Published to Discord Webhook")
                return True
            else:
                print(f"[FAIL] Discord Webhook Error: {res.status_code} - {res.text}")
                return False
        except Exception as e:
            print(f"[EXCEPTION] DiscordAdapter: {e}")
            return False
