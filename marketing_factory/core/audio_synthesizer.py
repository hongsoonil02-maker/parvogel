#!/usr/bin/env python3
"""
Audio Narrative Synthesizer — Edge-TTS 기반 전문 수의학 보이스 내레이션 및 자막 생성 엔진
- Microsoft Edge-TTS(무료, 초고음질) 신경망 음성 합성
- 기본 보이스: ko-KR-SunHiNeural (따뜻하고 신뢰감 있는 여성 보이스) / ko-KR-InJoonNeural (차분한 남성 보이스)
- VTT / SRT 자막 동시 출력으로 FFmpeg 자막 싱크 100% 일치 보장
- "몬모릴로나이트" 정식 발음 및 무결성 강제
"""

import os
import sys
import asyncio
import edge_tts
from typing import Dict, Any, Tuple, Optional

# UTF-8 출력 보장
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

VOICE_FEMALE = "ko-KR-SunHiNeural"
VOICE_MALE = "ko-KR-InJoonNeural"

class AudioNarrativeSynthesizer:
    """초고음질 신경망 TTS 및 자막 생성기"""

    def __init__(self, voice: str = VOICE_FEMALE):
        self.voice = voice

    async def _synthesize_async(self, text: str, output_audio_path: str, output_srt_path: str) -> bool:
        """Edge-TTS 비동기 실행 및 오디오/자막 동시 저장"""
        # 몬모릴로나이트 오기 교정 보장
        clean_text = text.replace("몽모릴로나이트", "몬모릴로나이트")

        communicate = edge_tts.Communicate(clean_text, self.voice, rate="+5%", pitch="+0Hz")
        submaker = edge_tts.SubMaker()

        with open(output_audio_path, "wb") as audio_file:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_file.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    submaker.feed(chunk)

        # SRT 형식 자막 생성
        srt_content = submaker.get_srt()
        with open(output_srt_path, "w", encoding="utf-8") as srt_file:
            srt_file.write(srt_content)

        return os.path.exists(output_audio_path) and os.path.getsize(output_audio_path) > 0

    def generate_narration(self, text: str, output_audio_path: str, output_srt_path: str) -> bool:
        """동기 호출 래퍼"""
        try:
            return asyncio.run(self._synthesize_async(text, output_audio_path, output_srt_path))
        except Exception as e:
            print(f"[TTS_ERROR] Edge-TTS synthesis failed: {e}")
            return False

    @staticmethod
    def extract_spoken_script(narrative: Dict[str, Any]) -> str:
        """마케팅 내러티브 JSON에서 35~45초 숏폼 전용 음성 대본 추출"""
        line1 = narrative.get("line1", "설사 혈변으로 곡기 끊겨 쓰러졌던 아이.")
        line2 = narrative.get("line2", "단 3일 만에 밥그릇을 싹싹 비워내고.")
        line3 = narrative.get("line3", "다시 건강하게 네 발로 일어섰습니다.")
        pain = narrative.get("pain_point", "아픈 아이에게 억지로 주사기를 들이대다 기도로 넘어갈까 봐 가슴이 무너집니다.")
        cta = "주사기 거부감 제로, 1초 원터치 펌프 파보겔로 우리 아이 골든타임을 지켜주세요."

        # 간결하고 전달력 높은 40초 숏폼 내레이션 구성
        script = (
            f"{line1} {line2} {line3} "
            f"하남 사랑동물병원 김동준 원장님의 실제 진료실 회복 실화입니다. "
            f"주사기 없이 입가에 대고 1초 펌프를 누르면 스스로 핥아먹습니다. "
            f"순수 천연 나노 몬모릴로나이트가 장 점막을 실크처럼 코팅하고 유해 독소를 배출합니다. "
            f"{cta}"
        )
        # 몬모릴로나이트 재확인
        return script.replace("몽모릴로나이트", "몬모릴로나이트")
