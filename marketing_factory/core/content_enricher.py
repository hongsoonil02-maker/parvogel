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
    
    if os.path.exists(local_env):
        load_dotenv(local_env)

load_all_envs()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_MAX_DAILY_COST_USD = float(os.getenv("OPENAI_MAX_DAILY_COST", "2.0"))
DAILY_COST_TRACK = os.path.join(DATA_DIR, "daily_cost.json")


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
        """오늘 요일에 맞는 마케팅 테마 및 타겟팅 추출 (격주/주기적 앵무새·조류 테마 자동 회전)"""
        now = datetime.datetime.now()
        if not day_name:
            day_name = now.strftime("%A")
            # 2주에 1번(짝수 주 화요일) 조류·앵무새 스페셜 테마 자동 분기
            iso_week = now.isocalendar()[1]
            if day_name == "Tuesday" and (iso_week % 2 == 0):
                schedule = self.calendar_data.get("schedule", {})
                if "biweekly_bird" in schedule:
                    return schedule["biweekly_bird"]

        schedule = self.calendar_data.get("schedule", {})
        if day_name in ["bird", "parrot", "biweekly_bird"]:
            return schedule.get("biweekly_bird", schedule.get("Monday", {}))
        return schedule.get(day_name, schedule.get("Monday", {}))

    def _check_cost_guard(self) -> bool:
        """일일 비용 가드 — 초과 시 AI 호출 차단 후 템플릿 강제"""
        try:
            if os.path.exists(DAILY_COST_TRACK):
                with open(DAILY_COST_TRACK, "r", encoding="utf-8") as f:
                    data = json.load(f)
                today = datetime.datetime.now().strftime("%Y-%m-%d")
                if data.get("date") == today and data.get("usd", 0) >= OPENAI_MAX_DAILY_COST_USD:
                    print(f"[COST_GUARD] Daily limit ${OPENAI_MAX_DAILY_COST_USD} reached, forcing template.")
                    return False
        except Exception:
            pass
        return True

    def _add_cost(self, usd: float):
        try:
            today = datetime.datetime.now().strftime("%Y-%m-%d")
            data = {"date": today, "usd": usd}
            if os.path.exists(DAILY_COST_TRACK):
                with open(DAILY_COST_TRACK, "r", encoding="utf-8") as f:
                    prev = json.load(f)
                if prev.get("date") == today:
                    data["usd"] = prev.get("usd", 0) + usd
            with open(DAILY_COST_TRACK, "w", encoding="utf-8") as f:
                json.dump(data, f)
        except Exception:
            pass

    BANNED_PHRASES = ["정식허가", "치료제", "완치 보장", "100% 치료", "부작용 없음", "몽모릴로나이트"]
    REPLACEMENTS = {"정식허가": "정식등록", "치료제": "보조사료", "완치 보장": "완화에 도움을 줄 수 있음", "100% 치료": "증상 완화에 도움", "부작용 없음": "수의사 상담 권장", "몽모릴로나이트": "몬모릴로나이트"}

    def _sanitize_narrative(self, d: Dict[str, Any]) -> Dict[str, Any]:
        txt = json.dumps(d, ensure_ascii=False)
        for banned, repl in self.REPLACEMENTS.items():
            txt = txt.replace(banned, repl)
        return json.loads(txt)

    def generate_narrative(self, day_name: Optional[str] = None) -> Dict[str, Any]:
        """AI 또는 정밀 수의학 템플릿을 통해 당일 마케팅 패키지 생성 — OpenAI→Gemini→템플릿 3단 폴백"""
        theme = self.get_daily_theme(day_name)
        today_date = datetime.datetime.now().strftime("%Y-%m-%d")
        
        # 1. OpenAI (비용 가드 통과 시)
        narrative_out = None
        if self.openai_client and self._check_cost_guard():
            try:
                ai_result = self._generate_with_openai(theme)
                if ai_result:
                    ai_result["date"] = today_date
                    ai_result["source"] = "OpenAI-GPT4o"
                    self._add_cost(0.02)
                    narrative_out = ai_result
            except Exception as e:
                print(f"[INFO] OpenAI failed, trying Gemini: {e}")

        # 1b. Gemini 2차 폴백
        if not narrative_out and GEMINI_API_KEY:
            try:
                g_result = self._generate_with_gemini(theme)
                if g_result:
                    g_result["date"] = today_date
                    g_result["source"] = "Gemini-1.5"
                    narrative_out = g_result
            except Exception as e:
                print(f"[INFO] Gemini failed, falling back to template: {e}")

        # 2. 고품질 룰베이스 수의학 템플릿 엔진 (100% 무오류 보장)
        if not narrative_out:
            narrative_out = self._generate_template_narrative(theme, today_date)

        # 요일별 GEO 검색 키워드 및 토픽 자동 바인딩 보장
        narrative_out["geo_keyword"] = theme.get("geo_keyword", "강아지 파보 장염 초기증상")
        narrative_out["geo_topic"] = theme.get("geo_topic", "3개월령 강아지 급성 설사 대처 및 파보겔을 활용한 장 점막 보호 관리")
        narrative_out["sub_keywords"] = theme.get("sub_keywords", ["강아지 설사", "파보겔", "몬모릴로나이트"])
        narrative_out["search_intent"] = theme.get("search_intent", "급성 설사 대처 및 장 점막 보호")

        return self._sanitize_narrative(narrative_out)

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

