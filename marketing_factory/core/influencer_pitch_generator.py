import json
import os
import re
from typing import Any, Dict, List, Optional

import requests

from marketing_factory.core.influencer_gonggu_guard import (
    APPROVED_USPS,
    OFFICIAL_CEO_NAME,
    OFFICIAL_COMPANY_NAME,
    OFFICIAL_DOMAIN,
    OFFICIAL_KOREAAGRO_URL,
    OFFICIAL_PHONE,
    OFFICIAL_PRODUCT_NAME,
    assert_gonggu_safe,
    build_prompt_negative_constraints,
    find_forbidden_gonggu_tokens,
    sanitize_gonggu_copy,
)


class InfluencerPitchGenerator:
    """
    파보겔 100ml 정품 단독 - AI 초개인화 '메시지 자판기' 생성기.
    - 인플루언서의 반려동물 이름 또는 최근 게시물 3~5개 중 핵심 내용을 첫 문장에 자연스럽게 반영
    - DM용 숏버전 + 이메일용 상세 제안서 동시 생성
    - 몬스멕타·에스앤제이·500ml·사료관리법 위반어 자동 차단(Guardrail)
    """

    def __init__(self, use_llm: bool = True):
        self.use_llm = use_llm
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()

    @staticmethod
    def _extract_personal_hook(lead: Dict[str, Any]) -> str:
        display_name = (lead.get("display_name") or lead.get("handle") or "작가").strip()
        pet_name = (lead.get("pet_name") or "").strip()
        recent_posts: List[str] = [str(p).strip() for p in (lead.get("recent_posts") or []) if str(p).strip()]

        if pet_name and recent_posts:
            snippet = recent_posts[0][:38].rstrip("., ")
            raw_hook = f"{display_name}님, 최근 올려주신 {pet_name}와 함께한 '{snippet}' 콘텐츠를 인상 깊게 보고 연락드립니다."
        elif pet_name:
            raw_hook = f"{display_name}님, 사랑스러운 {pet_name}의 일상을 꾸준히 챙겨주시는 모습을 보고 반가운 마음에 연락드립니다."
        elif recent_posts:
            snippet = recent_posts[0][:42].rstrip("., ")
            raw_hook = f"{display_name}님, 최근 공유해주신 '{snippet}' 피드를 진정성 있게 보고 연락드리게 되었습니다."
        else:
            kw = (lead.get("matched_keyword") or "반려동물 케어").lstrip("#")
            raw_hook = f"{display_name}님, 평소 '{kw}' 관련 소식을 진심으로 전해주시는 피드를 보고 연락드렸습니다."

        safe_hook, _ = sanitize_gonggu_copy(raw_hook)
        return safe_hook

    @staticmethod
    def _build_recommended_bundles(group: str) -> List[Dict[str, str]]:
        """오직 파보겔 100ml 정품만으로 구성된 공구 전용 패키지(타제품/500ml 절대 배제)."""
        if str(group).upper() == "A":
            return [
                {"name": "다견·브리더 실속 3+1 구성", "composition": "파보겔 100ml 정품 3병 + 파보겔 100ml 정품 1병 추가 증정"},
                {"name": "홈케어 더블 구성", "composition": "파보겔 100ml 정품 2병 단독 공구가 할인"},
            ]
        return [
            {"name": "스타터 더블 구성", "composition": "파보겔 100ml 정품 2병 단독 공구가 할인"},
            {"name": "패밀리 2+1 증정 구성", "composition": "파보겔 100ml 정품 2병 + 파보겔 100ml 정품 1병 동일 추가 증정"},
        ]

    def _try_llm_personalization(self, lead: Dict[str, Any], hook_line: str) -> Optional[Dict[str, str]]:
        """Gemini API 키가 있을 경우 첫 문장·연결 멘트를 자연스럽게 다듬되, 실패/위반 시 즉시 폴백합니다."""
        if not (self.use_llm and self.gemini_api_key):
            return None

        group = str(lead.get("keyword_group", "B")).upper()
        recent_summary = " / ".join(str(p)[:60] for p in (lead.get("recent_posts") or [])[:4]) or "반려동물 일상 기록"
        prompt = (
            "당신은 (주)한국아그로의 파보겔(Pavogel) 100ml 정품 공동구매 매니저입니다.\n"
            f"{build_prompt_negative_constraints()}\n"
            f"- 대상 계정: {lead.get('display_name') or lead.get('handle')} (채널: {lead.get('channel')}, 그룹: {group})\n"
            f"- 시작 훅 문장 예시: {hook_line}\n"
            f"- 최근 게시물 요약: {recent_summary}\n"
            "- 필수 포함 내용:\n"
            f"  1) {APPROVED_USPS['authority']}\n"
            f"  2) {APPROVED_USPS['science']}\n"
            "  3) 조건 없는 파보겔 100ml 정품 본품 1병 무상 체험 우선 발송 (먼저 먹여보신 후 만족 시에만 공구 진행)\n"
            "  4) 파보겔 100ml 정품 다구성/동일 증정 최저가 단독 기획 & 수수료 20~30% 협의\n"
            "아래 JSON 스키마로만 응답하세요:\n"
            '{"dm_short": "첫 문장에 반드시 상대 피드/반려동물 언급 포함, 250~360자", '
            '"email_subject": "이메일 제목", '
            '"email_body": "정중한 상세 제안서 본문 (공식 스토어 koreaagro 및 02-6949-5708 표기)"}\n'
        )
        try:
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"gemini-2.0-flash:generateContent?key={self.gemini_api_key}"
            )
            resp = requests.post(
                url,
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"responseMimeType": "application/json", "temperature": 0.4},
                },
                timeout=15,
            )
            if resp.status_code != 200:
                return None
            text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(text)
            if not all(k in parsed for k in ("dm_short", "email_subject", "email_body")):
                return None
            for k in ("dm_short", "email_subject", "email_body"):
                cleaned, _ = sanitize_gonggu_copy(str(parsed[k]))
                parsed[k] = cleaned
            if find_forbidden_gonggu_tokens(parsed):
                return None
            return parsed
        except Exception:
            return None

    def generate_pitch(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """인플루언서·벤더 1건에 대해 DM/이메일 초개인화 제안서와 공구 가이드를 생성합니다."""
        display_name = (lead.get("display_name") or lead.get("handle") or "파트너").strip()
        group = str(lead.get("keyword_group", "B")).upper()
        hook_line = self._extract_personal_hook(lead)
        bundles = self._build_recommended_bundles(group)
        bundle_summary = " / ".join(f"{b['name']}({b['composition']})" for b in bundles)

        llm_result = self._try_llm_personalization(lead, hook_line)
        if llm_result:
            dm_short = llm_result["dm_short"]
            email_subject = llm_result["email_subject"]
            email_body = llm_result["email_body"]
            source_mode = "gemini_personalized"
        else:
            if group == "C":
                dm_short = (
                    f"{hook_line} {OFFICIAL_COMPANY_NAME} 담당자입니다. "
                    f"{APPROVED_USPS['authority']}로 주목받는 '{OFFICIAL_PRODUCT_NAME}' 단독 공동구매 제휴를 제안드립니다. "
                    "진행 전 조건 없이 파보겔 100ml 정품 체험분을 먼저 보내드리며, "
                    "소속 크리에이터 전용 최저가 구성 및 업계 최고 수준 수수료(20~30% 협의) 지원이 가능합니다. "
                    "편하신 메일 주소 남겨주시면 상세 제안서 보내드리겠습니다!"
                )
            else:
                dm_short = (
                    f"{hook_line} 아이들 장 컨디션 챙겨주시는 진심이 느껴져 {OFFICIAL_COMPANY_NAME}에서 조심스레 연락드립니다. "
                    f"{APPROVED_USPS['authority']} 제품인 '{OFFICIAL_PRODUCT_NAME}'을 조건 없이 1병 먼저 보내드리고 싶습니다! "
                    "직접 급여해 보시고 만족하실 때만 단독 공구(100ml 정품 다구성·수수료 20~30% 협의)를 논의해 보실 수 있어요. "
                    "체험 수령 가능하신지 편하게 답장 주세요 :)"
                )

            email_subject = f"[{OFFICIAL_COMPANY_NAME}] {display_name}님, '{OFFICIAL_PRODUCT_NAME}' 무상 본품 체험 및 단독 공동구매 제안"
            email_body = (
                f"안녕하세요, {display_name}님.\n\n"
                f"{hook_line}\n"
                f"반려동물의 건강한 일상을 진정성 있게 공유해주시는 {display_name}님께 "
                f"{OFFICIAL_COMPANY_NAME}의 B2C 주력 제품 **'{OFFICIAL_PRODUCT_NAME}'** 체험 및 공동구매 파트너십을 정식으로 제안드립니다.\n\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"■ 제품 안내: {OFFICIAL_PRODUCT_NAME} (단일 정품 라인업)\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"1. 압도적 권위: {APPROVED_USPS['authority']}\n"
                f"2. 과학적 근거: {APPROVED_USPS['science']}\n"
                "3. 급여 편의성: 주사기 없이 1초 원터치 펌프로 간편 급여 · 실온 18개월 보관\n\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "■ 인플루언서·파트너 전용 파격 조건\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "1) 조건 없는 정품 체험: 공구 의무 없이 '파보겔 100ml 정품' 본품을 먼저 무상 발송해 드립니다.\n"
                "   (직접 급여해 보신 뒤 정말 만족스러우실 때만 공구 오픈을 논의합니다.)\n"
                f"2) 전용 단독 구성: {bundle_summary}\n"
                "3) 업계 최고 수준 수수료: 판매 수수료 20~30% 협의 (전용 스마트스토어 UTM 정산 링크 발급)\n\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "■ 공식 스토어 및 문의처\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"- 공식 브랜드몰: {OFFICIAL_DOMAIN}\n"
                f"- 공식 스마트스토어(koreaagro): {OFFICIAL_KOREAAGRO_URL}\n"
                f"- 공식 공급사: {OFFICIAL_COMPANY_NAME} (대표이사 {OFFICIAL_CEO_NAME} · 학술고문 홍순일 수의사 · {OFFICIAL_PHONE})\n\n"
                "체험 수령을 원하시면 편하신 회신으로 [성함 / 연락처 / 수령 주소]만 알려주시면\n"
                "바로 파보겔 100ml 정품 본품을 발송해 드리겠습니다.\n\n"
                "감사합니다.\n"
                f"{OFFICIAL_COMPANY_NAME} 파보겔 공구 파트너십팀 드림"
            )
            source_mode = "deterministic_personalized"

        feed_guideline = (
            "※ [인플루언서 공개 피드/릴스 필수 준수 가이드]\n"
            f"- 제품 표기: 오직 '{OFFICIAL_PRODUCT_NAME}'으로만 소개 (타 제품/병원명 언급 금지)\n"
            "- 권장 표현: '장 건강·점막 보호 및 컨디션 관리에 도움 (동물용 정식등록 보조사료)'\n"
            "- 금지 표현: 질병을 직접 고친다는 단정적 효능 표현, 의약품 오인 표현, 일반 소비자 대상 무상 증정 이벤트성 문구 사용 금지"
        )

        pitch_payload: Dict[str, Any] = {
            "lead_id": lead.get("lead_id", ""),
            "handle": lead.get("handle", ""),
            "product": OFFICIAL_PRODUCT_NAME,
            "generation_mode": source_mode,
            "personal_hook": hook_line,
            "dm_short": dm_short,
            "email_subject": email_subject,
            "email_body": email_body,
            "recommended_bundles": bundles,
            "feed_guideline": feed_guideline,
        }

        for field in ("personal_hook", "dm_short", "email_subject", "email_body", "feed_guideline"):
            pitch_payload[field], _ = sanitize_gonggu_copy(pitch_payload[field])

        assert_gonggu_safe(pitch_payload, context=f"pitch:{lead.get('handle', 'unknown')}")
        return pitch_payload
