# Higgsfield MCP 연동 및 720p 저비용 B-roll 운용 가이드

본 문서는 파보겔(`ParvoGel`) 및 SNJ 격리 브랜드(`Monsmecta`, `Hepamax`, `Renaldetox`, `Heartcare Gel`) 쇼츠 자동화 파이프라인에 **Higgsfield 720p B-roll MCP 커넥터**를 연결하고, 실제 제품 외형 왜곡을 차단하며 월간 운영비를 절반 이하로 절감하는 운영 표준입니다.

---

## 1. 아키텍처 원칙 (비용·품질·브랜드 보호)

1. **해상도 720p 영구 고정 (`enforce_720p`)**
   - 모든 AI B-roll 호출은 `resolution="720p"`로 강제 고정됩니다 (`1080p`/`4K` 요청이 들어와도 `720p`로 자동 클램프).
   - 720p 생성 클립은 렌더링 단계(`ShortformAutoRenderer`)에서 `ffmpeg`의 `lanczos` 스케일러로 `1080x1920` 세로 쇼츠 프레임에 선명하게 업스케일링·크롭 합성됩니다.
2. **가성비 모델 라우팅**
   - 기본값: `kling-3.0-720p` (반려견 행동·표정 및 보호자 손동작 모션 최우선)
   - 초저비용 대안: `seedance-2.5-720p` (야간 거실·무드 컷 대량 생성 시 추가 ~25% 크레딧 절감)
3. **실제 제품 외형 보호 가드 (`assert_no_product_distortion`)**
   - AI B-roll은 오직 **"강아지가 속 불편해하는 모습 / 보호자가 걱정하며 쓰다듬는 손 / 활력을 되찾아 밥 먹는 모습"** 같은 상황 컷에만 사용합니다.
   - 실제 제품 용기·라벨·로고가 등장하는 씬(`scene_role="official_reference_asset"`, `use_ai_broll=false`)은 AI 생성을 원천 차단하고, `public/images/bottle_front.png` 등 **공식 고화질 정품 실사 PNG 오버레이 합성 모듈**만 사용합니다.
4. **무중단 캐시 및 로컬 폴백**
   - 동일 프롬프트·모델·길이는 SHA-256 해시로 `marketing_factory/output/broll_cache/`에 캐싱되어 재호출 크레딧이 `0`입니다.
   - `HIGGSFIELD_API_KEY`가 미설정된 오프라인/CI 테스트 환경에서는 `broll_catalog.json`의 검증된 로컬 실사/임상 클립으로 자동 폴백됩니다.

---

## 2. Antigravity / Claude MCP 커넥터 설정

### 2-1. 환경변수 설정 (`.env` 및 GitHub Actions Secrets)

```env
# 필수 (실시간 Higgsfield API 연동 시)
HIGGSFIELD_API_KEY=your_higgsfield_api_key
HIGGSFIELD_API_SECRET=your_higgsfield_api_secret

# 선택 (기본값 유지 시 생략 가능)
HIGGSFIELD_DEFAULT_MODEL=kling-3.0-720p
HIGGSFIELD_BASE_URL=https://platform.higgsfield.ai
HIGGSFIELD_GENERATE_PATH=/v1/video/generations
```

### 2-2. `mcp_config.json` 추가 스니펫

Antigravity(`mcp_config.json`) 또는 Claude Desktop 설정의 `"mcpServers"` 블록에 아래 항목을 추가합니다. (외부 `mcp` 파이썬 패키지 설치 없이 Python 표준 라이브러리만으로 즉시 동작합니다.)

```json
{
  "mcpServers": {
    "higgsfield-broll": {
      "command": "python",
      "args": [
        "<PROJECT_ROOT>/marketing_factory/mcp/higgsfield_mcp_server.py"
      ],
      "env": {
        "HIGGSFIELD_DEFAULT_MODEL": "kling-3.0-720p",
        "HIGGSFIELD_API_KEY": "${HIGGSFIELD_API_KEY}",
        "HIGGSFIELD_API_SECRET": "${HIGGSFIELD_API_SECRET}"
      }
    }
  }
}
```

### 2-3. 제공 MCP Tool 4종

| Tool 이름 | 역할 | 비고 |
| --- | --- | --- |
| `check_higgsfield_auth` | API 키 설정 여부, 720p 잠금 정책, 지원 모델 점검 | 시크릿 값 평문 미노출 |
| `estimate_broll_cost` | 월간 30편 기준 720p vs 1080p 크레딧·비용 시뮬레이션 | 모델/캐시율 파라미터 지원 |
| `generate_720p_broll` | 상황 컷 720p B-roll 생성/캐시 조회 | 용기·라벨 키워드 포함 시 에러 차단 |
| `generate_review_shorts_master` | 리뷰 텍스트/CSV/JSON → `episode_type: "review_hook"` JSON 생성 | 브랜드 격리·금지어 자동 순화 |

