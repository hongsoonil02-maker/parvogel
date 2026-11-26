import json
import re
from typing import Any, Dict, List, Tuple


OFFICIAL_COMPANY_NAME = "(주)한국아그로"
OFFICIAL_PHONE = "02-6949-5708"
OFFICIAL_DOMAIN = "https://parvogel.kr"
OFFICIAL_PRODUCT_NAME = "파보겔 100ml 정품"
OFFICIAL_KOREAAGRO_URL = "https://smartstore.naver.com/koreaagro/products/11119190020"

# 확정된 브랜드 분리 & 법규 안전 USP (에스앤제이 동물병원 상호 배제, 100ml 정품 단독)
APPROVED_USPS: Dict[str, str] = {
    "authority": "서울대 수의대 출신 수의학 전문가 홍순일 수의사 설계",
    "science": (
        "경상국립대 수의학 연구 기반 및 특허균주 Bacillus subtilis MORI(특허 제2011B0042620.8호)와 "
        "초미세 나노 몬모릴로나이트 배합으로 장 건강·점막 보호 및 컨디션 관리에 도움 (동물용 정식등록 보조사료)"
    ),
    "offer": (
        "조건 없는 파보겔 100ml 정품 본품 무상 체험 제공 (먼저 급여 후 만족 시에만 공구 진행) · "
        "파보겔 100ml 정품 다구성 할인 및 동일 100ml 추가 증정 단독 기획 · "
        "판매 수수료 20~30% 협의"
    ),
}

# 절대 차단 토큰 (타 브랜드/동물병원 전용 라인업 + 200ml/500ml + 사료관리법 금지어)
FORBIDDEN_GONGGU_TOKENS: List[str] = [
    "몬스멕타",
    "monsmecta",
    "에스앤제이",
    "snj",
    "031-321-6562",
    "080-881-1289",
    "헤파맥스",
    "hepamax",
    "레날디톡스",
    "renaldetox",
    "하트케어",
    "heartcare",
    "로타갈",
    "rotagel",
    "베타콜",
    "betacol",
    "500ml",
    "200ml",
    "몽모릴로나이트",
    "무료 샘플",
    "무료샘플",
    "완치",
    "100% 완치",
    "치료제",
    "치료",
    "처방약",
    "처방",
    "상비약",
    "상비제",
    "정식허가",
    "부작용 제로",
    "부작용 없음",
    "특효약",
    "petschury",
]

SAFE_COPY_REPLACEMENTS: List[Tuple[str, str]] = [
    ("에스앤제이 동물병원", OFFICIAL_COMPANY_NAME),
    ("에스앤제이동물병원", OFFICIAL_COMPANY_NAME),
    ("질병 예방·치료에 도움", "장 건강·점막 보호 및 컨디션 관리에 도움"),
    ("질병 예방 및 치료", "장 점막 보호 및 컨디션 관리"),
    ("100% 완치", "빠른 컨디션 회복 도움"),
    ("완치", "컨디션 회복 도움"),
    ("치료제", "장 점막 보호 보조사료"),
    ("처방약", "영양 보조제"),
    ("치료", "장 점막 케어"),
    ("처방", "급여"),
    ("무료 샘플", "파보겔 100ml 정품 체험"),
    ("무료샘플", "파보겔 100ml 정품 체험"),
    ("상비약", "응급 상비템"),
    ("상비제", "응급 상비템"),
    ("부작용 제로", "부담 적은 천연 미네랄"),
    ("부작용 없음", "부담 적은 원료 설계"),
    ("정식허가", "정식등록"),
    ("특효약", "핵심 케어 솔루션"),
    ("몽모릴로나이트", "몬모릴로나이트"),
]


def build_prompt_negative_constraints() -> str:
    """LLM 프롬프트 주입용 브랜드 분리·사료관리법 네거티브 제약 블록."""
    return (
        "[절대 준수 브랜드 분리 및 법규 가드레일]\n"
        f"1. 오직 '{OFFICIAL_PRODUCT_NAME}'만 제안하며 200ml·500ml·타 브랜드 용량은 절대 언급 금지.\n"
        "2. 동물병원 전용 라인업('몬스멕타', '헤파맥스', '레날디톡스', '하트케어 겔') 및 '에스앤제이 동물병원' 상호 절대 언급 금지.\n"
        f"3. 공식 공급사는 반드시 '{OFFICIAL_COMPANY_NAME} ({OFFICIAL_PHONE}, {OFFICIAL_DOMAIN})', 스토어는 'koreaagro' 기준만 사용.\n"
        "4. 사료관리법 준수: '완치', '치료제', '치료', '처방', '무료 샘플', '부작용 제로', '정식허가', '상비약' 단어 절대 금지.\n"
        "5. 효능 표현은 '장 건강·점막 보호 및 컨디션 관리에 도움 (동물용 정식등록 보조사료)' 범위 내에서만 작성.\n"
    )


def sanitize_gonggu_copy(text: str) -> Tuple[str, List[str]]:
    """안전하지 않은 표현이 감지되면 자동 순화하고 치환 목록(마스킹)을 반환합니다."""
    cleaned = text or ""
    replaced: List[str] = []
    for bad, safe in SAFE_COPY_REPLACEMENTS:
        if bad in cleaned:
            cleaned = cleaned.replace(bad, safe)
            replaced.append(bad)
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned).strip()
    return cleaned, replaced


def find_forbidden_gonggu_tokens(payload: Any) -> List[str]:
    """문자열 또는 딕셔너리 직렬화 결과에서 금지 토큰을 탐지합니다."""
    raw = payload if isinstance(payload, str) else json.dumps(payload, ensure_ascii=False)
    lowered = raw.lower()
    hits: List[str] = []
    for tok in FORBIDDEN_GONGGU_TOKENS:
        if tok.lower() in lowered:
            hits.append(tok)
    return hits


def assert_gonggu_safe(payload: Any, context: str = "influencer_gonggu") -> None:
    """금지 토큰(몬스멕타, 에스앤제이, 500ml, 사료관리법 위반어 등) 포함 시 즉시 차단합니다."""
    hits = find_forbidden_gonggu_tokens(payload)
    if hits:
        raise ValueError(
            f"[GONGGU GUARDRAIL BLOCKED:{context}] Prohibited brand/compliance tokens detected: {hits}"
        )
