#!/usr/bin/env python3
"""
File Draft Adapter — 소셜 및 블로그 포스팅용 즉시 복사 패키지 자동 생성
- 네이버 블로그, 유튜브 쇼츠, 인스타 릴스, 링크드인, 동물병원 DM을 drafts/ 폴더에 정돈 저장
- 언제든지 복사하여 게시하거나 브라우저 자동화 봇이 가져갈 수 있도록 지원
"""

import os
from datetime import datetime
from typing import Dict, Any
from .base_adapter import BaseMarketingAdapter

class FileDraftAdapter(BaseMarketingAdapter):
    name = "File_Draft_Archive"

    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def validate_config(self) -> bool:
        return True

    def publish_draft(self, channel_name: str, content: Any, date_str: str) -> str:
        filename = f"{channel_name}_{date_str}.txt"
        if channel_name == "Naver_Blog" or channel_name == "LinkedIn_B2B":
            filename = f"{channel_name}_{date_str}.md"

        filepath = os.path.join(self.output_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            if isinstance(content, dict):
                if "body" in content:
                    f.write(content["body"])
                else:
                    f.write(json_to_readable(content))
            elif isinstance(content, str):
                f.write(content)

        return filepath


def json_to_readable(data: Dict[str, Any]) -> str:
    lines = []
    for k, v in data.items():
        if isinstance(v, dict):
            lines.append(f"### {k} ###\n{json_to_readable(v)}")
        elif isinstance(v, list):
            lines.append(f"### {k} ###\n" + "\n".join(f"- {item}" for item in v))
        else:
            lines.append(f"[{k}]\n{v}\n")
    return "\n".join(lines)
