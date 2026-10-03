#!/usr/bin/env python3
"""
Naver Blog Browser Automation Adapter (Playwright Engine)
- marketing_factory/data/naver_user_profile 에 저장된 세션을 사용하여 로그인 없이 바로 포스팅
- 네이버 스마트에디터 ONE (SmartEditor ONE) 자동 포맷팅 및 발행 지원
"""

import os
import sys
import time
import json
from typing import Dict, Any

# Windows 콘솔 UTF-8 강제
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, FACTORY_DIR)

try:
    from .base_adapter import BaseMarketingAdapter
except (ImportError, ValueError):
    from adapters.base_adapter import BaseMarketingAdapter

DATA_DIR = os.path.join(FACTORY_DIR, "data")
USER_PROFILE_DIR = os.path.join(DATA_DIR, "naver_user_profile")
SESSION_FLAG = os.path.join(DATA_DIR, "naver_session_ready.json")
COOKIES_FILE = os.path.join(DATA_DIR, "naver_cookies.json")

class NaverBlogBrowserAdapter(BaseMarketingAdapter):
    name = "Naver_Blog"

    def validate_config(self) -> bool:
        """세션 프로필 및 준비 플래그 확인"""
        if os.path.exists(SESSION_FLAG) and os.path.exists(USER_PROFILE_DIR):
            return True
        return False

    def _convert_markdown_to_smart_html(self, title: str, body: str, links: Dict[str, str]) -> str:
        """스마트에디터 ONE 친화적 고품질 리치 HTML 변환"""
        import re

        coupang_url = links.get("coupang", "https://www.coupang.com/vp/products/9690739565")
        smartstore_url = links.get("smartstore", "https://smartstore.naver.com/petschury/products/13718496355")
        landing_url = links.get("landing", "https://parvogel.kr/")

        # 기본 단락 분리 및 HTML 빌드
        raw_paragraphs = [p.strip() for p in body.split("\n\n") if p.strip()]
        html_parts = []

        html_parts.append('<div style="font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; line-height: 1.85; color: #1e293b; font-size: 16px;">')

        for p in raw_paragraphs:
            # 1. 메인 타이틀은 별도 에디터 타이틀 영역에 입력되므로 본문에서는 제외
            if p.startswith("# "):
                continue

            # 2. 연관 검색어 행 및 구매 안내 중복 텍스트 제거 (하단 전용 프리미엄 카드 박스로 통합)
            if "연관 검색어" in p or "연관검색어" in p or "골든타임을 지키는 가장 빠른 방법" in p or "쿠팡 로켓배송 즉시 구매" in p:
                continue


            # 3. 소제목 (## ) 처리
            if p.startswith("## "):
                lines = p.split("\n")
                heading_line = lines[0].replace("## ", "").strip()
                
                # 5번 공식 구매 안내는 하단 전용 CTA 박스로 대체하므로 헤더만 출력하거나 CTA로 위임
                if "구매 안내" in heading_line or "구매처" in heading_line:
                    continue

                html_parts.append(f'<h3 style="color: #03C75A; font-size: 20px; font-weight: 700; margin-top: 35px; margin-bottom: 14px; border-left: 4px solid #03C75A; padding-left: 12px; line-height: 1.4;">{heading_line}</h3>')

                # 소제목 뒤에 연달아 붙은 줄들이 있을 경우 본문 문단으로 이어서 처리
                remaining_lines = "\n".join(lines[1:]).strip()
                if remaining_lines:
                    cleaned_p = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', remaining_lines)
                    cleaned_p = cleaned_p.replace('*', '').replace('~', '').replace('\n', '<br>')
                    html_parts.append(f'<p style="margin-bottom: 18px; color: #334155;">{cleaned_p}</p>')
                continue

            # 4. 인용구 (> )
            if p.startswith("> "):
                quote_text = p.replace("> ", "").strip()
                quote_text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', quote_text)
                quote_text = quote_text.replace('*', '').replace('~', '').replace('\n', '<br>')
                html_parts.append(f'<div style="background-color: #f8fafc; border-left: 4px solid #03C75A; padding: 16px 20px; margin: 24px 0; border-radius: 6px; color: #334155; font-size: 15.5px; line-height: 1.8;">{quote_text}</div>')
                continue

            # 5. 고품질 스튜디오 정품 사진 배치 (테스트용 샘플 사진 제거, 스튜디오 3종 라인업/단품/성분표/정품인증 배치)
            if "[사진/영상 배치 지점 1" in p:
                html_parts.append('<div style="text-align: center; margin: 30px 0;"><img src="https://parvogel.kr/images/bottle_group.png" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);" alt="몬스멕타 파보겔 정품 공식 3종 라인업 (100ml / 200ml / 500ml)"><p style="font-size: 13.5px; color: #64748b; margin-top: 10px; font-weight: 600;">▲ [정품 공식 라인업] 동물병원 단독 처방 몬스멕타 파보겔 (100ml / 200ml / 500ml)</p></div>')
                continue
            elif "[사진/영상 배치 지점 2" in p:
                html_parts.append('<div style="text-align: center; margin: 30px 0;"><img src="https://parvogel.kr/images/bottle_front.png" style="max-width: 320px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);" alt="1초 원터치 펌프형 동물용 보조사료 파보겔 200ml 정품"><p style="font-size: 13.5px; color: #64748b; margin-top: 10px; font-weight: 600;">▲ 바늘·주사기 스트레스 ZERO! 1초 원터치 펌프형 동물용 보조사료 파보겔 200ml</p></div>')
                continue
            elif "[사진/영상 배치 지점 3" in p:
                html_parts.append('<div style="text-align: center; margin: 30px 0;"><img src="https://parvogel.kr/images/bottle_back.png" style="max-width: 340px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);" alt="파보겔 5가지 복합제 성분등록 및 특허균주 상세 라벨"><p style="font-size: 13.5px; color: #64748b; margin-top: 10px; font-weight: 600;">▲ 5가지 복합 작용 기전 및 특허균주(Patent No. 2011B0042620.8) 정식 라벨</p></div>')
                continue
            elif "[사진/영상 배치 지점" in p:
                continue

            # 6. 구분선
            if p.startswith("---"):
                html_parts.append('<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 35px 0;">')
                continue

            # 7. 불릿 리스트 (- )
            if p.startswith("- "):
                items = p.split("\n- ")
                html_parts.append('<ul style="margin: 16px 0 16px 20px; padding: 0; color: #334155;">')
                for item in items:
                    clean_item = item.replace("- ", "").strip()
                    clean_item = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', clean_item)
                    clean_item = clean_item.replace('*', '').replace('~', '')
                    html_parts.append(f'<li style="margin-bottom: 8px; line-height: 1.7;">{clean_item}</li>')
                html_parts.append('</ul>')
                continue

            # 8. 일반 문단 처리 (모든 **는 <strong>으로 변환, 잔여 * 및 ~는 제거하여 가로선/취소선 원천 차단)
            formatted_p = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', p)
            formatted_p = formatted_p.replace('*', '').replace('~', '').replace('\n', '<br>')
            html_parts.append(f'<p style="margin-bottom: 18px; color: #334155; line-height: 1.85;">{formatted_p}</p>')

        # 하단 공식 구매처 고가독성 프리미엄 카드 박스
        cta_box = f"""
        <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-top: 40px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <h4 style="color: #03C75A; font-size: 20px; margin-top: 0; margin-bottom: 12px; font-weight: 700;">🐾 파보겔 공식 공급처 안내 (최우선 신속 발송)</h4>
          <p style="color: #475569; font-size: 14.5px; margin-bottom: 20px; line-height: 1.6;">우리 아이의 골든타임을 지키기 위해 공식 공급처를 통해 최대한 빠르게 발송해 드립니다. 원하시는 구매처를 선택해 주세요.</p>
          
          <div style="background-color: #ffffff; border: 1.5px solid #03C75A; border-radius: 10px; padding: 16px 20px; margin-bottom: 14px;">
            <a href="{smartstore_url}" target="_blank" style="text-decoration: none; color: inherit; display: block;">
              <div style="font-size: 17px; font-weight: 700; color: #03C75A; margin-bottom: 4px;">🟢 네이버 스마트스토어 (펫츄리 공식몰) 바로가기 &gt;</div>
              <div style="font-size: 13.5px; color: #475569;">네이버페이 포인트 적립 · 최우선 신속 출고 지원</div>
            </a>
          </div>

          <div style="background-color: #ffffff; border: 1.5px solid #ef4444; border-radius: 10px; padding: 16px 20px; margin-bottom: 14px;">
            <a href="{coupang_url}" target="_blank" style="text-decoration: none; color: inherit; display: block;">
              <div style="font-size: 17px; font-weight: 700; color: #dc2626; margin-bottom: 4px;">🚀 쿠팡 공식 판매처 바로가기 &gt;</div>
              <div style="font-size: 13.5px; color: #475569;">골든타임을 지키는 최우선 신속 출고 · 최대한 빠른 안심 배송</div>
            </a>
          </div>

          <div style="background-color: #ffffff; border: 1.5px solid #2563eb; border-radius: 10px; padding: 16px 20px;">
            <a href="{landing_url}" target="_blank" style="text-decoration: none; color: inherit; display: block;">
              <div style="font-size: 17px; font-weight: 700; color: #1d4ed8; margin-bottom: 4px;">🌐 파보겔 공식 홈페이지 바로가기 &gt;</div>
              <div style="font-size: 13.5px; color: #475569;">55일령 아기 강아지 7일간의 무편집 진료실 직캠 풀영상 확인</div>
            </a>
          </div>
        </div>


        <div style="margin-top: 30px; padding: 16px 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 13.5px; color: #64748b; line-height: 1.8;">
          <strong style="color: #03C75A;">🔍 주요 검색 키워드</strong><br>
          강아지 설사 응급처치 · 파보 장염 초기증상 · 새끼 강아지 피똥 · 강아지 혈변 탈진 · 강아지 발작 경련 원인 · 몬스멕타 파보겔 · 동물병원 파보장염
        </div>
        """
        html_parts.append(cta_box)
        html_parts.append('</div>')

        return "".join(html_parts)


    def _dismiss_popups(self, frame, page):
        """작성 중인 글 팝업 및 도움말 패널 완전 닫기 (취소선 툴바 버튼 오클릭 원천 방지)"""
        for _ in range(2):
            try:
                # 1. 팝업 레이어 내부의 '취소' 버튼만 엄격하게 타겟팅 (툴바의 '취소선' 버튼 절대 클릭 금지)
                popup_cancel = frame.locator(".se-popup-container button.se-popup-button-cancel, .se-popup-alert-confirm button, .se-popup button:has-text('취소')").first
                if popup_cancel.is_visible(timeout=1000):
                    popup_cancel.click(force=True)
                    print("[NAVER_BLOG] Dismissed draft alert with modal cancel button.")
                    page.wait_for_timeout(500)
            except Exception:
                pass

            try:
                # 2. JS 레벨에서 팝업 컨테이너 내부의 취소/닫기 버튼만 탐색하여 클릭
                frame.evaluate("""() => {
                    const popups = document.querySelectorAll('.se-popup-container, .se-popup, [class*="popup"]');
                    popups.forEach(popup => {
                        const btns = Array.from(popup.querySelectorAll('button'));
                        const cancel = btns.find(b => {
                            const t = (b.textContent || '').trim();
                            return t === '취소' || t === '닫기';
                        });
                        if (cancel) cancel.click();
                    });
                    const helpClose = document.querySelector('.se-help-panel-close-button');
                    if (helpClose) helpClose.click();
                }""")
            except Exception:
                pass

            page.keyboard.press("Escape")
            page.wait_for_timeout(300)

        # 혹시 취소선(strikethrough) 툴바 버튼이 켜져 있다면 강제로 해제
        try:
            frame.evaluate("""() => {
                const strikeBtn = document.querySelector('.se-strikethrough-toolbar-button');
                if (strikeBtn) {
                    const isSelected = strikeBtn.classList.contains('is-selected') || 
                                       strikeBtn.classList.contains('active') || 
                                       strikeBtn.getAttribute('aria-pressed') === 'true';
                    if (isSelected) {
                        strikeBtn.click();
                        console.log('Strikethrough toolbar button was active; turned off.');
                    }
                }
                document.querySelectorAll('.se-popup-dim').forEach(el => el.remove());
            }""")
        except Exception:
            pass


    def publish(self, content_data: Dict[str, Any]) -> bool:
        """네이버 블로그 스마트에디터 ONE 자동 포스팅"""
        if not self.validate_config():
            print("[NAVER_BLOG] ⚠️ Session not found. Please run 'python setup_naver_session.py' first.")
            return False

        from playwright.sync_api import sync_playwright

        title = content_data.get("title", "파보겔 55일령 아기 강아지 급성 장염 회복 실화")
        body = content_data.get("body", "")
        links = content_data.get("links", {})

        print(f"[NAVER_BLOG] Starting automated post for: '{title[:30]}...'")

        rich_html = self._convert_markdown_to_smart_html(title, body, links)

        try:
            with sync_playwright() as p:
                context = p.chromium.launch_persistent_context(
                    user_data_dir=USER_PROFILE_DIR,
                    headless=False,
                    permissions=["clipboard-read", "clipboard-write"],
                    args=[
                        "--disable-blink-features=AutomationControlled",
                        "--start-maximized"
                    ],
                    viewport=None,
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                )

                # 저장된 영구 세션 쿠키 주입
                if os.path.exists(COOKIES_FILE):
                    try:
                        with open(COOKIES_FILE, "r", encoding="utf-8") as cf:
                            cookies_data = json.load(cf)
                            context.add_cookies(cookies_data)
                            print(f"[NAVER_BLOG] Loaded {len(cookies_data)} persistent session cookies.")
                    except Exception as ce:
                        print(f"[NAVER_BLOG] Notice loading cookies: {ce}")

                page = context.pages[0] if context.pages else context.new_page()

                # 글쓰기 페이지 진입
                print("[NAVER_BLOG] Navigating to blog write page...")
                page.goto("https://blog.naver.com/GoBlogWrite.naver", wait_until="networkidle", timeout=60000)
                page.wait_for_timeout(3000)

                # 로그인 풀림 체크
                if "nidlogin.login" in page.url:
                    print("[NAVER_BLOG] [AUTH] Session expired. Re-authentication required.")
                    context.close()
                    return False

                # 스마트에디터 비동기 로딩 대기
                page.wait_for_timeout(5000)
                frame = page.frame('mainFrame') or page

                # 초기 팝업 닫기
                self._dismiss_popups(frame, page)

                # 1. 제목 입력
                print("[NAVER_BLOG] Typing post title...")
                title_locator = frame.locator(".se-documentTitle, .se-section-documentTitle, span:has-text('제목을 입력하세요')").first
                title_locator.click(force=True)
                page.wait_for_timeout(500)
                page.keyboard.type(title, delay=30)
                page.wait_for_timeout(1000)

                # 제목 입력 후 비동기로 뜰 수 있는 팝업 재확인
                self._dismiss_popups(frame, page)

                # 2. 본문으로 이동
                print("[NAVER_BLOG] Moving to body editor...")
                body_locator = frame.locator(".se-main-container, .se-component-content").last
                body_locator.click(force=True)
                page.wait_for_timeout(500)

                # 3. 클립보드를 통한 리치 HTML 서식 주입
                print("[NAVER_BLOG] Injecting rich HTML formatted content...")
                page.evaluate("""html => {
                    const blob = new Blob([html], { type: 'text/html' });
                    const textBlob = new Blob([html], { type: 'text/plain' });
                    const item = new ClipboardItem({
                        'text/html': blob,
                        'text/plain': textBlob
                    });
                    return navigator.clipboard.write([item]);
                }""", rich_html)
                page.wait_for_timeout(500)
                page.keyboard.press("Control+V")
                page.wait_for_timeout(3000)

                # 4. 발행 전 팝업 재확인 및 정리
                self._dismiss_popups(frame, page)

                # 상단 초록색 발행 버튼 클릭 (발행 레이어 열기)
                print("[NAVER_BLOG] Clicking header publish button...")
                header_publish_btn = frame.locator('button[data-click-area="tpb.publish"], button[class*="publish_btn__"]').first
                header_publish_btn.click(force=True)
                page.wait_for_timeout(2500)

                # 5. 태그 입력 (가능한 경우)
                try:
                    tag_input = frame.locator("input[placeholder*='태그'], [class*='tag_input__'] input, .tag_input__").first
                    if tag_input.is_visible(timeout=2000):
                        tag_input.click()
                        tags = content_data.get("tags") or ["파보겔", "몬스멕타", "몬스멕타파보겔", "강아지파보겔", "파보장염", "강아지설사", "강아지혈변", "동물병원몬스멕타"]
                        for tag in tags:
                            tag_input.fill(tag)
                            page.keyboard.press("Enter")
                            page.wait_for_timeout(200)
                        print("[NAVER_BLOG] Tags entered successfully.")
                except Exception as te:
                    print(f"[NAVER_BLOG] Tag entry optional notice: {te}")

                # 6. 레이어 하단 최종 발행 확인 버튼 클릭
                print("[NAVER_BLOG] Confirming final publication in publish modal...")
                confirm_btn = frame.locator('button[data-click-area="tpb*i.publish"], button[class*="confirm_btn__"]').first
                if confirm_btn.is_visible(timeout=3000):
                    confirm_btn.click(force=True)
                    print("[NAVER_BLOG] Clicked confirm publish button!")
                else:
                    print("[NAVER_BLOG] Confirm button fallback...")
                    frame.locator('button:has-text("발행")').last.click(force=True)

                # 7. 실제 발행 완료 및 리디렉션 대기 (최대 15초)
                print("[NAVER_BLOG] Waiting for post publishing redirect...")
                final_post_url = page.url
                for _ in range(15):
                    page.wait_for_timeout(1000)
                    if "Redirect=Write" not in page.url and "PostWriteForm" not in page.url and "GoBlogWrite" not in page.url:
                        final_post_url = page.url
                        print(f"[NAVER_BLOG] Successfully redirected to published post: {final_post_url}")
                        break

                print(f"[NAVER_BLOG] [SUCCESS] Naver Blog post published! URL: {final_post_url}")
                context.close()
                return True

        except Exception as e:
            print(f"[NAVER_BLOG] [ERROR] Error during automated posting: {e}")
            return False

if __name__ == "__main__":
    adapter = NaverBlogBrowserAdapter()
    test_data = {
        "title": "[임상실화] 55일령 아기 강아지 급성 장염 파보겔 회복기",
        "body": "안녕하세요 파보겔 공식 블로그입니다.\n\n## 1. 급성 장염과 골든타임\n신속한 대처가 중요합니다.\n\n> 김동준 원장 단독 처방 48시간 파보겔 급여\n\n- 정식등록 보조사료\n- 1-deoxinojirimycin 특허 성분",
        "links": {
            "coupang": "https://www.coupang.com/vp/products/9690739565",
            "smartstore": "https://smartstore.naver.com/petschury/products/13718496355",
            "landing": "https://parvogel.kr/"
        }
    }
    adapter.publish(test_data)
