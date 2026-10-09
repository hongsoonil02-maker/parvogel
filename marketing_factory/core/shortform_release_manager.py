#!/usr/bin/env python3
"""
Shortform Release Manager — 파보겔(PARVOGEL) 숏폼 3편 플랫폼 업로드 및 A/B 테스트 매니저
- 렌더링된 숏폼 3편(버전 A, B, C)을 유튜브 쇼츠, 인스타그램 릴스, 틱톡에 동시 릴리즈
- A/B 테스트 매트릭스(감성형 vs 기전형 vs 농가형) 관리 및 플랫폼별 최적화 메타데이터 주입
- 고정 댓글(스마트스토어/쿠팡 UTM 링크) 및 댓글 폭탄 트리거 자동 설정
- 릴리즈 히스토리 장부(shortform_releases.json) 보관
"""

import os
import sys
import json
import glob
from datetime import datetime
from typing import Dict, Any, List, Optional

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, FACTORY_DIR)

DATA_DIR = os.path.join(FACTORY_DIR, "data")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")
RENDER_DIR = os.path.join(OUTPUT_DIR, "rendered_shorts")
DRAFTS_DIR = os.path.join(FACTORY_DIR, "drafts")
RELEASES_LOG_PATH = os.path.join(DATA_DIR, "shortform_releases.json")

from core.viral_shortform_engine import ViralShortformEngine
from adapters.youtube_adapter import YouTubeAdapter
from adapters.instagram_adapter import InstagramAdapter
from adapters.tiktok_adapter import TikTokAdapter


class ShortformReleaseManager:
    """바이럴 숏폼 멀티플랫폼 릴리즈 및 A/B 테스트 관리자"""

    def __init__(self):
        self.engine = ViralShortformEngine()
        self.adapters = {
            "YouTube_Shorts": YouTubeAdapter(),
            "Instagram_Reels": InstagramAdapter(),
            "TikTok": TikTokAdapter()
        }
        self.releases = self._load_releases()

    def _load_releases(self) -> List[Dict[str, Any]]:
        if os.path.exists(RELEASES_LOG_PATH):
            try:
                with open(RELEASES_LOG_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save_releases(self):
        with open(RELEASES_LOG_PATH, "w", encoding="utf-8") as f:
            json.dump(self.releases, f, indent=2, ensure_ascii=False)

    def _find_latest_rendered_video(self, version_token: str) -> Optional[str]:
        """버전 토큰(VERSION_A, VERSION_B, VERSION_C)에 매칭되는 가장 최신 렌더링 MP4 탐색"""
        pattern = os.path.join(RENDER_DIR, f"Viral_*{version_token}*.mp4")
        matches = glob.glob(pattern)
        if matches:
            return max(matches, key=os.path.getmtime)
        return None

    def build_ab_test_matrix(self) -> Dict[str, Any]:
        """A/B 테스트 3대 버전 릴리즈 패키지 생성"""
        scripts = self.engine.generate_shortform_scripts()
        matrix = {}

        versions = [
            ("version_a", "VERSION_A", "감성공감형 (0.6kg 아기 강아지 실화)"),
            ("version_b", "VERSION_B", "수의학기전형 (단순 지사제 위험 vs 몬모릴로나이트)"),
            ("version_c", "VERSION_C", "농가실화형 (송아지 300만원 폐사 방지)")
        ]

        for v_key, v_token, v_desc in versions:
            s_obj = scripts.get(v_key, {})
            v_file = self._find_latest_rendered_video(v_token)
            
            matrix[v_key] = {
                "version_id": s_obj.get("version_id"),
                "ab_hypothesis": v_desc,
                "video_file": v_file,
                "title": s_obj.get("title"),
                "trigger_keyword": s_obj.get("trigger_keyword"),
                "target": s_obj.get("target"),
                "running_time_sec": s_obj.get("running_time_sec"),
                "pinned_comment": s_obj.get("pinned_comment"),
                "platforms": {
                    "YouTube_Shorts": {
                        "title": f"{s_obj.get('title')} #shorts"[:100],
                        "description": f"{s_obj.get('title')}\n\n{s_obj.get('pinned_comment')}\n\n#파보겔 #shorts #반려동물",
                        "tags": ["파보겔", "강아지설사", "파보장염", "수의사", "shorts"],
                        "video_path": v_file
                    },
                    "Instagram_Reels": {
                        "caption": f"🚨 {s_obj.get('title')}\n\n{s_obj.get('pinned_comment')}\n\n#파보겔 #반려견 #수의학 #릴스",
                        "video_path": v_file
                    },
                    "TikTok": {
                        "title": f"{s_obj.get('title')} #파보겔 #틱톡"[:150],
                        "video_path": v_file
                    }
                }
            }

        return matrix

    def execute_release(self, force: bool = False) -> Dict[str, Any]:
        """3개 버전의 숏폼을 활성화된 플랫폼에 배포 및 결과 아카이브"""
        matrix = self.build_ab_test_matrix()
        results = {}
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        print("=" * 65)
        print(f"🚀 [SHORTFORM RELEASE MANAGER] Launching A/B Test Campaign ({now_str})")
        print("=" * 65)

        for v_key, v_data in matrix.items():
            v_id = v_data["version_id"]
            video_file = v_data["video_file"]
            print(f"\n📦 Processing {v_id} [{v_data['ab_hypothesis']}]...")
            print(f"   Video: {os.path.basename(video_file) if video_file else 'NOT_FOUND'}")

            version_res = {}
            for p_name, adapter in self.adapters.items():
                p_payload = v_data["platforms"].get(p_name, {})
                
                if not video_file or not os.path.exists(video_file):
                    version_res[p_name] = "SKIPPED_NO_VIDEO"
                    continue

                # 어댑터 인증 키 유효성 확인
                if adapter.validate_config():
                    try:
                        success = adapter.publish(p_payload)
                        version_res[p_name] = "SUCCESS" if success else "FAILED"
                    except Exception as e:
                        version_res[p_name] = f"ERROR: {e}"
                else:
                    # API 키 미등록 시 자동 발행용 Drafts 아카이브 저장
                    draft_file = os.path.join(DRAFTS_DIR, f"{p_name}_{v_id}_{datetime.now().strftime('%Y%m%d')}.json")
                    with open(draft_file, "w", encoding="utf-8") as f:
                        json.dump(p_payload, f, indent=2, ensure_ascii=False)
                    version_res[p_name] = f"ARCHIVED_READY_FOR_PUBLISH: {os.path.basename(draft_file)}"

                print(f"   • {p_name:16}: {version_res[p_name]}")

            results[v_id] = {
                "hypothesis": v_data["ab_hypothesis"],
                "video_file": video_file,
                "trigger_keyword": v_data["trigger_keyword"],
                "platform_statuses": version_res
            }

        # 릴리즈 장부 기록
        release_entry = {
            "timestamp": now_str,
            "campaign": "PARVOGEL_VIRAL_SHORTS_AB_TEST",
            "results": results
        }
        self.releases.append(release_entry)
        self._save_releases()

        print("\n" + "=" * 65)
        print("🎉 [RELEASE COMPLETE] A/B Test Packaged & Recorded in shortform_releases.json")
        print("=" * 65)

        return release_entry


if __name__ == "__main__":
    manager = ShortformReleaseManager()
    res = manager.execute_release()
    print("Release Results Summary:")
    print(json.dumps(res, indent=2, ensure_ascii=False))
