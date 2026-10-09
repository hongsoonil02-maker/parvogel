#!/usr/bin/env python3
"""
Webhook Server — ManyChat / Instagram / YouTube 실시간 댓글 수신 및 D2C 자동 DM 발송 웹훅 서버
- 경량 표준 HTTP 서버(포트 8088) 기반
- /webhook/comment (POST): ManyChat / 인스타 / 유튜브 실시간 댓글 수신 -> 자동 매칭 -> DM/답글 페이로드 반환
- /webhook/status (GET): 실시간 헬스체크 및 누적 리드/전환율 현황
- /webhook/test (GET): 브라우저 및 curl 단독 시뮬레이션 지원
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
from typing import Dict, Any

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, FACTORY_DIR)

from core.comment_funnel import CommentFunnelEngine

funnel_engine = CommentFunnelEngine()


class CommentWebhookHandler(BaseHTTPRequestHandler):
    """실시간 댓글 웹훅 요청 처리기"""

    def _set_headers(self, status: int = 200, content_type: str = "application/json; charset=utf-8"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        if path == "/" or path == "/webhook/status":
            summary = funnel_engine.get_funnel_summary()
            resp = {
                "server": "Parvogel Comment Webhook Server",
                "status": "HEALTHY",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "active_triggers": ["파보", "골든타임", "송아지"],
                "funnel_stats": summary
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(resp, indent=2, ensure_ascii=False).encode("utf-8"))

        elif path == "/webhook/test":
            user = params.get("user", ["테스트_견주"])[0]
            comment = params.get("comment", ["파보 가이드북 주세요"])[0]
            platform = params.get("platform", ["Manual_Test"])[0]

            res = funnel_engine.process_incoming_comment(user, comment, platform)
            self._set_headers(200)
            if res:
                self.wfile.write(json.dumps({"success": True, "lead": res}, indent=2, ensure_ascii=False).encode("utf-8"))
            else:
                self.wfile.write(json.dumps({"success": False, "message": "No keyword matched"}, indent=2, ensure_ascii=False).encode("utf-8"))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/webhook/comment":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            
            try:
                data = json.loads(body)
            except Exception:
                # 폼 데이터 파싱 폴백
                data = dict(urllib.parse.parse_qsl(body))

            user_name = data.get("user_name") or data.get("sender_name") or data.get("username") or "익명_보호자"
            comment_text = data.get("comment_text") or data.get("comment") or data.get("message") or ""
            platform = data.get("platform") or data.get("source") or "ManyChat_Instagram"

            res = funnel_engine.process_incoming_comment(user_name, comment_text, platform)

            if res:
                self._set_headers(200)
                resp = {
                    "status": "MATCHED",
                    "matched_keyword": res["matched_keyword"],
                    "lead_magnet": res["lead_magnet"],
                    "dm_response": res["dm_sent"],
                    "public_reply": res["public_reply"]
                }
                self.wfile.write(json.dumps(resp, indent=2, ensure_ascii=False).encode("utf-8"))
            else:
                self._set_headers(200)
                resp = {
                    "status": "IGNORED_NO_KEYWORD",
                    "comment": comment_text,
                    "message": "트리거 키워드('파보', '골든타임', '송아지')가 포함되지 않은 댓글입니다."
                }
                self.wfile.write(json.dumps(resp, indent=2, ensure_ascii=False).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))


def run_webhook_server(port: int = 8088):
    server_address = ("", port)
    httpd = HTTPServer(server_address, CommentWebhookHandler)
    print(f"🚀 [WEBHOOK SERVER] Listening on http://localhost:{port} (Triggers: '파보', '골든타임', '송아지')")
    httpd.serve_forever()


if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8088
    run_webhook_server(port_arg)
