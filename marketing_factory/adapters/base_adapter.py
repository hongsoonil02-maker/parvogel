#!/usr/bin/env python3
"""
Base Marketing Adapter — 모든 마케팅 채널 어댑터의 공통 부모 클래스
"""

from typing import Dict, Any

class BaseMarketingAdapter:
    name: str = "Base"

    def validate_config(self) -> bool:
        """환경변수 및 필수 연동 키 존재 여부 확인"""
        raise NotImplementedError

    def publish(self, formatted_content: Dict[str, Any]) -> bool:
        """채널별 실제 포스팅 실행"""
        raise NotImplementedError
