#!/usr/bin/env python3
"""
Content Enricher — 파보겔(Parvogel) 수의학·반려동물 마케팅 내러티브 AI 엔진
- 요일별 임상 증례 회전 (Day 1 응급발작 ~ Day 7 완치보행)
- OpenAI / Gemini API 및 고성능 템플릿 폴백 탑재
- B2C 보호자 공감 & B2B 수의학 특허 메커니즘 듀얼 모드 지원
"""

import os
import sys
import json
import datetime
from typing import Dict, Any, Optional

# UTF-8 출력 보장
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(FACTORY_DIR, "data")
CONFIG_DIR = os.path.join(FACTORY_DIR, "config")

# 상위 100배거 env 자동 연동 (API 키 중복 설정 불필요)
def load_all_envs():
    from dotenv import load_dotenv
    local_env = os.path.join(FACTORY_DIR, ".env")
    saas_env = r"c:\Users\master\quant_system\100_bagger_saas\.env"
    
    if os.path.exists(local_env):
        load_dotenv(local_env)
    if os.path.exists(saas_env):
        load_dotenv(saas_env)

load_all_envs()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


class ParvogelContentEnricher:
    """파보겔 마케팅 내러티브 지능형 생성기"""

    def __init__(self):
        self.clinical_data = self._load_json(os.path.join(DATA_DIR, "clinical_case_store.json"))
        self.keywords_data = self._load_json(os.path.join(DATA_DIR, "keywords_seo.json"))
        self.calendar_data = self._load_json(os.path.join(DATA_DIR, "daily_calendar.json"))
        
        self.openai_client = None
        if OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=OPENAI_API_KEY)
            except Exception as e:
                print(f"[WARN] OpenAI client init warning: {e}")

    def _load_json(self, path: str) -> Dict[str, Any]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def get_daily_theme(self, day_name: Optional[str] = None) -> Dict[str, Any]:
        """오늘 요일에 맞는 마케팅 테마 및 타겟팅 추출"""
        if not day_name:
            day_name = datetime.datetime.now().strftime("%A")
        schedule = self.calendar_data.get("schedule", {})
        return schedule.get(day_name, schedule.get("Monday", {}))

    def generate_narrative(self, day_name: Optional[str] = None) -> Dict[str, Any]:
        """AI 또는 정밀 수의학 템플릿을 통해 당일 마케팅 패키지 생성"""
        theme = self.get_daily_theme(day_name)
        today_date = datetime.datetime.now().strftime("%Y-%m-%d")
        
        # 1. OpenAI 호출 시도
        if self.openai_client:
            try:
                ai_result = self._generate_with_openai(theme)
                if ai_result:
                    ai_result["date"] = today_date
                    ai_result["source"] = "OpenAI-GPT4o"
                    return ai_result
            except Exception as e:
                print(f"[INFO] OpenAI failed, falling back to rule-based template engine: {e}")

        # 2. 고품질 룰베이스 수의학 템플릿 엔진 (100% 무오류 보장)
        return self._generate_template_narrative(theme, today_date)

    def _generate_with_openai(self, theme: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        prompt = f"""
당신은 동물용 헬스케어 최고 마케팅 디렉터이자 수의학 카피라이터입니다.
다음 파보겔(Parvo Gel) 임상 데이터와 오늘의 테마를 바탕으로 고효율 마케팅 내러티브를 JSON 형식으로 작성하세요.

[제품 팩트]:
- 제품명: 파보겔 (Parvo Gel)
- 등록: 정식등록 보조사료 (주의: "정식허가" 금지, "정식등록" 사용)
- 핵심성분: 1-deoxinojirimycin (DNJ) + Bacillus subtilis MORI (특허 제 2011B0042620.8호) + 고순도 초미세 몬모릴로나이트
- 주요특징: 1초 원터치 펌프 급여(주사기 거부견도 스트레스 제로), 장 점막 물리적 코팅 및 유해 독소 배출, 3일 만에 식욕 폭풍 완식
- 실화 임상: 하남 사랑동물병원 김동준 원장 55일령 0.6kg 토이푸들 발작 환축 7일 만에 기립 완치 퇴원
- 판매처: 네이버 스마트스토어(펫츄리), 쿠팡 로켓배송

[오늘의 테마]:
- 테마: {theme.get('headline_core')}
- 포커스 씬: {theme.get('focus_scene')}
- 영상 파일: {theme.get('video_file')}

반드시 아래 JSON 키를 갖추어 응답하세요:
{{
  "headline": "간결하고 강력한 메인 헤드라인",
  "subheadline": "보호자의 감정과 호기심을 자극하는 서브카피",
  "pain_point": "보호자가 겪는 위급한 고통과 안타까움 묘사",
  "clinical_solution": "1-deoxinojirimycin 및 특허균주의 장 점막 코팅 메커니즘",
  "video_highlight": "김동준 원장 직캠 영상 속 생생한 회복 순간 묘사",
  "cta_text": "네이버 스마트스토어 및 쿠팡 로켓배송 즉시 구매 유도 문구"
}}
"""
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional veterinary copywriter. Respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)

    def _generate_template_narrative(self, theme: Dict[str, Any], date_str: str) -> Dict[str, Any]:
        """고품질 수의학 기반 결정론적 템플릿"""
        theme_id = theme.get("theme_id", "emergency")
        scene = theme.get("focus_scene", "Day 1")
        video_file = theme.get("video_file", "parvogel_case_01_seizure.mp4")

        return {
            "date": date_str,
            "theme_id": theme_id,
            "headline": theme.get("headline_core"),
            "subheadline": "쓰러진 55일령 강아지의 기적의 7일 회복 실화 — 1초 펌프로 입안에 꿀꺽!",
            "pain_point": "급성 장염과 심한 설사로 탈진해 쓰러진 아기 강아지, 억지로 가루약을 먹이려다 거품을 물고 거부할 때 보호자의 가슴은 무너져 내립니다.",
            "clinical_solution": "파보겔은 1-deoxinojirimycin과 특허균주(Patent No. 2011B0042620.8) 복합 성분이 무너진 장 점막에 즉시 물리적 보호막을 입히고 체내 독소를 빠르게 흡착 배출합니다.",
            "video_highlight": f"하남 사랑동물병원 김동준 원장님의 실제 진료실 직캠 ({scene}): 주사기 없이 한 손으로 펌핑하여 입가에 대주자 스트레스 없이 삼키고 스스로 일어선 감동의 순간.",
            "cta_text": "골든타임을 놓치지 마세요! 네이버 스마트스토어(펫츄리) 및 쿠팡 로켓배송으로 내일 아침 즉시 받아보실 수 있습니다.",
            "video_file": video_file,
            "source": "Clinical-Verified-Template"
        }


if __name__ == "__main__":
    enricher = ParvogelContentEnricher()
    narrative = enricher.generate_narrative()
    print("[NARRATIVE GENERATED]:")
    print(json.dumps(narrative, indent=2, ensure_ascii=False))
