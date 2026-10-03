@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ========================================================
echo   PARVOGEL 마케팅 컨텐츠 생성 및 자동 배포 공장 가동
echo   - 스마트스토어 펫츄리, 쿠팡, 엠오바이오 공식 채널 연동
echo ========================================================
echo 현재 작업 경로: %CD%
echo.
echo [1/2] 숏폼 대본, 네이버 블로그 후기 가이드, 엠오바이오 원고 생성 중...
node scripts/marketing/parvogel_content_generator.cjs
echo.
echo [2/3] 멀티채널 마케팅 마스터 엔진 가동 (콘텐츠 패키징)...
python scripts/marketing/parvogel_marketing_master.py
echo.
echo [3/3] 파보겔 마케팅 공장 가동 (네이버 블로그 자동 포스팅 및 멀티채널 배포)...
py marketing_factory/core/marketing_master.py
echo.
echo ========================================================
echo   완료! 네이버 블로그 발행 및 drafts 아카이브 완료.
echo ========================================================
pause
