---
name: review-shorts-skill
description: 실제 스마트스토어·쿠팡 구매자 리뷰 데이터를 분석해 15초 공감형 후킹 쇼츠 대본 및 Higgsfield 720p B-roll 연동 마스터 JSON을 생성하는 스킬
---

# Review-Based Empathy Hook Shorts Skill (`review_shorts_skill.md`)

## 1. 목적 및 적용 범위
실제 구매자 리뷰(스마트스토어·쿠팡·자사몰 텍스트/CSV/JSON)에서 보호자가 가장 크게 공감하는 **불편 포인트(Pain Point)**와 **구매 후 만족 포인트**를 추출하여, **15초 내외의 전환형 쇼츠 마스터 JSON(`episode_type: "review_hook"`)**을 생성한다.

### 지원 제품군 및 브랜드 격리 철칙 (Cross-Brand Isolation Mandatory)
두 브랜드 계열은 법인, 도메인, 연락처, 제품 이미지, 유통 채널이 **완전히 분리**되어 있으므로 단일 에피소드 내에서 절대 교차 혼용하지 않는다.

| 브랜드 트랙 | 허용 `product_code` | 공식 상호 / 도메인 / 연락처 | 허용 정품 이미지 레퍼런스 | 절대 금지 교차 토큰 |
| :--- | :--- | :--- | :--- | :--- |
| **Korea Agro (B2C)** | `PARVOGEL` (`Pavogel`, `ParvoGel`) | `(주)한국아그로` · `https://parvogel.kr` · `02-6949-5708` | `public/images/bottle_front.png`, `bottle_group.png`, `bottle_back.png` | `몬스멕타`, `에스앤제이`, `031-321-6562`, `080-881-1289`, `송아지`, `무료샘플`, `상비약` |
| **SNJ Vet (Isolated)** | `MONSMECTA`, `HEPAMAX`, `RENALDETOX`, `HEARTCARE_GEL` | `에스앤제이동물병원` · `https://monsmecta.kr/` · `031-321-6562` · `080-881-1289` | `assets/bottle_mockup.png`, `hepamax_real_front.png`, `heartcare_mockup.png` 등 | `파보겔`, `(주)한국아그로`, `parvogel.kr`, `02-6949-5708` |

---

## 2. 입력 인터페이스
1. `product_name`: `ParvoGel` (또는 `Pavogel`), `Monsmecta`, `Hepamax`, `Renaldetox`, `Heartcare Gel`
2. `reviews_input`:
   - 원시 리뷰 텍스트 문자열 (줄바꿈 구분)
   - 또는 `.csv` (`rating`, `content`, `author`, `platform` 컬럼)
   - 또는 `.json` (`[{"rating": 5, "content": "...", "platform": "smartstore"}]`)
3. `hook_pattern` (선택): `"empathy_question"` | `"review_metric"` | `"contrast_crisis"` | `"auto"`

---

## 3. 리뷰 분석 및 사료관리법 규제 필터링 규칙

### 3.1 리뷰 소구점 추출
- **Pain Point 추출 (빈도 우선):** 새벽 구토·물설사 당황, 가루약/주사기 투약 거부·거품 토, 병원 문 닫은 야간 불안, 사료 거부·기력 저하, 간/신장/심장 수치 관리 고민.
- **만족 포인트 추출:** 1초 원터치 펌프 급여 편의성, 스스로 핥아먹는 기호성, 실온 보관 편리함, 빠른 배변/컨디션 안정화 체감, 재구매 의사.
- **수치 표현 원칙:** 실제 입력된 리뷰 건수·평점만 인용하며, 입력 데이터에 없는 허위 리뷰 수치는 절대 생성하지 않는다.

### 3.2 금지어 자동 순화 (사료관리법 & 브랜드 용어)
| 금지/위험 표현 | 자동 순화 치환 | 사유 |
| :--- | :--- | :--- |
| `치료제`, `치료`, `특효약` | `장 점막 보호 케어 보조사료` / `컨디션 관리 보조` | 의약품 오인 방지 |
| `완치`, `100% 완치`, `치료 보장` | `빠른 컨디션 회복 도움` / `안정화에 도움` | 결과 단정 금지 |
| `정식허가` | `정식등록` | 보조사료는 성분등록 대상 |
| `부작용 제로`, `부작용 없음` | `체내 흡수 부담을 줄인 포뮬러` | 절대 표현 금지 |
| `몽모릴로나이트` | `몬모릴로나이트` | 공식 원료 표기 통일 |
| `상비약`, `상비제` *(ParvoGel 전용)* | `응급 상비겔` | 파보겔 B2C 카피 표준 |

---

## 4. 15초 대본 전개 구조 & 3대 후킹 패턴

