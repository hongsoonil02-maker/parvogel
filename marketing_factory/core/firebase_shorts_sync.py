#!/usr/bin/env python3
"""
Firebase Shorts Feed Auto-Sync Module (ParvoGel B2C Only)
- Connects ParvoGel's YouTube Shorts auto-upload pipeline to Firebase Firestore
  (`parvogel-petcare-vip` -> `shorts_feed` collection).
- Enforces strict ParvoGel / Korea Agro brand isolation (blocks SNJ / Monsmecta leakage).
- Supports automatic upsert on YouTube upload completion and initial backfill
  from `published_ledger.json`.
"""

import os
import sys
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
DEFAULT_SA_PATH = os.path.join(FACTORY_DIR, "config", "secrets", "parvogel-firebase-sa.json")
LEDGER_PATH = os.path.join(FACTORY_DIR, "data", "published_ledger.json")

FORBIDDEN_PARVOGEL_TOKENS = [
    "에스앤제이",
    "031-321-6562",
    "0313216562",
    "080-881-1289",
    "0808811289",
    "monsmecta",
    "몬스멕타",
    "몽모릴로나이트",
]

_firestore_client = None


def _get_firestore_client():
    global _firestore_client
    if _firestore_client is not None:
        return _firestore_client

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError as exc:
        print(f"[WARN] firebase-admin not installed: {exc}")
        return None

    sa_path = os.getenv("PARVOGEL_FIREBASE_SA_PATH") or DEFAULT_SA_PATH
    if not os.path.exists(sa_path):
        print(f"[WARN] ParvoGel Firebase service account not found: {sa_path}")
        return None

    if not firebase_admin._apps:
        cred = credentials.Certificate(sa_path)
        firebase_admin.initialize_app(cred, {"projectId": "parvogel-petcare-vip"})

    _firestore_client = firestore.client()
    return _firestore_client


def _assert_parvogel_brand_safe(text: str):
    lowered = (text or "").lower()
    for token in FORBIDDEN_PARVOGEL_TOKENS:
        if token.lower() in lowered:
            raise ValueError(
                f"[BRAND ISOLATION BLOCKED] Forbidden token '{token}' cannot enter ParvoGel B2C shorts_feed!"
            )


def sync_short_to_firestore(
    video_id: str,
    title: str,
    product_tag: str = "parvogel",
    reward_points: int = 50,
    campaign_id: Optional[str] = None,
    created_at: Optional[datetime] = None,
) -> bool:
    """
    Upsert a ParvoGel YouTube Short into `parvogel-petcare-vip` Firestore `shorts_feed`.
    Returns True on success, False if skipped or failed.
    """
    if not video_id or video_id == "unknown" or len(video_id) < 5:
        print(f"[SKIP] Invalid video_id for Firestore sync: {video_id}")
        return False

    # Enforce strict brand isolation for B2C app
    if product_tag != "parvogel":
        print(f"[SKIP] Brand isolation: product_tag '{product_tag}' is excluded from ParvoGel B2C shorts_feed.")
        return False

    clean_title = (title or "파보겔 펫케어 쇼츠").strip()[:160]
    _assert_parvogel_brand_safe(clean_title)
    if campaign_id:
        _assert_parvogel_brand_safe(campaign_id)

    db = _get_firestore_client()
    if db is None:
        return False

    from google.cloud import firestore as gc_firestore

    ts = created_at or datetime.now(timezone.utc)
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)

    doc_data: Dict[str, Any] = {
        "video_id": video_id,
        "title": clean_title,
        "product_tag": "parvogel",
        "reward_points": max(10, min(100, int(reward_points))),
        "youtube_url": f"https://youtube.com/shorts/{video_id}",
        "thumbnail_url": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        "created_at": ts,
    }
    if campaign_id:
        doc_data["campaign_id"] = str(campaign_id)[:100]

    try:
        db.collection("shorts_feed").document(video_id).set(doc_data, merge=True)
        print(f"[FIREBASE SYNC OK] shorts_feed/{video_id} -> '{clean_title}' (+{doc_data['reward_points']}P)")
        return True
    except Exception as exc:
        print(f"[FIREBASE SYNC FAIL] {exc}")
        return False


def backfill_from_published_ledger() -> List[str]:
    """Read verified live YouTube Shorts from published_ledger.json and sync to Firestore."""
    synced_ids: List[str] = []
    if not os.path.exists(LEDGER_PATH):
        print(f"[WARN] Ledger not found: {LEDGER_PATH}")
        return synced_ids

    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        ledger = json.load(f)

    seen = set()
    for entry in ledger:
        live_urls = entry.get("live_urls") or {}
        vid = live_urls.get("youtube_id")
        if not vid or vid in seen:
            continue
        seen.add(vid)

        title = entry.get("theme") or "파보겔 임상 스토리 쇼츠"
        campaign_id = entry.get("campaign_id") or "PARVOGEL_SHORTS"
        ts_str = entry.get("timestamp")
        dt = None
        if ts_str:
            try:
                dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            except Exception:
                dt = None

        if sync_short_to_firestore(
            video_id=vid,
            title=title,
            product_tag="parvogel",
            reward_points=50,
            campaign_id=campaign_id,
            created_at=dt,
        ):
            synced_ids.append(vid)

    return synced_ids


if __name__ == "__main__":
    print("=" * 64)
    print("🔥 [PARVOGEL FIREBASE SHORTS FEED BACKFILL & VERIFICATION]")
    print("=" * 64)
    ids = backfill_from_published_ledger()
    print(f"\n✅ Total synced live ParvoGel YouTube Shorts: {len(ids)} -> {ids}")
