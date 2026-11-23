#!/usr/bin/env python3
"""
Content Enricher — 파보겔(Parvogel) 순수 B2C 반려동물 마케팅 내러티브 AI 엔진
- KST(Asia/Seoul) 기준 요일별 7대 반려동물 B2C 테마 자동 회전 + ISO 주차별 훅 변주
- OpenAI / Gemini API 및 주차별 변주 템플릿 3단 폴백 탑재
- 엄격한 브랜드 분리(SNJ/몬스멕타/축산/B2B 무료샘플 원천 차단) 및 '응급 상비겔' 용어 통일
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

KST = datetime.timezone(datetime.timedelta(hours=9))

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(FACTORY_DIR, "data")
CONFIG_DIR = os.path.join(FACTORY_DIR, "config")


def now_kst() -> datetime.datetime:
    return datetime.datetime.now(KST)


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
    """파보겔 순수 B2C 반려동물 마케팅 내러티브 지능형 생성기"""

    BANNED_PHRASES = [
        "정식허가", "치료제", "완치 보장", "100% 치료", "부작용 없음",
        "몽모릴로나이트", "상비약", "상비제"
    ]
    REPLACEMENTS = {
        "정식허가": "정식등록",
        "치료제": "보조사료",
        "완치 보장": "완화에 도움을 줄 수 있음",
        "100% 치료": "증상 완화에 도움",
        "부작용 없음": "수의사 상담 권장",
        "몽모릴로나이트": "몬모릴로나이트",
        "상비약": "응급 상비겔",
        "상비제": "응급 상비겔",
    }
    FORBIDDEN_BRAND_TOKENS = [
        "몬스멕타", "monsmecta", "에스앤제이", "031-321-6562", "0313216562",
        "080-881-1289", "0808811289", "로타갈", "베타콜", "송아지", "자돈",
        "엠오바이오", "무료 샘플", "무료샘플", "펫샵", "브리더",
    ]
    WEEKLY_ANGLES = [
        "새벽 2시 응급실 가기 전 골든타임 1차 대처 관점",
        "주사기·가루약 거부하는 예민한 아이 스트레스 제로 급여 관점",
        "체내 흡수 0% 나노 몬모릴로나이트 장 점막 코팅 과학 원리 관점",
        "55일령 아기 푸들 실제 진료실 회복 관찰 기록 관점",
    ]
    WEEKLY_HOOK_PREFIXES = [
        "[실제 진료실 기록]",
        "[새벽 골든타임 필수]",
        "[펫 구급함 1순위]",
        "[수의학 팩트체크]",
    ]

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
        """KST 기준 오늘 요일에 맞는 순수 B2C 마케팅 테마 추출"""
        now = now_kst()
        if not day_name:
            day_name = now.strftime("%A")

        schedule = self.calendar_data.get("schedule", {})
        if day_name in ["bird", "parrot", "biweekly_bird"]:
            return schedule.get("Wednesday", schedule.get("biweekly_bird", schedule.get("Monday", {})))
        return schedule.get(day_name, schedule.get("Monday", {}))

    def _check_cost_guard(self) -> bool:
        """일일 비용 가드 — 초과 시 AI 호출 차단 후 템플릿 강제"""
        try:
            if os.path.exists(DAILY_COST_TRACK):
                with open(DAILY_COST_TRACK, "r", encoding="utf-8") as f:
                    data = json.load(f)
                today = now_kst().strftime("%Y-%m-%d")
                if data.get("date") == today and data.get("usd", 0) >= OPENAI_MAX_DAILY_COST_USD:
                    print(f"[COST_GUARD] Daily limit ${OPENAI_MAX_DAILY_COST_USD} reached, forcing template.")
                    return False
        except Exception:
            pass
        return True

    def _add_cost(self, usd: float):
        try:
            today = now_kst().strftime("%Y-%m-%d")
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

    def _sanitize_narrative(self, d: Dict[str, Any]) -> Dict[str, Any]:
        txt = json.dumps(d, ensure_ascii=False)
        for banned, repl in self.REPLACEMENTS.items():
            txt = txt.replace(banned, repl)
        # 중복 표현 정리 ("응급 응급 상비겔" -> "응급 상비겔")
        txt = txt.replace("응급 응급 상비겔", "응급 상비겔")
        lowered = txt.lower()
        for token in self.FORBIDDEN_BRAND_TOKENS:
            if token.lower() in lowered:
                raise ValueError(f"[BRAND GUARD] Forbidden token '{token}' detected in narrative!")
        return json.loads(txt)

    def generate_narrative(self, day_name: Optional[str] = None) -> Dict[str, Any]:
        """AI 또는 주차별 변주 템플릿을 통해 당일 마케팅 패키지 생성 — OpenAI→Gemini→템플릿 3단 폴백"""
        now = now_kst()
        theme = self.get_daily_theme(day_name)
        today_date = now.strftime("%Y-%m-%d")
        iso_week = now.isocalendar()[1]
        weekly_angle = self.WEEKLY_ANGLES[iso_week % len(self.WEEKLY_ANGLES)]

        # 1. OpenAI (비용 가드 통과 시)
        narrative_out = None
        if self.openai_client and self._check_cost_guard():
            try:
                ai_result = self._generate_with_openai(theme, today_date, iso_week, weekly_angle)
                if ai_result:
                    candidate = {
                        **theme,
                        "line1": theme.get("headline_line1", ""),
                        "line2": theme.get("headline_line2", ""),
                        "line3": theme.get("headline_line3", ""),
                        **ai_result,
                        "date": today_date,
                        "iso_week": iso_week,
                        "source": "OpenAI-GPT4o"
                    }
                    narrative_out = self._sanitize_narrative(candidate)
                    self._add_cost(0.02)
            except Exception as e:
                print(f"[INFO] OpenAI failed/rejected, trying Gemini: {e}")

        # 1b. Gemini 2차 폴백
        if not narrative_out and GEMINI_API_KEY:
            try:
                g_result = self._generate_with_gemini(theme, today_date, iso_week, weekly_angle)
                if g_result:
                    candidate = {
                        **theme,
                        "line1": theme.get("headline_line1", ""),
                        "line2": theme.get("headline_line2", ""),
                        "line3": theme.get("headline_line3", ""),
                        **g_result,
                        "date": today_date,
                        "iso_week": iso_week,
                        "source": "Gemini-2.0-Flash"
                    }
                    narrative_out = self._sanitize_narrative(candidate)
            except Exception as e:
                print(f"[INFO] Gemini failed/rejected, falling back to template: {e}")

        # 2. 주차별 변주 룰베이스 템플릿 (100% 무오류 & 브랜드 안전 보장)
        if not narrative_out:
            narrative_out = {
                **theme,
                "iso_week": iso_week,
                **self._generate_template_narrative(theme, today_date, iso_week)
            }

        # 요일별 GEO 검색 키워드 및 토픽 자동 바인딩 보장
        narrative_out["geo_keyword"] = theme.get("geo_keyword", "강아지 급성 설사 응급처치")
        narrative_out["geo_topic"] = theme.get("geo_topic", "반려동물 급성 설사 대처 및 파보겔을 활용한 장 점막 보호 관리")
        narrative_out["sub_keywords"] = theme.get("sub_keywords", ["강아지 설사", "파보겔", "몬모릴로나이트"])
        narrative_out["search_intent"] = theme.get("search_intent", "급성 설사 대처 및 장 점막 보호")

        return self._sanitize_narrative(narrative_out)

    def _generate_with_openai(self, theme: Dict[str, Any], today_date: str, iso_week: int, weekly_angle: str) -> Optional[Dict[str, Any]]:
        prompt = f"""
