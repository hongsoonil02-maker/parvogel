@echo off
chcp 65001 > nul
echo ==========================================================
echo [PARVOGEL MULTI-MALL SHORTS] 6대 쇼핑몰 프로모션 숏폼 일괄 생성
echo ==========================================================
cd /d "c:\Users\master\parvogel_landing"

echo [1/6] 쿠팡 로켓배송 프로모션 숏폼...
python scripts\generate_coupang_promo_shorts.py

echo [2/6] 네이버 스마트스토어 프로모션 숏폼...
python scripts\generate_mall_promo_shorts.py --mall smartstore

echo [3/6] G마켓/옥션 프로모션 숏폼...
python scripts\generate_mall_promo_shorts.py --mall gmarket

echo [4/6] 11번가 프로모션 숏폼...
python scripts\generate_mall_promo_shorts.py --mall 11st

echo [5/6] 카카오 쇼핑하기 프로모션 숏폼...
python scripts\generate_mall_promo_shorts.py --mall kakao

echo [6/6] 토스 쇼핑 프로모션 숏폼...
python scripts\generate_mall_promo_shorts.py --mall toss

echo.
echo ==========================================================
echo [완료] 6대 쇼핑몰 프로모션 숏폼 생성이 모두 완료되었습니다!
echo 저장 위치: marketing_factory\output
echo ==========================================================
pause
