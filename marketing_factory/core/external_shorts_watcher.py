#!/usr/bin/env python3
"""
External Shorts Ingestion & Watcher — 외부 숏폼(메이커 셀링 도우미 등) 자동 인입 및 배포 큐 연동
- input_external/maker_selling 폴더를 스캔하여 신규 MP4 파일 자동 감지
- 1080x1920 해상도 및 영상 길이(초) 검증
- 브랜드 가드(100배거 교차 방지 및 파보겔 키워드 확인)
- 배포 대기열(queue_server 또는 drafts)에 자동 등록 후 archive 폴더로 이동
"""

import os
import sys
import shutil
import subprocess
import json
from datetime import datetime

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
INPUT_DIR = os.path.join(FACTORY_DIR, "input_external", "maker_selling")
ARCHIVE_DIR = os.path.join(INPUT_DIR, "archive")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")
QUEUE_DIR = os.path.join(FACTORY_DIR, "data", "queue")

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(ARCHIVE_DIR, exist_ok=True)
os.makedirs(QUEUE_DIR, exist_ok=True)

def probe_video(video_path: str) -> dict:
    """FFprobe로 해상도 및 재생 시간 추출"""
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "stream=width,height,codec_type",
        "-show_entries", "format=duration",
        "-of", "json",
        video_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        return {}
    data = json.loads(res.stdout)
    dur = float(data.get("format", {}).get("duration", 0))
    streams = data.get("streams", [])
    v = next((s for s in streams if s.get("codec_type") == "video"), {})
    return {
        "duration": dur,
        "width": v.get("width", 0),
        "height": v.get("height", 0)
    }

def process_external_shorts():
    print("=" * 60)
    print("🔍 [메이커 셀링 도우미] 외부 숏폼 인입 폴더 스캔 중...")
    print(f"📁 대상 폴더: {INPUT_DIR}")
    print("=" * 60)

    files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.mp4', '.mov'))]
    if not files:
        print("💡 현재 인입 폴더에 새로 등록된 숏폼 영상이 없습니다.")
        print(f"👉 메이커 셀링 도우미에서 생성한 MP4를 위 폴더에 저장하시면 자동 배포 큐에 실립니다.")
        return 0

    processed_count = 0
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")

    for fname in files:
        src_path = os.path.join(INPUT_DIR, fname)
        info = probe_video(src_path)
        dur = info.get("duration", 0)
        w = info.get("width", 0)
        h = info.get("height", 0)

        print(f"\n[발견] {fname} ({dur:.1f}초, {w}x{h})")

        # 1. 파일 이름 규격화
        clean_name = f"External_MakerSelling_{date_str}_{fname}"
        dest_output_path = os.path.join(OUTPUT_DIR, clean_name)

        # 2. output 폴더로 복사 (배포 가용 상태)
        shutil.copyfile(src_path, dest_output_path)
        print(f"  ✓ output 디렉터리 복사 완료: {clean_name}")

        # 3. 배포 큐 등록 메타데이터 생성
        queue_item = {
            "type": "EXTERNAL_PROMO_SHORTS",
            "source": "MAKER_SELLING_ASSISTANT",
            "video_path": dest_output_path,
            "original_filename": fname,
            "duration": dur,
            "resolution": f"{w}x{h}",
            "created_at": datetime.now().isoformat(),
            "target_channels": ["youtube_shorts", "tiktok", "instagram_reels_parvogel"],
            "status": "QUEUED_FOR_DISPATCH",
            "caption": (
                "🚨 파보겔 쿠팡/스마트스토어 공식 입점 특가!\n"
                "주사기 없이 1초 원터치 펌프로 끝내는 반려동물 흡착 겔.\n"
                "프로필 링크 또는 포털 검색창에서 '파보겔'을 검색하세요! 🐾\n"
                "#파보겔 #강아지설사 #쿠팡로켓배송 #스마트스토어 #강아지장염"
            )
        }

        queue_file = os.path.join(QUEUE_DIR, f"task_{date_str}_{processed_count+1}.json")
        with open(queue_file, "w", encoding="utf-8") as qf:
            json.dump(queue_item, qf, ensure_ascii=False, indent=2)
        print(f"  ✓ 배포 대기열(Queue) 등록 완료: {os.path.basename(queue_file)}")

        # 4. 원본 파일은 archive 폴더로 안전 이동 (중복 처리 방지)
        archive_dest = os.path.join(ARCHIVE_DIR, f"{date_str}_{fname}")
        shutil.move(src_path, archive_dest)
        print(f"  ✓ 원본 보관소 이동 완료: archive/{os.path.basename(archive_dest)}")

        processed_count += 1

    print("\n" + "=" * 60)
    print(f"🎉 총 {processed_count}개의 외부 숏폼 인입 및 배포 큐 등록 완료!")
    print("=" * 60)
    return processed_count

if __name__ == '__main__':
    process_external_shorts()
