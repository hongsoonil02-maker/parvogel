#!/usr/bin/env python3
"""
Viral Shortform Reverse-Engineering & Funnel Engine
— 파보겔(PARVOGEL) 바이럴 숏폼 역설계 및 D2C 전환 퍼널 생성 엔진

핵심 기능:
1. 외부 바이럴 쇼츠/릴스 STT 대본 분석 및 3대 역설계 구조(후킹, 고통증폭, 해결책 전환) 분해
2. 파보겔 핵심 수의약학적 가치 매핑 -> 3가지 숏폼 대본 자동 생성
   - 버전 A (반려견 B2C 감성 공감형): 1초 펌프 & 0.6kg 아기 강아지 실화
   - 버전 B (반려견 B2C 수의학 팩트형): 지사제 장마비 위험 vs 나노 몬모릴로나이트 물리적 코팅
   - 버전 C (한우 송아지 B2Farm 손실방지형): 송아지 설사 300만원 폐사 방지 & 정성대 원장 배앓이 완화
3. 사료관리법/동물약품 법적 리스크 필터링 (compliance_rules.json 자동 치환)
4. 하이브리드 어셈블러 연동 (Option A: FFmpeg/TTS 자동 렌더링 명세 / Option B: 외주 웹훅 지시서)
5. 댓글 폭탄 -> D2C 스마트스토어/쿠팡 로켓 퍼널 트리거
"""

import os
import sys
import json
import re
from datetime import datetime
from typing import Dict, Any, List, Optional

# UTF-8 보장
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(FACTORY_DIR, "data")
CONFIG_DIR = os.path.join(FACTORY_DIR, "config")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")

os.makedirs(OUTPUT_DIR, exist_ok=True)