### 첫 2초 인트로(Hooking) 3대 패턴
1. **`empathy_question` (공감 질문형):** `"새벽에 강아지가 갑자기 토해서 당황하셨죠?"`
2. **`review_metric` (실제 리뷰 수치형):** `"보호자들이 직접 남긴 재구매 1위 응급 상비템, 이유가 있었습니다"` *(입력 리뷰 수량 연동 가능)*
3. **`contrast_crisis` (상황 대비형):** `"병원 문 닫은 밤, 집에 이거 없었으면 큰일 날 뻔했습니다"`

### 15초 4-Beat 타임라인 규칙
| 구간 | 시간 | 역할 | 시각 소스 정책 (핵심 비용·품질 규칙) |
| :--- | :---: | :--- | :--- |
| **Scene 1** | `00:00~00:02.5` (2.5s) | **첫 2초 후킹** | **Higgsfield 720p B-roll** (`situation_distress`: 어두운 거실에서 사료 거부·웅크린 반려견) |
| **Scene 2** | `00:02.5~00:06.5` (4.0s) | **보호자 불편 상황** | **Higgsfield 720p B-roll** (`owner_prep_hands`: 주사기·가루약 때문에 난감한 보호자 손동작) |
| **Scene 3** | `00:06.5~00:11.5` (5.0s) | **제품 급여/해결** | **고화질 공식 정품 레퍼런스 합성 (`use_ai_broll: false`)** — AI 생성 절대 금지, 실사 PNG 오버레이 |
| **Scene 4** | `00:11.5~00:15.0` (3.5s) | **한 줄 결론 & CTA** | **Higgsfield 720p B-roll** (`happy_recovery`: 활력 되찾고 꼬리 치며 밥 먹는 강아지) + 구매처 배지 |

---

## 5. Higgsfield 720p B-roll 생성 제약 (필수 준수)
1. **해상도 고정:** `resolution: "720p"`, `aspect_ratio: "9:16"` (`1080p`/`4K` 요청 시 강제 차단 또는 `720p`로 다운클램핑).
2. **모델 라우팅:** 기본 `"kling-3.0-720p"` (대체 `"seedance-2.5-720p"`). 15초 통짜 AI 생성 금지 → 상황 컷 2~3개만 `5s` 단위로 수급 후 로컬 캐시 재사용.
3. **제품 외형 보호:** 프롬프트에 제품명·용기·라벨(`bottle`, `label`, `파보겔`, `몬스멕타`, `헤파맥스`) 포함 금지. 제품 컷은 반드시 기존 레퍼런스 PNG 합성 모듈로 렌더링한다.

---

## 6. 확장 마스터 JSON 출력 스키마 (`episode_type: "review_hook"`)
실제 샘플 출력: `marketing_factory/data/review_shorts_master_sample.json`

```json
{
  "schema_version": "2.0",
  "episode_type": "review_hook",
  "version_id": "REVIEW_PARVOGEL_REVIEW_METRIC_20261126",
  "date": "2026-11-26",
  "product": "ParvoGel",
  "brand_profile": {
    "brand_group": "KOREA_AGRO",
    "company_name": "(주)한국아그로",
    "phone": "02-6949-5708",
    "official_url": "https://parvogel.kr/"
  },
  "hook_pattern": "review_metric",
  "running_time_sec": 15,
  "review_insights": {
    "review_count_analyzed": 5,
    "average_rating": 5.0,
    "top_pain_points": ["식욕·기력 급감", "야간·새벽 돌발 속불편"],
    "top_satisfaction_points": ["비상 상비템 안심감", "기호성·편한 급여"],
    "filtered_terms_count": 2
  },
  "higgsfield_policy": {
    "resolution_locked": "720p",
    "default_model": "kling-3.0-720p",
    "ai_broll_scene_nos": [1, 2, 4],
    "official_asset_scene_nos": [3],
    "product_distortion_guard": "strict"
  },
  "scenes": [
    {
      "scene_no": 1,
      "beat": "hook_2s",
      "timecode": "00:00-00:02.5",
      "duration_sec": 2.5,
      "broll_id": "BROLL_01",
      "broll_source": "higgsfield_720p",
      "use_ai_broll": true,
      "broll_resolution": "720p",
      "broll_model": "kling-3.0-720p",
      "broll_fallback_file": "public/assets/parvogel_case_01_seizure.mp4",
      "protect_product_integrity": true
    },
    {
      "scene_no": 3,
      "beat": "product_feeding_official_ref",
      "timecode": "00:07.0-00:12.0",
      "duration_sec": 5.0,
      "broll_id": "BROLL_OFFICIAL_PRODUCT",
      "broll_source": "official_reference_asset",
      "use_ai_broll": false,
      "official_asset_path": "public/images/bottle_front.png",
      "protect_product_integrity": true
    }
  ],
  "pinned_comment": "실제 보호자 후기로 검증된 파보겔 (ParvoGel) 공식 채널 안내...",
  "compliance_status": {
    "passed": true,
    "filtered_terms_count": 2,
    "forbidden_hits": []
  }
}
```
