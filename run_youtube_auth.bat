@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ========================================================
echo   [파보겔 유튜브 쇼츠 OAuth 토큰 1회 갱신 및 자동 업로드]
echo ========================================================
echo.
echo 브라우저가 열리면 파보겔 유튜브 채널 구글 계정으로 로그인하고 승인해 주세요.
echo 승인 완료 즉시 리프레시 토큰이 자동 갱신됩니다.
echo.
py "marketing_factory\setup_youtube_auth.py"
echo.
pause
