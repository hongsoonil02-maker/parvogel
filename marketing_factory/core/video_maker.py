#!/usr/bin/env python3
"""
Video Maker — 파보겔(Parvogel) 하남 사랑동물병원 김동준 원장 리얼 임상 다큐 9:16 비디오 엔진
- 1080x1920 세로형 숏폼/릴스/틱톡 최적화
- 김동준 원장 진료실 실사 클립 및 풀버전 다큐멘터리 연계
- 상단 골든타임 경보 뱃지 / 중앙 리얼 진료 영상 / 하단 1초 펌프 & 쿠팡/네이버 구매 전환 바
"""

import os
import sys
import subprocess
import json
from datetime import datetime
from typing import Dict, Any, Optional

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_DIR = os.path.dirname(FACTORY_DIR)
ASSETS_DIR = os.path.join(PROJECT_DIR, "public", "assets")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")

os.makedirs(OUTPUT_DIR, exist_ok=True)


class ParvogelVideoMaker:
    """김동준 원장 리얼 임상 다큐멘터리 숏폼 렌더러"""

    def __init__(self):
        self.assets_dir = ASSETS_DIR
        self.output_dir = OUTPUT_DIR

    def generate_daily_shorts(self, video_filename: str, top_title: str, bottom_sub: str, date_tag: Optional[str] = None) -> Optional[str]:
        if not date_tag:
            date_tag = datetime.now().strftime("%Y%m%d")

        # 1. 다큐멘터리 소스 우선 매핑
        src_path = os.path.join(self.assets_dir, video_filename)
        if not os.path.exists(src_path):
            candidates = [
                os.path.join(self.assets_dir, "short_story_final.mp4"),
                os.path.join(self.assets_dir, "parvogel_clinical_documentary_v2.mp4"),
                os.path.join(self.assets_dir, "parvogel_case_01_seizure.mp4")
            ]
            for cand in candidates:
                if os.path.exists(cand):
                    src_path = cand
                    break

        clean_name = os.path.splitext(os.path.basename(src_path))[0].replace(" ", "_")
        out_filename = f"Shorts_{clean_name}_{date_tag}.mp4"
        out_path = os.path.join(self.output_dir, out_filename)

        print(f"[VIDEO] Rendering Clinical Documentary Shorts: '{os.path.basename(src_path)}' -> '{out_filename}'")

        # 9:16 (1080x1920) 캔버스 + 고대비 다큐멘터리 헤더/푸터 박스
        filter_complex = (
            "scale=1080:1920:force_original_aspect_ratio=increase,"
            "crop=1080:1920,"
            "drawbox=y=0:w=1080:h=260:color=black@0.90:t=fill,"
            "drawbox=x=60:y=35:w=360:h=50:color=red@0.95:t=fill,"
            "drawbox=y=1640:w=1080:h=280:color=black@0.90:t=fill"
        )

        cmd = [
            "ffmpeg", "-y",
            "-i", src_path,
            "-vf", filter_complex,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "20",
            "-c:a", "aac",
            "-b:a", "192k",
            "-t", "45",
            out_path
        ]

        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore")
            if res.returncode == 0 and os.path.exists(out_path):
                file_size_mb = os.path.getsize(out_path) / (1024 * 1024)
                print(f"[VIDEO_SUCCESS] Generated Clinical Documentary Shorts: {out_path} ({file_size_mb:.2f} MB)")
                
                thumb_path = os.path.join(self.output_dir, f"Shorts_{clean_name}_{date_tag}_thumb.jpg")
                self._extract_thumb(out_path, thumb_path)
                return out_path
            else:
                print(f"[VIDEO_ERROR] FFmpeg failed with code {res.returncode}: {res.stderr[:300]}")
                return None
        except Exception as e:
            print(f"[VIDEO_EXCEPTION] {e}")
            return None

    def _extract_thumb(self, video_path: str, thumb_path: str):
        cmd = [
            "ffmpeg", "-y",
            "-ss", "00:00:03",
            "-i", video_path,
            "-vframes", "1",
            "-q:v", "2",
            thumb_path
        ]
        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore")
        except Exception:
            pass


if __name__ == "__main__":
    maker = ParvogelVideoMaker()
    out = maker.generate_daily_shorts(
        video_filename="short_story_final.mp4",
        top_title="안락사 위기 0.6kg 아기 강아지 7일 완치 실화",
        bottom_sub="주사기 없이 1초 펌프 급여"
    )
    print("Result:", out)
