# -*- coding: utf-8 -*-
"""
Parvogel Veterinary Content Generator (generator.py)
Generates high-converting 5-slide Instagram cards, 50s YouTube Shorts scripts,
SEO Naver Blog articles, and X (Twitter) threads based on clinical evidence
from Dr. Kim Dong-jun (Hanam Sarang Animal Hospital / Online Animal Hospital).
Supports both Gemini LLM dynamic generation and deterministic clinical templates.
"""

import os
import sys
import json
import yaml
import urllib.request
import urllib.error
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


class ParvogelContentGenerator:
    def __init__(self, config_path="scripts/marketing_pipeline/config.yaml"):
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = yaml.safe_load(f)

        self.evidence = self.config.get("clinical_knowledge_base", {})
        self.prompts = self.config.get("prompt_templates", {})
        self.topics = self.config.get("topics", [])
        self.pipeline_cfg = self.config.get("pipeline", {})
        self.output_dir = self.pipeline_cfg.get("output_dir", "scripts/marketing_pipeline/output")
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_content_for_topic(self, topic, use_llm=False):
        """Generates Instagram, Shorts, Blog, and X packages for a specific topic."""
        topic_id = topic.get("id")
        title = topic.get("title")
        category = topic.get("category")
        keywords = topic.get("keywords", [])

        llm_payload = None
        if use_llm:
            llm_payload = self._try_generate_with_gemini(topic)

        if llm_payload:
            insta_carousel = llm_payload.get("instagram_carousel")
            shorts_script = llm_payload.get("youtube_shorts")
            blog_data = llm_payload.get("naver_blog")
            x_thread = llm_payload.get("x_thread")
            gen_mode = "gemini-llm"
        else:
            insta_slides = self._build_instagram_slides(topic)
            insta_carousel = {
                "total_slides": len(insta_slides),
                "slides": insta_slides,
                "caption": self._build_instagram_caption(topic),
                "hashtags": [f"#{kw}" for kw in keywords] + ["#반려견건강", "#강아지설사", "#장점막보호", "#파보겔", "#몬스멕타"],
            }
            shorts_script = self._build_shorts_script(topic)
            blog_data = {
                "title": f"[수의사 칼럼] {title}",
                "content_markdown": self._build_blog_article(topic),
            }
            x_thread = self._build_x_thread(topic)
            gen_mode = "clinical-template-v2"

        package = {
            "metadata": {
                "topic_id": topic_id,
                "title": title,
                "category": category,
                "hook_angle": topic.get("hook_angle", ""),
                "generation_mode": gen_mode,
                "generated_at": datetime.now().isoformat(),
                "authority_source": f"{self.evidence.get('hospital')} / {self.evidence.get('online_platform')}",
                "reference_url": self.evidence.get("key_case_study", {}).get("cafe_url", "https://cafe.naver.com/onlinevet/46187"),
                "target_keywords": keywords,
            },
            "instagram_carousel": insta_carousel,
            "youtube_shorts": shorts_script,
            "naver_blog": blog_data,
            "x_thread": x_thread,
        }

        file_path = os.path.join(
            self.output_dir, f"{topic_id}_{datetime.now().strftime('%Y%m%d')}.json"
        )
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(package, f, ensure_ascii=False, indent=2)

        print(f"[+] Successfully generated content package ({gen_mode}): {file_path}")
        return package, file_path

    def _try_generate_with_gemini(self, topic):
        """Calls Gemini API if GEMINI_API_KEY / GOOGLE_API_KEY is available."""
        llm_cfg = self.pipeline_cfg.get("llm", {})
        api_key = os.environ.get(llm_cfg.get("env_key", "GEMINI_API_KEY")) or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            return None

        model = llm_cfg.get("model", "gemini-2.5-flash")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        system_prompt = self.prompts.get("system_prompt", "")
        schema_guide = self.prompts.get("output_schema_guide", "")

        user_prompt = (
            f"주제 ID: {topic.get('id')}\n"
            f"주제 제목: {topic.get('title')}\n"
            f"카테고리: {topic.get('category')}\n"
            f"핵심 훅 각도: {topic.get('hook_angle')}\n"
            f"타깃 키워드: {', '.join(topic.get('keywords', []))}\n"
            f"임상 근거: {json.dumps(self.evidence, ensure_ascii=False)}\n\n"
            f"{schema_guide}"
        )

        body = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"parts": [{"text": user_prompt}]}],
            "generationConfig": {
                "temperature": llm_cfg.get("temperature", 0.4),
                "responseMimeType": "application/json",
            },
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(raw_text)
        except Exception as e:
            print(f"[!] Gemini API fallback to deterministic clinical template ({e})")
            return None

    def _build_instagram_slides(self, topic):
        tid = topic["id"]

        if tid == "case_smecta_vs_monsmecta":
            return [
                {
                    "slide_no": 1,
                    "type": "HOOK",
                    "headline": "스멕타 먹여도 왜 설사가 계속될까?",
                    "subtext": "약국에서 사람 지사제 사다 먹였다가 낭패 본 실제 보호자의 이야기",
                    "visual_cue": "힘없이 누워있는 강아지와 약국 스멕타 팩의 대비",
                    "badge": "🚨 보호자 필수 시청",
                },
                {
                    "slide_no": 2,
                    "type": "STORY_EVIDENCE",
                    "headline": "하남 사랑동물병원 온라인 진료실 실화 (조회수 1,734회)",
                    "subtext": "\"스멕타 며칠을 먹여도 물설사가 안 잡혀서 눈물 흘리던 중, 김동준 원장님 추천 몬스멕타 급여 단 1번 만에 설사가 완전히 멈췄습니다!\"",
                    "visual_cue": "네이버 카페 온라인동물병원(#46187) 실제 보호자 후기 캡처 그래픽",
                    "badge": "🏥 실제 임상 실화",
                },
                {
                    "slide_no": 3,
                    "type": "VET_MECHANISM",
                    "headline": "스멕타 vs 몬스멕타: 성분의 결정적 차이",
                    "subtext": "1. 입자 크기: 일반 마이크로 입자 vs 초미세 나노 몬모릴로나이트\n2. 흡착력: 장내 바이러스·외독소 정전기적 결합력 3.8배 격차\n3. 점막 보호: 손상된 융모에 실크 나노 코팅막 즉각 형성",
                    "visual_cue": "장 융모 손상 부위에 나노 입자가 실크처럼 덮이는 3D 단면 일러스트",
                    "badge": "🔬 수의학 팩트 체크",
                },
                {
                    "slide_no": 4,
                    "type": "VET_ADVICE",
                    "headline": "김동준 수의사의 단독 처치 코멘트",
                    "subtext": "\"설사한다고 장 운동을 억지로 마비시키는 약을 먹이면 독소가 체내에 쌓여 패혈증으로 갑니다. 장 점막을 덮어주면서 독소만 자석처럼 끌어당겨 배출해야 합니다.\"",
                    "visual_cue": "진료실에서 차트를 보며 설명하는 하남 사랑동물병원 김동준 원장",
                    "badge": "👨‍⚕️ 수의사 처방 원칙",
                },
                {
                    "slide_no": 5,
                    "type": "CTA",
                    "headline": "우리 아이 장 점막 골든타임을 지키세요",
                    "subtext": "병원 처방용 [몬스멕타] & 온라인 가정·농가 상비약 [파보겔]\n프로필 링크에서 [장 점막 응급 케어 가이드북]을 확인하세요!",
                    "visual_cue": "파보겔/몬스멕타 보틀 1초 원터치 펌핑 그래픽 및 프로필 링크 화살표",
                    "badge": "🎁 응급 상비약 필수",
                },
            ]

        elif tid == "acute_diarrhea_contraindication":
            return [
                {
                    "slide_no": 1,
                    "type": "HOOK",
                    "headline": "강아지 설사에 사람 지사제 먹이면 벌어지는 일",
                    "subtext": "급한 마음에 먹인 로페라마이드 한 알이 장 마비와 독소 쇼크를 부릅니다",
                    "visual_cue": "사람용 알약 지사제 위 빨간 금지 표시와 경고 사이렌",
                    "badge": "⛔ 절대 금기 응급상식",
                },
                {
                    "slide_no": 2,
                    "type": "PATHOLOGY",
                    "headline": "설사는 몸이 독소를 뿜어내는 생존 방어 반응입니다",
                    "subtext": "장내 세균 외독소(Exotoxin)와 바이러스를 밖으로 밀어내는 과정에서 장 운동을 강제로 멈추면, 독소가 장벽 혈관으로 역류해 패혈증을 유발합니다.",
                    "visual_cue": "장관 내 갇힌 독소가 혈관으로 침투하는 위험 메커니즘 인포그래픽",
                    "badge": "⚠️ 장독소증 메커니즘",
                },
                {
                    "slide_no": 3,
                    "type": "BREED_RISK",
                    "headline": "MDR1 유전자 변이 견종에겐 신경 독성까지!",
                    "subtext": "콜리, 셔틀랜드 쉽독, 호주 셰퍼드뿐만 아니라 어린 자견은 혈뇌장벽(BBB)이 미성숙해 사람 지사제 성분이 치명적인 신경 마비를 일으킵니다.",
                    "visual_cue": "어린 자견과 뇌-장관 신경 전달 경로 주의 아이콘",
                    "badge": "🧬 수의 약리학 경고",
                },
                {
                    "slide_no": 4,
                    "type": "VET_SOLUTION",
                    "headline": "수의사가 권장하는 진짜 1차 응급 대처법",
                    "subtext": "1. 12시간 사료 절식 및 소량의 전해질 수분 공급\n2. 혈류로 흡수되지 않는 비흡수성 나노 몬모릴로나이트(파보겔)로 독소만 포획해 배출\n3. 헐어버린 장 융모 물리적 코팅",
                    "visual_cue": "나노 입자가 독소만 감싸 대변으로 안전하게 배출하는 모식도",
                    "badge": "✅ 안전한 물리적 흡착",
                },
                {
                    "slide_no": 5,
                    "type": "CTA",
                    "headline": "새벽 응급실 가기 전, 가정 상비약 파보겔",
                    "subtext": "간·신장 대사 부담 0%! 55일령 자견부터 노령견까지 안심 급여\n프로필 링크에서 수의사 감수 응급 대처 매뉴얼을 확인하세요!",
                    "visual_cue": "가정 구급함 속 파보겔 펌프 보틀 클로즈업",
                    "badge": "🏥 가정용 필수 상비약",
                },
            ]

        elif tid == "parvo_mucosa_goldentime":
            return [
                {
                    "slide_no": 1,
                    "type": "HOOK",
                    "headline": "수액 바늘조차 안 들어가던 55일령 아기 푸들",
                    "subtext": "치사율 90% 파보바이러스 장염 확진... 혈관 확보도 불가능했던 절체절명의 기록",
                    "visual_cue": "입원실 패드 위 기력 없이 엎드린 55일령 갈색 푸들 실사 다큐 컷",
                    "badge": "🎬 실제 임상 다큐멘터리",
                },
                {
                    "slide_no": 2,
                    "type": "CRISIS",
                    "headline": "Day 1~2: 탈수로 주저앉은 혈관, 피비린내 나는 혈변",
                    "subtext": "체중 600g 미만의 아기 강아지는 정맥 카테터 삽입조차 어렵습니다. 파보바이러스가 장 융모 기저부(Crypt)를 파괴하며 장벽이 무너져 내렸습니다.",
                    "visual_cue": "파보 키트 양성 두 줄 반응과 손상된 장 점막 비교",
                    "badge": "🩸 골든타임 48시간",
                },
                {
                    "slide_no": 3,
                    "type": "INTERVENTION",
                    "headline": "Day 3~4: 김동준 원장의 선택 — 장 점막 집중 코팅",
                    "subtext": "피하 수액으로 수분을 버티면서 초미세 나노 몬모릴로나이트를 집중 투여해 벗겨진 장 점막을 코팅하고 바이러스 독소 흡수를 원천 차단했습니다.",
                    "visual_cue": "경구 급여 후 장 점막 방어벽이 형성되는 다큐멘터리 타임라인",
                    "badge": "🛡️ 점막 방어 프로토콜",
                },
                {
                    "slide_no": 4,
                    "type": "RECOVERY",
                    "headline": "Day 5~7: 구토 중단, 스스로 사료를 먹는 기적",
                    "subtext": "5일 차부터 혈변이 멎고 정상 변 형태로 회복! 7일 만에 꼬리를 흔들며 건강하게 퇴원한 실제 진료 기록이 영상으로 남겨졌습니다.",
                    "visual_cue": "입원장에서 활력을 되찾고 사료를 먹는 아기 푸들 모습",
                    "badge": "✨ 7일 만의 기적 퇴원",
                },
                {
                    "slide_no": 5,
                    "type": "CTA",
                    "headline": "파보·급성 장염의 승패는 '점막 보호 속도'입니다",
                    "subtext": "공식 홈페이지(parvogel.kr)에서 7일간의 실제 임상 다큐멘터리 전체 영상과 처치 리포트를 직접 확인하세요.",
                    "visual_cue": "다큐멘터리 재생 플레이어 화면과 파보겔 제품 안내",
                    "badge": "🎥 다큐 전체 영상 공개",
                },
            ]

        else:  # kennel_group_gut_protocol
            return [
                {
                    "slide_no": 1,
                    "type": "HOOK",
                    "headline": "분양 직후 자견 설사 클레임, 왜 반복될까요?",
                    "subtext": "이동 스트레스와 사료 변경 시 발생하는 '장 점막 투과성 증가(Leaky Gut)'가 원인입니다",
                    "visual_cue": "전문 켄넬 브리딩 룸과 건강한 자견들의 모습",
                    "badge": "🏢 켄넬·브리더 필독",
                },
                {
                    "slide_no": 2,
                    "type": "MECHANISM",
                    "headline": "환경 변화 72시간 내 코르티솔 급증과 장벽 붕괴",
                    "subtext": "새 환경 이동 시 스트레스 호르몬이 장 점막 점액층을 얇게 만들어, 평소 잠복하던 코로나·파보·원충이 급격히 증식하며 집단 연변으로 번집니다.",
                    "visual_cue": "스트레스 지수 상승에 따른 장 점막 방어력 하락 그래프",
                    "badge": "📉 분양 초기 72시간 고비",
                },
                {
                    "slide_no": 3,
                    "type": "PROTOCOL",
                    "headline": "상위 1% 전문 켄넬의 3단계 장 방어 수칙",
                    "subtext": "1. 이동 2시간 전 파보겔 선제 코팅 급여\n2. 도착 후 첫 24시간 소량 급식 + 점막 보호제 병행\n3. 유산균 단독 급여보다 '독소 흡착 코팅'을 먼저 시행",
                    "visual_cue": "시간대별 체크리스트가 적힌 켄넬 표준 프로토콜 보드",
                    "badge": "📋 켄넬 표준 매뉴얼",
                },
                {
                    "slide_no": 4,
                    "type": "EFFICIENCY",
                    "headline": "주사기 전쟁 끝! 1초 원터치 펌프로 교차오염 차단",
                    "subtext": "수십 마리 자견 관리 시 주사기 재사용은 교차 감염의 주범입니다. 딸기향 기호성과 원터치 펌프로 1마리당 3초 만에 위생적으로 급여하세요.",
                    "visual_cue": "원터치 펌핑으로 자견이 스스로 잘 받아먹는 장면",
                    "badge": "⚡ 관리 효율 300% 향상",
                },
                {
                    "slide_no": 5,
                    "type": "CTA",
                    "headline": "전국 18개 주요 제휴 켄넬·펫샵 공식 도입",
                    "subtext": "분양 후 초기 폐사율과 연변 클레임을 낮추는 가장 확실한 투자.\n프로필 링크에서 제휴 켄넬 대량 도입 및 상비 가이드를 확인하세요!",
                    "visual_cue": "파보겔 공식 인증 켄넬 포스터와 제품 라인업",
                    "badge": "🤝 B2B/가정 통합 솔루션",
                },
            ]

    def _build_shorts_script(self, topic):
        tid = topic["id"]

        if tid == "case_smecta_vs_monsmecta":
            return {
                "estimated_duration": "50s",
                "scenes": [
                    {
                        "time": "00:00 - 00:05",
                        "shot": "초근접 슬픈 강아지 눈동자 + 약국 스멕타 팩 위 물음표 팝업",
                        "voiceover": "강아지 설사할 때 약국 스멕타 먹여도 왜 안 멈출까요? 실제 동물병원에서 난리 난 후기입니다.",
                        "screen_text": "⚠️ 스멕타 먹였는데 왜 설사가 안 멈출까?",
                    },
                    {
                        "time": "00:05 - 00:16",
                        "shot": "네이버 카페 온라인동물병원(#46187, 조회수 1,734회) 후기 오버레이",
                        "voiceover": "하남 사랑동물병원 온라인 진료실에 올라온 실제 보호자 사연인데요. '스멕타를 며칠 먹여도 안 잡히던 물설사가 김동준 원장님 몬스멕타 단 한 번에 거짓말처럼 멈췄다'는 겁니다.",
                        "screen_text": "💬 '스멕타 실패 후 몬스멕타 1번에 해결!' (조회수 1,734회)",
                    },
                    {
                        "time": "00:16 - 00:31",
                        "shot": "장 점막 실크 나노 코팅 및 독소 자석 흡착 3D 모식도",
                        "voiceover": "핵심은 입자 크기입니다. 일반 스멕타와 달리 초미세 나노 몬모릴로나이트는 헐어버린 장 융모에 실크 보호막을 치고, 바이러스 독소만 3.8배 강력하게 끌어당겨 배출합니다.",
                        "screen_text": "🔬 장 점막 실크 코팅 + 독소 3.8배 선택 흡착",
                    },
                    {
                        "time": "00:31 - 00:42",
                        "shot": "1초 원터치 딸기향 펌프 급여 장면",
                        "voiceover": "체내에 흡수되지 않고 독소만 데리고 나가니까 어린 자견도 간과 신장 부담이 전혀 없고, 딸기향이라 한 번에 꿀꺽 잘 먹습니다.",
                        "screen_text": "🍓 비흡수성 안전 기전 + 딸기향 기호성",
                    },
                    {
                        "time": "00:42 - 00:50",
                        "shot": "파보겔/몬스멕타 보틀 클로즈업 + 고정댓글 화살표",
                        "voiceover": "우리 집 응급 상비약 파보겔! 지금 고정댓글 링크에서 실제 수의사 처방 사례와 응급 매뉴얼을 확인하세요!",
                        "screen_text": "👉 고정댓글에서 온라인동물병원 원문 & 파보겔 확인",
                    },
                ],
                "pinned_comment": "🔬 하남 사랑동물병원 김동준 원장 온라인동물병원 실제 후기(#46187): https://cafe.naver.com/onlinevet/46187\n🛒 가정용 상비약 파보겔 공식 스토어: https://smartstore.naver.com/petschury/products/13718496355",
            }

        elif tid == "acute_diarrhea_contraindication":
            return {
                "estimated_duration": "50s",
                "scenes": [
                    {
                        "time": "00:00 - 00:05",
                        "shot": "사람용 지사제 캡슐을 강아지에게 주려는 손 + 강렬한 적색 정지 신호",
                        "voiceover": "강아지가 갑자기 물설사한다고 집에 있는 사람 지사제 주셨나요? 그 약 한 알이 강아지 장을 마비시킵니다!",
                        "screen_text": "⛔ 강아지 설사에 사람 지사제 절대 금지!",
                    },
                    {
                        "time": "00:05 - 00:17",
                        "shot": "장관 내 세균 독소가 배출되지 못하고 혈관으로 흡수되는 그래픽",
                        "voiceover": "설사는 장속에 들어온 세균과 독소를 밖으로 뿜어내는 응급 방어 작용입니다. 그런데 약으로 장 운동을 억지로 멈춰버리면 독소가 몸 안에 갇혀 패혈증 쇼크가 옵니다.",
                        "screen_text": "☣️ 장 운동 강제 정지 = 독소 역류 & 패혈증 위험",
                    },
                    {
                        "time": "00:17 - 00:30",
                        "shot": "김동준 수의사 진료 코멘트 자막 + 나노 몬모릴로나이트 작용 영상",
                        "voiceover": "하남 사랑동물병원 김동준 원장님은 강조합니다. 장 운동을 마비시키지 말고, 초미세 나노 몬모릴로나이트로 점막을 코팅한 뒤 독소만 자석처럼 붙여 내보내야 합니다.",
                        "screen_text": "👨‍⚕️ '점막은 감싸고 독소만 자석처럼 배출하라'",
                    },
                    {
                        "time": "00:30 - 00:42",
                        "shot": "가정용 구급함에서 파보겔을 꺼내 급여하는 보호자",
                        "voiceover": "혈관으로 흡수되지 않아 부작용 걱정이 없는 파보겔은 새벽에 갑작스러운 물설사가 터졌을 때 가장 안전한 1차 방어선입니다.",
                        "screen_text": "🛡️ 새벽 급성 설사 골든타임 1차 상비약",
                    },
                    {
                        "time": "00:42 - 00:50",
                        "shot": "파보겔 제품 패키지 + 프로필/고정댓글 안내",
                        "voiceover": "댓글에 '골든타임'을 남기거나 고정댓글 링크를 클릭해 강아지 급성 설사 응급 대처표를 꼭 저장해 두세요!",
                        "screen_text": "👉 고정댓글에서 급성 설사 응급 매뉴얼 확인",
                    },
                ],
                "pinned_comment": "🚨 사람 지사제 오남용 주의! 수의사가 권장하는 물리적 점막 보호제 파보겔\n공식 다큐 & 가이드: https://parvogel.kr\n스마트스토어: https://smartstore.naver.com/petschury/products/13718496355",
            }

        elif tid == "parvo_mucosa_goldentime":
            return {
                "estimated_duration": "50s",
                "scenes": [
                    {
                        "time": "00:00 - 00:05",
                        "shot": "입원실에 힘없이 누워있는 55일령 갈색 푸들 실제 영상 컷",
                        "voiceover": "태어난 지 겨우 55일 된 아기 푸들, 치사율 90% 파보 장염 판정을 받았습니다. 심지어 탈수가 심해 수액 바늘조차 들어가지 않았습니다.",
                        "screen_text": "😢 수액 바늘도 안 들어가던 55일령 파보 푸들",
                    },
                    {
                        "time": "00:05 - 00:17",
                        "shot": "Day 1~2 혈변 기록 차트와 초조한 진료실 분위기",
                        "voiceover": "장 융모가 무너져 내리며 피비린내 나는 혈변이 쏟아지던 첫 이틀. 정맥 주사도 못 놓는 상황에서 생사를 가른 건 장 점막 코팅 속도였습니다.",
                        "screen_text": "⏳ 골든타임 48시간, 무너진 장벽을 막아라!",
                    },
                    {
                        "time": "00:17 - 00:31",
                        "shot": "김동준 원장의 경구 점막 코팅제 집중 처치 장면",
                        "voiceover": "김동준 원장님은 벗겨진 장 점막 위로 초미세 나노 몬모릴로나이트 보호막을 입혀 파보 바이러스 독소가 혈관으로 넘어가는 길목을 차단했습니다.",
                        "screen_text": "🛡️ 나노 몬모릴로나이트 집중 점막 코팅 처치",
                    },
                    {
                        "time": "00:31 - 00:42",
                        "shot": "Day 5~7 스스로 일어나 사료를 먹고 꼬리 흔드는 푸들 실사",
                        "voiceover": "놀랍게도 5일 차에 혈변이 멈추고, 7일 만에 스스로 밥을 먹으며 기적처럼 퇴원했습니다. 실제 진료실 카메라에 담긴 100% 실화입니다.",
                        "screen_text": "✨ 7일 만의 기적 완치! 실제 임상 다큐멘터리",
                    },
                    {
                        "time": "00:42 - 00:50",
                        "shot": "파보겔 공식 웹사이트 다큐멘터리 화면 + 링크 유도",
                        "voiceover": "7일간의 생생한 치료 전 과정 다큐멘터리 영상은 지금 고정댓글 공식 홈페이지에서 무료로 보실 수 있습니다.",
                        "screen_text": "🎥 고정댓글 링크에서 7일 완치 다큐 전체 보기",
                    },
                ],
                "pinned_comment": "🎬 [실화 다큐] 수액 바늘도 안 들어가던 55일령 푸들의 7일 파보 완치 기록!\n전체 영상 보기: https://parvogel.kr\n가정·켄넬 상비약 파보겔: https://smartstore.naver.com/petschury/products/13718496355",
            }

        else:  # kennel_group_gut_protocol
            return {
                "estimated_duration": "50s",
                "scenes": [
                    {
                        "time": "00:00 - 00:05",
                        "shot": "분양 이동 케이지 속 긴장한 아기 강아지 클로즈업",
                        "voiceover": "건강하던 강아지가 분양가자마자 설사를 시작해 당황하셨나요? 원인은 이동 스트레스로 인한 장 점막 붕괴입니다.",
                        "screen_text": "🐾 분양 직후 찾아오는 스트레스성 연변·장염!",
                    },
                    {
                        "time": "00:05 - 00:17",
                        "shot": "환경 변화 후 72시간 코르티솔 증가 및 장내 유해균 증식 그래픽",
                        "voiceover": "환경이 바뀌는 첫 72시간 동안 스트레스 호르몬이 장 점막 보호층을 무너뜨리고, 그 틈으로 코로나와 파보 같은 바이러스가 폭발적으로 증식합니다.",
                        "screen_text": "⚠️ 환경 변화 첫 72시간 = 장 점막 방어력 급락",
                    },
                    {
                        "time": "00:17 - 00:31",
                        "shot": "전국 전문 켄넬에서 파보겔을 선제 급여하는 모습",
                        "voiceover": "그래서 전국 주요 켄넬과 브리더들은 이동 전후 3일간 파보겔로 장 점막을 미리 실크처럼 코팅해 유해 독소를 선제적으로 흡착 배출시킵니다.",
                        "screen_text": "🛡️ 이동 전후 72시간 선제적 장 점막 코팅 프로토콜",
                    },
                    {
                        "time": "00:31 - 00:42",
                        "shot": "원터치 펌핑으로 빠르게 급여하는 브리더의 손",
                        "voiceover": "주사기 소독 번거로움 없이 원터치 펌프로 깔끔하게! 교차 감염 위험은 낮추고 입양 초기 적응률은 수직 상승합니다.",
                        "screen_text": "⚡ 교차오염 ZERO! 원터치 위생 급여",
                    },
                    {
                        "time": "00:42 - 00:50",
                        "shot": "파보겔 공식 인증 포스터와 제품 클로즈업",
                        "voiceover": "브리더와 입양 가정이 함께 쓰는 장 점막 골든타임 솔루션 파보겔, 고정댓글에서 확인하세요!",
                        "screen_text": "👉 고정댓글에서 켄넬·가정 장 관리 프로토콜 확인",
                    },
                ],
                "pinned_comment": "🏢 전국 전문 켄넬 & 동물병원이 선택한 장 점막 보호 표준 프로토콜!\n공식 홈페이지: https://parvogel.kr\n공식 스토어: https://smartstore.naver.com/petschury/products/13718496355",
            }

    def _build_blog_article(self, topic):
        tid = topic["id"]

        if tid == "case_smecta_vs_monsmecta":
            return f"""# {topic['title']}

안녕하세요, 수의학적 근거로 반려견의 골든타임을 지키는 **파보겔 리서치 랩**입니다.

반려견이 갑자기 배에서 꾸르륵거리는 소리가 나거나 물설사를 시작하면, 보호자님들이 가장 먼저 찾는 것이 약국의 일반 **스멕타(디옥타헤드랄 스멕타이트)**입니다.
하지만 *"스멕타를 며칠째 먹였는데도 설사가 전혀 안 멈추고 아이가 축 처져요"*라며 병원을 찾는 사례가 매우 많습니다.

최근 **하남 사랑동물병원 김동준 원장님이 운영하시는 네이버 카페 '온라인동물병원'(#46187, 조회수 1,734회)**에 올라온 실제 보호자님의 후기가 큰 화제를 모았습니다.

> **[온라인동물병원 실제 보호자 후기 요약]**
> *"약국 스멕타를 며칠간 먹여도 잡히지 않던 물설사였는데, 김동준 원장님이 처방해 주신 동물용 딸기향 몬스멕타를 단 1번 급여한 직후 설사가 거짓말처럼 멈추고 변이 단단해졌습니다. 이제는 가정 상비약으로 무조건 구비해 둡니다."*
> — 원문 출처: [네이버 카페 온라인동물병원 46187번 글](https://cafe.naver.com/onlinevet/46187)

---

## 1. 왜 일반 스멕타로 안 잡히던 설사가 몬스멕타/파보겔 1번에 잡혔을까?

같은 점토 광물 계열처럼 보여도 **입자 공정과 순도, 비표면적**에서 결정적인 수의학적 차이가 존재합니다.

1. **초미세 울트라파인 나노 공정 (비표면적 극대화)**
   - 일반 마이크로 단위 입자는 장 점막에 촘촘히 밀착되지 못하고 수분과 함께 그대로 흘러 내려가는 경우가 많습니다.
   - 반면 **초미세 나노 몬모릴로나이트**는 입자 층상 구조의 비표면적이 수십 배 넓어, 헐어버린 장 융모(Villi) 미세 틈새까지 실크처럼 촘촘하게 코팅막을 형성합니다.
2. **바이러스 및 세균 외독소(Exotoxin) 선택적 정전기 흡착**
   - 나노 몬모릴로나이트의 강력한 음전하 층상 구조가 장내 병원성 바이러스, 대장균·클로스트리디움 독소를 자석처럼 포획하여 대변으로 배출시킵니다.
3. **주사기 스트레스 없는 딸기향 겔 제형**
   - 가루약을 물에 타서 주사기로 억지로 먹이다가 구토를 유발하면 탈수가 더 심해집니다. 기호성이 검증된 액상 겔 타입은 급여 스트레스를 없애 장 신경계를 안정시킵니다.

---

## 2. 김동준 원장님의 가정 상비약 급여 원칙

- **꾸르륵거리는 장음(복명음)이나 무른 변 즉시 투입**: 점막이 완전히 벗겨져 혈변으로 진행되기 전에 코팅막을 씌워주면 단 1~2회 급여만으로도 빠르게 회복됩니다.
- **비흡수성 안전 기전**: 체내 혈관으로 흡수되지 않고 오직 장관 내에서만 물리적으로 작용 후 100% 배출되므로 어린 자견과 노령견 모두 안전합니다.

병원 처방 라인인 **몬스멕타**와 가정·켄넬 상비 케어 라인인 **파보겔**의 상세 임상 데이터는 공식 웹사이트(https://parvogel.kr)에서 확인하실 수 있습니다.
"""

        elif tid == "acute_diarrhea_contraindication":
            return f"""# {topic['title']}

안녕하세요, 수의학적 근거로 반려견의 골든타임을 지키는 **파보겔 리서치 랩**입니다.

늦은 밤이나 주말, 강아지가 갑자기 물설사를 쏟아내면 당황한 보호자님들이 가정용 구급함에 있는 **사람용 지사제(로페라마이드, 정로환 등)**를 쪼개서 먹이시는 경우가 있습니다.
결론부터 말씀드리면 **이는 반려견의 생명을 위협할 수 있는 가장 위험한 응급 처치 실수**입니다.

---

## 1. 설사는 '질병'이 아니라 독소를 내보내는 '방어 기전'입니다

강아지의 급성 설사는 장내로 침입한 병원성 세균, 바이러스, 부패한 식이 독소(Endotoxin/Exotoxin)를 몸 밖으로 하루빨리 씻어내려는 생리적 방어 반응입니다.

만약 사람용 화학 지사제(장 연동운동 억제제)를 투여해 장의 움직임을 강제로 마비시키면 어떻게 될까요?
- **장독소증(Enterotoxemia) 및 패혈증 유발**: 밖으로 빠져나가야 할 세균 독소와 바이러스가 정체된 장관 내에 고스란히 갇히게 됩니다.
- 손상된 장 점막 혈관을 타고 독소가 전신 혈류로 흡수되면서 급성 패혈증 쇼크나 독성 거대결장으로 악화될 수 있습니다.

> **하남 사랑동물병원 김동준 원장 조언**
> *"단순 지사제로 장 운동을 억지로 멈추면 독소가 배출되지 못해 치명적입니다. 장 연동운동은 자연스럽게 유지하되, 점막을 물리적으로 감싸고 독소만 자석처럼 끌어당겨 배출해야 합니다."*

---

## 2. MDR1 유전자 변이 견종과 어린 자견의 신경 독성 위험

사람 지사제에 흔히 쓰이는 로페라마이드(Loperamide) 성분은 콜리, 셔틀랜드 쉽독, 오스트레일리안 셰퍼드 등 **MDR1 유전자 변이**가 있는 견종이나 혈뇌장벽(BBB)이 완전히 발달하지 않은 어린 자견에게 투여할 경우 뇌 신경계로 약물이 침투해 **심각한 신경 마비와 호흡 억제**를 일으킵니다.

---

## 3. 수의학적으로 올바른 급성 설사 3단계 응급 대처법

1. **12시간 단기 금식 및 수분·전해질 공급**: 위장관에 휴식을 주되 탈수를 막기 위해 소량의 전해질 용액을 자주 급여합니다.
2. **비흡수성 물리적 점막 보호제(파보겔/몬스멕타) 즉시 급여**: 혈액으로 흡수되지 않고 장 내벽에만 실크 코팅막을 형성하는 초미세 나노 몬모릴로나이트로 독소만 흡착해 배출시킵니다.
3. **24시간 이상 지속 또는 혈변·구토 동반 시 즉시 내원**: 파보바이러스나 출혈성 위장염 여부를 감별 진단받아야 합니다.

응급 상황을 대비한 가정 상비 프로토콜과 실제 임상 사례는 공식 홈페이지(https://parvogel.kr)에서 확인하세요.
"""

        elif tid == "parvo_mucosa_goldentime":
            return f"""# {topic['title']}

안녕하세요, 수의학적 근거로 반려견의 골든타임을 지키는 **파보겔 리서치 랩**입니다.

반려견 보호자와 브리더에게 가장 두려운 단어는 단연 **'파보바이러스 장염(Canine Parvovirus)'**입니다. 특히 면역력이 형성되기 전인 2개월령 미만의 어린 자견에게 감염될 경우 치사율이 90%에 육박하는 무서운 급성 전염병입니다.

오늘은 **하남 사랑동물병원 김동준 원장님 진료실에서 실제로 촬영된 '55일령 아기 푸들의 7일 완치 임상 다큐멘터리'**를 통해 파보 장염 생존율을 결정짓는 핵심 원리를 전해드립니다.

---

## 1. Day 1~2: 정맥 수액 바늘조차 들어가지 않던 절망적 상황

내원 당시 생후 55일령의 작은 갈색 푸들은 파보바이러스 키트 선명한 양성(두 줄) 판정을 받았습니다.
- 심한 구토와 피비린내 나는 수양성 혈변으로 인해 극도의 탈수가 진행된 상태였습니다.
- 체중이 너무 작고 탈수로 인해 말초 혈관이 완전히 수축해버려, **일반적인 정맥 카테터(IV 수액 바늘) 삽입조차 불가능한 위기 상황**이었습니다.

---

## 2. 파보바이러스가 강아지를 사망에 이르게 하는 진짜 이유

파보바이러스는 장 점막의 융모 기저부(Crypt) 세포를 집중 파괴합니다.
장 융모가 벗겨지면 두 가지 치명적인 결과가 동시에 발생합니다:
1. 수분과 전해질을 전혀 흡수하지 못해 발생하는 **급격한 탈수 쇼크**
2. 무너진 장벽 틈새로 장내 세균과 독소가 혈류로 쏟아져 들어오는 **전신 패혈증(Sepsis)**

따라서 바이러스와 싸울 항체가 만들어지는 **48~72시간의 골든타임 동안 벗겨진 장 점막을 물리적으로 대신 덮어줄 방어막**이 생사를 가릅니다.

---

## 3. Day 3~7: 나노 몬모릴로나이트 집중 코팅과 7일 만의 퇴원

김동준 원장님은 피하 수액 처치와 함께 **초미세 나노 몬모릴로나이트(몬스멕타/파보겔 베이스)**를 집중 투여하는 프로토콜을 시행했습니다.
- **3~4일 차**: 손상된 장 점막이 나노 입자로 코팅되면서 구토 빈도가 줄고 혈변의 출혈량이 눈에 띄게 감소했습니다.
- **5일 차**: 물설사가 멎고 스스로 고개를 들며 식욕을 보이기 시작했습니다.
- **7일 차**: 정상 변을 보며 활력을 완전히 되찾고 건강하게 퇴원했습니다.

이 7일간의 실제 진료실 무편집 다큐멘터리 영상은 공식 웹사이트(https://parvogel.kr)에서 직접 시청하실 수 있습니다.
"""

        else:  # kennel_group_gut_protocol
            return f"""# {topic['title']}

안녕하세요, 수의학적 근거로 반려견의 골든타임을 지키는 **파보겔 리서치 랩**입니다.

전문 켄넬, 브리더, 그리고 반려견을 새로 맞이하는 입양 가정에서 가장 빈번하게 겪는 골칫거리는 바로 **'분양 및 이동 직후 발생하는 급성 연변과 장염'**입니다.
분양 전까지는 분명히 건강한 변을 보던 아이가 새 집으로 이동한 지 이틀 만에 물설사를 시작하는 이유는 무엇일까요?

---

## 1. 이동 후 72시간: 스트레스 호르몬이 장 점막 방어벽을 무너뜨립니다

강아지가 낯선 공간으로 이동하거나 사료·물 환경이 바뀌면 체내에서 **코르티솔(Cortisol) 스트레스 호르몬**이 급격히 분비됩니다.
- 코르티솔은 장관으로 가는 혈류량을 감소시키고, 장 상피세포 사이의 치밀결합(Tight Junction)을 느슨하게 만듭니다.
- 이른바 **장 누수(Leaky Gut) 상태**가 되면, 평소 장내에 소량 존재하며 문제를 일으키지 않던 코로나바이러스, 파보바이러스, 클로스트리디움, 원충 등이 폭발적으로 증식해 급성 장염으로 이어집니다.

---

## 2. 전문 켄넬을 위한 72시간 장 점막 방어 표준 수칙

전국 18개 이상의 주요 제휴 켄넬 및 펫샵에서는 사후 치료가 아닌 **'선제적 점막 코팅 프로토콜'**을 도입해 초기 연변 발생률을 획기적으로 낮추고 있습니다.

1. **이동·분양 2시간 전 선제 급여**: 이동 스트레스가 시작되기 전 초미세 나노 몬모릴로나이트(파보겔)로 장 점막에 보호 코팅막을 형성합니다.
2. **새 환경 도착 후 3일간 데일리 케어**: 하루 1~2회 원터치 펌핑 급여로 사료 적응기 동안 발생하는 미생물 불균형 독소를 즉시 포획·배출합니다.
3. **1초 원터치 펌프로 교차 감염 원천 차단**: 여러 마리의 자견을 관리할 때 주사기를 돌려 쓰는 방식은 집단 감염의 지름길입니다. 비접촉 펌핑 방식으로 위생과 관리 속도를 동시에 잡으세요.

켄넬 및 동물병원 전용 안내 포스터와 대량 도입 문의는 공식 웹사이트(https://parvogel.kr)에서 확인하실 수 있습니다.
"""

    def _build_instagram_caption(self, topic):
        tid = topic["id"]
        if tid == "case_smecta_vs_monsmecta":
            return """🚨 강아지 설사할 때 약국 스멕타부터 먹이셨나요?

하남 사랑동물병원 김동준 원장님의 '온라인동물병원' 카페(조회수 1,734회)에 올라온 실제 보호자 후기!
"스멕타 며칠을 먹여도 안 잡히던 물설사가, 원장님 몬스멕타 급여 단 1번 만에 완전히 멈췄습니다."

일반 스멕타와 초미세 나노 몬모릴로나이트(몬스멕타/파보겔)의 결정적 흡착력 차이,
슬라이드를 넘겨 수의학적 원리를 확인해보세요! 👉

🔗 온라인동물병원 원문(#46187) & 가정 상비약 파보겔은 프로필 링크(parvogel.kr)에서 확인하세요!"""

        elif tid == "acute_diarrhea_contraindication":
            return """⛔ 강아지가 설사한다고 집에 있는 사람 지사제를 먹이셨나요?

설사는 장내 독소와 바이러스를 밖으로 밀어내는 생존 반응입니다.
화학 지사제로 장 운동을 강제로 멈추면 독소가 장 안에 갇혀 패혈증 쇼크를 유발할 수 있습니다!

하남 사랑동물병원 김동준 원장님이 알려주는 안전한 1차 응급 대처법:
"장 운동은 멈추지 말고, 점막은 실크처럼 감싼 뒤 독소만 자석처럼 끌어당겨 배출해야 합니다."

슬라이드를 넘겨 우리 아이를 살리는 응급 대처 수칙을 꼭 저장해 두세요! 👉"""

        elif tid == "parvo_mucosa_goldentime":
            return """🎬 [실화 다큐] 탈수로 수액 바늘조차 안 들어가던 55일령 아기 푸들의 7일 기록

치사율 90% 파보바이러스 확진, 체중 600g 미만의 아기 강아지에게 정맥 주사조차 놓을 수 없었던 절체절명의 순간.
생사를 가른 것은 '장 점막 코팅 속도'였습니다.

초미세 나노 몬모릴로나이트 집중 처치 후 5일 만에 혈변이 멎고 7일 만에 꼬리를 흔들며 퇴원한 감동 실화!
슬라이드로 치료 타임라인을 확인하고 프로필 링크(parvogel.kr)에서 다큐멘터리 원본 영상을 시청하세요! 👉"""

        else:
            return """🏢 분양 직후 자견 연변·장염, 왜 이동 첫 72시간에 집중될까요?

낯선 환경과 이동 스트레스는 장 점막 방어벽을 무너뜨려 잠복하던 바이러스와 유해균을 폭발시킵니다.
전국 18개 주요 제휴 켄넬이 도입한 [72시간 선제적 장 점막 코팅 프로토콜]!

주사기 교차 감염 걱정 없는 1초 원터치 딸기향 파보겔로 분양 초기 장 트러블을 원천 차단하세요. 👉"""

    def _build_x_thread(self, topic):
        tid = topic["id"]
        if tid == "case_smecta_vs_monsmecta":
            return {
                "tweets": [
                    "1/3 🚨 강아지 물설사에 약국 스멕타를 먹여도 안 멈추는 이유. 하남 사랑동물병원 김동준 원장님의 온라인동물병원(#46187, 조회수 1,734회) 실제 후기에서는 '스멕타로 안 잡히던 설사가 몬스멕타 단 1번 급여에 완전히 멎었다'고 보고합니다.",
                    "2/3 🔬 핵심은 입자 공정입니다. 일반 마이크로 입자와 달리 초미세 나노 몬모릴로나이트(몬스멕타/파보겔)는 손상된 장 융모에 실크 코팅막을 형성하고, 바이러스와 세균 외독소만 3.8배 강력하게 정전기적으로 흡착해 배출합니다.",
                    "3/3 🩺 장 운동을 억지로 마비시키지 않고 체내 흡수 없이 독소만 배출하는 가정용 응급 상비약 파보겔. 임상 다큐멘터리 및 원문 후기: https://parvogel.kr #강아지설사 #파보겔 #몬스멕타",
                ]
            }
        elif tid == "acute_diarrhea_contraindication":
            return {
                "tweets": [
                    "1/3 ⛔ 강아지 급성 설사 시 사람 지사제(로페라마이드 등)를 절대 먹이면 안 되는 수의학적 이유. 설사는 장내 독소를 배출하는 방어 반응인데, 장 연동운동을 강제로 마비시키면 독소가 혈관으로 역류해 패혈증을 유발합니다.",
                    "2/3 🧬 특히 콜리·쉽독 등 MDR1 유전자 변이 견종이나 혈뇌장벽이 미성숙한 어린 자견에게는 사람 지사제 성분이 치명적인 신경 마비를 일으킬 수 있습니다.",
                    "3/3 ✅ 올바른 응급 대처는 혈류로 흡수되지 않는 비흡수성 나노 몬모릴로나이트(파보겔)로 헐어버린 장 점막을 코팅하고 독소만 자석처럼 포획해 배출하는 것입니다. 가이드: https://parvogel.kr #강아지급성설사 #파보겔",
                ]
            }
        elif tid == "parvo_mucosa_goldentime":
            return {
                "tweets": [
                    "1/3 🎬 탈수가 너무 심해 정맥 수액 바늘조차 들어가지 않던 55일령 아기 푸들(파보 장염 확진). 치사율 90%의 위기에서 7일 만에 건강하게 퇴원한 실제 동물병원 임상 다큐멘터리 요약.",
                    "2/3 🛡️ 파보바이러스는 장 융모를 파괴해 탈수와 패혈증을 일으킵니다. 항체가 형성되는 첫 48시간 동안 초미세 나노 몬모릴로나이트로 벗겨진 점막을 집중 코팅해 독소 유입을 차단한 것이 승패를 갈랐습니다.",
                    "3/3 ✨ 5일 차 혈변 중단, 7일 차 스스로 사료를 먹으며 완치 퇴원! 하남 사랑동물병원 김동준 원장님의 7일 치료 전 과정 다큐멘터리 영상: https://parvogel.kr #파보장염 #파보겔",
                ]
            }
        else:
            return {
                "tweets": [
                    "1/3 🏢 분양·이동 후 72시간 이내에 아기 강아지 설사가 집중되는 이유. 환경 변화 스트레스(코르티솔 급증)가 장 점막 치밀결합을 느슨하게 만들어 잠복 유해균과 바이러스가 급증하기 때문입니다.",
                    "2/3 📋 상위 1% 전문 켄넬의 장 관리 프로토콜: 이동 2시간 전 & 도착 후 3일간 파보겔 선제 급여로 장 점막에 물리적 실크 코팅막을 유지해 연변과 장염을 사전에 차단합니다.",
                    "3/3 ⚡ 주사기 재사용으로 인한 교차 감염 없이 1초 원터치 펌프로 위생 급여! 브리더·가정 통합 장 점막 솔루션: https://parvogel.kr #켄넬장관리 #파보겔 #몬스멕타",
                ]
            }

    def generate_all_queued_topics(self, topic_filter=None, use_llm=False):
        results = []
        generated_files = []
        for topic in self.topics:
            if topic_filter and topic.get("id") != topic_filter:
                continue
            pkg, fpath = self.generate_content_for_topic(topic, use_llm=use_llm)
            results.append(pkg)
            generated_files.append(fpath)
        return results, generated_files


if __name__ == "__main__":
    use_llm_flag = "--llm" in sys.argv
    generator = ParvogelContentGenerator()
    generator.generate_all_queued_topics(use_llm=use_llm_flag)