class ViralShortformEngine:
    """바이럴 숏폼 역설계 및 D2C 전환 퍼널 총괄 엔진"""

    def __init__(self):
        self.broll_catalog = self._load_json(os.path.join(DATA_DIR, "broll_catalog.json"))
        self.compliance_rules = self._load_json(os.path.join(CONFIG_DIR, "compliance_rules.json"))
        self.channels_config = self._load_json(os.path.join(CONFIG_DIR, "channels_config.json"))

        self.smartstore_url = self.channels_config.get(
            "smartstore_url", "https://smartstore.naver.com/petschury/products/13718496355"
        )
        self.coupang_url = self.channels_config.get(
            "coupang_url", "https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090"
        )
        self.landing_url = self.channels_config.get(
            "site_landing_url", "https://parvogel.kr/"
        )

    def _load_json(self, path: str) -> Dict[str, Any]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def sanitize_compliance(self, text: str) -> str:
        """사료관리법 위반 단정적 표현 및 의약품 오인 문구 자동 치환"""
        sanitized = text
        prohibited = self.compliance_rules.get("rules", {}).get("prohibited_terms", [])
        for item in prohibited:
            banned = item.get("banned")
            replacement = item.get("replacement")
            if banned and replacement:
                sanitized = re.sub(re.escape(banned), replacement, sanitized)
        return sanitized

    def reverse_engineer_reference(self, reference_stt: str, source_url: Optional[str] = None) -> Dict[str, Any]:
        """외부 바이럴 레퍼런스 영상 대본(STT) 역설계 분석"""
        stt_lines = [l.strip() for l in reference_stt.strip().split("\n") if l.strip()]
        total_len = len(" ".join(stt_lines))

        # 1. 3초 후킹 감지 (첫 1~2문장)
        first_segment = " ".join(stt_lines[:2]) if len(stt_lines) >= 2 else (stt_lines[0] if stt_lines else "")
        hook_type = "shock_contrast"
        if "?" in first_segment:
            hook_type = "contrarian_question"
        elif any(k in first_segment for k in ["절대", "하지마", "금지", "망합니다", "쓰러진"]):
            hook_type = "urgency_warning"

        # 2. 고통/결핍 증폭 분석
        middle_segment = " ".join(stt_lines[2:-2]) if len(stt_lines) > 4 else "결핍 및 고통 증폭 구간"

        # 3. 해결책 및 CTA 분석
        tail_segment = " ".join(stt_lines[-2:]) if len(stt_lines) >= 2 else (stt_lines[-1] if stt_lines else "")

        return {
            "source_url": source_url or "https://youtube.com/shorts/reference_sample",
            "total_char_count": total_len,
            "estimated_pacing_wpm": int(total_len / 3.2),  # 평균 한국어 발화속도 기준
            "hook_pattern": {
                "detected_hook": first_segment,
                "hook_type": hook_type,
                "viral_trigger": "초반 3초 이탈 방지 극단적 대조 및 충격 경고"
            },
            "pain_amplification_pattern": {
                "core_conflict": middle_segment[:120] + "...",
                "emotional_leverage": "보호자/농가주의 상실에 대한 극심한 공포와 죄책감 자극"
            },
            "solution_pivot_pattern": {
                "mechanism_reveal": "기존 상식(주사기 강제 급여, 단순 지사제)을 깨뜨리는 새로운 1초 솔루션 도입",
                "authority_proof": "하남 사랑동물병원 김동준 원장 / 동진동물병원 정성대 원장 임상 실사"
            },
            "cta_pattern": {
                "closing_action": tail_segment,
                "optimized_pivot": "댓글 유도(선착순/무료 가이드북) -> D2C 링크 퍼널 직결"
            }
        }

    def generate_shortform_scripts(self, reverse_meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        파보겔 3가지 타깃별 30~50초 숏폼 대본 생성
        - version_a: 반려견 B2C [응급 보호자 공감형]
        - version_b: 반려견 B2C [수의학 팩트/기전형]
        - version_c: 한우/송아지 B2Farm [농가 손실방지/배앓이 완화형]
        """

        # VERSION A: 반려견 [응급 보호자 공감형]
        raw_script_a = {
            "version_id": "VERSION_A_DOG_EMPATHY",
            "target": "반려견 초보 보호자 / 2~3개월령 아기 강아지 견주 (B2C)",
            "title": "🚨 쓰러진 아기 강아지에게 절대 주사기 물리지 마세요 (7일의 기적)",
            "running_time_sec": 42,
            "scenes": [
                {
                    "scene_no": 1,
                    "timecode": "00:00 - 00:04",
                    "broll_id": "BROLL_01",
                    "visual_cue": "0.6kg 아기 푸들이 옆으로 쓰러져 경련하는 위급 상황 (화면 깜빡임 + 긴급 경보음)",
                    "caption": "쓰러진 강아지에게 주사기 억지로 물리지 마세요!",
                    "narration": "급성 장염으로 쓰러진 0.6kg 아기 강아지, 제발 주사기 억지로 쑤셔 넣지 마세요!",
                    "bgm_sound": "🚨 긴급 알람 + 무거운 심장박동 사운드"
                },
                {
                    "scene_no": 2,
                    "timecode": "00:04 - 00:12",
                    "broll_id": "BROLL_02",
                    "visual_cue": "입원장 패드 위에 축 늘어져 물도 못 넘기는 환축 클로즈업",
                    "caption": "억지 주사기 급여 = 기도 질식과 극심한 쇼크 유발",
                    "narration": "가루약 타서 주사기로 억지로 쏘면, 기도로 넘어가 폐렴이 오거나 쇼크로 골든타임을 영영 놓칩니다.",
                    "bgm_sound": "낮은 피아노 단음"
                },
                {
                    "scene_no": 3,
                    "timecode": "00:12 - 00:22",
                    "broll_id": "BROLL_09",
                    "visual_cue": "파보겔 펌프 바틀을 입가에 대고 가볍게 1초 펌핑 -> 핥아먹는 모습",
                    "caption": "주사기 바늘 0%! 입가에 대고 1초 펌프 누르면 끝",
                    "narration": "이럴 땐 주사기 없이 입가에 대고 1초만 펌핑하세요. 나노 몬모릴로나이트가 짓무른 장 점막을 실크처럼 즉각 코팅해 유해 독소를 싹 잡아 배출합니다.",
                    "bgm_sound": "스위치 전환음 + 희망찬 스트링 시작"
                },
                {
                    "scene_no": 4,
                    "timecode": "00:22 - 00:33",
                    "broll_id": "BROLL_05",
                    "visual_cue": "3일 만에 밥그릇에 코를 박고 캔사료를 폭풍 완식하는 반전 먹방",
                    "caption": "단 3일 만에 곡기 끊겼던 아이의 기적의 폭풍 완식!",
                    "narration": "물 한 모금 못 넘기던 아이가 단 3일 만에 밥그릇까지 싹싹 핥아먹더니, 7일 만에 네 발로 씩씩하게 일어났습니다.",
                    "bgm_sound": "경쾌하고 따뜻한 어쿠스틱 리듬"
                },
                {
                    "scene_no": 5,
                    "timecode": "00:33 - 00:42",
                    "broll_id": "BROLL_20",
                    "visual_cue": "파보겔 실물 + 댓글창 애니메이션 강조 + 가이드북 표지 그래픽",
                    "caption": "댓글로 '파보' 남겨주시면 [1초 골든타임 대처 가이드북] 즉시 발송!",
                    "narration": "지금 댓글로 '파보'라고 남겨주시면, 수의사가 검증한 [1초 골든타임 응급 대처 가이드북]을 DM으로 즉시 보내드립니다!",
                    "bgm_sound": "팝업 알림 차임벨"
                }
            ],
            "trigger_keyword": "파보",
            "auto_reply_lead_magnet": "[파보겔 1초 골든타임 응급 대처 가이드북 PDF] 다운로드 링크: https://parvogel.kr/guidebook-puppy",
            "pinned_comment": "🚨 55일령 아기 강아지 7일 임상 풀버전 직캠은 프로필 링크에서 확인하세요! \n🛒 쿠팡 로켓배송: https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090&utm_source=shorts_a\n🟢 네이버 공식 스마트스토어: https://smartstore.naver.com/petschury/products/13718496355?utm_source=shorts_a\n🎁 댓글로 '파보'를 남기시면 [응급 가이드북]을 즉시 보내드립니다."
        }

        # VERSION B: 반려견 [수의학 팩트/기전형]
        raw_script_b = {
            "version_id": "VERSION_B_DOG_MECHANISM",
            "target": "원인 분석형 스마트 보호자 & 다견 가정 (B2C/B2B)",
            "title": "🔬 단순 지사제를 먹이면 장이 더 망가지는 충격적인 이유",
            "running_time_sec": 45,
            "scenes": [
                {
                    "scene_no": 1,
                    "timecode": "00:00 - 00:04",
                    "broll_id": "BROLL_18",
                    "visual_cue": "장 융모 손상 3D 그래픽 + 빨간 X 표시",
                    "caption": "설사한다고 단순 지사제 먹이면 장이 썩어 들어갑니다",
                    "narration": "강아지 설사한다고 시중 지사제부터 먹이면, 장내 독소가 밖으로 못 빠져나가 장이 마비될 수 있습니다.",
                    "bgm_sound": "⚠️ 경고 비프음"
                },
                {
                    "scene_no": 2,
                    "timecode": "00:04 - 00:14",
                    "broll_id": "BROLL_11",
                    "visual_cue": "하남 사랑동물병원 김동준 원장 진료실 인터뷰",
                    "caption": "장 운동 마비 NO! 독소만 자석처럼 흡착 배출해야",
                    "narration": "설사의 본질은 장 점막 붕괴와 바이러스 독소입니다. 억지로 장을 멈추는 게 아니라, 점막을 덮고 독소만 자석처럼 끌어당겨 빼내야 합니다.",
                    "bgm_sound": "진중한 다큐멘터리 브금"
                },
                {
                    "scene_no": 3,
                    "timecode": "00:14 - 00:26",
                    "broll_id": "BROLL_10",
                    "visual_cue": "초미세 나노 몬모릴로나이트 겔 텍스처 초근접 + 실크 코팅 메커니즘",
                    "caption": "초미세 몬모릴로나이트의 장 점막 실크 코팅 + 1-DNJ 결합 차단",
                    "narration": "파보겔의 초미세 나노 몬모릴로나이트는 비흡수성 천연 미네랄로 간과 신장 부담 없이 장벽에 실크 보호막을 칩니다. 특허받은 1-DNJ가 바이러스 증식을 방어하죠.",
                    "bgm_sound": "신뢰감 있는 테크 사운드"
                },
                {
                    "scene_no": 4,
                    "timecode": "00:26 - 00:36",
                    "broll_id": "BROLL_07",
                    "visual_cue": "진료대 위에서 씩씩하게 걸어 다니며 꼬리 치는 완치 퇴원 모습",
                    "caption": "수액·약물 없이 오직 물리적 점막 코팅만으로 회복!",
                    "narration": "실제 동물병원 임상에서도 수액을 배제하고 단독 급여하여 전신 경련 환축을 7일 만에 정상 퇴원시켰습니다.",
                    "bgm_sound": "승리의 브라스 코드"
                },
                {
                    "scene_no": 5,
                    "timecode": "00:36 - 00:45",
                    "broll_id": "BROLL_20",
                    "visual_cue": "파보겔 바틀 + 하단 댓글 키워드 '골든타임'",
                    "caption": "댓글로 '골든타임' 남겨주시면 [장 점막 재생 매뉴얼] 무료 전송!",
                    "narration": "우리 아이 장 점막을 살리는 법, 댓글에 '골든타임'이라고 적어주시면 수의학 메커니즘 리포트를 즉시 보내드립니다.",
                    "bgm_sound": "징글 엔딩"
                }
            ],
            "trigger_keyword": "골든타임",
            "auto_reply_lead_magnet": "[수의사 공인 장 점막 재생 & 탈수 극복 리포트] 다운로드 링크: https://parvogel.kr/report-mechanism",
            "pinned_comment": "🔬 나노 몬모릴로나이트 MOA 및 동물병원 임상 논문 요약집 무료 배포 중! \n🟢 네이버 공식 스마트스토어(정품): https://smartstore.naver.com/petschury/products/13718496355?utm_source=shorts_b\n🚀 쿠팡 당일 로켓: https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090&utm_source=shorts_b\n💬 댓글로 '골든타임'을 남겨주시면 전문 리포트를 즉시 보내드립니다."
        }

        # VERSION C: 한우/송아지 [농가 손실방지/배앓이형]
        raw_script_c = {
            "version_id": "VERSION_C_CALF_FARM",
            "target": "전국 한우 번식우 농가 & 낙농 농가 대표님 (B2Farm)",
            "title": "🐄 신생 송아지 설사 한 번에 300만원 날릴 뻔했던 한우 농가 실화",
            "running_time_sec": 48,
            "scenes": [
                {
                    "scene_no": 1,
                    "timecode": "00:00 - 00:05",
                    "broll_id": "BROLL_14",
                    "visual_cue": "우사 바닥에 주저앉아 배앓이로 신음하는 갓 태어난 송아지 샷",
                    "caption": "신생 송아지 흰똥·물설사, 하루 만에 300만원 날아갑니다!",
                    "narration": "갓 태어난 송아지가 흰똥 싸고 젖 못 빨고 주저앉으면, 하루 만에 300만 원짜리 밑소 날아가는 거 순식간입니다.",
                    "bgm_sound": "🚨 둔탁한 경고 드럼비트"
                },
                {
                    "scene_no": 2,
                    "timecode": "00:05 - 00:15",
                    "broll_id": "BROLL_17",
                    "visual_cue": "동진동물병원 정성대 원장 통화/임상 차트 그래픽",
                    "caption": "주사기 거부하는 송아지, 위산 산도 망가지면 폐사 직행",
                    "narration": "억지로 쓴 가루약 먹이려다 송아지 스트레스받고 토하면 끝입니다. 송아지 설사는 위산 산도가 깨지고 배앓이가 심해서 젖을 못 빠는 겁니다.",
                    "bgm_sound": "현장감 있는 우사 배경음"
                },
                {
                    "scene_no": 3,
                    "timecode": "00:15 - 00:27",
                    "broll_id": "BROLL_15",
                    "visual_cue": "바쁜 농가주가 우사에서 송아지 입안에 파보겔 1초 펌프 직투여",
                    "caption": "우수한 기호성! 입가에 1초 펌핑하면 꿀꺽!",
                    "narration": "동진동물병원 정성대 원장님이 검증한 비결! 1초 펌프로 입안에 쓱 쏴주면, 기호성이 좋아 꿀꺽 삼키고 즉각 위내 산도를 잡아 배앓이가 싹 가라앉습니다.",
                    "bgm_sound": "기운차고 묵직한 베이스 전개"
                },
                {
                    "scene_no": 4,
                    "timecode": "00:27 - 00:38",
                    "broll_id": "BROLL_16",
                    "visual_cue": "다음 날 아침 벌떡 일어나 어미소 젖을 힘차게 빠는 송아지",
                    "caption": "다음 날 아침! 벌떡 일어나 어미 젖을 힘차게 빱니다",
                    "narration": "실제 한우 농가에서 투여하자마자 구토가 멎고 배앓이가 풀리더니, 다음 날 아침 벌떡 일어나 젖을 힘차게 빨았습니다.",
                    "bgm_sound": "활기찬 통기타 리듬"
                },
                {
                    "scene_no": 5,
                    "timecode": "00:38 - 00:48",
                    "broll_id": "BROLL_20",
                    "visual_cue": "파보겔 대용량 패키지 + 댓글 키워드 '송아지' 자막",
                    "caption": "댓글로 '송아지' 남기시면 [송아지 설사 폐사율 0% 현장 매뉴얼] 즉시 발송!",
                    "narration": "설사철 폐사 없는 번식우 우사 관리법, 지금 댓글로 '송아지'라고 남겨주시면 현장 응급 처치 매뉴얼을 무료로 보내드립니다!",
                    "bgm_sound": "도입부 징글"
                }
            ],
            "trigger_keyword": "송아지",
            "auto_reply_lead_magnet": "[전국 한우 번식우 농가 필수: 신생 송아지 설사 폐사율 0% 현장 매뉴얼] 무료 다운로드: https://parvogel.kr/farm-manual",
            "pinned_comment": "🐄 전국 한우·낙농 농가 현장 검증! 송아지 배앓이 완화 & 위내 산도 안정 보조사료 [파보겔] \n🟢 한국아그로 공식 네이버 스마트스토어: https://smartstore.naver.com/petschury/products/13718496355?utm_source=shorts_calf\n🏢 산업동물 대량 납품 및 대리점 문의: 전국 엠오바이오(MOBIO) 총판 연계\n💬 댓글로 '송아지'를 남기시면 [현장 폐사 방지 매뉴얼 PDF]를 즉시 보내드립니다."
        }

        # 규정 준수 필터링 일괄 적용
        scripts = [raw_script_a, raw_script_b, raw_script_c]
        sanitized_scripts = []
        for s in scripts:
            dumped = json.dumps(s, ensure_ascii=False)
            clean_str = self.sanitize_compliance(dumped)
            clean_obj = json.loads(clean_str)
            sanitized_scripts.append(clean_obj)

        return {
            "version_a": sanitized_scripts[0],
            "version_b": sanitized_scripts[1],
            "version_c": sanitized_scripts[2]
        }

    def build_option_a_render_blueprint(self, script_obj: Dict[str, Any]) -> Dict[str, Any]:
        """
        옵션 A (자동 렌더링): FFmpeg + AI TTS + 동적 자막 조립 청사진
        """
        timeline = []
        full_narration = []
        srt_subtitles = []

        for idx, scene in enumerate(script_obj.get("scenes", []), 1):
            broll_id = scene.get("broll_id")
            clip_meta = next((c for c in self.broll_catalog.get("clips", []) if c["id"] == broll_id), {})
            file_path = clip_meta.get("file", "public/assets/parvogel_case_01_seizure.mp4")
            
            narration = scene.get("narration", "")
            full_narration.append(narration)
            
            timeline.append({
                "scene_index": idx,
                "timecode": scene.get("timecode"),
                "broll_id": broll_id,
                "source_file": file_path,
                "duration_sec": clip_meta.get("duration_sec", 4.0),
                "visual_cue": scene.get("visual_cue"),
                "caption_text": scene.get("caption"),
                "narration_text": narration,
                "ffmpeg_filter_snippet": f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,drawbox=y=1600:w=1080:h=280:color=black@0.85:t=fill"
            })

            srt_subtitles.append(f"{idx}\n00:{scene.get('timecode').replace(' - ', ',000 --> 00:')},000\n{scene.get('caption')}\n")

        return {
            "mode": "OPTION_A_AUTO_RENDER",
            "version_id": script_obj.get("version_id"),
            "resolution": "1080x1920 (9:16)",
            "tts_spec": {
                "engine": "OpenAI TTS or Edge-TTS",
                "voice_ko": "ko-KR-SunHiNeural (자연스럽고 긴박한 톤) or alloy",
                "speed": 1.15
            },
            "timeline": timeline,
            "full_narration_script": " ".join(full_narration),
            "generated_srt": "\n".join(srt_subtitles)
        }

    def build_option_b_outsource_payload(self, script_obj: Dict[str, Any]) -> Dict[str, Any]:
        """
        옵션 B (초저가 외주 훅): 구글 시트 / 노션 웹훅 등록용 작업 지시서 페이로드
        편당 1~2만 원대 편집자에게 즉시 전달할 수 있는 세부 가이드
        """
        scenes_markdown = []
        for s in script_obj.get("scenes", []):
            broll_id = s.get("broll_id")
            clip_meta = next((c for c in self.broll_catalog.get("clips", []) if c["id"] == broll_id), {})
            scenes_markdown.append(
                f"- **[{s.get('timecode')}] 씬 {s.get('scene_no')}** ({broll_id})\n"
                f"  * 🎬 화면: {s.get('visual_cue')}\n"
                f"  * 📁 원본 파일 경로: `{clip_meta.get('file', 'N/A')}`\n"
                f"  * 💬 화면 자막: **{s.get('caption')}** (폰트: 프리텐다드 Bold, 노랑/흰색 강조)\n"
                f"  * 🎙️ 내레이션(TTS/녹음): \"{s.get('narration')}\"\n"
                f"  * 🎵 효과음/BGM: {s.get('bgm_sound')}"
            )

        instructions = f"""# 🎬 [외주 작업 지시서] 파보겔 숏폼 편집 ({script_obj.get('title')})
- **의뢰 단가**: 편당 15,000원 ~ 20,000원
- **규격**: 세로 9:16 (1080 x 1920), 60fps
- **목표 시간**: {script_obj.get('running_time_sec')}초 내외
- **핵심 요구사항**:
  1. 초반 3초에 이탈하지 않도록 텍스트 강조 애니메이션 및 깜빡임 효과 적용
  2. 주사기 거부 화면과 1초 펌프 급여 화면의 명확한 대비(Before vs After) 연출
  3. 마지막 5초에 댓글 유도 키워드 ('{script_obj.get('trigger_keyword')}') 박스 팝업 강조
- **씬별 세부 가이드**:
{chr(10).join(scenes_markdown)}

- **영상 업로드 시 고정 댓글 복사본**:
{script_obj.get('pinned_comment')}
"""
        return {
            "mode": "OPTION_B_OUTSOURCE_WEBHOOK",
            "target_system": ["Google_Sheets", "Notion_Database"],
            "unit_price_krw": 15000,
            "title": script_obj.get("title"),
            "trigger_keyword": script_obj.get("trigger_keyword"),
            "work_order_markdown": instructions
        }

    def generate_full_package(self, reference_stt: str, source_url: Optional[str] = None) -> Dict[str, Any]:
        """역설계부터 3종 대본 및 옵션 A/B 어셈블러 페이로드까지 전 과정 일괄 처리"""
        reverse_meta = self.reverse_engineer_reference(reference_stt, source_url)
        scripts = self.generate_shortform_scripts(reverse_meta)

        return {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "reverse_analysis": reverse_meta,
            "scripts": scripts,
            "assembler_payloads": {
                "version_a": {
                    "option_a_render": self.build_option_a_render_blueprint(scripts["version_a"]),
                    "option_b_outsource": self.build_option_b_outsource_payload(scripts["version_a"])
                },
                "version_b": {
                    "option_a_render": self.build_option_a_render_blueprint(scripts["version_b"]),
                    "option_b_outsource": self.build_option_b_outsource_payload(scripts["version_b"])
                },
                "version_c": {
                    "option_a_render": self.build_option_a_render_blueprint(scripts["version_c"]),
                    "option_b_outsource": self.build_option_b_outsource_payload(scripts["version_c"])
                }
            }
        }


if __name__ == "__main__":
    engine = ViralShortformEngine()
    sample_stt = """
    절대 강아지에게 가루약을 물에 타서 주사기로 먹이지 마세요!
    제가 이거 몰라서 우리 아이 질식할 뻔하고 응급실 달려갔습니다.
    많은 분들이 약 먹일 때 억지로 입 벌려서 주사기 쏘시는데 그러면 기도로 넘어가서 폐렴 옵니다.
    그 대신 이 1초 펌프를 입술 옆에 대고 쓱 눌러주면 거부감 없이 핥아먹습니다.
    저희 아이도 이거 먹고 3일 만에 밥그릇 싹 비웠습니다.
    지금 댓글로 '파보' 남겨주시면 동물병원 응급 대처법 가이드북 무료로 보내드립니다.
    """
    res = engine.generate_full_package(sample_stt, "https://youtube.com/shorts/sample_viral_123")
    out_file = os.path.join(OUTPUT_DIR, "viral_shortform_package_sample.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2, ensure_ascii=False)
    print(f"✅ Generated viral shortform package successfully: {out_file}")
