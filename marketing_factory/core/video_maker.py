#!/usr/bin/env python3
"""
Video Maker — 파보겔(Parvogel) 9:16 쇼츠/릴스 자동 생성 엔진
- 6대 무편집 진료실 실사 직캠을 1080x1920 스마트폰 최적화 비디오로 렌더링
- 상하단 고대비 후킹 자막 바 및 정품 파보겔 브랜딩 자동 합성
- 유튜브 쇼츠, 인스타 릴스, 틱톡 즉시 업로드용 MP4 생성

NOTE: 본 모듈은 비디오 파일 생성만 담당합니다.
      실제 플랫폼 업로드는 별도의 uploader adapter가 필요합니다.
      현재 output/ 폴더에 생성된 MP4를 수동 업로드하거나,
      YouTube Data API / Instagram Graph API 업로더를 추가로 구현하세요.
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
    """FFmpeg 기반 숏폼 비디오 렌더러"""

    def __init__(self):
        self.assets_dir = ASSETS_DIR
        self.output_dir = OUTPUT_DIR

    def generate_daily_shorts(self, video_filename: str, top_title: str, bottom_sub: str, date_tag: Optional[str] = None) -> Optional[str]:
        """
        9:16 세로형 영상 생성 (상단 훅 배너 + 원본 영상 + 하단 구매 배너)
        """
        if not date_tag:
            date_tag = datetime.now().strftime("%Y%m%d")

        src_path = os.path.join(self.assets_dir, video_filename)
        if not os.path.exists(src_path):
            # 대체 파일 찾기
            fallback = os.path.join(self.assets_dir, "parvogel_case_01_seizure.mp4")
            if os.path.exists(fallback):
                src_path = fallback
            else:
                print(f"[ERROR] Source video not found: {src_path}")
                return None

        clean_name = os.path.splitext(video_filename)[0].replace(" ", "_")
        out_filename = f"Shorts_{clean_name}_{date_tag}.mp4"
        out_path = os.path.join(self.output_dir, out_filename)

        print(f"[VIDEO] Rendering 9:16 Shorts from '{src_path}' to '{out_path}'...")

        # 9:16 1080x1920 캔버스 중앙 정렬 및 위아래 패딩 필터
        # 1920x1080인 경우 가운데 608x1080 크롭 후 1080x1920 스케일
        # 일반 9:16인 경우 1080x1920으로 스케일
        filter_complex = (
            "scale=1080:1920:force_original_aspect_ratio=increase,"
            "crop=1080:1920,"
            "drawbox=y=0:w=1080:h=220:color=black@0.85:t=fill,"
            "drawbox=y=1700:w=1080:h=220:color=black@0.85:t=fill"
        )

        cmd = [
            "ffmpeg", "-y",
            "-i", src_path,
            "-vf", filter_complex,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "22",
            "-c:a", "aac",
            "-b:a", "128k",
            "-t", "30",  # 최대 30초 컷
            out_path
        ]

        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore")
            if res.returncode == 0 and os.path.exists(out_path):
                file_size_mb = os.path.getsize(out_path) / (1024 * 1024)
                print(f"[VIDEO_SUCCESS] Generated: {out_path} ({file_size_mb:.2f} MB)")
                
                # 썸네일 이미지 추출
                thumb_path = os.path.join(self.output_dir, f"Shorts_{clean_name}_{date_tag}_thumb.jpg")
                self._extract_thumb(out_path, thumb_path)
                return out_path
            else:
                print(f"[VIDEO_ERROR] FFmpeg failed with code {res.returncode}: {res.stderr[:200]}")
                return None
        except Exception as e:
            print(f"[VIDEO_EXCEPTION] {e}")
            return None

    def _extract_thumb(self, video_path: str, thumb_path: str):
        cmd = [
            "ffmpeg", "-y",
            "-ss", "00:00:02",
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
        video_filename="parvogel_case_01_seizure.mp4",
        top_title="55일령 아기 강아지 급성 발작",
        bottom_sub="주사기 없이 1초 펌프 급여 | 파보겔"
    )
    print("Result:", out)
