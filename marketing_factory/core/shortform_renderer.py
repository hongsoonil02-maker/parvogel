#!/usr/bin/env python3
"""
Shortform Auto-Renderer — 파보겔(PARVOGEL) 9:16 바이럴 숏폼 멀티씬 자동 합성 렌더러
- edge-tts (고품질 뉴럴 한국어 음성 ko-KR-SunHiNeural, ko-KR-InJoonNeural) 연동
- 각 씬별 내레이션 음성 길이(duration)에 맞춘 B-roll 비디오/이미지 자동 동기화
- 1080x1920 세로형 캔버스 + 상단 긴급 배지 + 중앙 실사 임상 컷 + 하단 고대비 자막 바
- FFmpeg concat 필터를 통한 무손실 클립 결합 및 썸네일 추출
"""

import os
import sys
import subprocess
import asyncio
import json
import tempfile
from datetime import datetime
from typing import Dict, Any, List, Optional

# UTF-8 보장
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, FACTORY_DIR)
sys.path.insert(0, CURRENT_DIR)
PROJECT_DIR = os.path.dirname(FACTORY_DIR)
DATA_DIR = os.path.join(FACTORY_DIR, "data")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")
RENDER_DIR = os.path.join(OUTPUT_DIR, "rendered_shorts")

os.makedirs(RENDER_DIR, exist_ok=True)


