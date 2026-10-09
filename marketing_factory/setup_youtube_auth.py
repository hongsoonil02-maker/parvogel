#!/usr/bin/env python3
"""
YouTube 1-Click OAuth Setup & Auto-Upload Script
— 구글 계정 1회 로그인으로 만료된 YouTube Refresh Token을 즉시 갱신하고,
  렌더링된 파보겔 숏폼 3편(버전 A, B, C)을 YouTube Shorts로 즉시 자동 업로드합니다.
"""

import os
import sys
import json
import webbrowser
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
import requests

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(CURRENT_DIR)

CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
REDIRECT_URI = "http://localhost:8080/"
SCOPE = "https://www.googleapis.com/auth/youtube.upload"

auth_code_holder = {"code": None}


class OAuthCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        if "code" in params:
            auth_code_holder["code"] = params["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            html = """
            <html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#0f172a;color:#f8fafc;">
            <h1 style="color:#10b981;">🎉 유튜브 OAuth 인증 성공!</h1>
            <p style="font-size:18px;">새로운 Refresh Token이 안전하게 발급되었습니다.<br>이 창을 닫으셔도 되며, 터미널에서 즉시 파보겔 숏폼 3편 업로드가 진행됩니다.</p>
            </body></html>
            """
            self.wfile.write(html.encode("utf-8"))
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Authorization failed or code missing.")

    def log_message(self, format, *args):
        pass  # 침묵


def update_env_file(filepath: str, new_token: str):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    found = False
    new_lines = []
    for line in lines:
        if line.startswith("YOUTUBE_REFRESH_TOKEN="):
            new_lines.append(f"YOUTUBE_REFRESH_TOKEN={new_token}\n")
            found = True
        else:
            new_lines.append(line)
    if not found:
        new_lines.append(f"\nYOUTUBE_REFRESH_TOKEN={new_token}\n")

    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print(f"✓ Updated YouTube token in: {filepath}")


def run_auth_and_upload():
    print("=" * 65)
    print("🎬 [YOUTUBE SHORTS AUTO-AUTH & PUBLISHER]")
    print("=" * 65)

    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent"
    }
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)

    print("\n👉 브라우저에서 Google 계정(hongsoonil02@gmail.com) 승인을 진행합니다...")
    print(f"🔗 인증 URL (자동으로 안 열릴 시 복사): {auth_url}\n")
    try:
        webbrowser.open(auth_url)
    except Exception:
        pass

    server = HTTPServer(("localhost", 8080), OAuthCallbackHandler)
    print("⏳ http://localhost:8080/ 에서 로그인 콜백 대기 중...")
    while not auth_code_holder["code"]:
        server.handle_request()

    code = auth_code_holder["code"]
    print("✓ Authorization Code 수신 완료. 토큰 교환 요청 중...")

    # 토큰 교환
    token_resp = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI
    }, timeout=15)

    if token_resp.status_code == 200:
        data = token_resp.json()
        refresh_token = data.get("refresh_token")
        if not refresh_token:
            print("[WARN] Refresh token이 응답에 없습니다 (기존 승인 유지 상태). 새 토큰 강제 발급 필요.")
            return

        print(f"🎉 새 Refresh Token 발급 성공: {refresh_token[:20]}...")
        
        # .env 파일들 갱신
        env_paths = [
            os.path.join(CURRENT_DIR, ".env"),
            os.path.join(PROJECT_DIR, ".env")
        ]
        for ep in env_paths:
            update_env_file(ep, refresh_token)

        # 환경변수 즉시 반영
        os.environ["YOUTUBE_CLIENT_ID"] = CLIENT_ID
        os.environ["YOUTUBE_CLIENT_SECRET"] = CLIENT_SECRET
        os.environ["YOUTUBE_REFRESH_TOKEN"] = refresh_token

        # 즉시 3편 업로드 실행
        print("\n🚀 갱신된 토큰으로 파보겔 숏폼 3편 YouTube Shorts 업로드 시작...")
        sys.path.insert(0, CURRENT_DIR)
        from core.shortform_release_manager import ShortformReleaseManager
        manager = ShortformReleaseManager()
        res = manager.execute_release(force=True)
        print("\n[업로드 결과 요약]:")
        for v_id, info in res.get("results", {}).items():
            print(f"  • {v_id:25}: YouTube_Shorts -> {info.get('platform_statuses', {}).get('YouTube_Shorts')}")

    else:
        print(f"❌ 토큰 교환 실패: HTTP {token_resp.status_code} - {token_resp.text}")


if __name__ == "__main__":
    run_auth_and_upload()
