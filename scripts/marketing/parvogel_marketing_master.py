# -*- coding: utf-8 -*-
import os
import sys
import json
from datetime import datetime
from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl

try:
    import requests
except ImportError:
    requests = None

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


def append_utm(url: str, source: str, medium: str = 'organic', campaign: str = 'parvogel_d2c_2040') -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query))
    query.update({
        'utm_source': source,
        'utm_medium': medium,
        'utm_campaign': campaign,
    })
    return urlunparse(parsed._replace(query=urlencode(query)))


class ParvogelMarketingMaster:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.output_dir = os.path.join(self.base_dir, 'output')
        self.logs_dir = os.path.join(self.base_dir, 'logs')
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)
        self.log_file = os.path.join(self.output_dir, 'parvogel_deploy_log.txt')

    def log(self, msg: str):
        ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        line = f"[{ts}] {msg}"
        print(line)
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(line + '\n')

    def notify_channels(self, summary_text: str):
        if not requests:
            return
        tg_token = os.environ.get('TELEGRAM_BOT_TOKEN', '').strip()
        tg_chat = os.environ.get('TELEGRAM_CHAT_ID', '').strip()
        if tg_token and tg_chat:
            try:
                resp = requests.post(
                    f"https://api.telegram.org/bot{tg_token}/sendMessage",
                    json={'chat_id': tg_chat, 'text': summary_text},
                    timeout=10,
                )
                self.log(f"[Telegram Notification] status={resp.status_code}")
            except Exception as exc:
                self.log(f"[Telegram Notification] skipped/error: {exc}")

        discord_url = os.environ.get('DISCORD_WEBHOOK_URL', '').strip()
        if discord_url:
            try:
                resp = requests.post(
                    discord_url,
                    json={'content': summary_text},
                    timeout=10,
                )
                self.log(f"[Discord Notification] status={resp.status_code}")
            except Exception as exc:
                self.log(f"[Discord Notification] skipped/error: {exc}")

    def run_channels(self):
        self.log("=== [파보겔] 2040 D2C & B2B 멀티채널 마케팅 자동 배포 파이프라인 가동 ===")
        day_index = datetime.now().timetuple().tm_yday

        # 0. 보호자 공감 로테이션 메인 카피 배포 패키징
        copies_file = os.path.join(self.output_dir, 'rotating_hero_copies.json')
        today_copy = None
        if os.path.exists(copies_file):
            with open(copies_file, 'r', encoding='utf-8') as f:
                hero_copies = json.load(f)
            if hero_copies:
                today_copy = hero_copies[day_index % len(hero_copies)]
            self.log(f"[Hero Copies] {len(hero_copies)}개 보호자 공감 로테이션 메인 카피 패키징 완료 (오늘의 카피: {today_copy['id'] if today_copy else 'N/A'})")

        shorts_file = os.path.join(self.output_dir, 'shorts_reels_scripts.json')
        today_short = None
        if os.path.exists(shorts_file):
            with open(shorts_file, 'r', encoding='utf-8') as f:
                scripts = json.load(f)
            if scripts:
                today_short = scripts[day_index % len(scripts)]
            self.log(f"[Shorts/Reels] {len(scripts)}개 숏폼 대본 패키징 완료 (오늘의 추천 릴스/쇼츠: EP.{today_short['ep'] if today_short else 'N/A'})")
            manifest = []
            for s in scripts:
                manifest.append({
                    'platform': ['YouTube Shorts', 'Instagram Reels', 'Naver Clip'],
                    'ep': s.get('ep'),
                    'title': s['title'],
                    'hook_copy': s.get('hookCopy', ''),
                    'video_asset': s['video'],
                    'cta_links': {
                        'smartstore': append_utm('https://smartstore.naver.com/petschury/products/13718496355', f"shorts_ep{s.get('ep', 1)}"),
                        'landing': append_utm('https://parvogel.kr', f"shorts_ep{s.get('ep', 1)}"),
                        'b2b_sample': append_utm('https://parvogel.kr/?sample=petshop', f"shorts_b2b_ep{s.get('ep', 1)}")
                    }
                })
            manifest_file = os.path.join(self.output_dir, 'parvogel_shorts_manifest.json')
            with open(manifest_file, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, ensure_ascii=False, indent=2)
            self.log(f"[Shorts/Reels] UTM 추적 매니페스트 생성 -> {manifest_file}")

        blog_file = os.path.join(self.output_dir, 'blog_review_guide.json')
        if os.path.exists(blog_file):
            self.log("[Naver Blog] 네이버 블로그 체험단 및 구매자 후기 유도 패키지 준비 완료")

        mobio_file = os.path.join(self.output_dir, 'mobio_sales_brief.json')
        if os.path.exists(mobio_file):
            self.log("[MOBIO Offline] 엠오바이오 산업동물 독점 총판 대리점 영업 브리핑 패키지 준비 완료")

        summary = (
            f"✅ [파보겔 마케팅 팩토리 일일 리포트]\n"
            f"- 일자: {datetime.now().strftime('%Y-%m-%d')}\n"
            f"- 오늘의 D2C 히어로 카피: {today_copy['title'] if today_copy else 'N/A'}\n"
            f"- 오늘의 숏폼 캠페인: {today_short['title'] if today_short else 'N/A'}\n"
            f"- 랜딩 URL (UTM): {append_utm('https://parvogel.kr', 'daily_digest')}"
        )
        self.notify_channels(summary)
        self.log("=== 모든 파보겔 마케팅 배포 데이터 패키징 성공 ===")


if __name__ == '__main__':
    master = ParvogelMarketingMaster()
    master.run_channels()
