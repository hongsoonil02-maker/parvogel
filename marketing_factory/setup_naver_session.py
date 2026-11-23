#!/usr/bin/env python3
"""
Naver Blog Session Setup Script (Playwright Chromium)
- 사용자가 전용 브라우저 창에서 '로그인 상태 유지' 체크 상태로 1회 로그인하면
  블로그 글쓰기 권한(GoBlogWrite.naver)까지 직접 검증한 뒤 영구 프로필과 쿠키를 저장합니다.
- 완료 후 브라우저 창은 자동으로 닫히므로, 로그인 후 창을 수동으로 닫지 말고 5초만 기다려 주세요.
"""

import os
import sys
import time
import json

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


def setup_session() -> bool:
    print("=" * 64)
    print(">> [파보겔 네이버 블로그 1회 로그인 세션 연동]")
    print("=" * 64)
    print("1) 열리는 전용 Chromium 창에서 네이버 로그인을 완료해 주세요.")
    print("2) 반드시 '로그인 상태 유지'를 켜고, '새로운 기기 등록' 화면이 나오면 '등록'을 눌러 주세요.")
    print("3) 로그인 후 창을 직접 닫지 마세요 — 블로그 글쓰기 검증 후 자동으로 저장·종료됩니다.")
    print("-" * 64)

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
        page.goto("https://nid.naver.com/nidlogin.login?url=https%3A%2F%2Fsection.blog.naver.com%2F")

        # '로그인 상태 유지' 자동 체크 시도
        try:
            page.wait_for_timeout(1200)
            keep_cb = page.locator("#keep")
            if keep_cb.count() > 0 and not keep_cb.is_checked():
                page.locator("label[for='keep']").click(force=True)
                print("✓ '로그인 상태 유지' 옵션을 자동으로 활성화했습니다.")
        except Exception:
            pass

        print("⏳ 네이버 로그인 완료를 대기 중입니다 (최대 10분)...")
        logged_in = False
        start_time = time.time()

        while time.time() - start_time < 600:
            if page.is_closed():
                print("[알림] 브라우저 창이 닫혔습니다.")
                break

            curr_url = page.url
            cookies = context.cookies()
            cookie_names = {c["name"] for c in cookies}

            # nid.naver.com(로그인/2차인증/새기기등록)을 벗어나고 NID_AUT & NID_SES가 모두 발급된 시점 감지
            if "nid.naver.com" not in curr_url and "NID_AUT" in cookie_names and "NID_SES" in cookie_names:
                logged_in = True
                break

            time.sleep(1.5)

        if not logged_in:
            print("\n[안내] 로그인이 완료되지 않아 세션 저장을 종료합니다.")
            try:
                context.close()
            except Exception:
                pass
            return False

        print("\n[감지] 네이버 로그인 성공! 블로그 글쓰기 권한을 검증합니다...")
        page.goto("https://blog.naver.com/GoBlogWrite.naver", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(3000)

        if "nidlogin.login" in page.url or "nid.naver.com" in page.url:
            print("[오류] 블로그 글쓰기 페이지 진입 시 로그인이 유지되지 않았습니다. 다시 시도해 주세요.")
            context.close()
            return False

        saved_cookies = context.cookies()
        with open(COOKIES_FILE, "w", encoding="utf-8") as f:
            json.dump(saved_cookies, f, indent=2, ensure_ascii=False)

        info = {
            "status": "READY",
            "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "profile_dir": USER_PROFILE_DIR,
            "cookies_file": COOKIES_FILE,
            "cookies_count": len(saved_cookies),
            "verified_write_url": page.url[:120],
        }
        with open(SESSION_FLAG, "w", encoding="utf-8") as f:
            json.dump(info, f, indent=2, ensure_ascii=False)

        print(f"🎉 [완료] 검증된 네이버 세션({len(saved_cookies)}개 쿠키)이 저장되었습니다!")
        time.sleep(2)
        try:
            context.close()
        except Exception:
            pass
        return True


if __name__ == "__main__":
    ok = setup_session()
    sys.exit(0 if ok else 1)
