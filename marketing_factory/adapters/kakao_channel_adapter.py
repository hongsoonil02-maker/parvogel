#!/usr/bin/env python3
"""
KakaoTalk Channel Adapter — 카카오톡 채널 자동화
- 친구 추가 환영 메시지 (즉시 발송)
- 주간 케어 팁 (매주 수요일 오전 10시)
- 재구매 리마인더 (구매 45일 후)
- 장바구니 포기 알림 (클릭 후 미구매 1시간)
- 1:1 채팅 상담 연동
"""

import os
import json
import time
import requests
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from .base_adapter import BaseMarketingAdapter

class KakaoChannelAdapter(BaseMarketingAdapter):
    name = "Kakao_Channel"

    def __init__(self):
        super().__init__()
        self.channel_id = os.environ.get("KAKAO_CHANNEL_ID", "_rqxnJX")
        self.access_token = os.environ.get("KAKAO_CHANNEL_ACCESS_TOKEN", "")
        self.admin_key = os.environ.get("KAKAO_ADMIN_KEY", "")
        self.base_url = "https://kapi.kakao.com/v2/api/talk/channel"
        self.friend_url = "https://kapi.kakao.com/v1/api/talk/friends"
        self.message_url = "https://kapi.kakao.com/v2/api/talk/memo/default/send"
        
        # 자동화 시나리오 설정
        self.automation_config = {
            "welcome": {
                "enabled": True,
                "template_id": os.environ.get("KAKAO_WELCOME_TEMPLATE_ID", ""),
                "immediate": True
            },
            "weekly_tip": {
                "enabled": True,
                "template_id": os.environ.get("KAKAO_WEEKLY_TIP_TEMPLATE_ID", ""),
                "schedule": "weekly_wednesday_10am"
            },
            "repurchase": {
                "enabled": True,
                "template_id": os.environ.get("KAKAO_REPURCHASE_TEMPLATE_ID", ""),
                "delay_days": 45
            },
            "abandoned_cart": {
                "enabled": True,
                "template_id": os.environ.get("KAKAO_ABANDONED_CART_TEMPLATE_ID", ""),
                "delay_hours": 1
            }
        }

    def validate_config(self) -> bool:
        """필수 환경변수 확인"""
        return bool(self.channel_id and self.access_token)

    def _get_headers(self, use_admin=False):
        """API 요청 헤더 생성"""
        token = self.admin_key if use_admin else self.access_token
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def send_welcome_message(self, user_id: str) -> bool:
        """신규 친구 환영 메시지 발송"""
        if not self.automation_config["welcome"]["enabled"]:
            return False
        
        template_id = self.automation_config["welcome"]["template_id"]
        if not template_id:
            return False
        
        url = f"{self.message_url}/send"
        payload = {
            "receiver_uuids": [user_id],
            "template_id": template_id,
            "template_args": {
                "user_name": "보호자님",
                "guide_url": "https://parvogel.kr/guide",
                "coupon_code": "WELCOME10"
            }
        }
        
        try:
            response = requests.post(url, headers=self._get_headers(), json=payload, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"[KakaoChannel] Welcome message failed: {e}")
            return False

    def send_weekly_tip(self, user_ids: list, tip_content: dict) -> bool:
        """주간 케어 팁 발송 (수요일 오전 10시)"""
        if not self.automation_config["weekly_tip"]["enabled"]:
            return False
        
        template_id = self.automation_config["weekly_tip"]["template_id"]
        if not template_id:
            return False
        
        url = f"{self.message_url}/send"
        success_count = 0
        
        for user_id in user_ids:
            payload = {
                "receiver_uuids": [user_id],
                "template_id": template_id,
                "template_args": {
                    "tip_title": tip_content.get("title", "이번 주 케어 팁"),
                    "tip_body": tip_content.get("body", ""),
                    "tip_link": tip_content.get("link", "https://parvogel.kr/blog")
                }
            }
            
            try:
                response = requests.post(url, headers=self._get_headers(), json=payload, timeout=10)
                if response.status_code == 200:
                    success_count += 1
            except Exception as e:
                print(f"[KakaoChannel] Weekly tip failed for {user_id}: {e}")
        
        return success_count > 0

    def send_repurchase_reminder(self, user_id: str, last_purchase_date: str) -> bool:
        """재구매 리마인더 발송 (구매 45일 후)"""
        if not self.automation_config["repurchase"]["enabled"]:
            return False
        
        try:
            last_purchase = datetime.fromisoformat(last_purchase_date)
            days_since = (datetime.now() - last_purchase).days
            
            if days_since < self.automation_config["repurchase"]["delay_days"]:
                return False  # 아직 발송 시기 아님
        except:
            return False
        
        template_id = self.automation_config["repurchase"]["template_id"]
        if not template_id:
            return False
        
        url = f"{self.message_url}/send"
        payload = {
            "receiver_uuids": [user_id],
            "template_id": template_id,
            "template_args": {
                "product_name": "파보겔 100ml",
                "discount_code": "REBUY15",
                "purchase_link": "https://store.kakao.com/agrowellness/products/800840808"
            }
        }
        
        try:
            response = requests.post(url, headers=self._get_headers(), json=payload, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"[KakaoChannel] Repurchase reminder failed: {e}")
            return False

    def send_abandoned_cart_reminder(self, user_id: str, cart_data: dict) -> bool:
        """장바구니 포기 알림 발송 (클릭 후 미구매 1시간)"""
        if not self.automation_config["abandoned_cart"]["enabled"]:
            return False
        
        template_id = self.automation_config["abandoned_cart"]["template_id"]
        if not template_id:
            return False
        
        url = f"{self.message_url}/send"
        payload = {
            "receiver_uuids": [user_id],
            "template_id": template_id,
            "template_args": {
                "product_name": cart_data.get("product_name", "파보겔 100ml"),
                "cart_link": cart_data.get("cart_link", "https://store.kakao.com/agrowellness/products/800840808"),
                "expires_in": "24시간"
            }
        }
        
        try:
            response = requests.post(url, headers=self._get_headers(), json=payload, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"[KakaoChannel] Abandoned cart reminder failed: {e}")
            return False

    def get_friend_list(self, limit=100) -> list:
        """친구 목록 조회"""
        url = f"{self.friend_url}"
        params = {"limit": limit}
        
        try:
            response = requests.get(url, headers=self._get_headers(use_admin=True), params=params, timeout=10)
            if response.status_code == 200:
                return response.json().get("elements", [])
        except Exception as e:
            print(f"[KakaoChannel] Get friend list failed: {e}")
        return []

    def publish(self, content_data: Dict[str, Any]) -> bool:
        """채널 포스트 발행 비활성화 (관리자 센터 center-pf.kakao.com 직접 운영)."""
        # 카카오 채널 웰컴/FAQ/메시지는 관리자 센터 웹 UI에서 직접 운영하며,
        # API 자동 발송이 필요한 경우 알리고/솔라피 알림톡 연동을 사용합니다.
        return False

    def run_automation_cycle(self) -> Dict[str, Any]:
        """자동화 사이클 실행 (스케줄러에서 호출)"""
        results = {
            "timestamp": datetime.now().isoformat(),
            "weekly_tip": False,
            "repurchase_reminders": 0,
            "abandoned_cart_reminders": 0
        }
        
        # 주간 팁 (수요일만)
        if datetime.now().weekday() == 2:  # 수요일
            tip_content = self._get_weekly_tip()
            friends = self.get_friend_list(limit=1000)
            user_ids = [f["uuid"] for f in friends if f.get("uuid")]
            if user_ids and tip_content:
                results["weekly_tip"] = self.send_weekly_tip(user_ids, tip_content)
        
        # 재구매 리마인더 (일일 체크)
        # 실제로는 DB에서 45일 경과 사용자 조회 필요
        # 여기서는 스텁으로 구현
        
        # 장바구니 포기 알림 (실시간에 가까워야 함)
        # 실제로는 큐/웹훅 연동 필요
        
        return results

    def _get_weekly_tip(self) -> dict:
        """이번 주 케어 팁 콘텐츠 생성 (계절/시즌별)"""
        month = datetime.now().month
        
        seasonal_tips = {
            1: {"title": "새해 맞이 펫 구급함 점검", "body": "유통기한 지난 약은 버리고 파보겔로 새로 채워두세요!", "link": "https://parvogel.kr/blog"},
            2: {"title": "설 연휴 응급 대비", "body": "병원 휴진 대비 파보겔 미리 준비하세요. 귀성길 차멀미에도 좋아요.", "link": "https://parvogel.kr/blog"},
            3: {"title": "봄철 분양 시즌 케어", "body": "새끼 강아지/고양이 입양 시 파보겔로 초기 적응 도와주세요.", "link": "https://parvogel.kr/blog"},
            4: {"title": "황사/미세먼지 장 건강", "body": "호흡기-장 축 케어로 AFB1 흡착/식중독 예방하세요.", "link": "https://parvogel.kr/blog"},
            5: {"title": "가정의 달 다두가구 케어", "body": "강아지+고양이+조류 동시 케어는 파보겔 하나로!", "link": "https://parvogel.kr/blog"},
            6: {"title": "장마철 습도/곰팡이 독소", "body": "AFB1 98.5% 흡착하는 파보겔로 식중독 예방하세요.", "link": "https://parvogel.kr/blog"},
            7: {"title": "여름 휴가철 이동 스트레스", "body": "차멀미/환경변화 설사엔 파보겔 1초 펌프!", "link": "https://parvogel.kr/blog"},
            8: {"title": "폭염 탈수/전해질 관리", "body": "수분 보충+전해질 관리는 파보겔 활기명수 포지셔닝.", "link": "https://parvogel.kr/blog"},
            9: {"title": "추석 연휴 응급 대비", "body": "명절 음식 급여 후 설사엔 파보겔로 바로 케어.", "link": "https://parvogel.kr/blog"},
            10: {"title": "가을 환절기 면역/장 케어", "body": "면역력-장 건강 연계, 파보겔로 미리 대비하세요.", "link": "https://parvogel.kr/blog"},
            11: {"title": "겨울철 노령견/노령묘 케어", "body": "만성 설사/장누수 증후군엔 파보겔로 장벽 보호.", "link": "https://parvogel.kr/blog"},
            12: {"title": "연말 결산 베스트 리뷰", "body": "올해의 회복 스토리 모음 - 파보겔과 함께한 1년.", "link": "https://parvogel.kr/blog"}
        }
        
        return seasonal_tips.get(month, seasonal_tips[1])


if __name__ == "__main__":
    adapter = KakaoChannelAdapter()
    print(f"Kakao Channel Adapter initialized: {adapter.validate_config()}")
    print(f"Weekly tip for this month: {adapter._get_weekly_tip()}")