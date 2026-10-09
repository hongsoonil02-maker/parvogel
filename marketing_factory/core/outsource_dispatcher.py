#!/usr/bin/env python3
"""
Outsource Dispatcher (옵션 B)
— 파보겔 숏폼 초저가 외주 편집자(편당 1.5만~2만원) 연계 웹훅 및 작업 지시서 발송 모듈
- 구글 시트 / 노션 데이터베이스 규격에 맞춘 일괄 배치 TSV/CSV 생성
- 편집자용 노션 스타일 마크다운 작업 지시서(씬별 타임코드, 자막, 폰트, B-roll 다운로드 링크) 자동 발행
- 디스코드/슬랙/웹훅 알림 발송 지원
"""

import os
import sys
import json
import csv
from datetime import datetime
from typing import Dict, Any, List, Optional

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, FACTORY_DIR)
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output")
ORDERS_DIR = os.path.join(OUTPUT_DIR, "outsource_orders")

os.makedirs(ORDERS_DIR, exist_ok=True)


class OutsourceDispatcher:
    """초저가 외주 작업 지시서 생성 및 웹훅 배포자"""

    def __init__(self):
        self.orders_dir = ORDERS_DIR

    def create_work_order(self, script_obj: Dict[str, Any], outsource_payload: Dict[str, Any]) -> str:
        """개별 영상에 대한 마크다운 작업 지시서 파일 생성"""
        version_id = script_obj.get("version_id", "SHORTFORM")
        date_tag = datetime.now().strftime("%Y%m%d_%H%M%S")
        order_filename = f"WorkOrder_{version_id}_{date_tag}.md"
        order_path = os.path.join(self.orders_dir, order_filename)

        md_content = outsource_payload.get("work_order_markdown", "")
        with open(order_path, "w", encoding="utf-8") as f:
            f.write(md_content)

        return order_path

    def export_batch_spreadsheet_rows(self, packages: List[Dict[str, Any]]) -> str:
        """구글 시트 / 노션 DB 가져오기용 TSV 파일 생성"""
        date_tag = datetime.now().strftime("%Y%m%d")
        tsv_path = os.path.join(self.orders_dir, f"Outsource_Batch_{date_tag}.tsv")

        headers = [
            "주문ID", "타깃", "제목", "의뢰단가(원)", "권장러닝타임", "트리거키워드", "B-roll클립수", "상태", "작업지시서경로"
        ]

        rows = []
        for pkg in packages:
            scripts = pkg.get("scripts", {})
            assemblers = pkg.get("assembler_payloads", {})
            for v_key, s_data in scripts.items():
                v_payload = assemblers.get(v_key, {}).get("option_b_outsource", {})
                v_id = s_data.get("version_id", v_key)
                order_path = self.create_work_order(s_data, v_payload)
                
                rows.append([
                    v_id,
                    s_data.get("target", "B2C"),
                    s_data.get("title", ""),
                    str(v_payload.get("unit_price_krw", 15000)),
                    f"{s_data.get('running_time_sec', 45)}초",
                    s_data.get("trigger_keyword", ""),
                    str(len(s_data.get("scenes", []))),
                    "대기중 (배정 대기)",
                    order_path
                ])

        with open(tsv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f, delimiter="\t")
            writer.writerow(headers)
            writer.writerows(rows)

        return tsv_path

    def dispatch_webhook(self, webhook_url: str, script_obj: Dict[str, Any]) -> bool:
        """디스코드 또는 슬랙 편집자 공용 채널로 즉시 작업 의뢰 웹훅 전송"""
        if not webhook_url:
            return False
        import requests
        v_id = script_obj.get("version_id")
        title = script_obj.get("title")
        sec = script_obj.get("running_time_sec")
        kw = script_obj.get("trigger_keyword")

        msg = {
            "content": f"📢 **[신규 숏폼 편집 외주 발주]**\n- **프로젝트**: 파보겔 {v_id}\n- **제목**: {title}\n- **길이**: {sec}초\n- **댓글 트리거**: `{kw}`\n- **단가**: 15,000원 (당일 마감 우대)\n👉 상세 작업 지시서가 구글 시트에 업데이트되었습니다."
        }
        try:
            r = requests.post(webhook_url, json=msg, timeout=5)
            return r.status_code in [200, 204]
        except Exception:
            return False


if __name__ == "__main__":
    from core.viral_shortform_engine import ViralShortformEngine
    eng = ViralShortformEngine()
    pkg = eng.generate_full_package("샘플 영상 대본입니다.")
    dispatcher = OutsourceDispatcher()
    tsv_out = dispatcher.export_batch_spreadsheet_rows([pkg])
    print(f"✅ Generated Outsource Batch TSV: {tsv_out}")
