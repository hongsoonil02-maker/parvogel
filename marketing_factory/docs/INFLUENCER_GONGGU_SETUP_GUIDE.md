# 파보겔 100ml 정품 단독 — 인플루언서 공구 자동 매칭 & 아웃리치 가이드

본 시스템은 **(주)한국아그로**의 B2C 주력 품목인 **파보겔(Pavogel) 100ml 정품**만을 대상으로 타겟 인플루언서 및 공동구매 벤더사를 발굴·제안·트래킹·정산하는 전용 파이프라인입니다.

---

## 1. 시스템 아키텍처 & 브랜드 분리 가드레일

```text
[1단계: Lead Scraper] (marketing_factory/core/influencer_lead_scraper.py)
  ├─ YouTube Data API v3 / Naver Blog API / Meta Business Discovery & CSV 임포트
  ├─ 필터: 팔로워 3,000 ~ 50,000명 · 참여율 >= 3.0% (그룹 C 벤더사 예외)
  ├─ 바이오 파싱: 이메일 · 오픈카톡 · DM 허용 여부
  └─ 기존 DB 저장: Firebase Firestore (`influencer_leads`) + `marketing_factory/data/influencer_crm.json`
         │
         ▼
[브랜드 분리 & 법규 가드] (marketing_factory/core/influencer_gonggu_guard.py)
  ├─ 허용 품목: 오직 "파보겔 100ml 정품" 단독 (200ml / 500ml 언급 금지)
  ├─ 차단 토큰: 몬스멕타, 에스앤제이, SNJ, 031-321-6562, 헤파맥스, 레날디톡스, 하트케어, 로타갈, 베타콜
  └─ 사료관리법 차단: 완치, 치료제, 치료, 처방, 무료 샘플, 부작용 제로, 정식허가
         │
         ▼
[2단계: Pitch Generator] (marketing_factory/core/influencer_pitch_generator.py)
  ├─ 첫 문장 초개인화: 반려동물 이름 또는 최근 게시물 3~5개 중 1개 구체 언급
  ├─ USP 1: 서울대 수의대 출신 수의학 전문가 홍순일 수의사 설계
  ├─ USP 2: 경상국립대 수의학 연구 기반 · 특허균주 Bacillus subtilis MORI · 나노 몬모릴로나이트
  └─ USP 3: 조건 없는 파보겔 100ml 정품 무상 체험 · 100ml 다구성/추가 증정 단독 기획 · 수수료 20~30%
         │
         ▼
[3~4단계: Outreach & Tracking] (marketing_factory/core/influencer_outreach_manager.py)
  ├─ 이메일 분할 자동 발송 (10:00 / 15:00 KST, SendGrid API 또는 Gmail SMTP)
  ├─ 인스타 DM 계정 보호: 일일 25건 상한 + 3~7분(180~420초) 간격 권장 + 원클릭 자판기 UI
  ├─ 6단계 상태 관리: 발굴됨 -> 제안발송 -> 파보겔100ml발송요청 -> 발송완료 -> 공구확정 -> 정산완료
  └─ 공구 확정 시 `koreaagro` 전용 UTM 링크 발급 & 수수료(20~30%) 정산 자동 집계
```

---

## 2. 로컬 / Oracle VM / GCP VM 실행 세팅 가이드

### 2-1. 환경변수 설정 (`.env`)
기존 파보겔 파이프라인에서 사용 중인 Firebase SA, YouTube OAuth, SendGrid, Gemini 키를 그대로 재사용합니다.

```env
# 1) 리드 발굴용 (택1 이상)
YOUTUBE_API_KEY=...                  # 또는 기존 YOUTUBE_CLIENT_ID / SECRET / REFRESH_TOKEN 자동 사용
NAVER_CLIENT_ID=...                  # 네이버 블로그 검색 API (선택)
NAVER_CLIENT_SECRET=...

# 2) AI 초개인화 문구 보강 (선택 — 미설정 시 내장 템플릿 자동 동작)
GEMINI_API_KEY=...

# 3) 이메일 분할 자동 발송 (SendGrid 또는 Gmail 앱 비밀번호 중 1개)
SENDGRID_API_KEY=...
OUTREACH_FROM_EMAIL=contact@parvogel.kr
# 또는 Gmail SMTP 사용 시:
# GMAIL_USER=your_id@gmail.com
# GMAIL_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx
```

### 2-2. 단계별 실행 커맨드

```bash
# 1) 유튜브 타겟 발굴 + 초개인화 제안서 생성 + 메시지 자판기 대시보드 빌드
python -m marketing_factory.core.influencer_gonggu_runner --scrape-youtube --group B --generate-pitches --dashboard

# 2) 수동 추출한 인스타그램 마이크로 인플루언서 CSV 임포트
python -m marketing_factory.core.influencer_gonggu_runner --import-csv path/to/ig_leads.csv --generate-pitches --dashboard

# 3) 이메일 분할 발송 드라이런 (실제 발송 전 검수)
python -m marketing_factory.core.influencer_gonggu_runner --send-emails --window 10:00

# 4) 이메일 실제 라이브 발송 (`--live` 명시 시에만 발송)
python -m marketing_factory.core.influencer_gonggu_runner --send-emails --window 10:00 --live
```

### 2-3. Oracle VM / GCP e2-micro 무료 크론(Crontab) 예시

```cron
# 매일 오전 09:30 KST - 신규 타겟 발굴 및 제안서·자판기 대시보드 갱신
30 9 * * * cd /home/ubuntu/parvogel_landing && /usr/bin/python3 -m marketing_factory.core.influencer_gonggu_runner --scrape-youtube --group B --generate-pitches --dashboard >> /tmp/gonggu_scrape.log 2>&1

# 매일 오전 10:00 KST - 1차 이메일 분할 발송
0 10 * * * cd /home/ubuntu/parvogel_landing && /usr/bin/python3 -m marketing_factory.core.influencer_gonggu_runner --send-emails --window 10:00 --live >> /tmp/gonggu_email_am.log 2>&1

# 매일 오후 15:00 KST - 2차 이메일 분할 발송
0 15 * * * cd /home/ubuntu/parvogel_landing && /usr/bin/python3 -m marketing_factory.core.influencer_gonggu_runner --send-emails --window 15:00 --live >> /tmp/gonggu_email_pm.log 2>&1
```

---

## 3. 생성된 대시보드 확인
실행 후 `marketing_factory/output/influencer_gonggu_dashboard.html` 파일을 브라우저로 열면:
- **메시지 자판기 UI**: 인플루언서별 초개인화 DM 1클릭 복사 + 프로필 바로열기 + 금일 DM 발송 잔여 한도(최대 25건) 확인
- **6단계 공구 칸반 & `koreaagro` 정산 보드**: `파보겔 100ml 정품` 체험 발송 및 `smartstore.naver.com/koreaagro` UTM 링크별 판매량·수수료 정산 내역 확인
