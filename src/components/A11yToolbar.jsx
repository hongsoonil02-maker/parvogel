import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const A11yToolbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [readableFont, setReadableFont] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // 로컬스토리지에서 기존 접근성 설정 복원
  useEffect(() => {
    try {
      const hc = localStorage.getItem('parvogel_a11y_high_contrast') === 'true';
      const lt = localStorage.getItem('parvogel_a11y_large_text') === 'true';
      const rm = localStorage.getItem('parvogel_a11y_reduce_motion') === 'true';
      const rf = localStorage.getItem('parvogel_a11y_readable_font') === 'true';

      if (hc) setHighContrast(true);
      if (lt) setLargeText(true);
      if (rm) setReduceMotion(true);
      if (rf) setReadableFont(true);
    } catch {
      /* ignore */
    }
  }, []);

  // 고대비 모드 토글
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      try { localStorage.setItem('parvogel_a11y_high_contrast', 'true'); } catch { /* ignore */ }
    } else {
      document.documentElement.classList.remove('high-contrast');
      try { localStorage.removeItem('parvogel_a11y_high_contrast'); } catch { /* ignore */ }
    }
  }, [highContrast]);

  // 큰 글씨 모드 토글
  useEffect(() => {
    if (largeText) {
      document.documentElement.classList.add('large-text');
      try { localStorage.setItem('parvogel_a11y_large_text', 'true'); } catch { /* ignore */ }
    } else {
      document.documentElement.classList.remove('large-text');
      try { localStorage.removeItem('parvogel_a11y_large_text'); } catch { /* ignore */ }
    }
  }, [largeText]);

  // 움직임 줄이기 토글
  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
      try { localStorage.setItem('parvogel_a11y_reduce_motion', 'true'); } catch { /* ignore */ }
    } else {
      document.documentElement.classList.remove('reduce-motion');
      try { localStorage.removeItem('parvogel_a11y_reduce_motion'); } catch { /* ignore */ }
    }
  }, [reduceMotion]);

  // 가독성 폰트/줄간격 모드 토글
  useEffect(() => {
    if (readableFont) {
      document.documentElement.classList.add('readable-font');
      try { localStorage.setItem('parvogel_a11y_readable_font', 'true'); } catch { /* ignore */ }
    } else {
      document.documentElement.classList.remove('readable-font');
      try { localStorage.removeItem('parvogel_a11y_readable_font'); } catch { /* ignore */ }
    }
  }, [readableFont]);

  // 본문 음성 읽어주기 (TTS)
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert(t('a11y.ttsNotSupported', '이 브라우저는 음성 읽기(TTS)를 지원하지 않습니다.'));
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // 주요 헤딩과 핵심 본문 텍스트 추출
    const mainHeading = document.querySelector('h1')?.innerText || '파보겔';
    const subHeadings = Array.from(document.querySelectorAll('h2, h3'))
      .slice(0, 4)
      .map(el => el.innerText)
      .join('. ');
    const clinicalSummary = document.querySelector('#clinical')?.innerText?.slice(0, 300) || '';

    const textToRead = `${mainHeading}. ${subHeadings}. ${clinicalSummary}`.replace(/\s+/g, ' ').trim();

    if (!textToRead) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // 현재 선택된 다국어 코드 매핑
    const langMap = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
      zh: 'zh-CN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      th: 'th-TH',
      vi: 'vi-VN',
      ru: 'ru-RU',
      pt: 'pt-BR',
      ar: 'ar-SA',
      id: 'id-ID',
      ms: 'ms-MY',
      tr: 'tr-TR'
    };
    const currentLang = (i18n.language || 'ko').split('-')[0];
    utterance.lang = langMap[currentLang] || 'ko-KR';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 컴포넌트 언마운트 시 음성 중지
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ESC 키로 메뉴 닫기 접근성 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <aside
      aria-label={t('a11y.toolbarLabel', '웹 접근성 설정 도구')}
      className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom,0px))] start-3 sm:start-6 z-[80] flex flex-col items-start gap-2"
    >
      {isOpen && (
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="false"
          aria-label={t('a11y.title', '장애인 접근 편의 도구 (A11y)')}
          className="bg-slate-900/95 border border-cyan-400/40 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 mb-2 w-64 text-white backdrop-blur-md origin-bottom-left animate-in fade-in zoom-in"
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-1">
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
              <span aria-hidden="true">♿</span> {t('a11y.title', '장애인 접근 편의 도구')}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xs font-bold p-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
              aria-label={t('common.close', '닫기')}
            >
              ✕
            </button>
          </div>
          
          {/* 고대비 모드 */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`min-h-[42px] px-3 py-2 text-xs font-bold rounded-xl text-start transition-all flex items-center justify-between cursor-pointer ${
              highContrast
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-cyan-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            } focus:outline-none focus:ring-2 focus:ring-cyan-400`}
            aria-pressed={highContrast}
          >
            <span>{highContrast ? t('a11y.contrastOff', '고대비 끄기') : t('a11y.contrastOn', '고대비 켜기')}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/30">{highContrast ? 'ON' : 'OFF'}</span>
          </button>

          {/* 큰 글씨 모드 */}
          <button
            onClick={() => setLargeText(!largeText)}
            className={`min-h-[42px] px-3 py-2 text-xs font-bold rounded-xl text-start transition-all flex items-center justify-between cursor-pointer ${
              largeText
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-cyan-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            } focus:outline-none focus:ring-2 focus:ring-cyan-400`}
            aria-pressed={largeText}
          >
            <span>{largeText ? t('a11y.largeTextOff', '글씨 크기 복구') : t('a11y.largeTextOn', '큰 글씨 확대')}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/30">{largeText ? 'ON' : 'OFF'}</span>
          </button>

          {/* 움직임 줄이기 */}
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`min-h-[42px] px-3 py-2 text-xs font-bold rounded-xl text-start transition-all flex items-center justify-between cursor-pointer ${
              reduceMotion
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-cyan-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            } focus:outline-none focus:ring-2 focus:ring-cyan-400`}
            aria-pressed={reduceMotion}
          >
            <span>{reduceMotion ? t('a11y.reduceMotionOff', '움직임 효과 켜기') : t('a11y.reduceMotionOn', '움직임 줄이기')}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/30">{reduceMotion ? 'ON' : 'OFF'}</span>
          </button>

          {/* 가독성 향상 모드 */}
          <button
            onClick={() => setReadableFont(!readableFont)}
            className={`min-h-[42px] px-3 py-2 text-xs font-bold rounded-xl text-start transition-all flex items-center justify-between cursor-pointer ${
              readableFont
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-cyan-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            } focus:outline-none focus:ring-2 focus:ring-cyan-400`}
            aria-pressed={readableFont}
          >
            <span>{readableFont ? t('a11y.readableFontOff', '기본 줄간격 복구') : t('a11y.readableFontOn', '가독성 줄간격 확대')}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/30">{readableFont ? 'ON' : 'OFF'}</span>
          </button>

          {/* 본문 음성 읽어주기 (TTS) */}
          <button
            onClick={handleToggleSpeech}
            className={`min-h-[42px] px-3 py-2 text-xs font-bold rounded-xl text-start transition-all flex items-center justify-between cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            } focus:outline-none focus:ring-2 focus:ring-cyan-400`}
            aria-pressed={isSpeaking}
          >
            <span className="flex items-center gap-1.5">
              <span>{isSpeaking ? '🔊' : '🔈'}</span>
              <span>{isSpeaking ? t('a11y.readAloudOff', '음성 읽기 멈춤') : t('a11y.readAloudOn', '본문 음성 읽기')}</span>
            </span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/30">{isSpeaking ? '재생중' : 'OFF'}</span>
          </button>
        </div>
      )}

      {/* 플로팅 접근성 토글 버튼 (파보겔 시그니처 딥네이비 & 시안 블루 테두리 + 유니버설 접근성 아이콘) */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#0b192c] hover:bg-[#1e3a8a] active:bg-[#030712] text-cyan-300 w-14 h-14 min-w-[48px] min-h-[48px] rounded-full shadow-2xl border-2 border-cyan-400/90 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/50 transition-all hover:scale-110 active:scale-95 group cursor-pointer"
        aria-label={t('a11y.openMenu', '장애인 접근 편의 도구 열기')}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7 transition-transform group-hover:scale-105" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="10" strokeWidth="1.6" />
          <circle cx="12" cy="6.8" r="1.6" fill="currentColor" stroke="none" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10.2h11M12 9.5v4.5l-2.2 4.5M12 14l2.2 4.5" />
        </svg>
      </button>
    </aside>
  );
};

export default A11yToolbar;