class ShortformAutoRenderer:
    """9:16 숏폼 멀티씬 비디오 자동 렌더링 엔진"""

    def __init__(self):
        self.project_dir = PROJECT_DIR
        self.output_dir = RENDER_DIR
        self.broll_catalog = self._load_json(os.path.join(DATA_DIR, "broll_catalog.json"))
        
        # Windows / Linux 폰트 후보군
        font_candidates = [
            "C:/Windows/Fonts/malgunbd.ttf",
            "C:/Windows/Fonts/malgun.ttf",
            "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        ]
        self.font_file = next((p for p in font_candidates if os.path.exists(p)), None)

    def _load_json(self, path: str) -> Dict[str, Any]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

        # [철칙 가드] 로타겔 및 시제품 레거시 사진 영구 차단 -> 홈페이지 공식 정품 실사로 강제 치환
        lower_path = rel_or_abs.lower()
        if any(b in lower_path for b in ["rotagel", "로타겔", "parvogel-1", "parvogel-2", "parvogel-3", "parvogel-4", "시제품"]):
            official_front = os.path.join(self.project_dir, "public", "images", "bottle_front.png")
            if os.path.exists(official_front):
                return official_front

        if os.path.isabs(rel_or_abs) and os.path.exists(rel_or_abs):
            return rel_or_abs
        
        candidate = os.path.join(self.project_dir, rel_or_abs)
        if os.path.exists(candidate):
            return candidate
            
        candidate2 = os.path.join(self.project_dir, "public", "assets", os.path.basename(rel_or_abs))
        if os.path.exists(candidate2):
            return candidate2
            
        # 기본 폴백 비디오
        fallback = os.path.join(self.project_dir, "public", "assets", "parvogel_case_01_seizure.mp4")
        return fallback if os.path.exists(fallback) else rel_or_abs

    async def _generate_tts_audio(self, text: str, out_path: str, voice: str = "ko-KR-SunHiNeural", rate: str = "+12%"):
        """Edge-TTS를 이용한 한국어 고품질 음성 합성"""
        import edge_tts
        communicate = edge_tts.Communicate(text, voice, rate=rate)
        await communicate.save(out_path)

    def _probe_duration(self, media_path: str) -> float:
        """미디어 파일(오디오/비디오)의 실제 재생 시간(초) 반환"""
        try:
            res = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", media_path],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore", timeout=6
            )
            if res.returncode == 0 and res.stdout.strip():
                return float(res.stdout.strip())
        except Exception:
            pass
        return 4.0

    def _render_scene_clip(self, scene: Dict[str, Any], tts_path: str, duration: float, out_path: str, badge_text: str = "🚨 긴급 골든타임") -> bool:
        """단일 씬(오디오 길이 기준) 1080x1920 9:16 비디오 클립 렌더링"""
        broll_id = scene.get("broll_id")
        clip_meta = next((c for c in self.broll_catalog.get("clips", []) if c["id"] == broll_id), {})
        raw_source = clip_meta.get("file", "public/assets/parvogel_case_01_seizure.mp4")
        source_path = self._resolve_source_path(raw_source)

        is_image = any(source_path.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"])

        # 캡션 텍스트 정리 (특수문자 이스케이프)
        caption_raw = scene.get("caption", "")
        safe_caption = caption_raw.replace(":", " ").replace("'", "").replace('"', "")
        if len(safe_caption) > 28:
            safe_caption = safe_caption[:26] + ".."

        safe_badge = badge_text.replace(":", " ").replace("'", "").replace('"', "")

        # 필터 그래프 구성
        if self.font_file:
            safe_font = self.font_file.replace("\\", "/").replace(":", r"\:")
            draw_filters = (
                # 상단 배지 박스
                "drawbox=y=60:w=1080:h=120:color=black@0.85:t=fill,"
                "drawbox=x=80:y=80:w=360:h=80:color=red@0.95:t=fill,"
                f"drawtext=fontfile='{safe_font}':text='{safe_badge}':fontcolor=white:fontsize=36:x=110:y=100,"
                # 하단 자막 박스
                "drawbox=y=1540:w=1080:h=300:color=black@0.90:t=fill,"
                "drawbox=y=1540:w=1080:h=6:color=yellow@0.95:t=fill,"
                f"drawtext=fontfile='{safe_font}':text='{safe_caption}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=1640"
            )
        else:
            draw_filters = (
                "drawbox=y=60:w=1080:h=120:color=black@0.85:t=fill,"
                "drawbox=y=1540:w=1080:h=300:color=black@0.90:t=fill"
            )

        if is_image:
            # 정지 이미지일 경우 프리미엄 블러 엠비언트 배경 + 중앙 정품 실사 보틀 오버레이
            ambient_filter = (
                "split[bg][fg];"
                "[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[blurred];"
                "[fg]scale=960:1200:force_original_aspect_ratio=decrease[scaled];"
                "[blurred][scaled]overlay=(1080-w)/2:(1920-h)/2"
            )
            vf = f"{ambient_filter},{draw_filters}"
            cmd = [
                "ffmpeg", "-y",
                "-loop", "1",
                "-i", source_path,
                "-i", tts_path,
                "-t", str(duration),
                "-vf", vf,
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-crf", "22",
                "-c:a", "aac",
                "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-shortest",
                out_path
            ]
        else:
            # 비디오일 경우 loop 또는 trim 후 오디오 합성
            scale_filter = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
            vf = f"{scale_filter},{draw_filters}"
            cmd = [
                "ffmpeg", "-y",
                "-stream_loop", "-1",
                "-i", source_path,
                "-i", tts_path,
                "-t", str(duration),
                "-vf", vf,
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-crf", "22",
                "-c:a", "aac",
                "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-map", "0:v:0",
                "-map", "1:a:0",
                "-shortest",
                out_path
            ]

        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore", timeout=30)
            return res.returncode == 0 and os.path.exists(out_path)
        except Exception as e:
            print(f"[SCENE_RENDER_ERROR] {e}")
            return False

    def render_shortform_video(self, script_obj: Dict[str, Any], badge_text: Optional[str] = None) -> Optional[str]:
        """대본 객체를 받아 5개 씬의 TTS 및 비디오 클립을 조립하여 최종 9:16 비디오 생성"""
        version_id = script_obj.get("version_id", "SHORTFORM")
        scenes = script_obj.get("scenes", [])
        if not scenes:
            print(f"[RENDER_ERROR] No scenes in script: {version_id}")
            return None

        # 보이스 선택: 송아지 농가형은 신뢰감 있는 남성 보이스(InJoon), 반려견은 차분한 여성 보이스(SunHi)
        voice = "ko-KR-InJoonNeural" if "CALF" in version_id else "ko-KR-SunHiNeural"
        badge = badge_text or ("🐄 한우 농가 실화" if "CALF" in version_id else "🚨 1초 골든타임")

        date_tag = datetime.now().strftime("%Y%m%d_%H%M%S")
        final_video_name = f"Viral_{version_id}_{date_tag}.mp4"
        final_video_path = os.path.join(self.output_dir, final_video_name)

        print(f"\n[RENDER_START] Building {version_id} ({len(scenes)} scenes)...")

        with tempfile.TemporaryDirectory() as temp_dir:
            clip_paths = []

            for idx, scene in enumerate(scenes, 1):
                scene_narration = scene.get("narration", "")
                tts_file = os.path.join(temp_dir, f"scene_{idx:02d}_tts.mp3")
                clip_file = os.path.join(temp_dir, f"scene_{idx:02d}_clip.mp4")

                # 1. Edge-TTS 생성
                asyncio.run(self._generate_tts_audio(scene_narration, tts_file, voice=voice))
                tts_dur = self._probe_duration(tts_file)
                # 약간의 여운을 위해 +0.3초 추가
                scene_dur = max(3.5, tts_dur + 0.3)

                print(f"  • Scene {idx:02d}: {tts_dur:.1f}s audio -> rendering {scene_dur:.1f}s video slice...")
                success = self._render_scene_clip(scene, tts_file, scene_dur, clip_file, badge_text=badge)
                if success:
                    clip_paths.append(clip_file)
                else:
                    print(f"  ! Scene {idx:02d} failed to render.")

            if not clip_paths:
                print(f"[RENDER_FAIL] No clips rendered for {version_id}")
                return None

            # 2. Concat 리스트 작성
            concat_txt_path = os.path.join(temp_dir, "concat_list.txt")
            with open(concat_txt_path, "w", encoding="utf-8") as f:
                for cp in clip_paths:
                    safe_cp = cp.replace("\\", "/")
                    f.write(f"file '{safe_cp}'\n")

            # 3. 무손실 병합 (Concat Demuxer)
            concat_cmd = [
                "ffmpeg", "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", concat_txt_path,
                "-c", "copy",
                final_video_path
            ]
            res = subprocess.run(concat_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore")
            if res.returncode == 0 and os.path.exists(final_video_path):
                file_size_mb = os.path.getsize(final_video_path) / (1024 * 1024)
                total_duration = self._probe_duration(final_video_path)
                print(f"🎉 [RENDER_COMPLETE] {final_video_name} ({total_duration:.1f}s, {file_size_mb:.2f} MB)")
                
                # 썸네일 추출
                thumb_path = os.path.join(self.output_dir, f"Viral_{version_id}_{date_tag}_thumb.jpg")
                self._extract_thumb(final_video_path, thumb_path)
                return final_video_path
            else:
                print(f"[CONCAT_ERROR] FFmpeg concat failed:\n{res.stderr[-400:]}")
                return None

    def _extract_thumb(self, video_path: str, thumb_path: str):
        """3초 지점 대표 썸네일 추출"""
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
    from core.viral_shortform_engine import ViralShortformEngine
    engine = ViralShortformEngine()
    renderer = ShortformAutoRenderer()
    
    # 기본 대본 생성 후 버전 A, B, C 일괄 렌더링 테스트
    scripts_bundle = engine.generate_shortform_scripts()
    for v_key in ["version_a", "version_b", "version_c"]:
        s_obj = scripts_bundle[v_key]
        rendered = renderer.render_shortform_video(s_obj)
        print(f"Result for {v_key}: {rendered}")
