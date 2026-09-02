#!/usr/bin/env python3
"""
Content Formatter — 파보겔(Parvogel) 8대 채널별 최적화 포매터
- 각 채널의 규격과 알고리즘에 맞춘 자동 텍스트 & 해시태그 변환
- 네이버 스마트스토어 및 쿠팡 로켓배송 전용 UTM 어트리뷰션 자동 주입
- 숏폼 비디오(쇼츠/릴스/틱톡) 메타데이터 및 핀 고정 댓글 생성
"""

import os
import sys
import json
from datetime import datetime
from typing import List, Dict, Any

# UTF-8 출력 보장
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(FACTORY_DIR, "data")
CONFIG_DIR = os.path.join(FACTORY_DIR, "config")


class ParvogelContentFormatter:
    """8대 채널별 맞춤형 포맷팅 및 트래픽 유도 링크 주입기"""

    def __init__(self):
        self.config = self._load_json(os.path.join(CONFIG_DIR, "channels_config.json"))
        self.keywords = self._load_json(os.path.join(DATA_DIR, "keywords_seo.json"))
        
        self.landing_base = self.config.get("site_landing_url", "https://parvogel.kr/")
        self.smartstore_base = self.config.get("smartstore_url", "https://smartstore.naver.com/petschury/products/13718496355")
        self.coupang_base = self.config.get("coupang_url", "https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090")

    def _load_json(self, path: str) -> Dict[str, Any]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def _build_utm_links(self, channel: str) -> Dict[str, str]:
        """채널별 UTM 추적 파라미터가 결합된 구매 링크 생성"""
        ch_lower = channel.lower().replace(" ", "_").replace("(", "").replace(")", "")
        return {
            "landing": f"{self.landing_base}?utm_source={ch_lower}&utm_medium=auto_factory&utm_campaign=parvogel",
            "smartstore": f"{self.smartstore_base}&utm_source={ch_lower}&utm_medium=auto_factory&utm_campaign=parvogel",
            "coupang": f"{self.coupang_base}&utm_source={ch_lower}&utm_medium=auto_factory&utm_campaign=parvogel"
        }

    def format_all_channels(self, narrative: Dict[str, Any]) -> Dict[str, Any]:
        """모든 활성 채널 포맷 일괄 생성"""
        return {
            "Telegram": self._format_telegram(narrative),
            "Discord": self._format_discord(narrative),
            "Twitter_X": self._format_twitter(narrative),
            "Naver_Blog": self._format_naver_blog(narrative),
            "YouTube_Shorts": self._format_youtube_shorts(narrative),
            "Instagram_Reels": self._format_instagram_reels(narrative),
            "Facebook_Page": self._format_facebook_page(narrative),
            "TikTok": self._format_tiktok(narrative),
            "LinkedIn_B2B": self._format_linkedin(narrative),
            "Clinic_Cold_DM": self._format_cold_dm(narrative)
        }

    # Facebook 페이지 포맷팅
    def _format_facebook_page(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("facebook_page")
        tags = " ".join(self.keywords.get("hashtags", {}).get("b2c_general", [])[:6])
        text = f"""🐾 {n.get('headline')}

{n.get('subheadline')}

✅ 1초 원터치 펌프 급여: 주사기 거부하는 강아지도 스트레스 없이 안전 투약!
✅ 1-deoxinojirimycin 특허성분 + 천연 몬모릴로나이트 장 점막 실크 코팅
✅ 투약 3일 만에 그릇까지 싹싹 핥아먹는 기적의 식욕 회복!

📹 7일간의 무편집 진료실 회복 영상 확인: {links['landing']}
🚀 쿠팡 로켓배송 즉시 구매: {links['coupang']}
🟢 네이버 스마트스토어 구매: {links['smartstore']}

{tags}"""
        return {
            "title": n.get('headline', '파보겔 임상 케이스'),
            "caption": text,
            "text": text,
            "links": links
        }

    # TikTok 포맷팅
    def _format_tiktok(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("tiktok")
        tags = "#파보겔 #강아지설사 #파보장염 #새끼강아지 #동물병원 #shorts"
        title = f"{n.get('headline', '55일령 아기 강아지의 기적')} {tags}"[:150]
        return {
            "title": title,
            "links": links
        }

    # 1. 텔레그램 (실시간 공지)
    def _format_telegram(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("telegram")
        tags = " ".join(self.keywords.get("hashtags", {}).get("b2c_general", [])[:5])
        msg = f"""🚨 *[긴급 임상 속보]* {n.get('headline')}

💡 *쓰러진 55일령 강아지의 7일 회복 실화*
{n.get('subheadline')}

⚠️ *보호자가 반드시 알아야 할 골든타임:*
{n.get('pain_point')}

🛡️ *파보겔 핵심 치료 기전:*
• 1-deoxinojirimycin & 특허균주(Patent No. 2011B0042620.8)
• 초미세 몬모릴로나이트 장 점막 즉각 물리적 코팅
• 주사기 없이 원터치 펌프 1초 투약 (스트레스 0)

📹 *실제 7일 무편집 직캠 확인:*
{links['landing']}#parvogel-clinical-doc

🛒 *공식 직영 구매처 (익일 특급 수령):*
🟢 네이버 스마트스토어: {links['smartstore']}
🚀 쿠팡 로켓배송: {links['coupang']}

{tags}
"""
        return {"content": msg.strip(), "links": links}

    # 2. 디스코드 (웹훅 임베드용)
    def _format_discord(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("discord")
        return {
            "title": f"🩺 {n.get('headline')}",
            "description": f"**{n.get('subheadline')}**\n\n{n.get('video_highlight')}",
            "fields": [
                {"name": "⚠️ 위급 증상", "value": n.get('pain_point')[:200], "inline": False},
                {"name": "🔬 임상 솔루션", "value": n.get('clinical_solution')[:200], "inline": False},
                {"name": "🛒 즉시 구매처", "value": f"[네이버 스마트스토어]({links['smartstore']}) | [쿠팡 로켓배송]({links['coupang']})", "inline": False}
            ],
            "color": 0x3b82f6, # Blue
            "url": links["landing"],
            "links": links
        }

    # 3. 트위터 / X (스레드)
    def _format_twitter(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("twitter")
        tags = " #파보겔 #강아지설사 #파보장염 #쿠팡로켓배송"
        
        tweet1 = f"""🚨 {n.get('headline')}

급성 장염과 탈진으로 쓰러진 55일령 아기 강아지. 가루약과 주사기를 거부할 때 보호자의 가슴은 무너집니다.

7일 만에 기적처럼 스스로 일어선 진료실 실화 직캠을 공개합니다. 👇 (1/3)"""

        tweet2 = f"""💡 주사기 없이 입가에 대고 1초 펌프 누르면 꿀꺽!

• 1-deoxinojirimycin + Patent No. 2011B0042620.8
• 초미세 몬모릴로나이트의 장 점막 실크 코팅
• 3일 만에 밥그릇까지 싹싹 핥아먹는 기적의 식욕 폭발! 👇 (2/3)"""

        tweet3 = f"""📹 55일령 아기 푸들의 7일간 무편집 회복 영상 풀버전 확인:
{links['landing']}#parvogel-clinical-doc

🛒 쿠팡 로켓배송: {links['coupang']}
🟢 네이버 스마트스토어: {links['smartstore']}
{tags} (3/3)"""

        return {
            "thread": [tweet1, tweet2, tweet3],
            "first_tweet": tweet1,
            "links": links
        }

    # 4. 네이버 블로그 (SEO 장문 포스팅)
    def _format_naver_blog(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("naver_blog")
        keywords_str = ", ".join(self.keywords.get("search_intent_groups", {}).get("emergency_care", [])[:5])
        
        post_content = f"""# {n.get('headline')}

안녕하세요, 반려동물 건강 수호 파트너입니다.
오늘은 생후 55일령 초소형 아기 강아지(0.6kg)가 급성 장염과 전신 발작 증세로 동물병원에 긴급 내원하여, 단 7일 만에 기적처럼 완치되어 네 발로 뛰어 퇴원한 실제 임상 치료 사례를 공유해 드립니다.

---

## 1. 아기 강아지 급성 설사·파보 의심 증상과 골든타임
{n.get('pain_point')}
특히 2~3개월령의 어린 자견은 체중이 적고 면역계가 완성되지 않아, 몇 시간의 설사만으로도 급속한 탈수와 저혈당 쇼크로 이어질 수 있습니다.

> **김동준 원장님의 임상 소견:**
> "내원 당시 환축은 옆으로 쓰러져 전신 경련(Seizure)을 보이며 안락사까지 고려해야 할 만큼 극도로 위험한 상태였습니다. 무엇보다 스트레스 없이 빠르게 장 점막을 안정시키는 긴급 조치가 절실했습니다."

[사진/영상 배치 지점 1: 김동준 원장 진료실 초진 발작 영상]

---

## 2. 주사기 스트레스 ZERO! 1초 원터치 펌프 급여의 혁신
아픈 강아지에게 강제로 주사기를 들이대거나 쓴 가루약을 물에 타서 먹이려다 기도로 넘어가 오연성 폐렴이 오는 경우가 빈번합니다.
**파보겔(Parvo Gel)**은 펌프형 용기로 설계되어, 주사기나 바늘 없이 입가에 살짝 대고 한 번만 누르면 1초 만에 안전하게 투약됩니다.

[사진/영상 배치 지점 2: 파보겔 실물 펌핑 장면 및 패키지 실사]

---

## 3. 파보겔의 과학적 메커니즘: 1-deoxinojirimycin & 특허균주
{n.get('clinical_solution')}
- **정식등록 보조사료**: 법적으로 엄격한 사료 성분등록을 마쳐 안심하고 급여할 수 있습니다.
- **1-deoxinojirimycin (DNJ)**: 바이러스 당단백질 복제 차단 및 세포 보호.
- **Patent No. 2011B0042620.8 특허균주**: 장내 미생물총 급속 정상화.
- **초미세 천연 몬모릴로나이트**: 짓무른 장 점막에 물리적 코팅막을 형성하여 독소 흡착 배출.

---

## 4. 3일 차 기적의 캔사료 폭풍 완식 & 7일 차 당당한 퇴원
투약 3일 만에 곡기를 끊었던 환축이 밥그릇에 머리를 박고 싹싹 핥아먹는 기적 같은 식욕 폭발을 보여주었습니다! 
그리고 7일 차, 네 발로 당당하게 걸으며 꼬리를 치고 최종 완치 퇴원 판정을 받았습니다.

[사진/영상 배치 지점 3: 55일령 아기 강아지의 폭풍 완식 먹방 영상]

---

## 5. 파보겔 공식 구매 안내 (익일 도착 보장)
우리 아이의 골든타임을 지키는 가장 빠른 방법:
- 🚀 **쿠팡 로켓배송 즉시 구매**: {links['coupang']}
- 🟢 **네이버 스마트스토어(펫츄리) 즉시 구매**: {links['smartstore']}
- 📹 **7일간 무편집 진료실 직캠 풀영상 확인**: {links['landing']}

*연관 검색어: {keywords_str}*
"""
        return {
            "title": n.get('headline'),
            "body": post_content.strip(),
            "links": links
        }

    # 5. 유튜브 쇼츠 메타데이터
    def _format_youtube_shorts(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("youtube_shorts")
        title = n.get('headline', '안락사 위기 0.6kg 아기 강아지가 7일 만에 일어선 기적')[:100]
        description = f"""쓰러진 55일령 강아지의 기적의 7일 회복 실화 직캠!
주사기 없이 1초 펌프로 입안에 꿀꺽!

📹 풀영상 & 임상 일지 확인: {links['landing']}
🚀 쿠팡 로켓배송: {links['coupang']}
🟢 네이버 스마트스토어: {links['smartstore']}

#파보겔 #강아지설사 #파보장염 #토이푸들 #새끼강아지 #shorts #동물병원"""
        return {
            "title": title,
            "description": description[:5000],
            "pinned_comment": f"우리 아기 강아지 급성 장염 골든타임 파보겔 1초 케어! 쿠팡 로켓배송으로 내일 아침 도착: {links['coupang']}",
            "tags": ["파보겔", "강아지설사", "파보장염", "토이푸들", "새끼강아지", "shorts", "동물병원"],
            "links": links
        }

    # 6. 인스타그램 릴스
    def _format_instagram_reels(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("instagram_reels")
        tags = " ".join(self.keywords.get("hashtags", {}).get("b2c_general", []) + self.keywords.get("hashtags", {}).get("b2c_story", []))
        caption = f"""옆으로 쓰러져 발작하던 55일령 아기 강아지.. 
김동준 원장님의 7일간의 진료실 직캠 기록 📹

주사기 들이대면 거품 물고 거부하는데, 
파보겔은 입가에 대고 1초 펌프 누르니까 꿀꺽 삼키네요!

투약 3일 차에 캔사료를 그릇까지 싹싹 핥아먹더니 
7일 만에 네 발로 씩씩하게 걸어서 완치 퇴원했습니다 🐾

프로필 링크에서 7일간 무편집 원본 직캠을 확인하세요! 
👉 @parvogel_official

구매처 안내:
🚀 쿠팡 로켓배송 / 🟢 네이버 스마트스토어 (펫츄리)

.
.
.
{tags}
"""
        return {"caption": caption.strip(), "links": links}

    # 7. 링크드인 (수의학 B2B)
    def _format_linkedin(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("linkedin_b2b")
        text = f"""[Clinical Case Study: Canine Acute Enteritis & Seizure Recovery]

Subject: 55-day-old male Toy Poodle (0.6 kg)
Presenting Condition: Severe hemorrhagic enteritis, endotoxin shock, and generalized seizures.
Clinical Observation by Dr. Dong-jun Kim (Hanam Sarang Animal Hospital).

Therapeutic Protocol:
- Oral administration of Parvo Gel (Parvogel) via one-touch pump.
- Key Actives: 1-deoxinojirimycin (DNJ), Bacillus subtilis MORI (Patent No. 2011B0042620.8), and ultra-fine Montmorillonite mucosal protectant.

Key Outcomes:
1. Cessation of generalized seizures and neurological stabilization within 48h.
2. Complete restoration of appetite (full meal consumption) on Day 3 post-administration.
3. Full quadrupedal weight-bearing ambulation and discharge clearance on Day 7.

Learn more about Parvo Gel veterinary formulation & clinical data:
{links['landing']}

#VeterinaryMedicine #CanineEnteritis #Parvovirus #ClinicalCase #AnimalHealth #ParvoGel"""
        return {"content": text.strip(), "links": links}

    # 8. 전국 동물병원 / 유통대리점 콜드 DM
    def _format_cold_dm(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("clinic_dm")
        letter = f"""원장님 안녕하십니까, 한국아그로 수의사업부입니다.

최근 어린 환축들의 급성 장염 및 파보 바이러스 치료 시, 극심한 투약 스트레스와 가루약 거부로 처방에 애로를 겪으시는 원장님들이 많으십니다.

하남 사랑동물병원 김동준 원장님께서 전신 발작 증세를 보인 55일령 푸들 환축에게 주사기 없이 [파보겔 1초 원터치 펌프]로 처치하여, 단 7일 만에 완치 퇴원시킨 실제 무편집 진료실 임상 직캠을 원장님께 공유해 드리고자 합니다.

🔬 [학술 및 성분 데이터]:
- 1-deoxinojirimycin (DNJ) + Patent No. 2011B0042620.8 (Bacillus subtilis MORI)
- 초미세 몬모릴로나이트 장 점막 물리적 보호막 코팅
- 정식등록 보조사료

📹 김동준 원장님 7일간의 무편집 직캠 아카이브:
{links['landing']}#parvogel-clinical-doc

병원 내 샘플 신청이나 공급 단가 문의를 원하시면 본 메시지에 회신 주시거나 담당자 번호로 연락 부탁드립니다.
감사합니다.

한국아그로 수의헬스케어팀 배상"""
        return {"content": letter.strip(), "links": links}


if __name__ == "__main__":
    formatter = ParvogelContentFormatter()
    sample_narrative = {
        "headline": "새벽에 아기 강아지가 피똥 싸고 쓰러졌을 때: 골든타임 72시간 대처법",
        "subheadline": "쓰러진 55일령 강아지의 기적의 7일 회복 실화 — 1초 펌프로 입안에 꿀꺽!",
        "pain_point": "급성 장염과 탈진으로 쓰러진 아기 강아지, 가루약을 억지로 먹이다 거품을 물 때 보호자의 가슴은 무너집니다.",
        "clinical_solution": "파보겔은 1-deoxinojirimycin과 특허균주(Patent No. 2011B0042620.8) 성분이 무너진 장 점막을 즉시 코팅합니다.",
        "video_highlight": "김동준 원장님 직캠 속 주사기 없이 한 손 펌핑으로 꿀꺽 삼키는 감동의 순간.",
        "cta_text": "네이버 스마트스토어 및 쿠팡 로켓배송으로 내일 아침 즉시 받아보세요."
    }
    res = formatter.format_all_channels(sample_narrative)
    print("Formatted channels:", list(res.keys()))
    print("\n--- SAMPLE TELEGRAM ---")
    print(res["Telegram"]["content"][:300])
