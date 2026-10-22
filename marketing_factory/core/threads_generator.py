#!/usr/bin/env python3
"""
Threads Content Generator Engine for Parvogel (파보겔)
- 페르소나: 30년 차 서울대 수의대 출신 김동준 수의사 (하남 사랑동물병원 원장 / 파보겔 학술자문위원)
- 스레드 알고리즘 최적화:
  1) 첫 줄 0.5초 스크롤 스토퍼 후킹
  2) 본문 3~5줄 담백한 임상 팩트 (외부 링크 0개, 마지막 문장은 첫 댓글 확인 유도)
  3) 첫 댓글 타래: 1~3분 지연 게시 (자연스러운 전환, [스토어링크] 치환)
- 콘텐츠 믹스: Type A(40%) / Type B(40%) / Type C(20%)
"""

import os
import sys
import json
import random
import datetime
import requests
from typing import Dict, Any, List

# UTF-8 출력 보장
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_DIR = os.path.dirname(FACTORY_DIR)
DATA_DIR = os.path.join(FACTORY_DIR, "data")

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(FACTORY_DIR, ".env"))
    load_dotenv(os.path.join(PROJECT_DIR, ".env"))
except ImportError:
    pass

# 스토어 링크 환경변수 또는 기본 스마트스토어/쿠팡 링크
DEFAULT_STORE_URL = os.environ.get(
    "PARVOGEL_STORE_URL",
    os.environ.get("PHARMAGEL_STORE_URL", "https://smartstore.naver.com/petschury/products/13718496355")
)

