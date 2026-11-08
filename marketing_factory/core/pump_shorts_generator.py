#!/usr/bin/env python3
"""
Pump Shorts Generator — 파보겔 1초 펌프 급여 가이드 & 5개 임상 실사 결합 숏폼 엔진
- 1080x1920 9:16 세로형 풀 HD 숏폼
- 5대 핵심 실사 씬:
  1. 새벽 응급 발작 (parvogel_case_01_seizure.mp4)
  2. 무기력 탈수 & 흡착 원리 (parvogel_case_02_lethargy.mp4)
  3. 1초 펌프 급여 & 김동준 원장 (김동준원장_동영상 4-1.mp4)
  4. 3일 만의 먹방 기적 (parvogel_case_05_eating.mp4)
  5. 골든타임 회복 & 정품 파보겔 (parvogel_case_03_standing.mp4)
- OpenAI 고품질 한국어 뉴럴 보이스 (nova) 내레이션 자동 합성
"""

import os
import sys
import subprocess
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_DIR = os.path.dirname(FACTORY_DIR)
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")
TEMP_DIR = os.path.join(OUTPUT_DIR, "temp_guide_shorts")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_PATH = "C:/Windows/Fonts/malgunbd.ttf"
FFMPEG_FONT = "C\\:/Windows/Fonts/malgunbd.ttf"

SCENES = [
    {
        "id": "scene_01",
        "clip": "public/assets/parvogel_case_01_seizure.mp4",
        "badge": "🚨 [응급 상황] 새벽 갑작스러운 물설사·혈변",
        "tts_text": "새벽에 갑자기 쏟아지는 물설사와 혈변, 정말 당황스러우셨죠? 원인은 장내 쌓인 유해 독소와 세균입니다.",
        "sub_line1": "갑작스러운 설사·혈변 비상사태!",
        "sub_line2": "원인은 장내 유해 독소와 병원성 세균",
        "is_wide": False
    },
    {
        "id": "scene_02",
        "clip": "public/assets/parvogel_case_02_lethargy.mp4",
        "badge": "🔬 [핵심 원리] 나노 몬모릴로나이트",
        "tts_text": "억지로 멈추면 독소가 몸에 흡수됩니다. 파보겔의 고순도 몬모릴로나이트는 장내 유해 독소만을 자석처럼 강력하게 흡착해 배출합니다.",
        "sub_line1": "고순도 몬모릴로나이트",
        "sub_line2": "유해 독소·세균 자석처럼 흡착 배출 & 장 점막 보호",
        "is_wide": False
    },
    {
        "id": "scene_03",
        "clip": "public/assets/김동준원장_동영상 4-1.mp4",
        "badge": "👨‍⚕️ [임상 처방] 주사기 거부감 제로 1초 펌프",
        "tts_text": "더 이상 위험한 주사기로 실랑이하지 마세요. 바늘 스트레스 제로! 아이 입가에 대고 가볍게 1초 원터치 펌프만 누르면 끝납니다.",
        "sub_line1": "주사기 거부감 ZERO!",
        "sub_line2": "입가에 대고 1초 원터치 펌프로 간편 급여",
        "is_wide": True
    },
    {
        "id": "scene_04",
        "clip": "public/assets/parvogel_case_05_eating.mp4",
        "badge": "✨ [식욕 부활] 3일 만에 그릇까지 싹싹",
        "tts_text": "곡기 끊겨 쓰러졌던 아이가 거부감 없이 스스로 핥아먹으며, 단 3일 만에 밥그릇까지 깨끗하게 비워냅니다.",
        "sub_line1": "스스로 핥아먹는 특급 기호성!",
        "sub_line2": "단 3일 만에 그릇까지 싹싹 비워내는 기적",
        "is_wide": False
    },
    {
        "id": "scene_05",
        "clip": "public/assets/parvogel_case_03_standing.mp4",
        "badge": "🏆 [수의사 추천] 반려동물 정장지사 파보겔",
        "tts_text": "우리 아이 설사 골든타임! 장 점막 보호막까지 형성하는 흡착 겔 파보겔로 소중한 생명을 지켜주세요.",
        "sub_line1": "설사 골든타임 파보겔",
        "sub_line2": "포털 검색창에 [파보겔]을 검색하세요",
        "is_wide": False
    }
]

