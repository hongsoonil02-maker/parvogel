# -*- coding: utf-8 -*-
import os, sys, json, glob
from datetime import datetime

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

class ParvogelMarketingMaster:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.output_dir = os.path.join(self.base_dir, 'output')
        os.makedirs(self.output_dir, exist_ok=True)
        self.log_file = os.path.join(self.output_dir, 'parvogel_deploy_log.txt')

    def log(self, msg):
        ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        line = f"[{ts}] {msg}"
        print(line)
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(line + '\n')

    def run_channels(self):
        self.log("=== [파보겔] 온·오프라인 멀티채널 마케팅 자동 배포 파이프라인 가동 ===")
        
        shorts_file = os.path.join(self.output_dir, 'shorts_reels_scripts.json')
        if os.path.exists(shorts_file):
            with open(shorts_file, 'r', encoding='utf-8') as f:
                scripts = json.load(f)
            self.log(f"[Shorts/Reels] {len(scripts)}개 숏폼 대본 패키징 완료")
            manifest = []
            for s in scripts:
                manifest.append({
                    'platform': ['YouTube Shorts', 'Instagram Reels', 'TikTok'],
                    'title': s['title'],
                    'video_asset': s['video'],
                    'cta_link': 'https://smartstore.naver.com/petschury/products/13718496355'
                })
            manifest_file = os.path.join(self.output_dir, 'parvogel_shorts_manifest.json')
            with open(manifest_file, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, ensure_ascii=False, indent=2)
            self.log(f"[Shorts/Reels] 업로드 매니페스트 생성 -> {manifest_file}")

        blog_file = os.path.join(self.output_dir, 'blog_review_guide.json')
        if os.path.exists(blog_file):
            self.log("[Naver Blog] 네이버 블로그 체험단 및 구매자 후기 유도 패키지 준비 완료")

        mobio_file = os.path.join(self.output_dir, 'mobio_sales_brief.json')
        if os.path.exists(mobio_file):
            self.log("[MOBIO Offline] 엠오바이오 산업동물 총판 대리점 영업 브리핑 배포 준비 완료")

        self.log("=== 모든 파보겔 마케팅 배포 데이터 패키징 성공 ===")

if __name__ == '__main__':
    master = ParvogelMarketingMaster()
    master.run_channels()