# 큐레이션된 수의학 임상 팩트베이스 (김동준 원장 감수 기반 템플릿 풀)
EXPERT_TEMPLATES = {
    "Type A": [
        {
            "hook_title": "나 30년 차 수의사 김동준인데, 솔직히 강아지 묽은 변 볼 때 사람 약 먹이는 집사들 보면 진짜 가슴 찢어짐.",
            "main_post": """나 하남에서 30년째 진료 보는 김동준 수의사인데, 강아지 설사한다고 사람 먹는 화학 지사제 먹이는 집사들 보면 진짜 가슴 찢어진다.

설사는 몸이 장내 유해 물질이랑 독소를 밖으로 비워내려고 버티는 방어 기전인데, 장 운동을 억지로 멈춰버리면 그 독소가 장 안에 갇혀서 장벽을 더 무너뜨린다. 

설사를 무작정 막는 게 아니라 '장 점막을 감싸주고 독소만 물리적으로 흡착해서 빼주는 것'과 '탈수 방지' 딱 두 가지만 기억해.

아이들 변 상태별 안심 대처법이랑 상비 겔 정보는 아래 첫 댓글에 남겨둘게.""",
            "media_recommendation": "진료실 책상 위 강아지 차트 또는 텍스트 온리",
            "first_comment": """쪽지로 어떤 보조제를 챙겨둬야 하냐고 물어보시는 분들이 많아 남겨둡니다.

화학 성분이 아닌 체내 흡수율 0% 천연 나노 몬모릴로나이트 겔(파보겔)처럼 독소만 자석처럼 끌고 나오는 제형으로 먹이셔야 간·신장 부담이 없습니다.

👉 파보겔 공식 스토어: [스토어링크]
(본 정보는 수의학적 상식 공유이며, 구토·무기력이 동반될 경우 즉시 동물병원 진료를 받으세요)"""
        },
        {
            "hook_title": "새끼 강아지 설사한다고 무작정 굶기는 집사들, 제발 멈춰라.",
            "main_post": """새끼 강아지 설사한다고 무작정 하루 종일 굶기는 집사들, 제발 멈춰라.

성견이야 반나절 금식이 장을 쉬게 해줄 수 있지만, 2~3개월 새끼나 3kg 미만 소형견은 12시간만 굶어도 저혈당 쇼크로 위험해질 수 있다.

장 점막이 헐어 있는 상태에서 영양 공급이 끊기면 회복이 더뎌진다. 장벽을 부드럽게 코팅해주면서 전해질과 포도당부터 채워줘야 기력을 유지할 수 있다.

월령별 안심 금식 가이드와 응급 상비 정보는 첫 댓글에 정리해 둘게.""",
            "media_recommendation": "수의사 가운 착용 진료실 배경 10초 영상 또는 텍스트",
            "first_comment": """DM 문의가 많아서 바로 보실 수 있게 남겨둡니다.

어린 아이들은 무작정 굶기지 마시고, 간·신장 부담 없이 전해질 보충과 장 점막 보호를 돕는 겔 제형(파보겔)을 1초만 잇몸에 발라주세요.

👉 파보겔 공식 스토어: [스토어링크]
*아이 체온이 떨어지거나 기립이 어려우면 지체 없이 응급 병원으로 가셔야 합니다."""
        }
    ],
    "Type B": [
        {
            "hook_title": "새벽에 애들 피설사 쏟고 응급실 50만 원 깨지기 전에 집에 무조건 둬야 하는 비상템.",
            "main_post": """새벽에 애들 붉은 변 쏟아내고 응급실 50만 원 깨지기 전에 집에 무조건 둬야 하는 비상템 하나 알려준다.

밤 2시에 갑자기 물설사 쏟아내면 집사들은 패닉 와서 손 벌벌 떨린다. 야간 병원 찾고 이동하는 데만 1~2시간 골든타임 다 지나가거든.

수액 바늘 잡기도 힘들던 0.6kg 젖먹이 푸들도 이 겔 하나 잇몸에 1초 만에 발라주며 고비 넘긴 임상 사례가 있다. 주사기 실랑이 없이 스스로 핥아먹는 천연 나노 스펀지 겔이다.

새벽 응급 상황 대처 수칙이랑 상비 제품 정보는 첫 댓글에 남겨둘게.""",
            "media_recommendation": "비상 상비약 파우치 속 파보겔 10초 직찍 영상",
            "first_comment": """새벽에 발만 동동 구르지 마시라고 댓글로 정보 남깁니다.

장염이나 급성 설사 의심 시 병원 이동 전 체온 유지하며 잇몸에 1초 만에 발라주는 응급 장 점막 코팅 겔(파보겔)입니다.

👉 파보겔 공식 스토어: [스토어링크]
(가정 상비용으로 구비해 두시면 새벽 긴급 상황에서 가장 든든한 1초가 됩니다)"""
        },
        {
            "hook_title": "장염 겪어본 집사들은 알 거다. 애가 물만 마셔도 왈칵 뿜어낼 때 그 절망감...",
            "main_post": """장염 겪어본 집사들은 알 거다. 애가 물만 마셔도 왈칵 뿜어낼 때 그 절망감...

위장이 뒤집혀서 주사기로 물 한 방울만 억지로 쏴줘도 거품 물고 토해낸다. 이때 억지로 물 들이붓다 기도로 넘어가면 흡인성 폐렴 위험이 있다.

절대 물을 억지로 먹이지 말고, 위산 완충해주면서 혀에 닿자마자 스스로 핥아먹는 부드러운 점착성 겔을 잇몸에 살짝 발라줘야 점막이 코팅되고 구토 반사가 잦아든다.

구토 잦아들게 돕는 수의학적 프로토콜은 아래 첫 댓글 확인해 줘.""",
            "media_recommendation": "지쳐 누워있는 강아지 옆 파보겔 펌핑 10초 영상",
            "first_comment": """물도 못 삼키는 위급 상황에서 쓰이는 수의사 처방 기전 공유합니다.

주사기 거부감 없이 혀 뒤편에 1초 펌프로 급여하는 고기호성 파보겔(나노 몬모릴로나이트 겔)입니다. 위산 완충과 유해 물질 흡착을 돕습니다.

👉 파보겔 공식 스토어: [스토어링크]
(응급 시 1회 펌프 후 30분간 안정시키고 배변 상태를 확인하세요)"""
        }
    ],
    "Type C": [
        {
            "hook_title": "가루약 먹이다가 애 입에 거품 물고 물림 사고까지 났던 집사들 주목.",
            "main_post": """가루약 먹이다가 애 입에 거품 물고 물림 사고까지 났던 집사들 주목.

강아지 소화기 약 지어오면 쓴맛 때문에 사료에 섞어도 귀신같이 뱉어내고, 캡슐 억지로 목구멍에 밀어 넣다가 피 본 집사들 수없이 봤다.

아픈 아이한테 투약 스트레스 주는 게 면역력 떨어뜨리는 주범이다. 파보겔은 펌프로 잇몸에 툭 짜주면 자기가 알아서 촵촵 핥아먹는다.

약 먹이기 전쟁 끝내는 초간단 급여법이랑 제품 정보는 첫 댓글에 남겨둘게.""",
            "media_recommendation": "강아지가 파보겔을 맛있게 핥아먹는 10초 리얼 먹방 릴스",
            "first_comment": """약 먹이기 힘들어하셨던 집사님들께 진심으로 권해드립니다.

가루 날림이나 주사기 실랑이 없이 1초 만에 쏙 급여하는 100% 천연 고기호성 파보겔입니다. 아픈 아이 간·신장 대사 부담이 없습니다.

👉 파보겔 공식 스토어: [스토어링크]
(100ml 상비용 펌프 병으로 상온 18개월 보관 가능합니다)"""
        }
    ]
}


