#!/usr/bin/env python3
"""
Video Maker — 파보겔(Parvogel) 순수 B2C 리얼 임상 다큐 & 반려조 '꼬미' 실증 9:16 쇼츠 엔진
- 1080x1920 세로형 숏폼/릴스/틱톡 최적화 (Windows + Ubuntu Linux 교차 폰트 지원)
- 검증된 1등 영상(parvogel_real_clinical_28s_landing.mp4) 기반 ISO 주차별 변주 렌더링
- 수요일 반려조 앵무새 '꼬미' 실제 전·후 사진 기반 24시간 회복 실증 쇼츠 자동 렌더링
- 김동준 원장 진료실 실사 클립 요일별 맞춤형 9:16 숏폼 렌더링
"""

import os
import sys
import subprocess
import json
import requests
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
GOMI_DIR = os.path.join(PROJECT_DIR, "public", "images", "gomi")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")

os.makedirs(OUTPUT_DIR, exist_ok=True)


def _resolve_font_path() -> Optional[str]:
    candidates = [
        "C:/Windows/Fonts/malgunbd.ttf",
        "C:/Windows/Fonts/malgun.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    try:
        out = subprocess.check_output(
            ["fc-match", "-f", "%{file}", "Noto Sans CJK KR:bold"],
            text=True, stderr=subprocess.DEVNULL
        ).strip()
        if out and os.path.exists(out):
            return out
    except Exception:
        pass
    return None


def _clean_drawtext(text: str, max_len: int = 28) -> str:
    cleaned = (text or "").replace("몽모릴로나이트", "몬모릴로나이트").replace("상비약", "응급 상비겔")
    cleaned = cleaned.replace(":", " ").replace("'", "").replace('"', "").replace("%", "pct")
    return cleaned.strip()[:max_len]


class ParvogelVideoMaker:
    """김동준 원장 리얼 임상 다큐멘터리 & 꼬미 실증 숏폼 렌더러"""

    WEEKLY_REAL_DOCU_BADGES = [
        "우리 집 펫 구급함 1순위 응급 상비겔",
        "생후 55일 아기 푸들 실제 진료실 기록",
        "새벽 구토·물설사 골든타임 1초 펌프",
        "주사기 스트레스 ZERO 스스로 핥아먹는 겔",
    ]

    def __init__(self):
        self.assets_dir = ASSETS_DIR
        self.gomi_dir = GOMI_DIR
        self.output_dir = OUTPUT_DIR

    def generate_daily_shorts(
        self,
        video_filename: str,
        top_title: str,
        bottom_sub: str,
        date_tag: Optional[str] = None,
        iso_week: Optional[int] = None,
    ) -> Optional[str]:
        now = datetime.now()
        if not date_tag:
            date_tag = now.strftime("%Y%m%d")
        if iso_week is None:
            iso_week = now.isocalendar()[1]

        # 0. 수요일 반려조 '꼬미' 실제 전·후 배변 회복 실증 쇼츠 전용 분기
        if video_filename == "gomi_parrot_proof":
            gomi_out = self.generate_gomi_parrot_shorts(
                top_title=top_title,
                date_tag=date_tag,
                iso_week=iso_week,
            )
            if gomi_out:
                return gomi_out
            video_filename = "parvogel_real_clinical_28s_landing.mp4"

        # 1. 검증된 리얼 임상 28초 다큐 전용 분기 (조회수 170회 1등 원본 + 주차별 미세 변주)
        if "parvogel_real_clinical_28s" in str(video_filename):
            real_path = os.path.join(self.assets_dir, "parvogel_real_clinical_28s_landing.mp4")
            if os.path.exists(real_path):
                return self.generate_real_clinical_docu_shorts(
                    src_path=real_path,
                    top_title=top_title,
                    date_tag=date_tag,
                    iso_week=iso_week,
                )

        # 2. 일반 진료실 실사 클립 매핑
        src_path = os.path.join(self.assets_dir, video_filename)
        if not os.path.exists(src_path):
            candidates = [
                os.path.join(self.assets_dir, "parvogel_real_clinical_28s_landing.mp4"),
                os.path.join(self.assets_dir, "parvogel_clinical_documentary_v2.mp4"),
                os.path.join(self.assets_dir, "김동준원장_동영상 4-1.mp4"),
                os.path.join(self.assets_dir, "parvogel_case_05_eating.mp4"),
            ]
            for cand in candidates:
                if os.path.exists(cand):
                    src_path = cand
                    break

        clean_name = os.path.splitext(os.path.basename(src_path))[0].replace(" ", "_")
        out_filename = f"Shorts_{clean_name}_W{iso_week:02d}_{date_tag}.mp4"
        out_path = os.path.join(self.output_dir, out_filename)

        print(f"[VIDEO] Rendering Clinical Documentary Shorts: '{os.path.basename(src_path)}' -> '{out_filename}'")

        duration = self._probe_duration(src_path)
        target_t = min(45, max(7, int(duration) if duration else 45)) if duration else 45
        # 주차별 미세 시작 오프셋 (중복 영상 해시 회피)
        ss_offset = round(((iso_week % 4) * 0.2), 2) if duration and duration > 10 else 0.0
        ss_args = ["-ss", str(ss_offset)] if ss_offset > 0 else []
        t_args = ["-t", str(target_t)] if duration and duration > target_t else []

        safe_top = _clean_drawtext(top_title, 26)
        safe_bottom = _clean_drawtext(bottom_sub, 32)
        badge_text = self.WEEKLY_REAL_DOCU_BADGES[iso_week % len(self.WEEKLY_REAL_DOCU_BADGES)]

        font_file = _resolve_font_path()
        if font_file:
            safe_font = font_file.replace("\\", "/").replace(":", r"\:")
            filter_complex = (
                "scale=1080:1920:force_original_aspect_ratio=increase,"
                "crop=1080:1920,"
                "drawbox=y=0:w=1080:h=320:color=black@0.90:t=fill,"
                "drawbox=x=80:y=44:w=920:h=56:color=0xDC2626@0.95:t=fill,"
                f"drawtext=fontfile='{safe_font}':text='{badge_text}':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=56,"
                f"drawtext=fontfile='{safe_font}':text='{safe_top}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=134,"
                f"drawtext=fontfile='{safe_font}':text='특허균주 x 고순도 나노 몬모릴로나이트':fontcolor=0x10B981:fontsize=26:x=(w-text_w)/2:y=214,"
                "drawbox=y=1600:w=1080:h=320:color=black@0.90:t=fill,"
                "drawbox=x=80:y=1636:w=920:h=68:color=0x059669@0.95:t=fill,"
                f"drawtext=fontfile='{safe_font}':text='바늘·주사기 스트레스 ZERO! 1초 펌프 급여':fontcolor=white:fontsize=31:x=(w-text_w)/2:y=1654,"
                f"drawtext=fontfile='{safe_font}':text='{safe_bottom}':fontcolor=0xE2E8F0:fontsize=26:x=(w-text_w)/2:y=1736,"
                f"drawtext=fontfile='{safe_font}':text='카카오쇼핑 · 쿠팡 · 스마트스토어 공식 파보겔':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=1796"
            )
        else:
            filter_complex = (
                "scale=1080:1920:force_original_aspect_ratio=increase,"
                "crop=1080:1920,"
                "drawbox=y=0:w=1080:h=320:color=black@0.90:t=fill,"
                "drawbox=y=1600:w=1080:h=320:color=black@0.90:t=fill"
            )

        cmd = [
            "ffmpeg", "-y",
            *ss_args,
            "-i", src_path,
            "-vf", filter_complex,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "20",
            "-c:a", "aac",
            "-b:a", "192k",
            "-movflags", "+faststart",
        ] + t_args + [out_path]

        return self._run_ffmpeg(cmd, out_path, f"Shorts_{clean_name}_W{iso_week:02d}_{date_tag}_thumb.jpg")

    def generate_real_clinical_docu_shorts(
        self,
        src_path: str,
        top_title: str,
        date_tag: str,
        iso_week: int,
    ) -> Optional[str]:
        """170회 조회수 1등 순수 진료실 28초 다큐 기반 — 주차별 동적 훅 배너 + 미세 트림 변주 (1080x1920)"""
        out_filename = f"Shorts_RealClinical28s_W{iso_week:02d}_{date_tag}.mp4"
        out_path = os.path.join(self.output_dir, out_filename)
        print(f"[VIDEO_DOCU] Rendering 28s Real Clinical Shorts (W{iso_week:02d}) -> '{out_filename}'")

        # 주차별 0.0~0.6초 미세 시작 변주 + 상단 훅 문구 로테이션으로 중복 판정 방지
        ss_offset = round((iso_week % 4) * 0.2, 2)
        badge_text = self.WEEKLY_REAL_DOCU_BADGES[iso_week % len(self.WEEKLY_REAL_DOCU_BADGES)]
        safe_hook = _clean_drawtext(top_title, 26)
        font_file = _resolve_font_path()

        if font_file:
            safe_font = font_file.replace("\\", "/").replace(":", r"\:")
            vf = (
                "scale=1080:1920:force_original_aspect_ratio=increase,"
                "crop=1080:1920,"
                "drawbox=x=70:y=68:w=940:h=136:color=black@0.72:t=fill,"
                "drawbox=x=70:y=68:w=940:h=46:color=0x0F766E@0.95:t=fill,"
                f"drawtext=fontfile='{safe_font}':text='{badge_text}':fontcolor=white:fontsize=26:x=(w-text_w)/2:y=78,"
                f"drawtext=fontfile='{safe_font}':text='{safe_hook}':fontcolor=0xFEF08A:fontsize=34:x=(w-text_w)/2:y=134"
            )
        else:
            vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"

        cmd = [
            "ffmpeg", "-y",
            "-ss", str(ss_offset),
            "-i", src_path,
            "-vf", vf,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "20",
            "-c:a", "aac",
            "-b:a", "192k",
            "-movflags", "+faststart",
            out_path,
        ]
        return self._run_ffmpeg(cmd, out_path, f"Shorts_RealClinical28s_W{iso_week:02d}_{date_tag}_thumb.jpg")

    def generate_gomi_parrot_shorts(
        self,
        top_title: str,
        date_tag: str,
        iso_week: int,
    ) -> Optional[str]:
        """수요일 반려조 앵무새 '꼬미' 실제 전·후 배변 회복 사진 5장 기반 25초 실증 쇼츠 (1080x1920)"""
        slides = [
            (
                os.path.join(self.gomi_dir, "gomi_before.jpg"),
                "BEFORE 급성 물설사 비상",
                "바닥 휴지가 흥건히 젖은 수양성 물변",
                "새벽에 갑자기 터진 앵무새 물설사, 대사가 빠른 조류는 24시간이 골든타임입니다.",
            ),
            (
                os.path.join(self.gomi_dir, "gomi_before_close.jpg"),
                "낙조 위기 1차 대응",
                "강제 주사기 대신 부리 끝 1방울 톡",
                "주사기 강제 급여는 기도 질식 위험이 있어, 부리 끝에 파보겔 한 방울을 부드럽게 발라주었습니다.",
            ),
            (
                os.path.join(self.gomi_dir, "gomi_after.jpg"),
                "24시간 경과 실제 변화",
                "물기 번짐이 멈추고 변 형태 안정화",
                "체내 흡수 제로 나노 몬모릴로나이트가 장 점막을 코팅하고 유해 독소만 흡착 배출하자 변화가 시작됐습니다.",
            ),
            (
                os.path.join(self.gomi_dir, "gomi_after_clear.jpg"),
                "정상 변 알맹이·요산 분리",
                "단단한 초록 변과 하얀 정상 요산 회복",
                "단 24시간 만에 수양성 물변이 멎고 단단한 정상 변과 하얀 요산이 선명하게 분리되었습니다.",
            ),
            (
                os.path.join(self.gomi_dir, "gomi_after_close.jpg"),
                "우리 집 펫 구급함 1순위",
                "강아지·고양이·반려조 응급 상비겔 파보겔",
                "실온 18개월 보관 가능한 응급 상비겔 파보겔, 카카오쇼핑과 스마트스토어에서 확인하세요.",
            ),
        ]
        available = [s for s in slides if os.path.exists(s[0])]
        if len(available) < 3:
            print("[WARN] Gomi parrot proof images missing, falling back.")
            return None

        temp_dir = os.path.join(self.output_dir, "temp_gomi_shorts")
        os.makedirs(temp_dir, exist_ok=True)
        font_file = _resolve_font_path()
        safe_font = font_file.replace("\\", "/").replace(":", r"\:") if font_file else None
        api_key = os.getenv("OPENAI_API_KEY")

        scene_files = []
        # 주차별 슬라이드 미세 체류시간 변주 (중복 해시 회피)
        extra_pad = round((iso_week % 3) * 0.2, 2)
        for idx, (img_path, badge, caption, tts_text) in enumerate(available, 1):
            audio_path = os.path.join(temp_dir, f"gomi_s{idx}_audio.mp3")
            dur = self._ensure_tts_audio(tts_text, audio_path, api_key, default_dur=4.8 + extra_pad)
            scene_out = os.path.join(temp_dir, f"gomi_s{idx}_W{iso_week:02d}.mp4")

            safe_badge = _clean_drawtext(badge, 24)
            safe_cap = _clean_drawtext(caption, 28)
            safe_hdr = _clean_drawtext(top_title or "앵무새 꼬미 24시간 배변 회복 실화", 24)

            if safe_font:
                vf = (
                    "scale=1080:1920:force_original_aspect_ratio=decrease,"
                    "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:0x0F172A,"
                    "drawbox=x=0:y=0:w=1080:h=310:color=0x0F172A@0.92:t=fill,"
                    "drawbox=x=90:y=70:w=900:h=60:color=0x059669@0.95:t=fill,"
                    f"drawtext=fontfile='{safe_font}':text='{safe_badge}':fontcolor=white:fontsize=32:x=(w-text_w)/2:y=84,"
                    f"drawtext=fontfile='{safe_font}':text='{safe_hdr}':fontcolor=0xFEF08A:fontsize=36:x=(w-text_w)/2:y=165,"
                    "drawbox=x=0:y=1540:w=1080:h=380:color=0x0F172A@0.92:t=fill,"
                    f"drawtext=fontfile='{safe_font}':text='{safe_cap}':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=1600,"
                    f"drawtext=fontfile='{safe_font}':text='반려조 꼬미 실제 24시간 회복 기록 | 파보겔':fontcolor=0x94A3B8:fontsize=26:x=(w-text_w)/2:y=1685,"
                    "fps=30,setsar=1"
                )
            else:
                vf = "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:0x0F172A,fps=30,setsar=1"

            cmd = [
                "ffmpeg", "-y",
                "-loop", "1", "-i", img_path,
                "-i", audio_path,
                "-vf", vf,
                "-t", f"{dur:.2f}",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "1",
                scene_out,
            ]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore")
            if res.returncode != 0 or not os.path.exists(scene_out):
                print(f"[GOMI_SCENE_ERR] slide {idx}: {res.stderr[-300:]}")
                return None
            scene_files.append(scene_out)

        concat_txt = os.path.join(temp_dir, "gomi_scenes.txt")
        with open(concat_txt, "w", encoding="utf-8") as f:
            for sf in scene_files:
                f.write(f"file '{sf.replace(chr(92), '/')}'\n")

        out_filename = f"Shorts_Gomi_Parrot_W{iso_week:02d}_{date_tag}.mp4"
        out_path = os.path.join(self.output_dir, out_filename)
        concat_cmd = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_txt,
            "-c", "copy", "-movflags", "+faststart", out_path,
        ]
        return self._run_ffmpeg(concat_cmd, out_path, f"Shorts_Gomi_Parrot_W{iso_week:02d}_{date_tag}_thumb.jpg")

    def _ensure_tts_audio(self, text: str, out_path: str, api_key: Optional[str], default_dur: float = 5.0) -> float:
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
            dur = self._probe_duration(out_path)
            if dur and dur > 1.0:
                return dur
        if api_key:
            try:
                res = requests.post(
                    "https://api.openai.com/v1/audio/speech",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={"model": "tts-1", "voice": "nova", "input": text, "speed": 1.05},
                    timeout=25,
                )
                if res.status_code == 200:
                    with open(out_path, "wb") as f:
                        f.write(res.content)
                    dur = self._probe_duration(out_path)
                    if dur and dur > 1.0:
                        return dur
            except Exception as e:
                print(f"[WARN] Gomi TTS fallback triggered: {e}")
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
            "-t", f"{default_dur:.2f}", "-q:a", "9", "-acodec", "libmp3lame", out_path,
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return default_dur

    def _run_ffmpeg(self, cmd: list, out_path: str, thumb_name: str) -> Optional[str]:
        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore")
            if res.returncode == 0 and os.path.exists(out_path):
                file_size_mb = os.path.getsize(out_path) / (1024 * 1024)
                print(f"[VIDEO_SUCCESS] Generated: {out_path} ({file_size_mb:.2f} MB)")
                thumb_path = os.path.join(self.output_dir, thumb_name)
                self._extract_thumb(out_path, thumb_path)
                return out_path
            print(f"[VIDEO_ERROR] FFmpeg failed with code {res.returncode}:\n{res.stderr[-600:]}")
            return None
        except Exception as e:
            print(f"[VIDEO_EXCEPTION] {e}")
            return None

    def _probe_duration(self, path: str) -> Optional[float]:
        try:
            res = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore", timeout=5
            )
            if res.returncode == 0 and res.stdout.strip():
                return float(res.stdout.strip())
        except Exception:
            pass
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
        video_filename="parvogel_real_clinical_28s_landing.mp4",
        top_title="생후 55일 아기 푸들 3일 뒤 기적",
        bottom_sub="주사기 없이 1초 펌프 급여"
    )
    print("Result:", out)
