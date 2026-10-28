# -*- coding: utf-8 -*-
"""
Parvogel Veterinary Content Generator (generator.py)
Generates high-converting 5-slide Instagram cards, 50s YouTube Shorts scripts,
and SEO Naver Blog articles based on clinical evidence from Dr. Kim Dong-jun (Online Animal Hospital).
"""

import os
import sys
import json
import yaml
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class ParvogelContentGenerator:
    def __init__(self, config_path="scripts/marketing_pipeline/config.yaml"):
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = yaml.safe_load(f)
        
        self.evidence = self.config.get("clinical_knowledge_base", {})
        self.topics = self.config.get("topics", [])
        self.output_dir = self.config.get("pipeline", {}).get("output_dir", "scripts/marketing_pipeline/output")
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_content_for_topic(self, topic):
        """Generates Instagram, Shorts, and Blog packages for a specific topic."""
        topic_id = topic.get("id")
        title = topic.get("title")
        category = topic.get("category")
        keywords = topic.get("keywords", [])
        
        # 1. Instagram 5-Slide Carousel Card
        insta_slides = self._build_instagram_slides(topic)
        
        # 2. YouTube Shorts 50-Second Script
        shorts_script = self._build_shorts_script(topic)
        
        # 3. Naver Blog In-Depth Column
        blog_column = self._build_blog_article(topic)
        
        package = {
            "metadata": {
                "topic_id": topic_id,
                "title": title,
                "category": category,
                "generated_at": datetime.now().isoformat(),
                "authority_source": f"{self.evidence.get('hospital')} / {self.evidence.get('online_platform')}",
                "target_keywords": keywords
            },
            "instagram_carousel": {
                "total_slides": len(insta_slides),
                "slides": insta_slides,
                "caption": self._build_instagram_caption(topic),
                "hashtags": [f"#{kw}" for kw in keywords] + ["#반려견건강", "#강아지설사", "#장점막보호"]
            },
            "youtube_shorts": shorts_script,
            "naver_blog": {
                "title": f"[수의사 칼럼] {title}",
                "content_markdown": blog_column
            }
        }
        
        # Save output JSON
        file_path = os.path.join(self.output_dir, f"{topic_id}_{datetime.now().strftime('%Y%m%d')}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(package, f, ensure_ascii=False, indent=2)
            
        print(f"[+] Successfully generated content package: {file_path}")
        return package

    def _build_instagram_slides(self, topic):
        if topic["id"] == "case_smecta_vs_monsmecta":
            return [
                {
                    "slide_no": 1,
                    "type": "HOOK",
                    "headline": "스멕타 먹여도 왜 설사가 계속될까?",
                    "subtext": "약국에서 사람 지사제 사다 먹였다가 낭패 본 실제 보호자의 이야기",
                    "visual_cue": "힘없이 누워있는 강아지와 약국 지사제 팩의 대비",
                    "badge": "🚨 보호자 필수 시청"
                },
                {
                    "slide_no": 2,
                    "type": "STORY_EVIDENCE",
                    "headline": "하남 사랑동물병원 온라인 진료실에 올라온 실화",
                    "subtext": "\"스멕타 며칠을 먹여도 물설사가 안 잡혀서 눈물 흘리던 중, 원장님 추천 몬스멕타 급여 단 1번 만에 설사가 완전히 멈췄습니다!\"",
                    "visual_cue": "온라인동물병원 실제 보호자 감사 후기 캡처 그래픽",
                    "badge": "🏥 실제 임상 실화"
                },
                {
                    "slide_no": 3,
                    "type": "VET_MECHANISM",
                    "headline": "스멕타 vs 몬스멕타: 성분의 결정적 차이",
                    "subtext": "1. 입자 크기: 마이크로 벤토나이트 vs 초미세 나노 몬모릴로나이트\n2. 흡착력: 장내 바이러스 독소 정전기적 결합력 3.8배 격차\n3. 점막 보호: 장벽 융모에 실크 나노 코팅막 즉각 형성",
                    "visual_cue": "장 융모 손상 부위에 나노 입자가 실크처럼 덮이는 3D 단면 일러스트",
                    "badge": "🔬 수의학 팩트 체크"
                },
                {
                    "slide_no": 4,
                    "type": "VET_ADVICE",
                    "headline": "김동준 수의사의 단독 처치 코멘트",
                    "subtext": "\"설사한다고 장 운동을 억지로 마비시키는 약을 먹이면 독소가 체내에 쌓여 패혈증으로 갑니다. 장 점막을 덮어주면서 독소만 자석처럼 끌어당겨 배출해야 합니다.\"",
                    "visual_cue": "진료실에서 차트를 보며 신뢰감 있게 설명하는 김동준 원장 모습",
                    "badge": "👨‍⚕️ 수의사 처방 원칙"
                },
                {
                    "slide_no": 5,
                    "type": "CTA",
                    "headline": "우리 아이 장 점막 골든타임을 지키세요",
                    "subtext": "병원 처방용 [몬스멕타] & 온라인 농가·가정용 [파보겔]\n프로필 링크에서 [장 점막 응급 케어 가이드북]을 무료로 다운로드하세요!",
                    "visual_cue": "파보겔/몬스멕타 보틀 1초 원터치 펌핑 그래픽 및 프로필 링크 화살표",
                    "badge": "🎁 무료 가이드북 증정"
                }
            ]
        else:
            return [
                {"slide_no": 1, "type": "HOOK", "headline": topic["title"], "subtext": "수의학적으로 증명된 급성 장 관리법", "visual_cue": "경고 심볼"},
                {"slide_no": 2, "type": "PROBLEM", "headline": "잘못된 대처가 위험한 이유", "subtext": "탈수와 전해질 불균형의 급속 진행", "visual_cue": "장 점막 융모"},
                {"slide_no": 3, "type": "EVIDENCE", "headline": "동물병원 실제 임상 결과", "subtext": "48시간 단독 급여 후 정상 퇴원", "visual_cue": "임상 차트"},
                {"slide_no": 4, "type": "SOLUTION", "headline": "초미세 나노 몬모릴로나이트의 힘", "subtext": "점막 코팅 및 독소 흡착 배출", "visual_cue": "분자 결합 일러스트"},
                {"slide_no": 5, "type": "CTA", "headline": "응급 상비약 파보겔 구비하기", "subtext": "프로필 링크에서 확인하세요", "visual_cue": "파보겔 바틀"}
            ]

    def _build_shorts_script(self, topic):
        return {
            "estimated_duration": "50s",
            "scenes": [
                {
                    "time": "00:00 - 00:04",
                    "shot": "초근접 슬픈 강아지 눈동자 + 빨간 경고 팝업",
                    "voiceover": "강아지 설사한다고 약국 스멕타부터 먹이셨나요? 지금 당장 멈추셔야 합니다!",
                    "screen_text": "⚠️ 스멕타 먹였는데 왜 설사가 안 멈출까?"
                },
                {
                    "time": "00:04 - 00:15",
                    "shot": "온라인동물병원 보호자 후기 화면 오버레이",
                    "voiceover": "실제 하남 사랑동물병원 온라인 진료실에 올라온 후기입니다. '스멕타 며칠을 먹여도 물설사가 안 멎었는데, 김동준 원장님 몬스멕타 먹이자마자 바로 멈췄어요!'",
                    "screen_text": "💬 '스멕타 실패 후 몬스멕타로 1번 만에 해결!'"
                },
                {
                    "time": "00:15 - 00:30",
                    "shot": "장 점막 실크 나노 코팅 메커니즘 그래픽",
                    "voiceover": "비결은 입자 크기입니다. 일반 스멕타와 달리 몬스멕타의 초미세 나노 몬모릴로나이트는 헐어버린 장 점막에 실크 보호막을 치고, 바이러스 독소만 자석처럼 끌어당겨 밖으로 배출합니다.",
                    "screen_text": "🔬 장 점막 실크 코팅 + 독소 3.8배 흡착 배출"
                },
                {
                    "time": "00:30 - 00:42",
                    "shot": "주사기 거부하는 강아지 vs 1초 원터치 펌프 급여 대비",
                    "voiceover": "약 먹이기 힘든 아이도 주사기 스트레스 없이 1초 펌핑으로 꿀꺽! 어린 자견과 노령견에게도 간·신장 부담이 전혀 없습니다.",
                    "screen_text": "⏱️ 스트레스 제로! 1초 원터치 펌프"
                },
                {
                    "time": "00:42 - 00:50",
                    "shot": "파보겔 제품 클로즈업 + 댓글창 유도",
                    "voiceover": "댓글에 '골든타임'이라고 남겨주시면, 수의사 감수 [장 점막 응급 재생 매뉴얼]을 바로 보내드립니다!",
                    "screen_text": "👉 댓글에 '골든타임' 남기고 매뉴얼 받기"
                }
            ],
            "pinned_comment": "🔬 하남 사랑동물병원 김동준 원장 임상 검증 보조제!\n공식 스마트스토어: https://smartstore.naver.com/petschury\n💬 댓글로 '골든타임'을 남겨주시면 수의학 케어 리포트를 무료로 보내드립니다."
        }

    def _build_blog_article(self, topic):
        return f"""# {topic['title']}

안녕하세요, 수의학적 원리로 반려견의 건강을 지키는 펫케어 랩입니다.

반려견이 갑자기 물설사를 시작하면 당황한 마음에 사람 약국에서 **스멕타(디옥타헤드랄 스멕타이트)**를 사다 먹이시는 보호자님들이 많습니다.
하지만 *"스멕타를 먹였는데도 설사가 멈추지 않고 변이 점점 더 묽어져요"*라며 응급 내원하는 사례가 끊이지 않습니다.

최근 **하남 사랑동물병원 김동준 원장님이 운영하시는 '온라인동물병원'**에서도 화제가 된 실제 보호자 상담 후기가 있었습니다.

> **[실제 온라인동물병원 보호자 후기 요약]**
> *"스멕타를 며칠간 복용시켜도 계속되던 물설사와 기력 저하로 절망하던 중, 김동준 원장님 처방으로 몬스멕타를 급여했습니다. 놀랍게도 급여 직후 장이 편안해지더니 그날로 설사가 완전히 멎었습니다."*

왜 이런 극적인 차이가 발생할까요? 수의학적 팩트를 정리해 드립니다.

---

## 1. 지사제는 설사를 '치료'하는 약이 아닙니다
많은 분들이 오해하시는 점은 지사제가 장내 바이러스나 세균을 죽인다고 생각하는 것입니다.
억지로 장 운동을 멈추는 일반 화학 지사제를 투여하면, 장 속에 가득 찬 **세균 독소와 바이러스가 배출되지 못하고 체내로 재흡수되어 패혈증**을 유발할 수 있습니다.

---

## 2. 일반 스멕타 vs 몬스멕타(초미세 나노 몬모릴로나이트)의 차이
스멕타이트 계열의 핵심은 **물리적 흡착 면적**입니다.

1. **입자 크기와 비표면적의 압도적 차이**
   - 일반 스멕타: 마이크로 단위 입자로 장 점막 부착률이 낮고 배출 속도가 빠름
   - 몬스멕타: 특허받은 초미세 울트라파인 나노 공정으로 비표면적이 수십 배 넓어 장 점막 융모 사이사이를 빈틈없이 코팅
2. **독소 및 바이러스 결합력**
   - 음전하를 띤 나노 몬모릴로나이트 층상 구조가 양전하를 띤 장내 병원균과 외독소(Exotoxin)를 자석처럼 끌어당겨 변과 함께 배출
3. **간과 신장에 무해한 비흡수성 메커니즘**
   - 체내 혈류로 흡수되지 않고 오직 장관 내에서만 작용하므로 55일령 어린 강아지나 간수치가 높은 노령견에게도 매우 안전합니다.

---

## 3. 김동준 수의사의 응급 처치 가이드
- **설사 시작 1시간 이내 골든타임**: 탈수가 오기 전 즉시 장 점막을 물리적으로 감싸줄 것
- **주사기 강제 급여 스트레스 금지**: 구토 반사를 유발하지 않는 펌프형 제형 선택
- **수액과 영양 공급 병행**: 전해질 밸런스를 유지하며 장 점막 재생 유도

병원 전용 제품인 **몬스멕타** 및 온라인 농가/가정용 **파보겔**에 대한 자세한 임상 데이터와 다큐멘터리는 공식 웹사이트(parvogel.kr)에서 확인하실 수 있습니다.
"""

    def _build_instagram_caption(self, topic):
        return f"""🚨 강아지 설사할 때 약국 스멕타부터 먹이셨나요?

실제 하남 사랑동물병원 온라인동물병원 진료실에 올라온 화제의 후기!
"스멕타 먹여도 며칠째 물설사하던 아이가, 몬스멕타 급여 1번 만에 멈췄습니다."

일반 벤토나이트와 초미세 나노 몬모릴로나이트의 분자 흡착력 차이,
슬라이드를 넘겨 수의학적 원리를 확인해보세요! 👉

🎁 [장 점막 응급 재생 매뉴얼] 무료 배포 중!
프로필 링크(@parvogel.official)를 확인하세요.
"""

    def generate_all_queued_topics(self):
        results = []
        for topic in self.topics:
            res = self.generate_content_for_topic(topic)
            results.append(res)
        return results

if __name__ == "__main__":
    generator = ParvogelContentGenerator()
    generator.generate_all_queued_topics()