class ThreadsContentGenerator:
    """스레드 고수익·고도달 바이럴 콘텐츠 생성 엔진"""

    def __init__(self):
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY", "")
        self.store_url = DEFAULT_STORE_URL

    def generate_single_thread(self, content_type: str = None) -> Dict[str, Any]:
        """지정된 타입(Type A, B, C) 또는 4:4:2 가중치로 단일 스레드 생성"""
        if not content_type:
            # 4:4:2 확률 선택
            content_type = random.choices(["Type A", "Type B", "Type C"], weights=[4, 4, 2], k=1)[0]

        now = datetime.datetime.now()
        content_id = f"thread_{now.strftime('%Y%m%d_%H%M%S')}"

        # 1. Gemini API 시도
        generated = self._generate_with_gemini(content_type)
        if not generated:
            # 2. 고품질 큐레이션 전문가 템플릿 풀에서 생성
            generated = self._generate_from_expert_templates(content_type)

        # [스토어링크] 실제 URL 치환
        first_comment = generated.get("first_comment", "").replace("[스토어링크]", self.store_url)

        thread_obj = {
            "content_id": content_id,
            "type": content_type,
            "hook_title": generated.get("hook_title", ""),
            "main_post": generated.get("main_post", "").strip(),
            "media_recommendation": generated.get("media_recommendation", "10초 직찍 영상 또는 텍스트 온리"),
            "first_comment": first_comment.strip(),
            "delay_seconds": generated.get("delay_seconds", 90),
            "created_at": now.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "PENDING_REVIEW"
        }

        return thread_obj

    def _generate_with_gemini(self, content_type: str) -> Dict[str, Any]:
        """Gemini REST API를 호출하여 스레드 규격에 맞는 JSON 생성"""
        if not self.gemini_api_key:
            return None

        prompt = f"""너는 30년 차 서울대 수의대 출신 김동준 수의사(하남 사랑동물병원 원장 / 파보겔 학술자문위원)다.
스레드(Threads)에서 반려동물(강아지/고양이) 장 건강 케어 보조사료인 '파보겔(Parvogel)'을 인바운드로 바이럴시킬 고수익·고도달 스레드 원고를 작성하라.

[콘텐츠 카테고리]: {content_type}
- Type A: 상식/주의사항 (보호자가 흔히 하는 장 건강 실수: 사람 지사제 남용 위험, 잘못된 장시간 절식 등)
- Type B: 응급 대응/노하우 (혈변, 수양성 설사 발생 시 골든타임 대처 및 비상 상비 겔 활용법)
- Type C: 실전 활용 (1초 펌프 겔 제형 장점, 흡착 배출 원리, 스트레스 없는 급여 팁)

[엄격한 스레드 작성 규칙]:
1. 톤앤매너: 전단지 말투 절대 금지. 30년 차 진료실 원장으로서 후배 집사에게 툭 털어놓는 솔직한 반말/독백체 ("나 30년 차 수의사 김동준인데...", "...집사들 보면 진짜 가슴 찢어진다").
2. 법률 준수: '완치', '치료약' 단정적 표현 금지. 장 점막 보호 및 독소 흡착 배출을 돕는 보조사료 관점으로 서술.
3. 첫 줄 후킹 (hook_title): 0.5초 만에 스크롤을 멈추게 만드는 강렬한 수치, 호기심, 업계 비밀 폭로형 카피.
4. 본문 (main_post): 
   - 3~5줄 이내 담백한 임상 팩트와 원인 분석 (300자 이내).
   - 절대 본문에 링크(URL)나 연락처 넣지 말 것 (알고리즘 페널티 방지).
   - 마지막 줄은 항상 다음 타래(첫 댓글)를 확인하도록 유도 ("자세한 대처법이랑 상비 겔 정보는 아래 첫 댓글에 남겨둘게.")
5. 첫 댓글 타래 (first_comment):
   - 본문 배포 후 90초 뒤 지연 게시될 전환용 댓글.
   - 쪽지 문의가 많아 남겨둔다는 뉘앙스.
   - 파보겔(초미세 천연 나노 몬모릴로나이트 겔, 간/신장 부담 0%, 1초 펌프) 소개 한 줄 + [스토어링크] 포함 + 필수 안내 문구.

반드시 오직 아래 JSON 포맷으로만 응답하라 (추가 설명 금지):
{{
  "hook_title": "첫 줄 후킹 문장",
  "main_post": "본문 전체 텍스트 (줄바꿈 포함, 300자 이내)",
  "media_recommendation": "10초 직찍 영상 또는 텍스트 온리 여부 지침",
  "first_comment": "첫 번째 댓글 텍스트 및 [스토어링크]",
  "delay_seconds": 90
}}"""


        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 800}
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                res_json = json.loads(text)
                return res_json
        except Exception as e:
            # 실패 시 폴백
            pass

        return None

    def _generate_from_expert_templates(self, content_type: str) -> Dict[str, Any]:
        """검증된 수의학 템플릿 풀에서 무작위 선택하여 반환"""
        pool = EXPERT_TEMPLATES.get(content_type, EXPERT_TEMPLATES["Type A"])
        return random.choice(pool).copy()

    def generate_batch(self, count: int = 3) -> List[Dict[str, Any]]:
        """검증용 배치(Type A, Type B, Type C 각 1개씩 또는 지정 개수) 생성"""
        types = ["Type A", "Type B", "Type C"]
        results = []
        for i in range(count):
            c_type = types[i % len(types)]
            thread_data = self.generate_single_thread(c_type)
            results.append(thread_data)
        return results

    def save_to_queue(self, thread_items: List[Dict[str, Any]], queue_path: str = None) -> str:
        """threads_queue.json에 저장 (중복 방지 및 누적)"""
        if not queue_path:
            queue_path = os.path.join(DATA_DIR, "threads_queue.json")
        
        os.makedirs(os.path.dirname(queue_path), exist_ok=True)
        
        existing = []
        if os.path.exists(queue_path):
            try:
                with open(queue_path, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            except Exception:
                existing = []

        existing_ids = {x.get("content_id") for x in existing}
        for item in thread_items:
            if item.get("content_id") not in existing_ids:
                existing.insert(0, item)

        with open(queue_path, "w", encoding="utf-8") as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)

        return queue_path


if __name__ == "__main__":
    generator = ThreadsContentGenerator()
    print("=" * 65)
    print("🐾 [PHARMAGEL] 스레드 바이럴 콘텐츠 생성 테스트 (Type A, B, C)")
    print("=" * 65)
    sample_batch = generator.generate_batch(3)
    for idx, item in enumerate(sample_batch, 1):
        print(f"\n[{idx}/3] 카테고리: {item['type']} (ID: {item['content_id']})")
        print(f"📌 [첫 줄 후킹]: {item['hook_title']}")
        print("-" * 50)
        print(f"📝 [본문 (Main Post - 링크 0개)]:\n{item['main_post']}")
        print("-" * 50)
        print(f"💬 [첫 댓글 타래 (지연 {item['delay_seconds']}초 뒤 게시)]:\n{item['first_comment']}")
        print("=" * 65)
    
    saved_path = generator.save_to_queue(sample_batch)
    print(f"\n✓ 검수용 큐 파일 저장 완료: {saved_path}")
