@echo off
chcp 65001 > nul
echo ========================================================
echo   PARVOGEL 마케팅 컨텐츠 생성 및 자동 배포 공장 가동
echo   (스마트스토어 펫츄리 / 쿠팡 / 엠오바이오 총판 지원)
echo ========================================================
echo.
echo [1/2] 숏폼 대본, 네이버 블로그 후기 가이드, 엠오바이오 원고 생성 중...
node scripts/marketing/parvogel_content_generator.cjs
echo.
echo [2/2] 멀티채널 마케팅 마스터 엔진 가동 (100배거 파이프라인)...
python scripts/marketing/parvogel_marketing_master.py
echo.
echo ========================================================
echo   완료! scripts/marketing/output/ 폴더를 확인하세요.
echo ========================================================
pause