---

## 3. 파이프라인 실행 커맨드

```bash
# 1) 리뷰 기반 마스터 JSON 단건 생성
python -m marketing_factory.core.review_shorts_generator \
  --product ParvoGel \
  --reviews marketing_factory/data/sample_reviews_parvogel.json \
  --hook auto \
  --model kling-3.0-720p \
  --out marketing_factory/data/review_shorts_master_sample.json

# 2) 리뷰 후킹 트랙으로 일일 파이프라인 실행 (드라이런)
python marketing_factory/core/marketing_master.py --track review_hook --dry-run --force

# 3) 라이브 실행 + 유튜브 쇼츠 예약/고정댓글 연동
python marketing_factory/core/marketing_master.py --track review_hook --strict-youtube --force
```

---

## 4. 월간 30편(매일 1편) 기준 크레딧 및 예상 운영 비용 분석

> 아래 수치는 `HiggsfieldBrollClient.estimate_monthly_cost()` 내 설정된 모델별 벤치마크 가정치(5초 720p 기준 `kling-3.0-720p` = 20 크레딧 / `1080p` = 45 크레딧, `seedance-2.5-720p` = 15 크레딧 / `1080p` = 35 크레딧, 크레딧 단가 가정 `$0.0045/cr`, 환율 `1,400원/USD`)를 바탕으로 산출한 추정치이며, 실제 구독 티어·프로모션 크레딧 단가에 따라 변동될 수 있습니다.

### 4-1. 1편(15초 4컷) 기준 하이브리드 컷 배분

| 씬 | 역할 | 소스 방식 | 크레딧 소모 |
| --- | --- | --- | --- |
| **Scene 1 (2.5s)** | 첫 2초 공감 후킹 (야간 반려견 상황) | Higgsfield `720p` AI B-roll | 1회차 생성 시 1컷 분량 (20 cr / `kling-3.0-720p`) |
| **Scene 2 (4.5s)** | 보호자 불편 상황 (손·물그릇 컷) | Higgsfield `720p` AI B-roll (또는 캐시 재사용) | 1컷 분량 (20 cr) |
| **Scene 3 (5.0s)** | 제품 급여·하이라이트 컷 | **공식 고화질 정품 PNG 오버레이 (`bottle_front.png`)** | **0 cr (무료 · 왜곡 0%)** |
| **Scene 4 (3.0s)** | 한 줄 결론 (다음 날 활력 회복) | 검증 로컬 임상/회복 클립 또는 캐시 B-roll | **0 cr** (로컬/캐시 기준) ~ 20 cr (신규 생성 시) |

### 4-2. 월 30편 기준 시나리오별 비용 비교표 (편당 신규 720p AI B-roll 2컷 기준)

| 운영 방식 | 모델 / 해상도 | 편당 크레딧 | 월 30편 총 크레딧 | 예상 월 비용 (USD / KRW) | 풀 AI(4컷 1080p) 대비 절감률 |
| --- | --- | --- | --- | --- | --- |
| **비교군 A: 풀 AI 1080p (4컷 전부 AI)** | `kling-3.0` / `1080p` | 180 cr | 5,400 cr | `$24.30` (약 `34,020원`) | 기준 (0%) |
| **비교군 B: 하이브리드 2컷 1080p** | `kling-3.0` / `1080p` | 90 cr | 2,700 cr | `$12.15` (약 `17,010원`) | 50.0% 절감 |
| **권장안 1: 하이브리드 2컷 720p (신규)** | `kling-3.0-720p` | 40 cr | 1,200 cr | **`$5.40` (약 `7,560원`)** | **77.8% 절감** |
| **권장안 2: 초저비용 2컷 720p (신규)** | `seedance-2.5-720p` | 30 cr | 900 cr | **`$4.05` (약 `5,670원`)** | **83.3% 절감** |
| **권장안 3: 720p + 디스크 캐시 50% 재사용** | `kling-3.0-720p` | 평균 20 cr | 600 cr | **`$2.70` (약 `3,780원`)** | **88.9% 절감** |

### 4-3. 그 외 파이프라인 인프라 비용

- **한국어 음성 합성 (`Edge-TTS`)**: `$0` (무료, 로컬 및 GitHub Actions 즉시 실행)
- **영상 합성·자막·BGM·업스케일 (`FFmpeg` / GitHub Actions Runner)**: `$0` (무료)
- **유튜브 쇼츠 예약 업로드·고정 댓글 (`YouTube Data API v3`)**: `$0` (일일 기본 API 할당량 내 무료)
- **결론**: `kling-3.0-720p` + 하이브리드 공식 실사 합성 구조 적용 시 **월 30편 풀 자동 운영 총비용은 약 `$2.70 ~ $5.40` (약 `3,800원 ~ 7,600원`) 수준**으로 억제됩니다.
