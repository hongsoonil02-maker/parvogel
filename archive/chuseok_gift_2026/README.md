# 2026 추석 지인 선물 이벤트 아카이브 (Chuseok Gift Event Archive)

본 디렉터리는 2026년 한가위(추석) 시즌 동안 운영된 **파보겔 100ml 지인 무료 선물 이벤트** 관련 모든 자산과 데이터, 스크립트를 모아둔 보관소입니다.
프로덕션 사이트(UI/UX)에서는 이벤트가 종료되어 노출이 제거되었으며, 향후 명절 프로모션 재활용 및 발송 이력 보존을 위해 압축 및 체계적으로 저장되었습니다.

---

## 📁 보관 구조

```
archive/chuseok_gift_2026/
├── components/
│   └── ChuseokGiftModal.jsx         # 추석 초대코드 인증 및 100ml 선물 신청 팝업 모달 UI
├── data/
│   ├── chuseok_gift_applications.json    # 접수된 신청 내역 원본 JSON
│   ├── 알리고_추석지인선물_3724명_대량발송_업로드용.csv (및 .xlsx)  # 알리고 LMS 발송 타깃 리스트
│   ├── 알리고_추석지인예약등록결과_20260924_082005.json         # 알리고 발송 예약 API 결과
│   └── 우체국택배_파보겔_추석지인선물_*건_*_신규양식.xls/.xlsx     # 일자별 우체국 계약택배 업로드 엑셀 파일들
├── drafts/
│   └── Chuseok_Friends_Gift_LMS_Template.txt # 알리고 발송 LMS 문구 원안
├── scripts/
│   ├── create_chuseok_epost_excel.py  # 스프레드시트/API 연동 우체국택배 엑셀 생성 스크립트
│   ├── gen_chuseok_epost_now.py       # 실시간 우체국 발송 엑셀 생성 유틸리티
│   └── reserve_chuseok_dispatch.py    # 알리고 문자 발송 예약 실행 스크립트
└── README.md                          # 본 아카이브 설명서
```

---

## 💡 이벤트 주요 요약
- **프로모션 명**: 2026 한가위 지인 특별 선물 (파보겔 100ml 1병 무료 선물)
- **대상**: 대표님 추석 안부 문자 수신자 (초대코드 인증 방식)
- **신청 구분(requestType)**: `sample_chuseok_friend`
- **종료 및 아카이브 일시**: 2026-09-29
- **UI/UX 제거 내역**:
  - 상단 공지 탑바 (Chuseok Top Banner)
  - 데스크톱/모바일 네비게이션 헤더의 "추석 지인 선물" 버튼
  - 모바일 슬라이드 메뉴의 "추석 지인 100ml 선물 신청" 메뉴
  - 우측 하단 플로팅 퀵 버튼
  - URL 파라미터(`?sample=chuseok`, `?code=...`) 자동 팝업 트리거
