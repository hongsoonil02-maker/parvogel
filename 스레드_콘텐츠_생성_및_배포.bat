@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ========================================================
echo   [PHARMAGEL] 스레드 바이럴 콘텐츠 생성 및 자동 배포 공장
echo   - 30년 차 서울대 수의사 페르소나
echo   - Type A / B / C 4:4:2 황금 비율 순환
echo   - 본문 링크 0개 + 90초 지연 첫 댓글 타래 자동 전환
echo ========================================================
echo.
py "scripts\generate_threads.py" --count 3 --publish
echo.
echo ========================================================
echo   완료! 검수 큐: marketing_factory\data\threads_queue.json
echo ========================================================
pause