[학술 문헌 및 특허 데이터베이스 (E-E-A-T 신뢰도 강화)]:
1. 고순도 나노 몬모릴로나이트: 800m²/g 이상 비표면적 기반 병원성 세균 엔도톡신(LPS) 및 바이러스 물리적 흡착 배출 (Veterinary Microbiology 2021)
2. 1-DNJ (1-deoxynojirimycin): 바이러스 외피 당단백질 합성 차단 및 상피세포 수용체 결합 저해 (Journal of Antiviral Research)
3. 특허균주 Bacillus subtilis MORI (대한민국 특허 제 2011B0042620.8호): 장관 내 미생물총 정상화 및 설사 점도 안정화
4. 절대 표기 원칙: "몬모릴로나이트" (몽모릴로나이트 절대 금지)

[문체 가이드라인 (AI 티 제거 & Humanizer)]:
- 번역투("~에 대해 알아보겠습니다", "~의 경우", "~라고 할 수 있습니다") 절대 금지.
- 실제 동물병원 테크니션 또는 가슴을 졸이던 반려견 보호자의 진솔하고 절박한 육성 호흡으로 서술.

[오늘의 테마]:
- 테마: {theme.get('headline_core')}
- 포커스 씬: {theme.get('focus_scene')}
- 영상 파일: {theme.get('video_file')}