class PumpShortsGenerator:
    """1초 펌프 급여 가이드 실사 숏폼 자동 렌더링 클래스"""

    def __init__(self):
        load_dotenv(os.path.join(PROJECT_DIR, ".env"))
        self.api_key = os.getenv("OPENAI_API_KEY")

    def _generate_tts(self, text: str, out_path: str) -> float:
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
            cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', out_path]
            return float(subprocess.run(cmd, capture_output=True, text=True).stdout.strip())

        if self.api_key:
            try:
                headers = {'Authorization': f'Bearer {self.api_key}', 'Content-Type': 'application/json'}
                payload = {'model': 'tts-1', 'voice': 'nova', 'input': text, 'speed': 1.05}
                res = requests.post('https://api.openai.com/v1/audio/speech', headers=headers, json=payload, timeout=25)
                if res.status_code == 200:
                    with open(out_path, 'wb') as f:
                        f.write(res.content)
                    cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', out_path]
                    return float(subprocess.run(cmd, capture_output=True, text=True).stdout.strip())
            except Exception as e:
                print(f"[WARN] OpenAI TTS fallback triggered: {e}")

        # 무중단 Fallback: OpenAI 키 누락/실패 시 7.5초 무음 MP3 트랙 자동 생성하여 렌더링 중단 원천 방지
        fallback_dur = 7.5
        subprocess.run([
            'ffmpeg', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
            '-t', str(fallback_dur), '-q:a', '9', '-acodec', 'libmp3lame', out_path
        ], capture_output=True)
        return fallback_dur

    def _render_scene(self, scene: dict) -> str:
        scene_id = scene["id"]
        audio_path = os.path.join(TEMP_DIR, f"{scene_id}_audio.mp3")
        scene_out = os.path.join(TEMP_DIR, f"{scene_id}_render.mp4")
        duration = self._generate_tts(scene["tts_text"], audio_path)
        clip_path = os.path.join(PROJECT_DIR, scene["clip"])

        def clean_text(t: str) -> str:
            return t.replace("'", "").replace(":", "\\:").replace("%", "\\%")

        badge_txt = clean_text(scene["badge"])
        sub1_txt = clean_text(scene["sub_line1"])
        sub2_txt = clean_text(scene["sub_line2"])

        if scene["is_wide"]:
            vf = (
                f"[0:v]split=2[bg][fg];"
                f"[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[blurred];"
                f"[fg]scale=1080:-1[scaled_fg];"
                f"[blurred][scaled_fg]overlay=(W-w)/2:(H-h)/2[base];"
                f"[base]drawbox=x=60:y=150:w=960:h=90:color=black@0.7:t=fill,"
                f"drawtext=fontfile='{FFMPEG_FONT}':text='{badge_txt}':fontcolor=#FFE500:fontsize=36:x=(w-text_w)/2:y=175,"
                f"drawbox=x=60:y=1380:w=960:h=180:color=black@0.8:t=fill,"
                f"drawtext=fontfile='{FFMPEG_FONT}':text='{sub1_txt}':fontcolor=#FFFFFF:fontsize=44:x=(w-text_w)/2:y=1405,"
                f"drawtext=fontfile='{FFMPEG_FONT}':text='{sub2_txt}':fontcolor=#FFE500:fontsize=34:x=(w-text_w)/2:y=1480,"
                f"fps=30,setsar=1[v_out]"
            )
        else:
            vf = (
                f"[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black[base];"
                f"[base]drawbox=x=60:y=150:w=960:h=90:color=black@0.7:t=fill,"
                f"drawtext=fontfile='{FFMPEG_FONT}':text='{badge_txt}':fontcolor=#FFE500:fontsize=36:x=(w-text_w)/2:y=175,"
                f"drawbox=x=60:y=1380:w=960:h=180:color=black@0.8:t=fill,"
                f"drawtext=fontfile='{FFMPEG_FONT}':text='{sub1_txt}':fontcolor=#FFFFFF:fontsize=44:x=(w-text_w)/2:y=1405,"
                f"drawtext=fontfile='{FFMPEG_FONT}':text='{sub2_txt}':fontcolor=#FFE500:fontsize=34:x=(w-text_w)/2:y=1480,"
                f"fps=30,setsar=1[v_out]"
            )

        cmd = [
            'ffmpeg', '-y', '-stream_loop', '-1', '-i', clip_path, '-i', audio_path,
            '-filter_complex', vf, '-map', '[v_out]', '-map', '1:a',
            '-t', str(duration), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
            '-c:a', 'aac', '-b:a', '192k', scene_out
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
        if res.returncode != 0:
            raise RuntimeError(f"Scene render error: {res.stderr[-300:]}")
        return scene_out

    def generate_daily_pump_shorts(self, date_tag: str = None) -> str:
        """일일 1초 펌프 숏폼 생성 메인 메서드"""
        if not date_tag:
            date_tag = datetime.now().strftime("%Y%m%d")

        output_name = f"Shorts_Pump_Guide_{date_tag}.mp4"
        final_output = os.path.join(OUTPUT_DIR, output_name)
        canonical_output = os.path.join(OUTPUT_DIR, "Parvogel_Clinical_Pump_Guide_Shorts.mp4")

        rendered = [self._render_scene(s) for s in SCENES]
        concat_file = os.path.join(TEMP_DIR, "scenes.txt")
        with open(concat_file, "w", encoding="utf-8") as f:
            for s in rendered:
                f.write(f"file '{s.replace(chr(92), '/')}'\n")

        subprocess.run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', concat_file, '-c', 'copy', final_output], check=True)
        # 공식 파일로도 복사
        import shutil
        shutil.copyfile(final_output, canonical_output)
        return final_output

if __name__ == '__main__':
    gen = PumpShortsGenerator()
    out = gen.generate_daily_pump_shorts()
    print("Rendered successfully:", out)
