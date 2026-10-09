import React from 'react';
import { useTranslation } from 'react-i18next';
import { getStoreUrl } from '../config/storeLinks';

export default function StickyBottomCTA({ onOpenOrder }) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Quick Action Footer Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-primary-500/30 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] px-4 py-3 sm:px-6 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] text-white"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-black text-lg">
            🛡️
          </div>
          <div>
            <div className="font-extrabold text-white text-sm">
              {t('stickyCta.title', '파보겔 (Parvogel) 신생아 지사 보조제')}
            </div>
            <div className="text-xs text-primary-300 font-semibold">
              {t('stickyCta.sub', '고순도 초미세 나노 몬모릴로나이트 포뮬러')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <a
            href="https://pf.kakao.com/_rqxnJX/chat"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="카카오톡 1:1 맞춤 상담"
            className="flex-1 md:flex-initial px-3 sm:px-4 py-2.5 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-xs sm:text-sm rounded-xl shadow-lg border border-amber-300 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <span>💬 카톡 1:1 상담</span>
          </a>

          <a
            href={getStoreUrl('coupang')}
            target="_blank"
            rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade"
            aria-label={t('stickyCta.buyBtn', '쿠팡 로켓배송 구매')}
            className="relative flex-1 md:flex-initial px-3 sm:px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs sm:text-sm rounded-xl border border-slate-700/60 shadow-lg transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <span>{t('stickyCta.buyBtn', '🚀 쿠팡 구매')}</span>
          </a>
          
          <button
            onClick={onOpenOrder}
            aria-label={t('stickyCta.consultBtn', '주문·샘플 신청')}
            className="flex-1 md:flex-initial px-3 sm:px-4 py-2.5 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 hover:from-primary-800 hover:to-primary-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-primary-500/40 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <span>{t('stickyCta.consultBtn', '🎁 주문·샘플')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