당신은 (주)한국아그로 반려동물 전용 브랜드 '파보겔(ParvoGel)'의 수의학 카피라이터입니다.
오늘 날짜({today_date}, {iso_week}주차)와 오늘의 테마, 이번 주 포커스 관점을 반영해 매주 중복되지 않는 신선한 B2C 보호자용 마케팅 내러티브를 JSON으로 작성하세요.

[제품 팩트 — 순수 B2C 반려동물(강아지·고양이·반려조) 전용]:
- 공식 상호: (주)한국아그로 | 대표전화: 02-6949-5708 | 공식 도메인: https://parvogel.kr
- 제품명: 파보겔 (ParvoGel) — 우리 집 펫 구급함 1순위 응급 상비겔 (100ml 주력)
- 등록: 정식등록 보조사료 (절대 금지: "정식허가", "치료제", "상비약", "상비제")
- 핵심성분: 1-deoxinojirimycin (DNJ) + Bacillus subtilis MORI (특허 제 2011B0042620.8호) + 고순도 초미세 몬모릴로나이트
- 주요특징: 1초 원터치 펌프 급여(주사기 거부 아이도 스트레스 제로), 체내 흡수 0% 장 점막 물리적 코팅 및 유해 독소 배출, 실온 18개월 보관
- 실화 관찰: 하남 사랑동물병원 김동준 원장 55일령 0.6kg 토이푸들 3일 식욕 회복 & 7일 보행 퇴원 기록
- 판매처: 카카오 쇼핑하기, 네이버 스마트스토어(펫츄리), 쿠팡 로켓배송 등 공식 8개 온라인몰

