#!/usr/bin/env python3
"""
Aligo B2B Drip Funnel Adapter — 전국 인허가 펫샵·브리더(번식농장) 3단계 문자 퍼널 모듈
- D+0 (STAGE_D0_INVITE): 미신청 인허가 펫샵·브리더 대상 본품 1병 무료 샘플 신청 안내 (?sample=petshop)
- D+3 (STAGE_D3_TIP): 샘플 수령 거래처 1초 펌프 급여 팁 & 매장 A4/POP 보드판 무상 신청 안내
- D+7 (STAGE_D7_VIP): 샘플 체험 완료 거래처 10병/50병 VIP 도매 특가 발주 유도 (?sample=b2b)
- 기본값 testmode=True (과금/오발송 원천 방지 가드 탑재)
"""

import os
import sys
import json
import requests
from typing import Dict, Any, Optional

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

try:
    from .base_adapter import BaseMarketingAdapter
except (ImportError, ValueError):
    from adapters.base_adapter import BaseMarketingAdapter


DRIP_TEMPLATES = {
    "D0_SAMPLE_INVITE": {
        "title": "[파보겔] 펫샵·브리더 본품 1병 무료샘플 지원",
        "body": (
            "(광고) [{shop_name} 대표님 전용 안내]\n"
            "이유기·분양 초기 아기 강아지·고양이의 갑작스런 물설사와 구토, "
            "주사기 실랑이 없이 입가에 1초 톡 짜주면 스스로 핥아먹는 [파보겔 200ml 정품 1병]을 인허가 사업자님께 무료로 보내드립니다.\n\n"
            "✓ 체내 흡수 0% 고순도 나노 몬모릴로나이트 + 특허 유익균\n"
            "✓ 매장 상호가 인쇄된 A4 알림판 & 하드 POP 보드판 무상 동봉\n\n"
            "🎁 본품 1병 무료 샘플 신청하기:\n"
            "https://parvogel.kr/?sample=petshop\n\n"
            "무료수신거부 080-855-6380"
        )
    },
    "D3_FEEDING_TIP": {
        "title": "[파보겔] 샘플 100% 활용 1초 급여 팁 안내",
        "body": (
            "[{shop_name} 대표님] 보내드린 파보겔 샘플은 잘 받아보셨나요?\n\n"
            "💡 [현장 100% 활용 팁]\n"
            "1. 급여 전 가볍게 흔들어 오일펌프 노즐을 아이 입가에 대고 1초 톡(약 1ml) 짜주세요.\n"
            "2. 사료 교체기나 분양 직전 1~2펌프 미리 급여하시면 환경 변화 설사 컴플레인이 확 줄어듭니다.\n"
            "3. 매장 비치용 실물 POP 보드판이 추가로 필요하시면 언제든 홈페이지 파트너 라운지에서 무료 신청하세요!\n\n"
            "🏢 파트너 라운지 바로가기:\n"
            "https://parvogel.kr/#order"
        )
    },
    "D7_VIP_WHOLESALE": {
        "title": "[파보겔] 샘플 체험 VIP 거래처 전용 도매 특가",
        "body": (
            "(광고) [{shop_name} 대표님] 파보겔 1차 무료 샘플 체험 VIP 파트너 전용 도매 공급가 안내드립니다.\n\n"
            "아이들이 간식처럼 스스로 잘 받아먹고 변 상태가 빠르게 잡히는 것을 확인하신 전국 펫샵·켄넬 대표님들의 본품 재발주가 이어지고 있습니다.\n\n"
            "📦 [VIP 파트너 전용 도매 혜택]\n"
            "• 10병 / 50병 대량 도매 특별 할인가 적용\n"
            "• 당일 최우선 출고 및 매장용 POP 쇼카드 무상 지원\n\n"
            "👉 VIP 도매 특가 견적 및 즉시 발주:\n"
            "https://parvogel.kr/?sample=b2b\n\n"
            "고객센터: 02-6949-5708\n"
            "무료수신거부 080-855-6380"
        )
    }
}


class AligoB2BAdapter(BaseMarketingAdapter):
    name = "Aligo_B2B_SMS"
    BASE_URL = "https://apis.aligo.in"

    def validate_config(self) -> bool:
        return bool(
            os.getenv("ALIGO_USER_ID")
            and os.getenv("ALIGO_API_KEY")
            and os.getenv("ALIGO_SENDER")
        )

    def build_drip_message(self, stage: str = "D0_SAMPLE_INVITE", shop_name: str = "파트너") -> Dict[str, str]:
        tpl = DRIP_TEMPLATES.get(stage, DRIP_TEMPLATES["D0_SAMPLE_INVITE"])
        return {
            "stage": stage,
            "title": tpl["title"],
            "msg": tpl["body"].format(shop_name=shop_name)
        }

    def send_lms(self, receiver: str, title: str, msg: str, testmode: bool = True) -> Dict[str, Any]:
        if not self.validate_config():
            return {"result_code": -99, "message": "ALIGO env vars (ALIGO_USER_ID, ALIGO_API_KEY, ALIGO_SENDER) not configured"}

        clean_receiver = receiver.replace("-", "").strip()
        payload = {
            "key": os.getenv("ALIGO_API_KEY"),
            "user_id": os.getenv("ALIGO_USER_ID"),
            "sender": os.getenv("ALIGO_SENDER", "").replace("-", "").strip(),
            "receiver": clean_receiver,
            "title": title[:40],
            "msg": msg,
            "msg_type": "LMS",
            "testmode_yn": "Y" if testmode else "N"
        }
        try:
            resp = requests.post(f"{self.BASE_URL}/send/", data=payload, timeout=15)
            return resp.json() if resp.status_code == 200 else {"result_code": -1, "http_status": resp.status_code}
        except Exception as exc:
            return {"result_code": -1, "message": str(exc)}

    def publish(self, content_data: Dict[str, Any]) -> bool:
        """일일 파이프라인 연동 시 B2B 드립 원고 검증 및 테스트 모드 점검"""
        if not self.validate_config():
            print("[ALIGO_B2B] Skipped (ALIGO_API_KEY not set in environment).")
            return False
        stage = content_data.get("stage", "D0_SAMPLE_INVITE")
        sample_msg = self.build_drip_message(stage=stage, shop_name="사랑퍼피")
        print(f"[ALIGO_B2B] Ready drip stage={stage} title='{sample_msg['title']}'")
        return True


if __name__ == "__main__":
    adapter = AligoB2BAdapter()
    for stage_key in ["D0_SAMPLE_INVITE", "D3_FEEDING_TIP", "D7_VIP_WHOLESALE"]:
        built = adapter.build_drip_message(stage=stage_key, shop_name="스타켄넬")
        print(f"\n=== [{stage_key}] {built['title']} ===")
        print(built["msg"])
