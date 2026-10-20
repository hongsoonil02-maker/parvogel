#!/usr/bin/env python3
"""
Marketing Queue Server — 100baggersaas 백엔드 ↔ 로컬 크롬 확장 프로그램 하이브리드 브릿지
- 백엔드에서 생성된 마케팅 글을 큐(Queue)에 적재하고, 로컬 크롬 확장이 이를 폴링하여 안전하게 네이버/티스토리에 발행하도록 지원
- "몬모릴로나이트" 정식 표기 100% 강제 검증 및 산출
"""

import os
import sys
import json
import uuid
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

FACTORY_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(FACTORY_DIR, "data")
QUEUE_FILE = os.path.join(DATA_DIR, "marketing_queue.json")

def load_queue():
    if os.path.exists(QUEUE_FILE):
        try:
            with open(QUEUE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"pending": [], "published": []}
    return {"pending": [], "published": []}

def save_queue(queue):
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)

def push_post_to_queue(title: str, body: str, links: dict = None, tags: list = None, target_brand: str = "KOREA_AGRO", product_id: str = "PARVOGEL_D2C"):
    """백엔드 생성 파이프라인에서 발행 대기열에 글 추가 (브랜드별 격리 보장)"""
    # 몬모릴로나이트 무결성 검증
    title = title.replace("몽모릴로나이트", "몬모릴로나이트")
    body = body.replace("몽모릴로나이트", "몬모릴로나이트")

    queue = load_queue()
    post_item = {
        "id": str(uuid.uuid4())[:8],
        "target_brand": target_brand,  # "KOREA_AGRO" (법인/수의) 또는 "100BAGGER_LABS" (개인/퀀트)
        "product_id": product_id,      # "ROTAGAL_VACCINE" | "PARVOGEL_D2C" | "100BAGGER_APP"
        "title": title,
        "body": body,
        "links": links or {},
        "tags": tags or (["로타갈", "한우백신", "송아지설사"] if product_id == "ROTAGAL_VACCINE" else ["파보겔", "강아지설사", "파보장염", "몬모릴로나이트", "강아지장영양제"]),
        "status": "PENDING",
        "createdAt": datetime.now().isoformat()
    }
    queue["pending"].append(post_item)
    save_queue(queue)
    return post_item

class QueueHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/marketing/queue/pending":
            queue = load_queue()
            pending_items = [p for p in queue.get("pending", []) if p.get("status") == "PENDING"]
            
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()

            if pending_items:
                # 가장 오래된 1건 제공
                post = pending_items[0]
                self.wfile.write(json.dumps({"status": "SUCCESS", "post": post}, ensure_ascii=False).encode("utf-8"))
            else:
                self.wfile.write(json.dumps({"status": "EMPTY", "post": None}, ensure_ascii=False).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length) if length > 0 else b"{}"

        if parsed.path == "/api/marketing/queue/complete":
            try:
                body_json = json.loads(post_data.decode("utf-8"))
                post_id = body_json.get("id")
                post_url = body_json.get("postUrl")
                
                queue = load_queue()
                pending = queue.get("pending", [])
                published = queue.get("published", [])

                target = next((p for p in pending if p.get("id") == post_id), None)
                if target:
                    pending.remove(target)
                    target["status"] = "PUBLISHED"
                    target["postUrl"] = post_url
                    target["publishedAt"] = datetime.now().isoformat()
                    published.append(target)
                    save_queue({"pending": pending, "published": published})

                self.send_response(200)
                self._set_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "SUCCESS", "message": "Marked as published."}, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode("utf-8"))
        elif parsed.path == "/api/marketing/queue/push":
            try:
                body_json = json.loads(post_data.decode("utf-8"))
                item = push_post_to_queue(
                    title=body_json.get("title", ""),
                    body=body_json.get("body", ""),
                    links=body_json.get("links", {}),
                    tags=body_json.get("tags", [])
                )
                self.send_response(200)
                self._set_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "SUCCESS", "item": item}, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=8000):
    server = HTTPServer(("0.0.0.0", port), QueueHandler)
    print(f"[QUEUE_SERVER] Running on http://localhost:{port}/api/marketing/queue/pending")
    server.serve_forever()

if __name__ == "__main__":
    run_server()
