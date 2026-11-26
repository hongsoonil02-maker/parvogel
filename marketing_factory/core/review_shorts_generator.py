import csv
import datetime
import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple, Union


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COMPLIANCE_PATH = os.path.join(PROJECT_DIR, "marketing_factory", "config", "compliance_rules.json")


class ReviewShortsGenerator:
    """
    실제 스마트스토어·쿠팡 구매자 리뷰 기반 '공감형 후킹 쇼츠(episode_type="review_hook")' 대본 및 마스터 JSON 생성기.
    - 제품별 브랜드 격리 규칙 엄격 적용: ParvoGel((주)한국아그로) vs SNJ 4종(Monsmecta/Hepamax/Renaldetox/Heartcare Gel)
    - 사료관리법·금지어 자동 순화 (치료/완치/처방/상비약/정식허가/부작용 없음 등 차단 및 순화)
    - 15초 4비트 전개(2초 후킹 → 보호자 불편 상황 → 공식 실사 제품 급여 컷 → 한 줄 결론)
    """

    PRODUCT_ALIASES: Dict[str, str] = {
        "parvogel": "ParvoGel",
        "pavogel": "ParvoGel",
        "파보겔": "ParvoGel",
        "monsmecta": "Monsmecta",
        "몬스멕타": "Monsmecta",
        "hepamax": "Hepamax",
        "헤파맥스": "Hepamax",
        "renaldetox": "Renaldetox",
        "레날디톡스": "Renaldetox",
        "heartcare gel": "Heartcare Gel",
        "heartcare_gel": "Heartcare Gel",
        "heartcare": "Heartcare Gel",
        "하트케어 겔": "Heartcare Gel",
        "하트케어겔": "Heartcare Gel",
    }

    BRAND_PROFILES: Dict[str, Dict[str, Any]] = {
        "ParvoGel": {
            "brand_group": "KOREA_AGRO",
            "company_name": "(주)한국아그로",
            "phone": "02-6949-5708",
            "display_name": "파보겔 (ParvoGel)",
            "official_url": "https://parvogel.kr/",
            "smartstore_url": "https://smartstore.naver.com/koreaagro/products/11119190020",
            "coupang_url": "https://www.coupang.com/vp/products/8454837497",
            "official_asset": "public/images/bottle_front.png",
            "official_asset_group": "public/images/bottle_group.png",
            "default_broll_ids": {
                "hook": "BROLL_01",
                "pain": "BROLL_02",
                "happy": "BROLL_05",
            },
            "default_fallbacks": {
                "hook": "public/assets/parvogel_case_01_seizure.mp4",
                "pain": "public/assets/parvogel_case_02_lethargy.mp4",
                "happy": "public/assets/parvogel_case_05_eating.mp4",
            },
            "clip_rotation_pools": {
                "hook": [
                    "public/assets/parvogel_case_01_seizure.mp4",
                    "public/assets/parvogel_case_02_lethargy.mp4",
                ],
                "pain": [
                    "public/assets/parvogel_case_02_lethargy.mp4",
                    "public/assets/parvogel_case_03_standing.mp4",
                    "public/assets/김동준원장_동영상 4-1.mp4",
                ],
                "happy": [
                    "public/assets/parvogel_case_05_eating.mp4",
                    "public/assets/김동준원장_동영상 6-1.mp4",
                    "public/assets/parvogel_case_04_alertness.mp4",
                ],
            },
            "care_focus": "장 컨디션과 기력이 떨어졌을 때",
            "feeding_action": "1초 원터치 펌프로 가볍게 챙겨주면",
            "target_audience": "국내 반려견 가정(B2C)",
            "forbidden_cross_brand_tokens": [
                "몬스멕타",
                "monsmecta",
                "에스앤제이",
                "031-321-6562",
                "080-881-1289",
                "hepamax",
                "renaldetox",
                "heartcare",
                "로타갈",
                "베타콜",
                "무료 샘플",
                "무료샘플",
            ],
            "hashtags": ["#파보겔", "#반려견영양케어", "#강아지장건강", "#반려견비상템", "#한국아그로"],
            "disclaimer": "※ 본 콘텐츠는 실제 보호자 급여 후기를 바탕으로 제작되었으며, 의학적 진단·처치는 수의사 상담을 권장합니다.",
        },
        "Monsmecta": {
            "brand_group": "SNJ",
            "company_name": "에스앤제이동물병원",
            "phone": "031-321-6562",
            "display_name": "몬스멕타 (Monsmecta)",
            "official_url": "https://monsmecta.kr/",
            "smartstore_url": "https://monsmecta.kr/",
            "coupang_url": "https://monsmecta.kr/",
            "official_asset": "monsmecta_landing/public/assets/bottle_mockup.png",
            "official_asset_group": "monsmecta_landing/public/assets/bottle_mockup.png",
            "default_broll_ids": {
                "hook": "SNJ_BROLL_01",
                "pain": "SNJ_BROLL_02",
                "happy": "SNJ_BROLL_03",
            },
            "default_fallbacks": {
                "hook": "monsmecta_landing/public/assets/snj_case_01_night.mp4",
                "pain": "monsmecta_landing/public/assets/snj_case_02_water.mp4",
                "happy": "monsmecta_landing/public/assets/snj_case_03_recovery.mp4",
            },
            "care_focus": "갑작스런 묽은 변과 속 불편이 왔을 때",
            "feeding_action": "고순도 몬모릴로나이트 겔을 가볍게 급여하면",
            "target_audience": "반려동물 장 컨디션 케어 보호자",
            "forbidden_cross_brand_tokens": ["파보겔", "parvogel", "pavogel", "한국아그로", "02-6949-5708"],
            "hashtags": ["#몬스멕타", "#반려동물장케어", "#강아지묽은변케어", "#에스앤제이동물병원"],
            "disclaimer": "※ 본 콘텐츠는 실제 보호자 급여 경험을 바탕으로 구성되었으며, 이상 징후 지속 시 동물병원 진료를 권장합니다.",
        },
        "Hepamax": {
            "brand_group": "SNJ",
            "company_name": "에스앤제이동물병원",
            "phone": "031-321-6562",
            "display_name": "헤파맥스 (Hepamax)",
            "official_url": "https://monsmecta.kr/",
            "smartstore_url": "https://monsmecta.kr/",
            "coupang_url": "https://monsmecta.kr/",
            "official_asset": "monsmecta_landing/public/assets/hepamax_real_front.png",
            "official_asset_group": "monsmecta_landing/public/assets/hepamax_real_front.png",
            "default_broll_ids": {
                "hook": "SNJ_BROLL_01",
                "pain": "SNJ_BROLL_02",
                "happy": "SNJ_BROLL_03",
            },
            "default_fallbacks": {
                "hook": "monsmecta_landing/public/assets/snj_case_01_night.mp4",
                "pain": "monsmecta_landing/public/assets/snj_case_02_water.mp4",
                "happy": "monsmecta_landing/public/assets/snj_case_03_recovery.mp4",
            },
            "care_focus": "노령견·실내견의 간 영양 활력이 신경 쓰일 때",
            "feeding_action": "간 영양 설계 겔로 데일리 케어를 챙겨주면",
            "target_audience": "노령견·간 건강 관리 보호자",
            "forbidden_cross_brand_tokens": ["파보겔", "parvogel", "pavogel", "한국아그로", "02-6949-5708"],
            "hashtags": ["#헤파맥스", "#반려견간영양", "#노령견케어", "#에스앤제이동물병원"],
            "disclaimer": "※ 본 콘텐츠는 실제 보호자 급여 경험을 바탕으로 구성되었으며, 의학적 진료는 수의사 상담을 권장합니다.",
        },
        "Renaldetox": {
            "brand_group": "SNJ",
            "company_name": "에스앤제이동물병원",
            "phone": "031-321-6562",
            "display_name": "레날디톡스 (Renaldetox)",
            "official_url": "https://monsmecta.kr/",
            "smartstore_url": "https://monsmecta.kr/",
            "coupang_url": "https://monsmecta.kr/",
            "official_asset": "monsmecta_landing/public/assets/renaldetox_bottle.png",
            "official_asset_group": "monsmecta_landing/public/assets/renaldetox_bottle.png",
            "default_broll_ids": {
                "hook": "SNJ_BROLL_01",
                "pain": "SNJ_BROLL_02",
                "happy": "SNJ_BROLL_03",
            },
            "default_fallbacks": {
                "hook": "monsmecta_landing/public/assets/snj_case_01_night.mp4",
                "pain": "monsmecta_landing/public/assets/snj_case_02_water.mp4",
                "happy": "monsmecta_landing/public/assets/snj_case_03_recovery.mp4",
            },
            "care_focus": "신장 컨디션과 음수량 밸런스가 걱정될 때",
            "feeding_action": "부담 적은 신장 영양 케어로 꾸준히 돌봐주면",
            "target_audience": "신장 영양 밸런스 관리 보호자",
            "forbidden_cross_brand_tokens": ["파보겔", "parvogel", "pavogel", "한국아그로", "02-6949-5708"],
            "hashtags": ["#레날디톡스", "#반려동물신장영양", "#노령묘노령견케어", "#에스앤제이동물병원"],
            "disclaimer": "※ 본 콘텐츠는 실제 보호자 급여 경험을 바탕으로 구성되었으며, 의학적 진료는 수의사 상담을 권장합니다.",
        },
        "Heartcare Gel": {
            "brand_group": "SNJ",
            "company_name": "에스앤제이동물병원",
            "phone": "031-321-6562",
            "display_name": "하트케어 겔 (Heartcare Gel)",
            "official_url": "https://monsmecta.kr/",
            "smartstore_url": "https://monsmecta.kr/",
            "coupang_url": "https://monsmecta.kr/",
            "official_asset": "monsmecta_landing/public/assets/heartcare_mockup.png",
            "official_asset_group": "monsmecta_landing/public/assets/heartcare_mockup.png",
            "default_broll_ids": {
                "hook": "SNJ_BROLL_01",
                "pain": "SNJ_BROLL_02",
                "happy": "SNJ_BROLL_03",
            },
            "default_fallbacks": {
                "hook": "monsmecta_landing/public/assets/snj_case_01_night.mp4",
                "pain": "monsmecta_landing/public/assets/snj_case_02_water.mp4",
                "happy": "monsmecta_landing/public/assets/snj_case_03_recovery.mp4",
            },
            "care_focus": "산책 후 호흡이나 심장 컨디션이 신경 쓰일 때",
            "feeding_action": "기호성 좋은 심혈관 영양 겔을 꾸준히 급여하면",
            "target_audience": "소형견·노령견 심혈관 영양 관리 보호자",
            "forbidden_cross_brand_tokens": ["파보겔", "parvogel", "pavogel", "한국아그로", "02-6949-5708"],
            "hashtags": ["#하트케어겔", "#강아지심장영양", "#소형견데일리케어", "#에스앤제이동물병원"],
            "disclaimer": "※ 본 콘텐츠는 실제 보호자 급여 경험을 바탕으로 구성되었으며, 의학적 진료는 수의사 상담을 권장합니다.",
        },
    }

    # 사료관리법 및 브랜드 안전 치환 사전 (가장 긴 패턴부터 먼저 치환)
    COMPLIANCE_REPLACEMENTS: List[Tuple[str, str]] = [
        ("100% 완치", "빠른 컨디션 회복에 큰 도움"),
        ("치료 보장", "꾸준한 영양 관리 도움"),
        ("부작용 제로", "부담 적은 원료 설계"),
        ("부작용 없음", "부담 적은 원료 설계"),
        ("부작용이 전혀 없", "자극 부담이 적"),
        ("무료 샘플", "정품 본품 구매"),
        ("무료샘플", "정품 본품 구매"),
        ("특효약", "비상 상비템"),
        ("치료제", "영양 케어 보조제"),
        ("처방약", "영양 보조제"),
        ("상비약", "비상 상비템"),
        ("상비제", "비상 상비템"),
        ("정식허가", "엄격한 품질 기준"),
        ("완치", "컨디션 회복"),
        ("치료", "영양 케어"),
        ("처방", "영양 급여"),
        ("몽모릴로나이트", "몬모릴로나이트"),
    ]

    PAIN_RULES: List[Tuple[str, List[str], str]] = [
        ("야간·새벽 돌발 속불편", ["새벽", "밤", "주말", "병원 문 닫", "토하", "구토", "우엑"], "병원 문 닫은 밤 갑작스러운 속불편"),
        ("갑작스런 묽은 변·장 트러블", ["설사", "묽은", "물똥", "혈변", "장염", "배탈", "변 상태"], "갑자기 무너진 배변 컨디션"),
        ("식욕·기력 급감", ["밥을 안", "사료 거부", "기력", "축 처", "물도 안", "식욕"], "사료까지 거부하며 축 처진 모습"),
        ("급여 거부·기호성 걱정", ["안 먹", "입이 짧", "거부감", "먹이기 힘", "억지로"], "예민한 아이 급여 걱정"),
        ("환경 변화·스트레스 컨디션 난조", ["스트레스", "산책", "미용", "이사", "여행", "호텔링", "환절기"], "환경 변화 후 예민해진 컨디션"),
    ]

    SATISFACTION_RULES: List[Tuple[str, List[str], str]] = [
        ("기호성·편한 급여", ["잘 먹", "할짝", "기호성", "스포이드", "겔", "간편", "먹이기 편"], "거부감 없이 스스로 핥아먹는 급여 편의성"),
        ("빠른 컨디션 안정 체감", ["진정", "괜찮아", "활력", "뛰어노", "변이 잡", "사료 먹", "회복"], "다음 날 한결 편해진 아이 컨디션"),
        ("비상 상비템 안심감", ["상비", "쟁여", "비상", "안심", "재구매", "구비"], "집에 구비해 두면 마음이 놓이는 비상 케어 루틴"),
    ]

    HOOK_PATTERNS = ("empathy_question", "review_metric", "contrast_crisis")

    def __init__(self, compliance_path: Optional[str] = None):
        self.compliance_path = compliance_path or COMPLIANCE_PATH
        self.compliance_config = self._load_json(self.compliance_path)

    @staticmethod
    def _load_json(path: str) -> Dict[str, Any]:
        if path and os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    @classmethod
    def normalize_product_name(cls, product_name: str) -> str:
        key = (product_name or "").strip().lower()
        if key in cls.PRODUCT_ALIASES:
            return cls.PRODUCT_ALIASES[key]
        supported = ", ".join(cls.BRAND_PROFILES.keys())
        raise ValueError(f"Unsupported product '{product_name}'. Supported: {supported}")

    @classmethod
    def sanitize_copy(cls, text: str) -> Tuple[str, List[str]]:
        """금지 과대광고·의약품 오인 표현을 안전한 보호자 경험 표현으로 자동 순화합니다."""
        cleaned = text or ""
        replaced: List[str] = []
        for bad, safe in cls.COMPLIANCE_REPLACEMENTS:
            if bad in cleaned:
                cleaned = cleaned.replace(bad, safe)
                replaced.append(bad)
        cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
        return cleaned, replaced

    @classmethod
    def check_forbidden_tokens(cls, payload: Dict[str, Any], product_key: str) -> List[str]:
        profile = cls.BRAND_PROFILES[product_key]
        serialized = json.dumps(payload, ensure_ascii=False).lower()
        hits: List[str] = []

        prohibited = [
            "100% 완치", "완치", "치료제", "치료", "처방약", "처방",
            "상비약", "상비제", "정식허가", "부작용 제로", "부작용 없음", "특효약", "몽모릴로나이트",
        ]
        for tok in prohibited:
            if tok.lower() in serialized:
                hits.append(tok)
        for tok in profile["forbidden_cross_brand_tokens"]:
            if tok.lower() in serialized:
                hits.append(f"CROSS_BRAND:{tok}")
        return hits

    @classmethod
    def load_reviews(cls, source: Union[str, List[Any]]) -> List[Dict[str, Any]]:
        """
        텍스트 문자열, .txt/.csv/.json 파일 경로 또는 리뷰 리스트를 표준 리뷰 레코드 리스트로 변환합니다.
        """
        if isinstance(source, list):
            records: List[Dict[str, Any]] = []
            for idx, item in enumerate(source, start=1):
                if isinstance(item, dict):
                    txt = str(item.get("content") or item.get("review") or item.get("text") or "").strip()
                    if txt:
                        records.append({
                            "id": item.get("id", f"rev_{idx}"),
                            "rating": float(item.get("rating", 5.0) or 5.0),
                            "platform": str(item.get("platform", "smartstore")),
                            "content": txt,
                        })
                elif isinstance(item, str) and item.strip():
                    records.append({"id": f"rev_{idx}", "rating": 5.0, "platform": "raw", "content": item.strip()})
            return records

        if not isinstance(source, str) or not source.strip():
            raise ValueError("reviews source cannot be empty")

        source_str = source.strip()
        if os.path.exists(source_str) and os.path.isfile(source_str):
            ext = os.path.splitext(source_str)[1].lower()
            if ext == ".json":
                with open(source_str, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, dict) and isinstance(data.get("reviews"), list):
                    return cls.load_reviews(data["reviews"])
                if isinstance(data, list):
                    return cls.load_reviews(data)
                raise ValueError(f"Unsupported JSON structure in {source_str}")
            if ext == ".csv":
                rows: List[Dict[str, Any]] = []
                with open(source_str, "r", encoding="utf-8-sig", newline="") as f:
                    reader = csv.DictReader(f)
                    for idx, row in enumerate(reader, start=1):
                        txt = (
                            row.get("content")
                            or row.get("review")
                            or row.get("리뷰")
                            or row.get("text")
                            or row.get("body")
                            or ""
                        ).strip()
                        if txt:
                            rating_raw = row.get("rating") or row.get("별점") or "5"
                            try:
                                rating_val = float(str(rating_raw).strip())
                            except ValueError:
                                rating_val = 5.0
                            rows.append({
                                "id": f"csv_{idx}",
                                "rating": rating_val,
                                "platform": (row.get("platform") or row.get("플랫폼") or "csv").strip(),
                                "content": txt,
                            })
                return rows
            with open(source_str, "r", encoding="utf-8") as f:
                source_str = f.read()

        # 원문 텍스트 멀티라인 파싱
        lines = [re.sub(r"^\s*(?:[-*]|\d+[.)])\s*", "", ln).strip() for ln in source_str.splitlines()]
        return [
            {"id": f"txt_{idx}", "rating": 5.0, "platform": "text", "content": ln}
            for idx, ln in enumerate(lines, start=1)
            if ln
        ]

    def analyze_reviews(
        self,
        reviews: List[Dict[str, Any]],
        product_key: str,
    ) -> Dict[str, Any]:
        """리뷰에서 다빈도 Pain Point, 만족 포인트, 안전 순화된 핵심 문구를 추출합니다."""
        pain_scores: Dict[str, int] = {label: 0 for label, _, _ in self.PAIN_RULES}
        pain_copy_map: Dict[str, str] = {label: copy for label, _, copy in self.PAIN_RULES}
        sat_scores: Dict[str, int] = {label: 0 for label, _, _ in self.SATISFACTION_RULES}
        sat_copy_map: Dict[str, str] = {label: copy for label, _, copy in self.SATISFACTION_RULES}

        sanitized_snippets: List[str] = []
        filtered_terms: List[str] = []

        for rev in reviews:
            raw_txt = rev.get("content", "")
            safe_txt, replaced = self.sanitize_copy(raw_txt)
            filtered_terms.extend(replaced)
            sanitized_snippets.append(safe_txt)

            for label, keywords, _ in self.PAIN_RULES:
                if any(kw in raw_txt for kw in keywords):
                    pain_scores[label] += 1
            for label, keywords, _ in self.SATISFACTION_RULES:
                if any(kw in raw_txt for kw in keywords):
                    sat_scores[label] += 1

        ranked_pains = sorted(pain_scores.items(), key=lambda x: x[1], reverse=True)
        ranked_sats = sorted(sat_scores.items(), key=lambda x: x[1], reverse=True)

        top_pains = [label for label, cnt in ranked_pains if cnt > 0][:2] or [self.PAIN_RULES[0][0]]
        top_sats = [label for label, cnt in ranked_sats if cnt > 0][:2] or [self.SATISFACTION_RULES[0][0]]

        primary_pain_copy = pain_copy_map[top_pains[0]]
        primary_sat_copy = sat_copy_map[top_sats[0]]

        avg_rating = round(sum(float(r.get("rating", 5.0)) for r in reviews) / max(1, len(reviews)), 2)

        def _mask_term(term: str) -> str:
            if len(term) <= 2:
                return term[0] + "*"
            return term[0] + ("*" * (len(term) - 2)) + term[-1]

        masked_filtered = [_mask_term(t) for t in sorted(set(filtered_terms))]

        return {
            "product": product_key,
            "review_count_analyzed": len(reviews),
            "average_rating": avg_rating,
            "top_pain_points": top_pains,
            "top_satisfaction_points": top_sats,
            "primary_pain_phrase": primary_pain_copy,
            "primary_satisfaction_phrase": primary_sat_copy,
            "filtered_terms_count": len(filtered_terms),
            "filtered_terms_masked": masked_filtered,
            "verified_snippets": sanitized_snippets[:3],
        }

    def _build_hook_line(
        self,
        hook_pattern: str,
        product_key: str,
        insights: Dict[str, Any],
        review_total_badge: str = "1,000개",
        day_seed: Optional[int] = None,
    ) -> Tuple[str, str]:
        """첫 2초 스크롤 정지 후킹 패턴 (3종 중 선택 또는 날짜별 자동 순환) 생성."""
        pattern = (hook_pattern or "auto").strip().lower()
        if pattern == "auto":
            if day_seed is not None:
                pattern = self.HOOK_PATTERNS[day_seed % len(self.HOOK_PATTERNS)]
            else:
                pain_first = insights["top_pain_points"][0]
                if "야간" in pain_first or "새벽" in pain_first:
                    pattern = "empathy_question"
                elif insights["review_count_analyzed"] >= 5:
                    pattern = "review_metric"
                else:
                    pattern = "contrast_crisis"

        if pattern not in self.HOOK_PATTERNS:
            raise ValueError(f"hook_pattern must be one of {self.HOOK_PATTERNS} or 'auto', got '{hook_pattern}'")

        if pattern == "empathy_question":
            if "묽은" in insights["top_pain_points"][0]:
                hook_text = "새벽에 강아지 변 상태가 갑자기 무너져서 당황하셨죠?"
            else:
                hook_text = "새벽에 강아지가 갑자기 속 불편해해서 당황하셨죠?"
        elif pattern == "review_metric":
            hook_text = f"실제 보호자 리뷰 {review_total_badge} 넘게 쌓인 비상 상비템"
        else:
            hook_text = "병원 문 닫은 밤, 이거 없었으면 진짜 당황할 뻔했습니다"

        hook_text, _ = self.sanitize_copy(hook_text)
        return pattern, hook_text

    def generate_master_json(
        self,
        product_name: str,
        reviews_source: Union[str, List[Any]],
        hook_pattern: str = "auto",
        date_str: Optional[str] = None,
        review_total_badge: str = "1,000개",
        preferred_broll_model: str = "kling-3.0-720p",
    ) -> Dict[str, Any]:
        """
        기존 파이프라인(ShortformAutoRenderer / ParvogelMarketingMaster)이 바로 읽을 수 있는
        확장 마스터 JSON (`episode_type: "review_hook"`)을 생성하고 컴플라이언스를 검증합니다.
        """
        today = date_str or datetime.date.today().strftime("%Y-%m-%d")
        try:
            day_num = datetime.date.fromisoformat(today).day
            day_seed = day_num
        except Exception:
            day_seed = 0

        product_key = self.normalize_product_name(product_name)
        profile = self.BRAND_PROFILES[product_key]
        reviews = self.load_reviews(reviews_source)
        insights = self.analyze_reviews(reviews, product_key)
        resolved_hook, hook_narration = self._build_hook_line(
            hook_pattern=hook_pattern,
            product_key=product_key,
            insights=insights,
            review_total_badge=review_total_badge,
            day_seed=day_seed,
        )

        compact_date = today.replace("-", "")
        slug = re.sub(r"[^a-z0-9]+", "", product_key.lower())
        version_id = f"REVIEW_{slug.upper()}_{resolved_hook.upper()}_{compact_date}"

        pools = profile.get("clip_rotation_pools", {})
        hook_pool = pools.get("hook") or [profile["default_fallbacks"]["hook"]]
        pain_pool = pools.get("pain") or [profile["default_fallbacks"]["pain"]]
        happy_pool = pools.get("happy") or [profile["default_fallbacks"]["happy"]]
        official_pool = [profile["official_asset"], profile.get("official_asset_group", profile["official_asset"])]

        selected_hook_clip = hook_pool[day_seed % len(hook_pool)]
        selected_pain_clip = pain_pool[day_seed % len(pain_pool)]
        selected_happy_clip = happy_pool[day_seed % len(happy_pool)]
        selected_official_asset = official_pool[day_seed % len(official_pool)]

        spoken_name = profile["display_name"].split(" (")[0]
        pain_narration, _ = self.sanitize_copy(
            f"{insights['primary_pain_phrase']}, 아이 컨디션 떨어지면 보호자 마음부터 내려앉죠."
        )
        feeding_narration, _ = self.sanitize_copy(
            f"실제 후기에서 극찬받은 {spoken_name}, {profile['feeding_action']}."
        )
        conclusion_narration, _ = self.sanitize_copy(
            f"{insights['primary_satisfaction_phrase']}. 우리 집 필수 상비템으로 챙겨두세요."
        )

        hook_caption = "새벽 돌발 상황 당황하셨죠?" if resolved_hook == "empathy_question" else (
            f"실제 리뷰 {review_total_badge} 비상 상비템" if resolved_hook == "review_metric" else "병원 문 닫은 밤 긴급 대처"
        )

        scenes = [
            {
                "scene_no": 1,
                "timecode": "00:00-00:02.5",
                "duration_sec": 2.5,
                "beat": "hook_2s",
                "broll_id": profile["default_broll_ids"]["hook"],
                "broll_source": "higgsfield_720p",
                "use_ai_broll": True,
                "broll_resolution": "720p",
                "broll_model": preferred_broll_model,
                "broll_fallback_file": selected_hook_clip,
                "protect_product_integrity": True,
                "visual_cue": "어두운 거실 야간 조명, 바닥 패드 앞에서 웅크리고 불안해하는 소형견 클로즈업 (제품 미노출)",
                "broll_prompt": (
                    "Vertical 9:16 realistic handheld smartphone video, dim midnight living room, "
                    "small Maltese dog sitting anxiously on a puppy pad looking lethargic, gentle warm lamp light, clean background"
                ),
                "caption": hook_caption,
                "narration": hook_narration,
                "bgm_sound": "긴박한 심장박동 페이드인",
            },
            {
                "scene_no": 2,
                "timecode": "00:02.5-00:07.0",
                "duration_sec": 4.5,
                "beat": "pain_situation",
                "broll_id": profile["default_broll_ids"]["pain"],
                "broll_source": "higgsfield_720p",
                "use_ai_broll": True,
                "broll_resolution": "720p",
                "broll_model": preferred_broll_model,
                "broll_fallback_file": selected_pain_clip,
                "protect_product_integrity": True,
                "visual_cue": "보호자 손이 걱정스럽게 반려견 등을 쓰다듬고 물그릇을 확인하는 리얼 일상 컷 (제품 미노출)",
                "broll_prompt": (
                    "Vertical 9:16 realistic video, caring Korean pet owner hand gently stroking a quiet small dog near a stainless water bowl at home, "
                    "natural indoor lighting, shallow depth of field, authentic home footage"
                ),
                "caption": "보호자가 겪은 가장 막막한 순간",
                "narration": pain_narration,
                "bgm_sound": "잔잔한 공감 앰비언트",
            },
            {
                "scene_no": 3,
                "timecode": "00:07.0-00:12.0",
                "duration_sec": 5.0,
                "beat": "product_feeding_official_ref",
                "broll_id": "BROLL_OFFICIAL_PRODUCT",
                "broll_source": "official_reference_asset",
                "use_ai_broll": False,
                "broll_resolution": "native_official_png",
                "broll_model": "official_composite_only",
                "official_asset_path": selected_official_asset,
                "protect_product_integrity": True,
                "visual_cue": f"공식 고화질 정품 실사({selected_official_asset}) 기반 급여·성분 하이라이트 합성 (AI 변형 금지)",
                "broll_prompt": "",
                "caption": f"리뷰 검증 {profile['display_name']}",
                "narration": feeding_narration,
                "bgm_sound": "밝고 신뢰감 있는 톤 전환",
            },
            {
                "scene_no": 4,
                "timecode": "00:12.0-00:15.0",
                "duration_sec": 3.0,
                "beat": "conclusion",
                "broll_id": profile["default_broll_ids"]["happy"],
                "broll_source": "higgsfield_720p",
                "use_ai_broll": True,
                "broll_resolution": "720p",
                "broll_model": preferred_broll_model,
                "broll_fallback_file": selected_happy_clip,
                "protect_product_integrity": True,
                "visual_cue": "다음 날 활력을 되찾아 밥그릇 앞에서 꼬리를 흔드는 반려견 밝은 모닝 컷",
                "broll_prompt": (
                    "Vertical 9:16 bright morning sunlight inside Korean apartment, happy healthy small dog wagging tail "
                    "eagerly beside a clean ceramic kibble bowl, lively heartwarming mood"
                ),
                "caption": "집에 두면 마음이 놓이는 한 병",
                "narration": conclusion_narration,
                "bgm_sound": "경쾌한 마무리 징글",
            },
        ]

        title, _ = self.sanitize_copy(
            f"[실제리뷰] {hook_caption} {profile['display_name']} 보호자 리얼 후기"
        )
        pinned_comment, _ = self.sanitize_copy(
            f"실제 보호자 후기로 검증된 {profile['display_name']} 공식 채널 안내\n"
            f"▶ 공식 스마트스토어: {profile['smartstore_url']}\n"
            f"▶ 공식 쿠팡 구매처: {profile['coupang_url']}\n"
            f"▶ 공식 홈페이지: {profile['official_url']} ({profile['company_name']} {profile['phone']})\n"
            f"{profile['disclaimer']}"
        )
        description, _ = self.sanitize_copy(
            f"{hook_narration}\n{pain_narration}\n{conclusion_narration}\n\n"
            f"{' '.join(profile['hashtags'])}\n\n{profile['disclaimer']}"
        )

        master_json: Dict[str, Any] = {
            "schema_version": "2.0",
            "episode_type": "review_hook",
            "version_id": version_id,
            "date": today,
            "product": product_key,
            "brand_profile": {
                "brand_group": profile["brand_group"],
                "company_name": profile["company_name"],
                "phone": profile["phone"],
                "official_url": profile["official_url"],
            },
            "target": profile["target_audience"],
            "title": title[:100],
            "running_time_sec": 15,
            "hook_pattern": resolved_hook,
            "review_insights": insights,
            "higgsfield_policy": {
                "resolution_locked": "720p",
                "default_model": preferred_broll_model,
                "ai_broll_scene_nos": [1, 2, 4],
                "official_asset_scene_nos": [3],
                "product_distortion_guard": "strict",
            },
            "scenes": scenes,
            "caption": description,
            "hashtags": profile["hashtags"],
            "trigger_keyword": "리뷰후기",
            "pinned_comment": pinned_comment,
            "utm_links": {
                "youtube_shorts": f"{profile['official_url']}?utm_source=youtube&utm_medium=shorts&utm_campaign=review_hook_{compact_date}",
                "smartstore": profile["smartstore_url"],
                "coupang": profile["coupang_url"],
            },
            "compliance_status": {
                "passed": True,
                "filtered_terms_count": insights["filtered_terms_count"],
                "filtered_terms_masked": insights["filtered_terms_masked"],
                "forbidden_hits": [],
            },
            "generated_at": datetime.datetime.now().isoformat(),
        }

        hits = self.check_forbidden_tokens(master_json, product_key)
        master_json["compliance_status"]["forbidden_hits"] = hits
        master_json["compliance_status"]["passed"] = len(hits) == 0
        if hits:
            raise ValueError(f"[COMPLIANCE VIOLATION] Forbidden tokens detected in {product_key}: {hits}")

        return master_json


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate review_hook Master JSON for Shorts")
    parser.add_argument("--product", default="ParvoGel", help="ParvoGel, Monsmecta, Hepamax, Renaldetox, Heartcare Gel")
    parser.add_argument("--reviews", required=True, help="Path to reviews (.json/.csv/.txt) or inline text")
    parser.add_argument("--hook", default="auto", help="auto | empathy_question | review_metric | contrast_crisis")
    parser.add_argument("--model", default="kling-3.0-720p", help="kling-3.0-720p | seedance-2.5-720p")
    parser.add_argument("--out", default="", help="Output JSON file path")
    args = parser.parse_args()

    gen = ReviewShortsGenerator()
    result = gen.generate_master_json(
        product_name=args.product,
        reviews_source=args.reviews,
        hook_pattern=args.hook,
        preferred_broll_model=args.model,
    )
    if args.out:
        os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"[SUCCESS] Generated review_hook Master JSON: {args.out}")
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))

