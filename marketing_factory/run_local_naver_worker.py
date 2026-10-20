#!/usr/bin/env python3
"""
Local Naver Blog Hybrid Worker — 클라우드(GitHub Actions)에서 생성된 대기열(marketing_queue.json)을
로컬 Windows PC의 로그인된 네이버 세션(naver_user_profile)으로 안전하게 발행하는 하이브리드 워커
- 실행 방법: python marketing_factory/run_local_naver_worker.py
"""

import os
import sys
import json
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

FACTORY_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, FACTORY_DIR)

from core.queue_server import load_queue, save_queue
from adapters.naver_blog_adapter import NaverBlogBrowserAdapter


def run_worker():
    adapter = NaverBlogBrowserAdapter()
    if not adapter.validate_config():
        print("[LOCAL_NAVER_WORKER] ⚠️ 로컬 네이버 세션(naver_user_profile)이 준비되지 않았습니다.")
        print("먼저 'python marketing_factory/setup_naver_session.py'를 실행해 로그인 세션을 생성해 주세요.")
        return False

    queue = load_queue()
    pending = [item for item in queue.get("pending", []) if item.get("status") == "PENDING" and item.get("product_id") in ("PARVOGEL_D2C", "PARVOGEL_MONSMECTA")]
    if not pending:
        print("[LOCAL_NAVER_WORKER] ✅ 현재 발행 대기 중인 파보겔 네이버 블로그 원고가 없습니다.")
        return True

    target = pending[0]
    print(f"[LOCAL_NAVER_WORKER] 🚀 대기열 원고 발행 시작 (ID: {target.get('id')}) — {target.get('title')}")
    ok = adapter.publish({
        "title": target.get("title"),
        "body": target.get("body"),
        "links": target.get("links", {}),
        "tags": target.get("tags")
    })

    if ok:
        target["status"] = "PUBLISHED"
        target["publishedAt"] = datetime.now().isoformat()
        queue["pending"] = [p for p in queue.get("pending", []) if p.get("id") != target.get("id")]
        queue.setdefault("published", []).append(target)
        save_queue(queue)
        print(f"[LOCAL_NAVER_WORKER] 🎉 네이버 블로그 발행 및 큐 완료 처리 성공! (ID: {target.get('id')})")
        return True

    print(f"[LOCAL_NAVER_WORKER] ❌ 발행 실패 (ID: {target.get('id')}). 다음 실행 시 재시도합니다.")
    return False


if __name__ == "__main__":
    run_worker()
