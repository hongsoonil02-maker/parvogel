#!/usr/bin/env python3
"""
Naver Blog Session Setup Script (Playwright Chromium)
- 사용자가 직접 1회 브라우저 창에서 로그인하여 영구 세션(쿠키 및 브라우저 프로필)을 획득합니다.
- 저장된 프로필은 marketing_factory/data/naver_user_profile 에 영구 보관되어 매일 무인 자동 포스팅에 사용됩니다.
"""

import os
import sys
import time
import json

# Windows 콘솔 UTF-8 강제
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(CURRENT_DIR, "data")
USER_PROFILE_DIR = os.path.join(DATA_DIR, "naver_user_profile")
SESSION_FLAG = os.path.join(DATA_DIR, "naver_session_ready.json")
COOKIES_FILE = os.path.join(DATA_DIR, "naver_cookies.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(USER_PROFILE_DIR, exist_ok=True)

def setup_session():
    print("=" * 60)
    print(">> [네이버 블로그 1회 로그인 세션 연동]")
    print("=" * 60)
    print("새로운 전용 브라우저 창이 열립니다. 네이버에 로그인해 주세요.")
    print("-" * 60)

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=USER_PROFILE_DIR,
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--start-maximized"
            ],
            viewport=None,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )

        page = context.pages[0] if context.pages else context.new_page()
        page.bring_to_front()
        page.goto("https://nid.naver.com/nidlogin.login")

        print("⏳ 네이버 로그인 완료를 대기 중입니다 (최대 10분)...")
        logged_in = False
        start_time = time.time()

        while time.time() - start_time < 600:
            if page.is_closed():
                print("[알림] 브라우저 창이 닫혔습니다.")
                break

            cookies = context.cookies()
            cookie_names = [c["name"] for c in cookies]
            
            # NID_AUT 및 NID_SES 쿠키가 생성되면 로그인 성공
            if "NID_AUT" in cookie_names and "NID_SES" in cookie_names:
                logged_in = True
                break
            
            curr_url = page.url
            if "nid.naver.com" not in curr_url and ("naver.com" in curr_url):
                time.sleep(2)
                cookies = context.cookies()
                cookie_names = [c["name"] for c in cookies]
                if "NID_AUT" in cookie_names or "NID_SES" in cookie_names:
                    logged_in = True
                    break

            time.sleep(2)

        if logged_in:
            print("\n[성공] 네이버 로그인이 성공적으로 감지되었습니다!")
            page.goto("https://section.blog.naver.com/")
            page.wait_for_timeout(3000)
            
            # 모든 세션 쿠키를 naver_cookies.json 파일로 저장
            saved_cookies = context.cookies()
            with open(COOKIES_FILE, "w", encoding="utf-8") as f:
                json.dump(saved_cookies, f, indent=2, ensure_ascii=False)
            
            info = {
                "status": "READY",
                "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "profile_dir": USER_PROFILE_DIR,
                "cookies_file": COOKIES_FILE,
                "cookies_count": len(saved_cookies)
            }
            with open(SESSION_FLAG, "w", encoding="utf-8") as f:
                json.dump(info, f, indent=2, ensure_ascii=False)
                
            print(f"[완료] 쿠키 및 세션 정보가 '{COOKIES_FILE}'에 안전하게 저장되었습니다.")
            print("이제부터 마케팅 공장이 매일 자동으로 네이버 블로그에 포스팅할 수 있습니다.")
            time.sleep(3)
        else:
            print("\n[안내] 로그인이 감지되지 않아 세션 저장을 종료합니다.")

        try:
            context.close()
        except Exception:
            pass

if __name__ == "__main__":
    setup_session()