반드시 아래 JSON 키를 갖추어 응답하세요:
{{
  "headline": "간결하고 강력한 메인 헤드라인",
  "subheadline": "보호자의 감정과 호기심을 자극하는 서브카피",
  "pain_point": "보호자가 겪는 위급한 고통과 안타까움 묘사",
  "clinical_solution": "1-DNJ 및 특허균주, 초미세 몬모릴로나이트의 학술적 장 점막 코팅 메커니즘",
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

    def _generate_with_gemini(self, theme: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        import requests
        prompt = f"""당신은 수의학 카피라이터. 파보겔(정식등록 보조사료) 오늘 테마 {theme.get('headline_core')}에 대해 JSON headline/subheadline/pain_point/clinical_solution/video_highlight/cta_text 6키를 작성. 보조사료는 치료 대체 불가."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseMimeType": "application/json"}}
        r = requests.post(url, json=body, timeout=12)
        if r.status_code == 200:
            try:
                txt = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(txt)
            except Exception:
                return None
        return None

    def _generate_template_narrative(self, theme: Dict[str, Any], date_str: str) -> Dict[str, Any]:
        """고품질 수의학 기반 결정론적 템플릿 (랜딩 4대 메인 카피 3줄 완벽 연동)"""
        theme_id = theme.get("theme_id", "emergency")
        scene = theme.get("focus_scene", "Day 1")
        video_file = theme.get("video_file", "parvogel_case_01_seizure.mp4")
        badge = theme.get("badge", "✨ 7일간의 기적 임상 실화")
        l1 = theme.get("headline_line1", "설사·혈변으로 곡기 끊겨 쓰러졌던 아이")
        l2 = theme.get("headline_line2", "단 3일 만에 밥그릇 싹싹 비워내고")
        l3 = theme.get("headline_line3", "다시 건강하게 네 발로 서서 꼬리 칩니다")

        if theme_id == "bird_parrot_special":
            out = {
                "date": date_str,
                "theme_id": theme_id,
                "badge": badge,
                "line1": l1,
                "line2": l2,
                "line3": l3,
                "headline": theme.get("headline_core", f"{l1}, {l2} {l3}"),
                "subheadline": f"{badge} — 체구가 여린 새·앵무새를 위한 부리 끝 1방울 응급 솔루션!",
                "pain_point": "새는 신진대사가 극도로 빠르고 장이 짧아, 급성 물설사가 시작되면 단 24~48시간 만에 탈수로 '낙조(폐사)' 위험에 처합니다. 가루약이나 알약을 억지로 먹이다 기도로 넘어가 질식할 위험에 밤새 애가 타는 조류 집사의 마음을 깊이 공감합니다.",
                "clinical_solution": "파보겔 홍효선 대표 반려조 '꼬미' 실제 회복 입증: 순수 천연 나노 몬모릴로나이트의 비흡수성 물리적 메커니즘으로 간·신장 부담 없이 여린 조류 장 점막을 실크 코팅하고 사료 곰팡이 독소와 병원성 유해균을 즉각 흡착 배출합니다. *보조사료는 질병 치료를 대체하지 않습니다.",
                "video_highlight": "홍효선 대표가 직접 제작한 앵무새 꼬미 24시간 배변 정상화 직캠 쇼츠: 부리 끝 1방울 급여 후 물기만 번지던 수양성 변에서 단단한 알맹이와 정상 요산이 분리되어 배변하는 리얼 검증 데이터.",
                "cta_text": "소중한 반려조를 위한 24시간 비상 상비약! 네이버 스마트스토어 및 쿠팡 로켓배송으로 즉시 구비해 두세요.",
                "video_file": video_file,
                "source": "Bird-Parrot-Clinical-Template"
            }
            return self._sanitize_narrative(out)

        if theme_id == "cat_stress_free_2040":
            out = {
                "date": date_str,
                "theme_id": theme_id,
                "badge": badge,
                "line1": l1,
                "line2": l2,
                "line3": l3,
                "headline": theme.get("headline_core", f"{l1}, {l2} {l3}"),
                "subheadline": f"{badge} — 가루약 거품 물고 숨는 고양이도 입가에 1초 톡 짜주면 스스로 핥아먹어요!",
                "pain_point": "예민한 고양이가 사료 교체나 스트레스로 무른 변·설사를 하거나 헤어볼 구토를 반복할 때, 피딩 주사기로 억지로 약을 먹이려다 할퀴고 침 흘리며 온 집안이 전쟁터가 된 경험 있으신가요?",
                "clinical_solution": "체내 흡수 0% 고순도 나노 몬모릴로나이트(표면적 800m²/g 이상)가 쓰라린 위산(pH 2.0)을 pH 4.5~5.5로 부드럽게 완충해 구토 후 속쓰림을 달래주고, 장내 독소만 자석처럼 포획해 변으로 안전하게 배출합니다. 간과 신장에 부담이 전혀 없습니다. *보조사료는 질병 치료를 대체하지 않습니다.",
                "video_highlight": "주사기나 바늘 없이 오일펌프 노즐을 입가에 살짝 대고 1초 톡 짜주면 고양이와 소형견이 간식처럼 냠냠 핥아먹는 스트레스 제로 급여 직캠.",
                "cta_text": "다묘 가정·초보 집사 필수 상비약 파보겔! 쿠팡 로켓배송 및 네이버 스마트스토어에서 오늘 바로 준비하세요.",
                "video_file": video_file,
                "source": "Cat-2040-D2C-Template"
            }
            return self._sanitize_narrative(out)

        if theme_id == "petshop_breeder_b2b":
            out = {
                "date": date_str,
                "theme_id": theme_id,
                "badge": badge,
                "line1": l1,
                "line2": l2,
                "line3": l3,
                "headline": theme.get("headline_core", f"{l1}, {l2} {l3}"),
                "subheadline": f"{badge} — 전국 인허가 펫샵·전문 브리더(켄넬) 사장님께 파보겔 본품 1병 무료 샘플을 보내드립니다!",
                "pain_point": "생후 30~60일령 자견·자묘는 이유식 전환이나 분양 직후 낯선 환경 스트레스만으로도 급성 물설사와 장염이 쉽게 발생해 분양샵과 브리더 현장의 가장 큰 고민거리가 됩니다.",
                "clinical_solution": "파보겔은 1-deoxinojirimycin(DNJ)과 특허균주(Patent No. 2011B0042620.8), 초미세 나노 몬모릴로나이트 복합 포뮬러로 어린 동물의 여린 장 점막을 즉시 코팅하고 변 상태를 빠르게 안정화합니다. 인허가 펫샵·브리더 사업자님께는 전용 도매 특가와 매장용 POP 보드판을 100% 무상 지원합니다. *보조사료는 질병 치료를 대체하지 않습니다.",
                "video_highlight": "하남 사랑동물병원 김동준 원장님의 55일령 0.6kg 아기 푸들 7일 회복 다큐멘터리 & 원터치 1초 펌프 급여 시연.",
                "cta_text": "전국 펫샵·브리더 사장님! 지금 공식 홈페이지 파트너 라운지(parvogel.kr/?sample=petshop)에서 본품 1병 무료 샘플과 도매 단가표를 신청하세요.",
                "video_file": video_file,
                "source": "Petshop-Breeder-B2B-Template"
            }
            return self._sanitize_narrative(out)

        if theme_id == "home_first_aid_kit":
            out = {
                "date": date_str,
                "theme_id": theme_id,
                "badge": badge,
                "line1": l1,
                "line2": l2,
                "line3": l3,
                "headline": theme.get("headline_core", f"{l1}, {l2} {l3}"),
                "subheadline": f"{badge} — 새벽 응급실 달려가기 전, 서랍에서 꺼내 1초 만에 급여하는 우리 집 첫 상비약!",
                "pain_point": "동물병원이 모두 문을 닫은 일요일 밤이나 새벽 2시, 아이가 갑자기 노란 위산 토를 하고 물설사를 쏟아낼 때 24시 야간 응급실 기본 처치비 30~50만 원과 이동 스트레스 앞에서 보호자는 발만 동동 구르게 됩니다.",
                "clinical_solution": "냉장 보관 필요 없이 거실 서랍 속에 실온 18개월 보관 가능한 파보겔(100ml 18,000원)을 상비해 두세요. 경상국립대 수의대 연구진 데이터로 검증된 98.5% 독소 흡착력과 pH 4.5~5.5 위산 완충 보호막이 병원 진료 전후 응급 골든타임을 든든하게 지켜줍니다. *보조사료는 질병 치료를 대체하지 않습니다.",
                "video_highlight": f"하남 사랑동물병원 김동준 원장님의 7일 회복 직캠 ({scene}): 급성 장 트러블로 쓰러졌던 아기 강아지가 파보겔 급여 후 활력을 되찾고 네 발로 퇴원하는 과정.",
                "cta_text": "아프기 전에 미리 구비하는 우리 집 상비약 1순위! 쿠팡 로켓배송·네이버 스마트스토어에서 바로 만나보세요.",
                "video_file": video_file,
                "source": "Home-FirstAid-2040-Template"
            }
            return self._sanitize_narrative(out)

        out = {
            "date": date_str,
            "theme_id": theme_id,
            "badge": badge,
            "line1": l1,
            "line2": l2,
            "line3": l3,
            "headline": theme.get("headline_core", f"{l1}, {l2} {l3}"),
            "subheadline": f"{badge} — 주사기 스트레스 없이 입에 대고 1초 톡! 간식처럼 냠냠 핥아먹어요",
            "pain_point": "갑작스러운 구토와 설사로 기력이 빠진 아이에게 쓴 가루약을 물에 타서 주사기로 억지로 먹이다 거품을 물고 토해낼 때 집사님의 마음은 무너져 내립니다.",
            "clinical_solution": "하남 사랑동물병원 김동준 원장 관찰 케이스: 1-deoxinojirimycin 및 특허균주(Patent No. 2011B0042620.8), 체내 흡수 0% 고순도 나노 몬모릴로나이트가 여린 장 점막을 물리적으로 코팅하고 유해 독소만 자석처럼 흡착 배출합니다. *보조사료는 질병 치료를 대체하지 않습니다.",
            "video_highlight": f"하남 사랑동물병원 김동준 원장님의 실제 진료실 직캠 ({scene}): 주사기 없이 한 손으로 펌핑하여 입가에 대주자 스트레스 없이 핥아먹고 3일 만에 밥그릇을 비운 감동의 순간.",
            "cta_text": "우리 아이 장 케어 골든타임! 네이버 스마트스토어(펫츄리) 및 쿠팡 로켓배송으로 내일 아침 즉시 받아보실 수 있습니다.",
            "video_file": video_file,
            "source": "Clinical-Verified-2040-Template"
        }
        return self._sanitize_narrative(out)


if __name__ == "__main__":
    enricher = ParvogelContentEnricher()
    narrative = enricher.generate_narrative()
    print("[NARRATIVE GENERATED]:")
    print(json.dumps(narrative, indent=2, ensure_ascii=False))
