import React from 'react';
import { useTranslation } from 'react-i18next';
import { getStoreUrl } from '../config/storeLinks';

export default function StickyBottomCTA({ onOpenOrder }) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Quick Action Footer Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] px-4 py-3 sm:px-6 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] text-slate-900"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-primary-700 flex items-center justify-center font-black text-lg border border-sky-200">
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <a
            href="https://pf.kakao.com/_rqxnJX/chat"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="카카오톡 1:1 맞춤 상담"
            className="flex-1 md:flex-initial px-3 sm:px-4 py-2.5 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-xs sm:text-sm rounded-xl shadow-xs border border-amber-300 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <span>💬 카톡 상담</span>
          </a>

          <a
            href={getStoreUrl('coupang')}
            target="_blank"
            rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade"
            aria-label={t('stickyCta.buyBtn', '쿠팡 로켓배송 구매')}
            className="relative flex-1 md:flex-initial px-3 sm:px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <span>🚀 쿠팡 구매</span>
          </a>
          
          <a
            href={getStoreUrl('naver')}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer-when-downgrade"
            aria-label="네이버 스마트스토어 구매"
            className="flex-1 md:flex-initial px-3 sm:px-4 py-2.5 bg-[#03C75A] hover:bg-[#02b350] text-white font-black text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <span>🛍️ 네이버 구매</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