[절대 금지 규칙]:
- 금지어: "정식허가", "치료제", "상비약", "상비제", "몽모릴로나이트", "몬스멕타", "에스앤제이", "송아지", "자돈", "로타갈", "베타콜", "엠오바이오", "펫샵", "브리더", "무료 샘플"
- 반드시 "몬모릴로나이트"와 "응급 상비겔" 표현 사용.
- clinical_solution에는 반드시 "1-deoxinojirimycin"과 "2011B0042620.8"을 포함할 것.

[오늘의 테마 & 이번 주 변주 관점]:
- 날짜/주차: {today_date} ({iso_week}주차 — 이전 주와 다른 새로운 헤드라인 표현 필수)
- 이번 주 강조 각도: {weekly_angle}
- 테마: {theme.get('headline_core')}
- 포커스 씬: {theme.get('focus_scene')}

반드시 아래 JSON 6개 키를 갖추어 응답하세요:
{{
  "headline": "유튜브 쇼츠에 바로 쓸 28자~48자 자연스러운 한국어 훅 제목 (어색한 의태어·번역투 절대 금지, 실제 보호자가 클릭할 자연스러운 문장, 매주 신선하게 변주)",
  "subheadline": "보호자의 공감을 이끄는 서브카피",
  "pain_point": "보호자가 겪는 위급한 상황과 고민 묘사",
  "clinical_solution": "1-deoxinojirimycin(DNJ), 특허 제 2011B0042620.8호, 초미세 몬모릴로나이트 장 점막 코팅 원리 (*보조사료는 질병 치료를 대체하지 않습니다.)",
  "video_highlight": "실제 진료실 회복 기록 또는 반려조 꼬미 회복 장면 묘사",
  "cta_text": "카카오 쇼핑하기·쿠팡·스마트스토어 공식 안내 유도 문구 (무료샘플 언급 금지)"
}}
"""
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.65,
            messages=[
                {"role": "system", "content": "You are a Korean B2C companion-pet veterinary copywriter for ParvoGel. Respond in valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)

    def _generate_with_gemini(self, theme: Dict[str, Any], today_date: str, iso_week: int, weekly_angle: str) -> Optional[Dict[str, Any]]:
        import requests
        prompt = (
            f"당신은 (주)한국아그로 파보겔(정식등록 보조사료, 반려동물 응급 상비겔) 카피라이터입니다. "
            f"날짜 {today_date}({iso_week}주차), 강조 각도 '{weekly_angle}', 오늘 테마 '{theme.get('headline_core')}'에 대해 "
            f"JSON 6키(headline, subheadline, pain_point, clinical_solution, video_highlight, cta_text)를 작성하세요. "
            f"clinical_solution에 1-deoxinojirimycin 및 특허 2011B0042620.8을 반드시 포함하고, "
            f"상비약/정식허가/몬스멕타/송아지/무료샘플/펫샵/브리더 단어는 절대 금지하며 응급 상비겔을 사용하세요."
        )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 0.8}}
        r = requests.post(url, json=body, timeout=12)
        if r.status_code == 200:
            try:
                txt = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(txt)
            except Exception:
                return None
        return None

    def _generate_template_narrative(self, theme: Dict[str, Any], date_str: str, iso_week: int) -> Dict[str, Any]:
        """주차별 훅 접두사를 자동 변주하는 순수 B2C 결정론적 템플릿"""
        theme_id = theme.get("theme_id", "dog_emergency_2040")
        scene = theme.get("focus_scene", "Day 1")
        video_file = theme.get("video_file", "parvogel_real_clinical_28s_landing.mp4")
        badge = theme.get("badge", "✨ 7일간의 기적 임상 실화")
        l1 = theme.get("headline_line1", "설사·혈변으로 밥 못 먹고 쓰러졌던 아이")
        l2 = theme.get("headline_line2", "단 3일 만에 밥그릇 싹싹 비워내고")
        l3 = theme.get("headline_line3", "다시 건강하게 네 발로 서서 꼬리 칩니다")
        prefix = self.WEEKLY_HOOK_PREFIXES[iso_week % len(self.WEEKLY_HOOK_PREFIXES)]
        base_core = theme.get("headline_core", f"{l1}, {l2} {l3}")
        varied_headline = f"{prefix} {base_core}"[:85]

        if theme_id == "bird_parrot_special":
            return self._sanitize_narrative({
                "date": date_str,
                "theme_id": theme_id,
                "badge": badge,
                "line1": l1,
                "line2": l2,
                "line3": l3,
                "headline": varied_headline,
                "subheadline": f"{badge} — 체구가 여린 새·앵무새를 위한 부리 끝 1방울 응급 상비겔!",
                "pain_point": "새는 신진대사가 극도로 빠르고 장이 짧아, 급성 물설사가 시작되면 단 24~48시간 만에 탈수로 '낙조(폐사)' 위험에 처합니다. 가루약이나 알약을 억지로 먹이다 기도로 넘어가 질식할 위험에 밤새 애가 타는 조류 집사의 마음을 깊이 공감합니다.",
                "clinical_solution": "반려조 '꼬미' 실제 24시간 회복 기록: 1-deoxinojirimycin(DNJ)과 특허균주(Patent No. 2011B0042620.8), 순수 천연 나노 몬모릴로나이트의 비흡수성 물리적 메커니즘으로 간·신장 부담 없이 여린 조류 장 점막을 실크 코팅하고 유해 독소를 흡착 배출합니다. *보조사료는 질병 치료를 대체하지 않습니다.",
                "video_highlight": "앵무새 꼬미 24시간 배변 정상화 전·후 실제 사진 실증: 부리 끝 1방울 급여 후 물기만 번지던 수양성 변에서 단단한 알맹이와 정상 요산이 선명하게 분리된 리얼 기록.",
                "cta_text": "소중한 반려조를 위한 24시간 응급 상비겔! 카카오 쇼핑하기·쿠팡·네이버 스마트스토어에서 공식 파보겔을 준비해 두세요.",
                "video_file": video_file,
                "source": "Bird-Parrot-Clinical-Template"
            })

        if theme_id == "cat_stress_free_2040":
            return self._sanitize_narrative({
                "date": date_str,
                "theme_id": theme_id,
                "badge": badge,
                "line1": l1,
                "line2": l2,
                "line3": l3,
                "headline": varied_headline,
                "subheadline": f"{badge} — 가루약 거품 물고 숨는 고양이도 입가에 1초 톡 짜주면 스스로 핥아먹어요!",
                "pain_point": "예민한 고양이가 사료 교체나 스트레스로 무른 변·설사를 하거나 헤어볼 구토를 반복할 때, 피딩 주사기로 억지로 약을 먹이려다 할퀴고 침 흘리며 온 집안이 전쟁터가 된 경험 있으신가요?",
                "clinical_solution": "1-deoxinojirimycin(DNJ), 특허균주(Patent No. 2011B0042620.8), 체내 흡수 0% 고순도 나노 몬모릴로나이트가 쓰라린 위산(pH 2.0)을 pH 4.5~5.5로 부드럽게 완충해 구토 후 속쓰림을 달래주고, 장내 독소만 자석처럼 포획해 변으로 안전하게 배출합니다. *보조사료는 질병 치료를 대체하지 않습니다.",
                "video_highlight": "주사기나 바늘 없이 오일펌프 노즐을 입가에 살짝 대고 1초 톡 짜주면 고양이와 소형견이 간식처럼 핥아먹는 스트레스 제로 급여 직캠.",
                "cta_text": "다묘 가정·초보 집사 우리 집 펫 구급함 1순위 응급 상비겔 파보겔! 카카오 쇼핑하기·쿠팡·스마트스토어에서 바로 준비하세요.",
                "video_file": video_file,
                "source": "Cat-2040-D2C-Template"
            })

        if theme_id == "pump_zero_stress_2040":
            return self._sanitize_narrative({
                "date": date_str,
                "theme_id": theme_id,
                "badge": badge,
                "line1": l1,
                "line2": l2,
                "line3": l3,
                "headline": varied_headline,
                "subheadline": f"{badge} — 쓴 가루약에 거품 물던 아이도 입가에 1초 톡! 스스로 핥아먹는 응급 상비겔",
                "pain_point": "아이가 아파서 예민한 상태에서 쓴 가루약을 물에 타 주사기로 억지 투약하면 구토 반사와 기도 흡인 위험까지 커져 보호자도 아이도 큰 트라우마를 겪게 됩니다.",
                "clinical_solution": "파보겔은 1-deoxinojirimycin(DNJ)과 특허균주(Patent No. 2011B0042620.8), 초미세 나노 몬모릴로나이트 복합 포뮬러를 고기호성 겔 제형과 원터치 1초 에어리스 펌프에 담아 스트레스 없이 장 점막을 코팅합니다. *보조사료는 질병 치료를 대체하지 않습니다.",
                "video_highlight": "하남 사랑동물병원 김동준 원장님의 진료실 원터치 1초 펌프 급여 실사 & 55일령 아기 푸들 회복 다큐.",
                "cta_text": "약 먹이기 전쟁 끝내는 우리 집 펫 구급함 1순위 응급 상비겔 파보겔! 카카오 쇼핑하기·쿠팡·스마트스토어 공식몰에서 만나보세요.",
                "video_file": video_file,
                "source": "Pump-ZeroStress-B2C-Template"
            })

        if theme_id == "home_first_aid_kit":
            return self._sanitize_narrative({
                "date": date_str,
                "theme_id": theme_id,
                "badge": badge,
                "line1": l1,
                "line2": l2,
                "line3": l3,
                "headline": varied_headline,
                "subheadline": f"{badge} — 새벽 응급실 달려가기 전, 서랍에서 꺼내 1초 만에 급여하는 우리 집 첫 응급 상비겔!",
                "pain_point": "동물병원이 모두 문을 닫은 일요일 밤이나 새벽 2시, 아이가 갑자기 노란 위산 토를 하고 물설사를 쏟아낼 때 24시 야간 응급실 이동 스트레스 앞에서 보호자는 발만 동동 구르게 됩니다.",
                "clinical_solution": "냉장 보관 필요 없이 거실 서랍 속에 실온 18개월 보관 가능한 파보겔(100ml 18,000원)을 구비해 두세요. 1-deoxinojirimycin(DNJ), 특허균주(Patent No. 2011B0042620.8), 초미세 나노 몬모릴로나이트가 pH 4.5~5.5 위산 완충과 장 점막 코팅으로 병원 진료 전후 골든타임을 지켜줍니다. *보조사료는 질병 치료를 대체하지 않습니다.",
                "video_highlight": f"하남 사랑동물병원 김동준 원장님의 실제 진료실 7일 회복 기록 ({scene}): 급성 장 트러블로 쓰러졌던 아기 강아지가 파보겔 급여 후 활력을 되찾고 네 발로 퇴원하는 과정.",
                "cta_text": "아프기 전에 미리 구비하는 우리 집 펫 구급함 1순위 응급 상비겔! 카카오 쇼핑하기·쿠팡·네이버 스마트스토어에서 바로 만나보세요.",
                "video_file": video_file,
                "source": "Home-FirstAid-2040-Template"
            })

        return self._sanitize_narrative({
            "date": date_str,
            "theme_id": theme_id,
            "badge": badge,
            "line1": l1,
            "line2": l2,
            "line3": l3,
            "headline": varied_headline,
            "subheadline": f"{badge} — 주사기 스트레스 없이 입에 대고 1초 톡! 간식처럼 냠냠 핥아먹어요",
            "pain_point": "갑작스러운 구토와 설사로 기력이 빠진 아이에게 쓴 가루약을 물에 타서 주사기로 억지로 먹이다 거품을 물고 토해낼 때 집사님의 마음은 무너져 내립니다.",
            "clinical_solution": "하남 사랑동물병원 김동준 원장 관찰 케이스: 1-deoxinojirimycin(DNJ) 및 특허균주(Patent No. 2011B0042620.8), 체내 흡수 0% 고순도 나노 몬모릴로나이트가 여린 장 점막을 물리적으로 코팅하고 유해 독소만 자석처럼 흡착 배출합니다. *보조사료는 질병 치료를 대체하지 않습니다.",
            "video_highlight": f"하남 사랑동물병원 김동준 원장님의 실제 진료실 직캠 ({scene}): 주사기 없이 한 손으로 펌핑하여 입가에 대주자 스트레스 없이 핥아먹고 3일 만에 밥그릇을 비운 감동의 순간.",
            "cta_text": "우리 집 펫 구급함 1순위 응급 상비겔 파보겔! 카카오 쇼핑하기·네이버 스마트스토어·쿠팡 로켓배송으로 바로 준비해 두세요.",
            "video_file": video_file,
            "source": "Clinical-Verified-2040-Template"
        })


if __name__ == "__main__":
    enricher = ParvogelContentEnricher()
    narrative = enricher.generate_narrative()
    print("[NARRATIVE GENERATED]:")
    print(json.dumps(narrative, indent=2, ensure_ascii=False))
