@echo off
chcp 65001 > nul
cd /d "c:\Users\master\parvogel_landing"
echo ========================================================
echo   [PARVOGEL] 유튜브 쇼츠 1회 인증 및 3편 즉시 자동 업로드
echo ========================================================
echo.
echo 브라우저가 열리면 Google 계정(hongsoonil02@gmail.com)으로 로그인 후 [허용]을 눌러주세요.
echo 로그인 완료 즉시 렌더링된 숏폼 3편이 YouTube Shorts로 자동 업로드됩니다.
echo.
py "c:\Users\master\parvogel_landing\marketing_factory\setup_youtube_auth.py"
echo.
pause