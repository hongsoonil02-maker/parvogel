import React from 'react';
import { useTranslation } from 'react-i18next';
import { getStoreUrl } from '../config/storeLinks';

export default function StickyBottomCTA() {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('stickyCta.navAria', '빠른 구매 및 상담 하단 메뉴')}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] px-3 sm:px-6 py-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] text-slate-900"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-primary-700 flex items-center justify-center font-black text-lg border border-sky-200" aria-hidden="true">
            🐾
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">
              {t('stickyCta.title', '파보겔 (ParvoGel) — 우리 아이 1초 펌프 응급 장 케어')}
            </div>
            <div className="text-xs text-primary-700 font-semibold">
              {t('stickyCta.sub', '체내 흡수 0% 고순도 나노 몬모릴로나이트 · 간식처럼 냠냠 먹는 겔')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 md:flex items-center gap-1.5 sm:gap-2 w-full md:w-auto">
          <a
            href={getStoreUrl('kakaoStore')}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer-when-downgrade"
            aria-label={t('stores.kakaoAria', '카카오 쇼핑하기 구매 페이지로 이동 (새 창)')}
            className="min-h-[44px] md:flex-initial px-1.5 sm:px-4 py-2 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-[11px] sm:text-sm rounded-xl shadow-xs border border-amber-300 transition-all flex items-center justify-center gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
          >
            <span aria-hidden="true">🟡</span>
            <span>{t('stickyCta.kakaoShort', '카카오쇼핑')}</span>
          </a>

          <a
            href={getStoreUrl('coupang')}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer-when-downgrade"
            aria-label={t('stores.coupangAria', '쿠팡 로켓배송 구매 페이지로 이동 (새 창)')}
            className="min-h-[44px] relative md:flex-initial px-1.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1"
          >
            <span aria-hidden="true">🚀</span>
            <span>{t('stickyCta.coupangShort', '쿠팡')}</span>
          </a>

          <a
            href={getStoreUrl('naver')}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer-when-downgrade"
            aria-label={t('stores.naverAria', '네이버 스마트스토어 구매 페이지로 이동 (새 창)')}
            className="min-h-[44px] md:flex-initial px-1.5 sm:px-4 py-2 bg-[#028A3D] hover:bg-[#027734] text-white font-black text-[11px] sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
          >
            <span aria-hidden="true">🛍️</span>
            <span>{t('stickyCta.naverShort', '네이버')}</span>
          </a>

          <a
            href="https://pf.kakao.com/_rqxnJX/chat"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('stickyCta.chatAria', '카카오톡 1:1 맞춤 상담 (새 창)')}
            className="min-h-[44px] md:flex-initial px-1.5 sm:px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] sm:text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1"
          >
            <span aria-hidden="true">💬</span>
            <span>{t('stickyCta.chatShort', '상담')}</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
