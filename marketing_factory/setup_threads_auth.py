#!/usr/bin/env python3
"""
Threads 1-Click OAuth Setup Script (KoreaAgro / ParvoGel)
- Meta Threads OAuth 코드를 60일 장기 토큰(THREADS_ACCESS_TOKEN)으로 자동 교환
- @parvogel.official 계정의 THREADS_USER_ID를 조회하여 .env 및 marketing_factory/.env에 저장
"""

import os
import sys
import urllib.parse
import webbrowser
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(CURRENT_DIR)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(CURRENT_DIR, ".env"))
    load_dotenv(os.path.join(PROJECT_DIR, ".env"))
except ImportError:
    pass

REDIRECT_URI = "https://parvogel.kr/"
SCOPES = "threads_basic,threads_content_publish"


def upsert_env(filepath: str, updates: dict):
    if not os.path.exists(filepath):
        lines = []
    else:
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()

    remaining = dict(updates)
    new_lines = []
    for line in lines:
        matched_key = None
        for k in remaining:
            if line.startswith(f"{k}="):
                matched_key = k
                break
        if matched_key:
            new_lines.append(f"{matched_key}={remaining.pop(matched_key)}\n")
        else:
            new_lines.append(line)

    if new_lines and not new_lines[-1].endswith("\n"):
        new_lines.append("\n")
    for k, v in remaining.items():
        new_lines.append(f"{k}={v}\n")

    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(new_lines)


def exchange_code_and_save(app_id: str, app_secret: str, raw_input: str):
    cleaned = raw_input.strip()
    if "code=" in cleaned:
        parsed = urllib.parse.urlparse(cleaned)
        qs = urllib.parse.parse_qs(parsed.query)
        code = qs.get("code", [""])[0]
    else:
        code = cleaned
    code = code.split("#")[0].strip()
    if not code:
        raise ValueError("인증 코드(code)를 추출하지 못했습니다.")

    # 1. 단기 액세스 토큰 발급
    short_resp = requests.post(
        "https://graph.threads.net/oauth/access_token",
        data={
            "client_id": app_id,
            "client_secret": app_secret,
            "grant_type": "authorization_code",
            "redirect_uri": REDIRECT_URI,
            "code": code,
        },
        timeout=15,
    )
    if short_resp.status_code != 200:
        raise RuntimeError(f"단기 토큰 교환 실패: {short_resp.status_code} {short_resp.text}")
    short_token = short_resp.json()["access_token"]

    # 2. 60일 장기 액세스 토큰 교환
    long_resp = requests.get(
        "https://graph.threads.net/access_token",
        params={
            "grant_type": "th_exchange_token",
            "client_secret": app_secret,
            "access_token": short_token,
        },
        timeout=15,
    )
    if long_resp.status_code == 200 and "access_token" in long_resp.json():
        access_token = long_resp.json()["access_token"]
        expires_in = long_resp.json().get("expires_in", "unknown")
        print(f"[OK] 60일 장기 토큰 발급 완료 (expires_in={expires_in}s)")
    else:
        print(f"[WARN] 장기 토큰 교환 실패, 단기 토큰 사용: {long_resp.text}")
        access_token = short_token

    # 3. Threads 사용자 ID / username 확인
    me_resp = requests.get(
        "https://graph.threads.net/v1.0/me",
        params={"fields": "id,username", "access_token": access_token},
        timeout=15,
    )
    if me_resp.status_code != 200:
        raise RuntimeError(f"Threads /me 조회 실패: {me_resp.status_code} {me_resp.text}")
    me = me_resp.json()
    threads_user_id = str(me["id"])
    username = me.get("username", "")
    print(f"[OK] 연결된 스레드 계정: @{username} (ID: {threads_user_id})")

    # 4. .env 저장
    updates = {
        "THREADS_APP_ID": app_id,
        "THREADS_APP_SECRET": app_secret,
        "THREADS_USER_ID": threads_user_id,
        "THREADS_ACCESS_TOKEN": access_token,
    }
    upsert_env(os.path.join(CURRENT_DIR, ".env"), updates)
    upsert_env(os.path.join(PROJECT_DIR, ".env"), updates)
    print("[SUCCESS] .env 및 marketing_factory/.env에 Threads 설정 저장 완료!")
    return me


def main():
    app_id = os.getenv("THREADS_APP_ID") or input("Threads 앱 ID를 입력하세요: ").strip()
    app_secret = os.getenv("THREADS_APP_SECRET") or input("Threads 앱 시크릿 코드를 입력하세요: ").strip()

    auth_url = (
        "https://threads.net/oauth/authorize"
        f"?client_id={urllib.parse.quote(app_id)}"
        f"&redirect_uri={urllib.parse.quote(REDIRECT_URI, safe='')}"
        f"&scope={urllib.parse.quote(SCOPES)}"
        "&response_type=code"
    )
    print("\n1) 아래 URL을 브라우저에서 열어 @parvogel.official 계정으로 허용해 주세요:")
    print(auth_url)
    try:
        webbrowser.open(auth_url)
    except Exception:
        pass

    print("\n2) 허용 후 https://parvogel.kr/?code=... 페이지로 이동되면, 주소창 전체 URL을 복사해 아래에 붙여넣으세요:")
    raw = input("리디렉션된 전체 URL (또는 code 값): ").strip()
    exchange_code_and_save(app_id, app_secret, raw)


if __name__ == "__main__":
    main()
