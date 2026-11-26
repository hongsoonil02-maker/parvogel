import datetime
import html
import os
import random
import re
import smtplib
from email.message import EmailMessage
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

import requests

from marketing_factory.core.influencer_gonggu_guard import (
    OFFICIAL_COMPANY_NAME,
    OFFICIAL_KOREAAGRO_URL,
    OFFICIAL_PRODUCT_NAME,
    assert_gonggu_safe,
)
from marketing_factory.core.influencer_lead_scraper import (
    PIPELINE_STAGES,
    InfluencerCRMStore,
)
from marketing_factory.core.influencer_pitch_generator import InfluencerPitchGenerator


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DASHBOARD_PATH = os.path.join(PROJECT_DIR, "marketing_factory", "output", "influencer_gonggu_dashboard.html")


class InfluencerOutreachManager:
    """
    파보겔 100ml 정품 단독 공동구매 3~4단계 총괄 매니저:
    - 3단계: 이메일(SendGrid / Gmail SMTP) 10시/15시 분할 발송 + 인스타 DM 일일 25건 한도 및 3~7분 딜레이 보호
    - 4단계: 6단계 파이프라인 상태 관리 + koreaagro 전용 UTM 공구 링크 생성 + 수수료 정산 + 메시지 자판기 HTML 대시보드
    """

    DEFAULT_DAILY_DM_LIMIT = 25
    MIN_DM_DELAY_SEC = 180
    MAX_DM_DELAY_SEC = 420
    SPLIT_WINDOWS_KST = ("10:00", "15:00")

    def __init__(
        self,
        crm_store: Optional[InfluencerCRMStore] = None,
        pitch_generator: Optional[InfluencerPitchGenerator] = None,
        max_daily_dm: int = DEFAULT_DAILY_DM_LIMIT,
    ):
        self.crm = crm_store or InfluencerCRMStore()
        self.pitch_gen = pitch_generator or InfluencerPitchGenerator(use_llm=True)
        self.max_daily_dm = max(1, min(int(max_daily_dm), 30))

    @staticmethod
    def build_koreaagro_gonggu_link(
        handle: str,
        campaign_tag: Optional[str] = None,
        base_url: str = OFFICIAL_KOREAAGRO_URL,
    ) -> str:
        """인플루언서별 koreaagro 스마트스토어 전용 추적 UTM 공구 링크를 생성합니다."""
        clean_handle = re.sub(r"[^a-z0-9_]+", "", (handle or "partner").lower()) or "partner"
        month_tag = campaign_tag or f"parvogel100ml_{datetime.date.today().strftime('%Y%m')}"
        query = urlencode({
            "utm_source": "influencer",
            "utm_medium": "gonggu",
            "utm_campaign": month_tag,
            "utm_content": clean_handle,
        })
        sep = "&" if "?" in base_url else "?"
        return f"{base_url}{sep}{query}"

    @staticmethod
    def recommend_dm_delay_seconds() -> int:
        """인스타그램 계정 보호를 위한 3~7분(180~420초) 랜덤 대기 시간 반환."""
        return random.randint(InfluencerOutreachManager.MIN_DM_DELAY_SEC, InfluencerOutreachManager.MAX_DM_DELAY_SEC)

    def _get_dm_log_today(self, date_str: Optional[str] = None) -> List[str]:
        today = date_str or datetime.date.today().strftime("%Y-%m-%d")
        data = self.crm._read_local()
        return list(data.get("daily_dm_log", {}).get(today, []))

    def get_dm_safety_status(self, date_str: Optional[str] = None) -> Dict[str, Any]:
        today = date_str or datetime.date.today().strftime("%Y-%m-%d")
        sent_handles = self._get_dm_log_today(today)
        used = len(sent_handles)
        remaining = max(0, self.max_daily_dm - used)
        return {
            "date": today,
            "daily_limit": self.max_daily_dm,
            "sent_today": used,
            "remaining_today": remaining,
            "recommended_delay_sec_range": [self.MIN_DM_DELAY_SEC, self.MAX_DM_DELAY_SEC],
            "can_send_more": remaining > 0,
        }

    def record_dm_dispatched(
        self,
        lead_id: str,
        date_str: Optional[str] = None,
    ) -> Dict[str, Any]:
        """메시지 자판기에서 DM 복사/발송 완료 시 일일 발송 한도(25건/일)를 검증하고 기록합니다."""
        today = date_str or datetime.date.today().strftime("%Y-%m-%d")
        status = self.get_dm_safety_status(today)
        if not status["can_send_more"]:
            raise RuntimeError(
                f"[ANTI-BAN LIMIT] Daily Instagram DM quota ({self.max_daily_dm}/day) reached for {today}."
            )

        lead = self.crm.get_lead(lead_id)
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")

        data = self.crm._read_local()
        dm_log = data.setdefault("daily_dm_log", {})
        today_list = dm_log.setdefault(today, [])
        if lead_id not in today_list:
            today_list.append(lead_id)
        self.crm._write_local(data)

        if lead.get("status") == "발굴됨":
            self.transition_stage(lead_id, "제안발송")

        return self.get_dm_safety_status(today)

    def ensure_pitch_for_lead(self, lead_id: str) -> Dict[str, Any]:
        lead = self.crm.get_lead(lead_id)
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")
        pitch = self.pitch_gen.generate_pitch(lead)
        return self.crm.upsert_lead({
            "lead_id": lead_id,
            "pitch": pitch,
        })

    def _send_via_sendgrid(self, to_email: str, subject: str, body: str, from_email: str) -> bool:
        api_key = os.getenv("SENDGRID_API_KEY", "").strip()
        if not api_key:
            return False
        resp = requests.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "personalizations": [{"to": [{"email": to_email}]}],
                "from": {"email": from_email, "name": f"{OFFICIAL_COMPANY_NAME} 파보겔 공구팀"},
                "subject": subject,
                "content": [{"type": "text/plain", "value": body}],
            },
            timeout=15,
        )
        return resp.status_code in (200, 201, 202)

    def _send_via_gmail_smtp(self, to_email: str, subject: str, body: str) -> bool:
        gmail_user = os.getenv("GMAIL_USER", "").strip()
        gmail_pw = os.getenv("GMAIL_APP_PASSWORD", "").strip()
        if not (gmail_user and gmail_pw):
            return False
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = f"{OFFICIAL_COMPANY_NAME} 파보겔 공구팀 <{gmail_user}>"
        msg["To"] = to_email
        msg.set_content(body)
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as server:
            server.starttls()
            server.login(gmail_user, gmail_pw)
            server.send_message(msg)
        return True

    def send_pitch_emails(
        self,
        max_emails: int = 15,
        dry_run: bool = True,
        window_label: str = "10:00",
    ) -> Dict[str, Any]:
        """
        이메일이 확보된 '발굴됨' 상태 리드에 대해 분할 발송(10시/15시 배치)을 수행합니다.
        발송 전 브랜드 분리·사료관리법 가드레일(assert_gonggu_safe)을 필수 통과합니다.
        """
        candidates = [
            l for l in self.crm.list_leads(status="발굴됨")
            if (l.get("email") or "").strip() and not l.get("email_sent_at")
        ][:max_emails]

        from_email = os.getenv("OUTREACH_FROM_EMAIL") or os.getenv("GMAIL_USER") or "contact@parvogel.kr"
        results: List[Dict[str, Any]] = []

        for lead in candidates:
            updated = self.ensure_pitch_for_lead(lead["lead_id"])
            pitch = updated["pitch"]
            assert_gonggu_safe(pitch, context=f"email:{lead['lead_id']}")

            to_email = updated["email"]
            subject = pitch["email_subject"]
            body = pitch["email_body"]

            if dry_run:
                results.append({
                    "lead_id": lead["lead_id"],
                    "email": to_email,
                    "window": window_label,
                    "status": "DRY_RUN_READY",
                    "subject": subject,
                })
                continue

            sent_ok = False
            transport = "none"
            if os.getenv("GMAIL_USER") and os.getenv("GMAIL_APP_PASSWORD"):
                try:
                    sent_ok = self._send_via_gmail_smtp(to_email, subject, body)
                    transport = "gmail_smtp"
                except Exception:
                    sent_ok = False
            if not sent_ok and os.getenv("SENDGRID_API_KEY"):
                try:
                    sent_ok = self._send_via_sendgrid(to_email, subject, body, from_email)
                    transport = "sendgrid"
                except Exception:
                    sent_ok = False

            if sent_ok:
                self.crm.upsert_lead({
                    "lead_id": lead["lead_id"],
                    "status": "제안발송",
                    "email_sent_at": datetime.datetime.now().isoformat(),
                    "email_window": window_label,
                    "email_transport": transport,
                })
                results.append({"lead_id": lead["lead_id"], "email": to_email, "status": "SENT", "transport": transport})
            else:
                results.append({"lead_id": lead["lead_id"], "email": to_email, "status": "FAILED_OR_NO_SMTP_KEY"})

        return {
            "window": window_label,
            "dry_run": dry_run,
            "processed": len(results),
            "results": results,
        }

    def transition_stage(
        self,
        lead_id: str,
        new_stage: str,
        commission_rate: Optional[float] = None,
        shipping_tracking_no: Optional[str] = None,
    ) -> Dict[str, Any]:
        """6단계 공동구매 파이프라인 상태를 전환하고 공구 확정 시 koreaagro 전용 UTM 링크를 발급합니다."""
        if new_stage not in PIPELINE_STAGES:
            raise ValueError(f"Invalid stage '{new_stage}'. Allowed: {PIPELINE_STAGES}")

        lead = self.crm.get_lead(lead_id)
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")

        patch: Dict[str, Any] = {
            "lead_id": lead_id,
            "status": new_stage,
            "product": OFFICIAL_PRODUCT_NAME,
            "stage_updated_at": datetime.datetime.now().isoformat(),
        }

        if new_stage == "발송완료" and shipping_tracking_no:
            patch["shipping_tracking_no"] = shipping_tracking_no

        if new_stage == "공구확정":
            rate = float(commission_rate if commission_rate is not None else lead.get("commission_rate", 0.25))
            rate = max(0.20, min(0.30, rate))
            patch["commission_rate"] = rate
            patch["gonggu_url"] = lead.get("gonggu_url") or self.build_koreaagro_gonggu_link(lead.get("handle", lead_id))

        return self.crm.upsert_lead(patch)

    def record_gonggu_sales(
        self,
        lead_id: str,
        units_sold: int,
        unit_price_krw: int = 29000,
        commission_rate: Optional[float] = None,
        mark_settled: bool = False,
    ) -> Dict[str, Any]:
        """판매 수량 및 수수료(20~30%) 정산 내역을 자동 집계합니다."""
        lead = self.crm.get_lead(lead_id)
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")

        units = max(0, int(units_sold))
        price = max(0, int(unit_price_krw))
        rate = float(commission_rate if commission_rate is not None else lead.get("commission_rate", 0.25))
        rate = max(0.20, min(0.30, rate))

        gross_sales = units * price
        payout = int(round(gross_sales * rate))

        patch: Dict[str, Any] = {
            "lead_id": lead_id,
            "units_sold": units,
            "unit_price_krw": price,
            "commission_rate": rate,
            "gross_sales_krw": gross_sales,
            "commission_payout_krw": payout,
            "gonggu_url": lead.get("gonggu_url") or self.build_koreaagro_gonggu_link(lead.get("handle", lead_id)),
        }
        if mark_settled:
            patch["status"] = "정산완료"
            patch["settled_at"] = datetime.datetime.now().isoformat()

        return self.crm.upsert_lead(patch)

    def build_gonggu_dashboard(self, out_path: Optional[str] = None) -> str:
        """
        메시지 자판기(원클릭 DM 복사 + 인스타 열기 + 25건 안전 카운터)와
        6단계 공동구매 칸반 트래킹 & koreaagro 수수료 정산표를 통합한 HTML 대시보드 생성.
        """
        target_path = out_path or DEFAULT_DASHBOARD_PATH
        os.makedirs(os.path.dirname(target_path), exist_ok=True)

        leads = self.crm.list_leads()
        dm_status = self.get_dm_safety_status()
        stage_counts = {st: sum(1 for l in leads if l.get("status") == st) for st in PIPELINE_STAGES}

        total_units = sum(int(l.get("units_sold", 0) or 0) for l in leads)
        total_payout = sum(int(l.get("commission_payout_krw", 0) or 0) for l in leads)

        cards_html: List[str] = []
        table_rows_html: List[str] = []

        for lead in leads:
            lead_id = lead["lead_id"]
            if not lead.get("pitch"):
                lead = self.ensure_pitch_for_lead(lead_id)
            pitch = lead["pitch"]
            assert_gonggu_safe(pitch, context=f"dashboard:{lead_id}")

            dm_text_esc = html.escape(pitch["dm_short"])
            email_text_esc = html.escape(pitch["email_body"])
            name_esc = html.escape(str(lead.get("display_name") or lead.get("handle") or ""))
            handle_esc = html.escape(str(lead.get("handle") or ""))
            channel_esc = html.escape(str(lead.get("channel") or "instagram"))
            status_esc = html.escape(str(lead.get("status") or "발굴됨"))
            profile_url_esc = html.escape(str(lead.get("profile_url") or "#"))
            email_esc = html.escape(str(lead.get("email") or "-"))
            gonggu_url = str(lead.get("gonggu_url") or self.build_koreaagro_gonggu_link(lead.get("handle", lead_id)))
            gonggu_url_esc = html.escape(gonggu_url)
            units = int(lead.get("units_sold", 0) or 0)
            rate_pct = int(round(float(lead.get("commission_rate", 0.25) or 0.25) * 100))
            payout = int(lead.get("commission_payout_krw", 0) or 0)

            cards_html.append(
                f"""
                <div class="card" data-channel="{channel_esc}" data-status="{status_esc}">
                  <div class="card-head">
                    <div>
                      <span class="badge">{channel_esc.upper()}</span>
                      <span class="badge stage">{status_esc}</span>
                      <h3>{name_esc} <small>@{handle_esc}</small></h3>
                    </div>
                    <a class="btn-outline" href="{profile_url_esc}" target="_blank" rel="noopener">프로필 열기 ↗</a>
                  </div>
                  <p class="meta">팔로워 {int(lead.get('followers', 0)):,} · 참여율 {lead.get('engagement_rate', 0)}% · 이메일: {email_esc}</p>
                  <label>📩 인스타 DM / 카톡 숏버전 (파보겔 100ml 정품 단독)</label>
                  <textarea id="dm_{html.escape(lead_id)}" readonly rows="4">{dm_text_esc}</textarea>
                  <div class="actions">
                    <button class="btn-primary" onclick="copyText('dm_{html.escape(lead_id)}')">1클릭 DM 복사 (3~7분 간격 권장)</button>
                    <details>
                      <summary>이메일 상세 제안서 보기</summary>
                      <pre>{email_text_esc}</pre>
                    </details>
                  </div>
                </div>
                """
            )

            table_rows_html.append(
                f"""
                <tr>
                  <td>{name_esc} (@{handle_esc})</td>
                  <td>{channel_esc}</td>
                  <td><span class="badge stage">{status_esc}</span></td>
                  <td>{OFFICIAL_PRODUCT_NAME}</td>
                  <td><a href="{gonggu_url_esc}" target="_blank" rel="noopener">koreaagro UTM 링크</a></td>
                  <td>{units:,}개</td>
                  <td>{rate_pct}%</td>
                  <td>{payout:,}원</td>
                </tr>
                """
            )

        stage_pills = "".join(
            f'<div class="kpi"><span>{html.escape(st)}</span><strong>{stage_counts[st]}</strong></div>'
            for st in PIPELINE_STAGES
        )

        html_doc = f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>파보겔 100ml 정품 공동구매 메시지 자판기 & 트래킹 보드</title>
  <style>
    body {{ font-family: 'Malgun Gothic', -apple-system, sans-serif; background:#f6f8fb; color:#111827; margin:0; padding:24px; }}
    .wrap {{ max-width:1200px; margin:0 auto; }}
    .banner {{ background:#0f172a; color:#fff; padding:20px 24px; border-radius:14px; margin-bottom:20px; }}
    .banner small {{ color:#93c5fd; display:block; margin-top:6px; }}
    .kpis {{ display:grid; grid-template-columns:repeat(auto-fit, minmax(140px,1fr)); gap:12px; margin-bottom:24px; }}
    .kpi {{ background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:14px; }}
    .kpi span {{ display:block; font-size:12px; color:#6b7280; }}
    .kpi strong {{ font-size:22px; color:#0f172a; }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fit, minmax(360px,1fr)); gap:16px; margin-bottom:28px; }}
    .card {{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; }}
    .card-head {{ display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }}
    .badge {{ display:inline-block; font-size:11px; padding:3px 8px; border-radius:999px; background:#dbeafe; color:#1e40af; font-weight:700; }}
    .badge.stage {{ background:#dcfce7; color:#166534; }}
    .meta {{ font-size:12px; color:#4b5563; margin:8px 0; }}
    textarea {{ width:100%; box-sizing:border-box; padding:10px; border-radius:8px; border:1px solid #d1d5db; font-size:13px; background:#f9fafb; }}
    .actions {{ margin-top:10px; display:flex; flex-direction:column; gap:8px; }}
    .btn-primary {{ background:#2563eb; color:#fff; border:none; border-radius:8px; padding:9px 14px; font-weight:700; cursor:pointer; }}
    .btn-outline {{ font-size:12px; color:#2563eb; text-decoration:none; border:1px solid #bfdbfe; padding:5px 10px; border-radius:8px; white-space:nowrap; }}
    pre {{ white-space:pre-wrap; font-size:12px; background:#f3f4f6; padding:10px; border-radius:8px; }}
    table {{ width:100%; border-collapse:collapse; background:#fff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb; }}
    th, td {{ padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:left; font-size:13px; }}
    th {{ background:#f9fafb; font-weight:700; }}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="banner">
      <h2>파보겔(ParvoGel) 100ml 정품 단독 — 인플루언서 공구 메시지 자판기 &amp; 정산 보드</h2>
      <small>공식 공급: {OFFICIAL_COMPANY_NAME} · 브랜드 분리 가드레일 활성(타 제품/병원명 원천 차단) · 금일 DM 잔여 한도: {dm_status['remaining_today']} / {dm_status['daily_limit']}건</small>
    </div>

    <div class="kpis">
      {stage_pills}
      <div class="kpi"><span>총 판매 수량</span><strong>{total_units:,}개</strong></div>
      <div class="kpi"><span>누적 정산 수수료</span><strong>{total_payout:,}원</strong></div>
    </div>

    <h3>1. AI 초개인화 메시지 자판기 (1클릭 복사 · 계정 보호 반자동 발송)</h3>
    <div class="grid">
      {''.join(cards_html) or '<p>등록된 리드가 없습니다. Lead Scraper로 타겟을 수집하거나 CSV를 임포트해 주세요.</p>'}
    </div>

    <h3>2. 공구 진행 파이프라인 &amp; koreaagro UTM 수수료 정산 현황</h3>
    <table>
      <thead>
        <tr>
          <th>인플루언서/벤더</th>
          <th>채널</th>
          <th>현재 단계</th>
          <th>공구 품목</th>
          <th>전용 추적 링크</th>
          <th>판매 수량</th>
          <th>수수료율</th>
          <th>예상 수수료</th>
        </tr>
      </thead>
      <tbody>
        {''.join(table_rows_html) or '<tr><td colspan="8">등록된 파이프라인 데이터가 없습니다.</td></tr>'}
      </tbody>
    </table>
  </div>
  <script>
    function copyText(id) {{
      var el = document.getElementById(id);
      if (!el) return;
      el.select();
      navigator.clipboard.writeText(el.value);
      alert('초개인화 DM이 복사되었습니다! 인스타 차단 방지를 위해 3~7분 간격으로 발송하세요.');
    }}
  </script>
</body>
</html>
"""
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(html_doc)
        return target_path
