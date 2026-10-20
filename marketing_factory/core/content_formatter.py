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
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

try:
    from .humanizer_engine import BlogHumanizer
except (ImportError, ValueError):
    from core.humanizer_engine import BlogHumanizer


class ParvogelContentFormatter:
    """8대 채널별 맞춤형 포맷팅 및 트래픽 유도 링크 주입기"""

    def __init__(self):
        self.config = self._load_json(os.path.join(CONFIG_DIR, "channels_config.json"))
        self.keywords = self._load_json(os.path.join(DATA_DIR, "keywords_seo.json"))
        self.papers_data = self._load_json(os.path.join(DATA_DIR, "scientific_papers.json"))
        
        self.landing_base = self.config.get("site_landing_url", "https://parvogel.kr/")
        self.smartstore_base = self.config.get("smartstore_url", "https://smartstore.naver.com/petschury/products/13718496355")
        self.coupang_base = self.config.get("coupang_url", "https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090")

    def _load_json(self, path: str) -> Dict[str, Any]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def _build_utm_links(self, channel: str, theme_id: str = "daily") -> Dict[str, str]:
        """채널별·테마별 UTM 추적 파라미터가 결합된 구매 및 B2B 무료샘플 링크 생성"""
        from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
        ch_lower = channel.lower().replace(" ", "_").replace("(", "").replace(")", "")
        def _append(base: str, extra: Dict[str, str] = None) -> str:
            parsed = urlparse(base)
            qs = dict(parse_qsl(parsed.query))
            qs.update({
                "utm_source": ch_lower,
                "utm_medium": "auto_factory",
                "utm_campaign": "parvogel_2040_d2c",
                "utm_content": theme_id or "daily"
            })
            if extra:
                qs.update(extra)
            new_q = urlencode(qs)
            return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_q, parsed.fragment))
        return {
            "landing": _append(self.landing_base),
            "smartstore": _append(self.smartstore_base),
            "coupang": _append(self.coupang_base),
            "b2b_sample": _append(self.landing_base, {"sample": "petshop"}),
            "b2b_breeder": _append(self.landing_base, {"sample": "breeder"}),
            "b2b_wholesale": _append(self.landing_base, {"sample": "b2b"})
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
        links = self._build_utm_links("facebook_page", n.get("theme_id", "daily"))
        tags = " ".join(self.keywords.get("hashtags", {}).get("b2c_general", [])[:6])
        text = f"""🐾 {n.get('headline')}

{n.get('subheadline')}

✅ 1초 원터치 펌프 급여: 주사기 거부하는 아이도 스트레스 없이 안전 케어!
✅ 1-deoxinojirimycin 특허성분 + 천연 몬모릴로나이트 장 점막 실크 코팅
✅ 급여 3일 만에 그릇까지 싹싹 핥아먹는 기적의 식욕 회복!

📹 7일간의 무편집 회복 영상 & 무료 샘플 안내: {links['landing']}
🚀 쿠팡 로켓배송 즉시 구매: {links['coupang']}
🟢 네이버 스마트스토어 구매: {links['smartstore']}

{tags}"""
        return {
            "title": n.get('headline', '파보겔 1초 펌프 장 케어'),
            "caption": text,
            "text": text,
            "links": links
        }

    # TikTok 포맷팅
    def _format_tiktok(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("tiktok", n.get("theme_id", "daily"))
        tags = "#파보겔 #강아지설사 #고양이설사 #새끼강아지 #반려동물상비약 #shorts"
        title = f"{n.get('headline', '55일령 아기 강아지의 기적')} {tags}"[:150]
        return {
            "title": title,
            "links": links
        }

    # 1. 텔레그램 (실시간 공지)
    def _format_telegram(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("telegram", n.get("theme_id", "daily"))
        # 텔레그램 봇 API의 특정 오픈마켓 도메인 스팸필터(PEER_FLOOD) 회피를 위해 공식 랜딩 구매 안내 링크 사용
        telegram_coupang_link = f"{self.landing_base}?target=coupang&utm_source=telegram&utm_medium=auto_factory&utm_campaign=parvogel_2040_d2c"
        tags = " ".join(self.keywords.get("hashtags", {}).get("b2c_general", [])[:5])
        msg = f"""🚨 *[긴급 케어 속보]* {n.get('headline')}

💡 *{n.get('badge', '파보겔 1초 펌프 장 케어')}*
{n.get('subheadline')}

⚠️ *보호자가 반드시 알아야 할 골든타임:*
{n.get('pain_point')}

🛡️ *파보겔 핵심 케어 기전:*
• 1-deoxinojirimycin & 특허균주(Patent No. 2011B0042620.8)
• 초미세 몬모릴로나이트 장 점막 즉각 물리적 코팅 (체내 흡수 0%)
• 주사기 없이 원터치 펌프 1초 급여 (스트레스 0)

📹 *실제 7일 무편집 직캠 & 펫샵/브리더 무료샘플 확인:*
{links['landing']}

🛒 *공식 직영 구매처 (익일 특급 수령):*
🟢 네이버 스마트스토어: {links['smartstore']}
🚀 쿠팡 로켓배송: {telegram_coupang_link}

{tags}
"""
        return {"content": msg.strip(), "links": links}

    # 2. 디스코드 (웹훅 임베드용)
    def _format_discord(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("discord", n.get("theme_id", "daily"))
        return {
            "title": f"🐾 {n.get('headline')}",
            "description": f"**{n.get('subheadline')}**\n\n{n.get('video_highlight')}",
            "fields": [
                {"name": "⚠️ 위급 증상 & 고민", "value": n.get('pain_point')[:200], "inline": False},
                {"name": "🔬 1초 펌프 솔루션", "value": n.get('clinical_solution')[:200], "inline": False},
                {"name": "🛒 즉시 구매 & 무료샘플", "value": f"[네이버 스마트스토어]({links['smartstore']}) | [쿠팡 로켓배송]({links['coupang']}) | [펫샵·브리더 무료샘플]({links['b2b_sample']})", "inline": False}
            ],
            "color": 0x10b981,
            "url": links["landing"],
            "links": links
        }

    # 3. 트위터 / X (스레드)
    def _format_twitter(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("twitter", n.get("theme_id", "daily"))
        tags = " #파보겔 #강아지설사 #고양이설사 #쿠팡로켓배송"
        
        tweet1 = f"""🚨 {n.get('headline')}

{n.get('pain_point', '')[:110]}...

주사기 실랑이 없이 1초 만에 해결하는 홈 케어 비결을 공개합니다. 👇 (1/3)"""

        tweet2 = f"""💡 주사기 없이 입가에 대고 1초 펌프 누르면 꿀꺽!

• 1-deoxinojirimycin + Patent No. 2011B0042620.8
• 초미세 몬모릴로나이트의 장 점막 실크 코팅 (체내 흡수 0%)
• 급여 3일 만에 밥그릇까지 싹싹 핥아먹는 기적의 식욕 회복! 👇 (2/3)"""

        tweet3 = f"""📹 55일령 아기 푸들의 7일간 무편집 회복 영상 & 펫샵/브리더 무료샘플 확인:
{links['landing']}

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
        links = self._build_utm_links("naver_blog", n.get("theme_id", "daily"))
        keywords_str = ", ".join(self.keywords.get("search_intent_groups", {}).get("emergency_care", [])[:5])
        
        badge = n.get('badge', '✨ 7일간의 기적 회복 실화')
        l1 = n.get('line1', '설사·혈변으로 곡기 끊겨 쓰러졌던 아이')
        l2 = n.get('line2', '단 3일 만에 밥그릇 싹싹 비워내고')
        l3 = n.get('line3', '다시 건강하게 네 발로 서서 꼬리 칩니다')

        post_content = f"""# [{badge}] {n.get('headline')}

안녕하세요, 반려동물 건강 수호 파트너 파보겔(ParvoGel)입니다.
오늘은 **{l1}**, **{l2}**, **{l3}** 핵심 케어 가이드를 전해드립니다.

{n.get('subheadline')}

---

## 1. 반려동물 급성 설사·장트러블 골든타임과 보호자의 고민
{n.get('pain_point')}
특히 어린 강아지·고양이나 소형 반려조는 체중이 적고 수분 보유량이 낮아, 몇 시간의 물설사만으로도 급속한 탈수와 기력 저하로 이어질 수 있습니다.

> **실제 55일령 토이푸들(0.6kg) 7일 회복 관찰 기록:**
> "옆으로 쓰러져 기력을 잃었던 초소형 아기 강아지가 주사기 스트레스 없이 파보겔 1초 펌프 급여만으로 48시간 내 안정을 되찾고, 3일 차에 캔사료를 싹싹 비워낸 뒤 7일 차에 건강하게 네 발로 뛰었습니다."

[사진/영상 배치 지점 1: 55일령 아기 강아지 초진 및 회복 비교 영상]

---

## 2. 주사기 스트레스 ZERO! 1초 원터치 펌프 급여의 혁신
아픈 아이에게 강제로 주사기를 들이대거나 쓴 가루약을 물에 타서 먹이려다 거품을 물고 토해내는 경우가 빈번합니다.
**파보겔(ParvoGel)**은 에어리스 오일펌프 용기로 설계되어, 주사기나 바늘 없이 입가에 살짝 대고 한 번만 톡 누르면 1초 만에 맛있게 핥아먹습니다.

[사진/영상 배치 지점 2: 파보겔 실물 펌핑 장면 및 패키지 실사]

---

## 3. 파보겔의 과학적 메커니즘: 체내 흡수 0% 나노 클레이 & 특허균주
{n.get('clinical_solution')}
- **정식등록 보조사료**: 엄격한 사료 성분등록을 마쳐 어린 자견·자묘부터 노령견까지 안심하고 급여할 수 있습니다.
- **1-deoxinojirimycin (DNJ)**: 장내 유해 인자 결합 및 세포 보호.
- **Patent No. 2011B0042620.8 특허균주**: 장내 유익 미생물총 급속 밸런스 케어.
- **초미세 천연 몬모릴로나이트**: 혈관이나 간·신장으로 흡수되지 않고(체내 흡수율 0%), 장 점막에 실크 코팅막을 형성하여 유해 독소와 수분을 흡착해 단단한 황금변으로 배출합니다.

---

## 4. 3일 차 기적의 폭풍 완식 & 7일 차 건강한 일상 복귀
{n.get('video_highlight')}

[사진/영상 배치 지점 3: 55일령 아기 강아지의 폭풍 완식 먹방 영상]

---

## 5. 파보겔 공식 온라인몰 & 펫샵·브리더 무료 샘플 안내
우리 아이의 골든타임을 지키는 가장 빠른 방법:
- 🚀 **쿠팡 로켓배송 즉시 구매**: {links['coupang']}
- 🟢 **네이버 스마트스토어(펫츄리) 즉시 구매**: {links['smartstore']}
- 📹 **7일간 무편집 회복 직캠 풀영상 확인**: {links['landing']}
- 🎁 **인허가 펫샵·브리더 본품 1병 무료 샘플 신청**: {links['b2b_sample']}

*연관 검색어: {keywords_str}*
"""
        raw_draft = {
            "title": n.get('headline'),
            "body": post_content.strip(),
            "links": links
        }

        # 수의학 학술 논문 및 공인 특허 인용 리스트 추출
        citations = []
        if self.papers_data and "papers" in self.papers_data:
            for p in self.papers_data.get("papers", []):
                fmt = p.get("blog_citation_format")
                if fmt:
                    citations.append(fmt)

        # AI 티 제거 및 학술 근거 주입 휴머나이징 적용
        return BlogHumanizer.enhance_naver_draft(raw_draft, paper_citations=citations)

    # 5. 유튜브 쇼츠 메타데이터
    def _format_youtube_shorts(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("youtube_shorts", n.get("theme_id", "daily"))
        title = n.get('headline', '0.6kg 아기 강아지가 7일 만에 일어선 기적')[:100]
        description = f"""{n.get('subheadline', '쓰러진 55일령 강아지의 기적의 7일 회복 실화 직캠!')}
주사기 없이 1초 펌프로 입안에 꿀꺽!

📹 풀영상 & 펫샵/브리더 무료샘플 확인: {links['landing']}
🚀 쿠팡 로켓배송: {links['coupang']}
🟢 네이버 스마트스토어: {links['smartstore']}

#파보겔 #강아지설사 #고양이설사 #토이푸들 #새끼강아지 #shorts #반려동물상비약"""
        return {
            "title": title,
            "description": description[:5000],
            "pinned_comment": f"우리 아이 급성 물설사 골든타임 파보겔 1초 케어! 쿠팡 로켓배송으로 내일 아침 도착: {links['coupang']} | 펫샵·브리더 1병 무료샘플: {links['b2b_sample']}",
            "tags": ["파보겔", "강아지설사", "고양이설사", "토이푸들", "새끼강아지", "shorts", "반려동물상비약"],
            "links": links
        }

    # 6. 인스타그램 릴스
    def _format_instagram_reels(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("instagram_reels", n.get("theme_id", "daily"))
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

    # 8. 전국 인허가 펫샵 · 전문 브리더(켄넬) B2B 모바일 메시지 (LMS / 카카오 알림톡 최적화)
    def _format_cold_dm(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("petshop_breeder_b2b", n.get("theme_id", "b2b"))
        badge = n.get('badge', '🏢 펫샵 · 브리더 파트너 라운지')
        l1 = n.get('line1', '분양 직후·이유기 아기 강아지 설사 비상!')
        l2 = n.get('line2', '견사와 매장에 상비하는 1초 펌프 장 케어')
        l3 = n.get('line3', '인허가 사업자 본품 1병 무료 샘플 지원')

        letter = f"""[펫샵·브리더 대표님 전용] 아기 강아지·고양이 1초 펌프 장 케어 '파보겔' 본품 1병 무료 샘플 지원 안내

대표님 안녕하십니까, (주)한국아그로 파보겔 B2B 파트너팀입니다.

이유식 전환기나 분양 직후 낯선 환경 스트레스로 발생하는 아기 강아지·고양이의 급성 물설사·장염 케어를 위해, 주사기 실랑이 없이 입가에 1초 톡 짜주면 스스로 핥아먹는 [파보겔(ParvoGel)] 정품 1병 무료 체험 캠페인을 진행하고 있습니다.

📌 [{badge}]
- {l1}
- {l2}
- {l3}

💡 [전국 펫샵·켄넬 대표님들이 파보겔을 선택하신 이유]:
1. [주사기 스트레스 ZERO]: 가루약 거품 토해냄 없이 오일펌프로 1초 만에 급여 완료!
2. [체내 흡수 0% 안전성]: 생후 30일령 초소형 자견·자묘도 간·신장 부담 없이 안심 급여
3. [과학적 특허 조성물]: 1-deoxinojirimycin(DNJ) + 특허 제2011B0042620.8호 유익균 + 초미세 나노 몬모릴로나이트
4. [매장 홍보물 100% 무상 지원]: 상호명·연락처가 인쇄된 A4 알림판 및 하드 폼보드 POP 쇼카드 무료 발송

🎁 [인허가 펫샵·브리더 본품 1병 무료 샘플 즉시 신청]:
👉 {links['b2b_sample']}

📦 [기존 샘플 수령 거래처 VIP 도매 발주 (10병/50병 특가)]:
👉 {links['b2b_wholesale']}

고객센터: 02-6949-5708 / 010-5407-5708
(주)한국아그로 파보겔 파트너팀 드림"""
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
