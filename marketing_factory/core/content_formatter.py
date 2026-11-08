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

try:
    from .threads_generator import ThreadsContentGenerator
except (ImportError, ValueError):
    from core.threads_generator import ThreadsContentGenerator


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
            "Threads": self._format_threads(narrative),
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

    # Threads(스레드) 포맷팅 — 링크 없는 본문 + 90초 지연 첫댓글 전환 타래
    def _format_threads(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("threads", n.get("theme_id", "daily"))
        try:
            gen = ThreadsContentGenerator()
            thread_data = gen.generate_single_thread()
            if thread_data:
                thread_data["links"] = links
                return thread_data
        except Exception:
            pass

        headline = n.get("headline", "새끼 강아지 설사한다고 무작정 굶기는 집사들, 제발 멈춰라.")
        main_post = f"""{headline}

성견이야 반나절 금식이 장을 쉬게 해줄 수 있지만, 2~3개월 새끼나 소형견은 12시간만 굶어도 저혈당 쇼크로 위험해질 수 있습니다.

장벽을 부드럽게 코팅해주면서 전해질과 장내 독소만 물리적으로 흡착 배출해주는 상비 케어가 필수입니다.

월령별 안심 금식 가이드와 응급 상비 정보는 아래 첫 댓글에 남겨둘게요."""

        first_comment = f"""DM 문의가 많아서 바로 보실 수 있게 남겨둡니다.

간·신장 부담 없이 전해질 보충과 장 점막 보호를 돕는 초미세 나노 몬모릴로나이트 겔(파보겔)입니다.

👉 파보겔 공식 스토어: {links['smartstore']}
(아이 체온이 떨어지거나 기립이 어려우면 지체 없이 응급 병원으로 가셔야 합니다.)"""

        return {
            "content_id": f"thread_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "main_post": main_post.strip(),
            "first_comment": first_comment.strip(),
            "delay_seconds": 90,
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

    # 4. 네이버 블로그 (C-Rank / D.I.A.+ / GEO AI브리핑 최적화 5단계 전문 포스팅)
    def _format_naver_blog(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("naver_blog", n.get("theme_id", "daily"))
        
        # 요일별 동적 GEO 키워드 및 토픽 연동
        geo_keyword = n.get("geo_keyword", "강아지 파보 장염 초기증상")
        geo_topic = n.get("geo_topic", "급성 설사 대처 및 파보겔을 활용한 장 점막 보호 관리")
        sub_keywords = n.get("sub_keywords", ["강아지 설사", "파보겔", "몬모릴로나이트"])
        all_keywords = list(dict.fromkeys([geo_keyword] + sub_keywords + self.keywords.get("search_intent_groups", {}).get("emergency_care", [])[:3]))
        keywords_str = ", ".join(all_keywords[:6])

        badge = n.get('badge', '임상 수의학 리포트')
        headline = n.get('headline', f"{geo_keyword}: {geo_topic}")
        title = f"[{badge}] {geo_keyword}: {geo_topic}"
        pain_point = n.get('pain_point', f'{geo_keyword} 상황에서 갑작스러운 수양성 설사와 기력 저하로 보호자의 불안감이 극에 달하는 순간입니다.')
        clinical_solution = n.get('clinical_solution', '초미세 나노 몬모릴로나이트와 특허균주 복합체가 장 점막을 즉시 물리적으로 실크 코팅합니다.')

        theme_id = n.get("theme_id", "dog_emergency_2040")
        if theme_id == "bird_parrot_special":
            species_label = "앵무새·반려조"
            case_journal_block = """> 📅 **[실제 반려조 앵무새 '꼬미' 24시간 배변 회복 관찰 일지]:**
> - **급여 직전:** 급성 수양성 물변으로 바닥 휴지가 흥건히 젖고 깃털을 부풀린 채 횃대에서 기력 저하 (낙조 위기)
> - **부리 끝 1방울 급여:** 기도 질식 위험이 있는 강제 주사기 대신 부리 끝에 파보겔 1방울(약 0.1~0.2ml) 도포 및 음수 희석
> - **24시간 경과:** 수양성 물변이 멈추고 초록빛 단단한 변 알맹이와 하얀 정상 요산이 선명하게 분리되며 모이 섭취 완전 회복"""
        elif theme_id == "cat_stress_free_2040":
            species_label = "예민한 고양이·다묘 가정"
            case_journal_block = """> 📅 **[실제 사료 교체기 무른 변 & 헤어볼 구토 반려묘 회복 관찰 일지]:**
> - **1일 차:** 헤어볼 구토 후 공복 노란 위산 토와 무른 변 반복, 가루약 급여 시 극심한 거품 침 흘림 거부
> - **1초 펌프 급여:** 주사기 없이 파보겔 1펌프를 입가와 앞발에 살짝 묻혀주자 그루밍하며 스트레스 없이 자가 완식
> - **3일 차:** 위산(pH 2.0 → pH 4.5~5.5) 완충으로 구토 반사 진정 및 맛동산(정상 변 Type 3~4) 회복"""
        else:
            species_label = "어린 강아지·소형견"
            case_journal_block = """> 📅 **[실제 55일령 토이푸들(0.6kg) 회복 관찰 일지]:**
> - **1일 차:** 기립 불능, 수양성 설사 -> 파보겔 1초 펌프 급여 후 탈수 방지 안정화
> - **3일 차:** 복통 경감, 구토 반사 멈춤, 캔사료 밥그릇 싹싹 비워내며 기력 회복
> - **7일 차:** 단단한 정상 황금변 형성, 네 발로 활발히 보행하며 퇴원 판정"""

        post_content = f"""# {title}

{n.get('subheadline', f'동물병원 응급 내원 전 보호자가 반드시 확인해야 할 {geo_keyword} 골든타임 응급처치 수칙')}

---

## 1. {geo_keyword} 발생 시 즉시 체크해야 할 3대 위험 신호
**{geo_keyword} 상황에서 가장 먼저 무엇을 확인해야 할까요?** 단순 식이성 트러블과 응급 장염을 구분하는 기준은 '탈수 속도와 활력'이며, 보호자는 즉시 생체 징후를 체크해야 합니다.

{pain_point}
{species_label}의 경우 체내 수분 보유량이 적어 단 몇 시간의 수양성 설사(Bristol Stool Scale Type 7)만으로도 치명적인 순환 혈액량 감소를 겪을 수 있습니다.

> 🩺 **[가정 내 1분 자가진단 3대 체크포인트]:**
> 1. **탈수 및 탄력도 검사:** 피부 텐팅(등덜미 피부 원복 속도) 또는 배변 주변 수분 소실량이 급격히 늘어났다면 중등도 이상의 탈수 상태입니다.
> 2. **점막 색 & 순환 확인:** 잇몸이나 부리·발바닥 색이 창백해지고 말초 순환이 느려진다면 즉각적인 보온과 점막 보호가 필요합니다.
> 3. **체온 유지 확인:** 귀나 발끝이 차가워지는 저체온 징후가 나타나면 담요와 보온등으로 체온을 먼저 확보해야 합니다.

[사진/영상 배치 지점 1: {n.get('focus_scene', '진료실 및 가정 내 응급 케어 실사')}]

---

## 2. 수의학적 병태생리: 융모(Villi) 손상과 단순 금식·강제 투약의 위험
**설사한다고 무작정 굶기거나 쓴 가루약을 억지로 밀어 넣는 것이 안전할까요?** 체구가 작은 {species_label}는 장기간 금식 시 장 융모 위축과 치명적인 저혈당 쇼크를 유발할 수 있습니다.

병원성 세균 독소나 바이러스는 장 상피세포의 융모(Villi)를 공격하여 점막 장벽을 무너뜨립니다. 이로 인해 장관 내 삼투압이 깨지며 수양성 설사가 발생합니다.

- **단순 맹물 급여의 위험:** 장 상피세포가 손상된 상태에서 맹물만 과도하게 급여하면 삼투성 설사가 악화될 수 있습니다.
- **강제 주사기 투약 스트레스:** 구토 반사가 올라오거나 예민한 아이에게 쓴 가루약을 주사기로 강제 주입하면 기도 흡인 위험과 극심한 거품 구토 쇼크가 발생할 수 있습니다.

---

## 3. 파보겔(ParvoGel)의 과학적 작용 메커니즘과 체중별 급여 기준표
**파보겔은 화학 지사제와 무엇이 다르며 장을 어떻게 보호할까요?** 화학적으로 장 운동을 억지로 마비시키는 것이 아니라, 체내 흡수율 0%의 초미세 나노 몬모릴로나이트가 짓무른 장 점막에 물리적 실크 코팅막을 형성하여 독소와 바이러스 부산물만 자석처럼 흡착 배출합니다.

{clinical_solution}
- **체내 흡수 0%의 안전성:** 혈액이나 간·신장으로 대사되지 않고 장관 내에서만 물리적으로 작용한 뒤 변과 함께 100% 안전하게 배출됩니다.
- **1-deoxinojirimycin (DNJ) & Patent No. 2011B0042620.8 특허균주:** 장내 유해 세균 증식을 억제하고 장내 미생물총 정상화를 지원합니다.
- **1초 에어리스 오일펌프:** 쓴맛 없는 고기호성 겔 제형으로, 주사기 없이 입가나 부리 끝에 가볍게 도포해주면 스스로 핥아먹습니다.

### 📋 [파보겔 체중·축종별 1일 권장 급여량 기준표]
(1펌핑 = 약 2ml 기준)

| 반려동물 구분 / 체중 | 1일 권장 급여량 | 1회 권장 급여 방식 | 급여 팁 및 관리 요령 |
| :--- | :---: | :---: | :--- |
| **초소형견 (1kg 미만 ~ 3kg)** | 1 ~ 2 ml | 1회 (0.5 ~ 1펌프) | 입가에 톡 발라주거나 주둥이에 도포 |
| **소형견 (3kg ~ 5kg)** | 2 ~ 4 ml | 1 ~ 2회 펌핑 | 아침·저녁 1펌프씩 2회 분할 급여 |
| **중·대형견 (5kg ~ 15kg 이상)** | 4 ~ 8 ml | 2 ~ 4회 펌핑 | 체중 5kg당 2~4ml 비례 급여 |
| **고양이 (전 연령)** | 1 ~ 2 ml | 1회 펌핑 | 잇몸 또는 앞발에 살짝 묻혀주면 자가 완식 |
| **앵무새 · 반려조 (소형~중대형)** | 0.1 ~ 0.3 ml | 부리 끝 1~2방울 | 부리 끝에 톡 묻혀주거나 이유식·음수에 혼합 |

[사진/영상 배치 지점 2: 파보겔 실물 1초 펌핑 장면 및 축종별 급여 사진]

---

## 4. 임상 케이스 관찰 흐름 & 동물병원 응급 내원 골든타임
**파보겔 급여 후 분변 상태는 어떻게 회복되며, 언제 즉시 병원으로 달려가야 할까요?** 실제 관찰 케이스에서는 급여 24~48시간 내에 수양성 설사(Type 7)가 연변(Type 6)을 거쳐 빠르게 식욕을 회복하고 단단한 정상변(Type 3~4)으로 전환되는 흐름이 확인됩니다.

{case_journal_block}

🚨 **[즉시 24시 동물병원 응급실로 가야 하는 3대 레드 플래그]:**
1. **출혈성 구토 동반:** 설사뿐 아니라 커피색 또는 붉은 피를 연속으로 토하는 경우
2. **급격한 저체온증:** 사지나 발끝이 차갑게 식고 담요 보온에도 체온이 회복되지 않는 경우
3. **완전 기립 불능:** 불러도 반응이 없고 고개를 들지 못하는 탈진 상태

---

## 5. 💡 핵심 3줄 요약 (네이버 AI 브리핑 스니펫)
> 1. {geo_keyword} 대처 시 무작정 굶기면 저혈당 쇼크 위험이 있으므로, 탈수 징후를 체크하고 장 점막을 보호하는 응급 상비 대처가 필수적입니다.
> 2. 파보겔(ParvoGel)은 체내 흡수 0%의 초미세 나노 몬모릴로나이트 복합체로 장벽을 실크 코팅하고 유해 독소를 물리적으로 흡착 배출하는 1초 펌프 상비약입니다.
> 3. 출혈성 구토, 저체온, 기립 불능 등 3대 위험 신호가 동반될 경우 지체 없이 동물병원 응급 진료를 병행해야 합니다.

---

### 🏥 파보겔 공식 정보 및 상비 안내
- 🟢 **네이버 스마트스토어 공식몰**: {links['smartstore']}
- 🚀 **쿠팡 로켓배송 즉시 구매**: {links['coupang']}
- 📹 **실제 회복 직캠 & 학술 데이터 확인**: {links['landing']}
- 🏢 **전국 인허가 펫샵·브리더 본품 1병 무료 샘플 신청**: {links['b2b_sample']}

*연관 검색어 키워드: {keywords_str}*
"""
        raw_draft = {
            "title": title,
            "body": post_content.strip(),
            "links": links
        }

        # 수의학 학술 논문 및 공인 특허 인용 리스트 결합
        citations = []
        if self.papers_data and "papers" in self.papers_data:
            for p in self.papers_data.get("papers", []):
                fmt = p.get("blog_citation_format")
                if fmt:
                    citations.append(fmt)

        # AI 기계적 문체 제거 및 논문 출처 박스 결합
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

    # 6. 인스타그램 릴스 (요일별 테마 동적 반영)
    def _format_instagram_reels(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("instagram_reels", n.get("theme_id", "daily"))
        tags = " ".join(self.keywords.get("hashtags", {}).get("b2c_general", []) + self.keywords.get("hashtags", {}).get("b2c_story", []))
        headline = n.get("headline", "쓰러진 55일령 아기 강아지의 7일 회복 실화")
        subheadline = n.get("subheadline", "주사기 없이 입가에 대고 1초 펌프 누르면 꿀꺽!")
        pain_point = n.get("pain_point", "갑작스러운 구토와 물설사로 기력이 빠진 아이, 억지 주사기 투약 대신 1초 펌프로 안전하게 케어하세요.")
        video_hl = n.get("video_highlight", "투약 3일 차에 밥그릇까지 싹싹 핥아먹고 건강을 되찾은 리얼 직캠 기록")
        caption = f"""🐾 {headline}
{subheadline}

{pain_point}

✨ {video_hl}

프로필 링크에서 무편집 원본 직캠 및 무료 샘플 정보를 확인하세요! 
👉 @parvogel_official

구매처 안내:
🚀 쿠팡 로켓배송 / 🟢 네이버 스마트스토어 (펫츄리)

.
.
.
{tags}
"""
        return {"caption": caption.strip(), "links": links}

    # 7. 링크드인 (수의학 & B2B 동적 반영)
    def _format_linkedin(self, n: Dict[str, Any]) -> Dict[str, Any]:
        links = self._build_utm_links("linkedin_b2b", n.get("theme_id", "daily"))
        headline = n.get("headline", "Canine Acute Enteritis & Mucosal Protection Protocol")
        solution = n.get("clinical_solution", "1-deoxinojirimycin (DNJ), Bacillus subtilis MORI (Patent No. 2011B0042620.8), and ultra-fine nano-Montmorillonite mucosal protectant.")
        highlight = n.get("video_highlight", "Rapid stabilization of stool consistency and appetite recovery within 48-72 hours via zero-stress 1-second airless pump administration.")
        text = f"""[Veterinary Clinical & B2B Case Brief: {headline}]

Clinical Focus:
{n.get('subheadline', 'Non-absorbed physical mucosal coating and toxin adsorption protocol for companion animals.')}

Therapeutic Mechanism & Formulation:
- {solution}
- Field Observation: {highlight}

Learn more about Parvo Gel veterinary formulation, clinical data & B2B partner samples:
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
