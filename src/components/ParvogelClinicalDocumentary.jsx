import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getStoreUrl } from '../config/storeLinks';

export default function ParvogelClinicalDocumentary() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const videoUrl = useMemo(
    () => `${import.meta.env.BASE_URL}assets/parvogel_golden_time_35s_9x16.mp4`,
    []
  );
  const posterUrl = useMemo(
    () => `${import.meta.env.BASE_URL}assets/parvogel_golden_time_poster.jpg`,
    []
  );

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section
      id="parvogel-clinical-doc"
      aria-labelledby="parvogel-video-heading"
      className="py-10 sm:py-14 bg-gradient-to-b from-slate-50 via-primary-50/30 to-white text-slate-800 border-t border-slate-200/70"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
          {/* 왼쪽: 9:16 35초 핵심 스토리 영상 */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] sm:max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden bg-slate-950 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/80">
              <video
                ref={videoRef}
                src={videoUrl}
                poster={posterUrl}
                controls={isPlaying}
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onEnded={() => setIsPlaying(false)}
                aria-label={t('doc.shortVideoTitle', '파보겔 기적의 골든타임 35초 영상')}
                className="w-full h-full object-cover"
              />

              {!isPlaying && (
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label={t('doc.playVideo', '35초 영상 재생하기')}
                  className="group absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 hover:bg-slate-950/30 transition-colors cursor-pointer"
                >
                  <span className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/95 group-hover:scale-110 transition-transform shadow-2xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-primary-700 translate-x-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="mt-3 px-3.5 py-1 rounded-full bg-slate-950/80 text-white text-xs font-bold tracking-tight backdrop-blur-sm">
                    35초 영상 재생 ▶
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 오른쪽: 보호자용 심플 핵심 요약 */}
          <div className="md:col-span-7 text-center md:text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/90 border border-primary-200 text-primary-900 text-xs font-extrabold">
              <span>🎬</span>
              <span>{t('doc.simpleBadge', '35초로 보는 파보겔 기적의 골든타임')}</span>
            </div>

            <h2
              id="parvogel-video-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug break-keep"
            >
              한밤중 갑작스러운 설사·구토,
              <span className="block text-primary-700 mt-1">
                기적의 1초 펌프로 지켜주세요
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed break-keep">
              병원 문이 닫힌 새벽에도 당황하지 않도록, 우리 아이 장 건강을 지키는
              가장 간편한 홈케어 상비 보조사료입니다.
            </p>

            <ul className="space-y-2.5 text-left max-w-md mx-auto md:mx-0">
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-black shrink-0">
                  1
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 break-keep">
                  주사기 없이 원터치 1초 펌프 급여로 스트레스 최소화
                </span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-black shrink-0">
                  2
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 break-keep">
                  고순도 몬모릴로나이트 겔이 장 점막 코팅 및 유해물질 흡착
                </span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-black shrink-0">
                  3
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 break-keep">
                  강아지·고양이 전 연령 가정 상비 필수템, 온라인 공식몰 빠른 배송
                </span>
              </li>
            </ul>

            <div className="pt-1 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center md:justify-start">
                <a
                  href={getStoreUrl('naver')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-[#03C75A] hover:bg-[#02b351] text-white font-extrabold text-sm shadow-md transition-all text-center"
                >
                  네이버 스마트스토어 구매하기
                </a>
                <a
                  href={getStoreUrl('coupang')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all text-center"
                >
                  쿠팡 로켓배송으로 보기
                </a>
              </div>
              <div className="text-center md:text-left">
                <a
                  href="#official-stores"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary-700 transition-colors"
                >
                  <span>카카오 · 토스 · G마켓 · 옥션 · 11번가 공식몰 전체보기</span>
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
