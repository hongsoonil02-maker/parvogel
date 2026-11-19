import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getStoreUrl } from '../config/storeLinks';

export default function ParvogelClinicalDocumentary() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
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
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[300px] sm:max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden bg-slate-950 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/80">
              <video
                ref={videoRef}
                src={videoUrl}
                poster={posterUrl}
                controls={isPlaying}
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onEnded={() => setIsPlaying(false)}
                aria-label={t('videoSection.videoAria', '파보겔 기적의 골든타임 35초 소개 영상')}
                className="w-full h-full object-cover"
              />

              {!isPlaying && (
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label={t('videoSection.playAria', '35초 영상 재생하기')}
                  className="group absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 hover:bg-slate-950/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500 focus-visible:ring-inset"
                >
                  <span className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/95 group-hover:scale-110 motion-reduce:transform-none transition-transform shadow-2xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-primary-700 translate-x-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="mt-3 px-3.5 py-1.5 rounded-full bg-slate-950/85 text-white text-xs font-bold tracking-tight backdrop-blur-sm">
                    {t('videoSection.playBtn', '35초 영상 재생 ▶')}
                  </span>
                </button>
              )}
            </div>

            {/* 청각장애인·음소거 시청자용 텍스트 자막/대본 토글 */}
            <div className="w-full max-w-[300px] sm:max-w-[340px] mt-3">
              <button
                type="button"
                onClick={() => setIsTranscriptOpen((prev) => !prev)}
                aria-expanded={isTranscriptOpen}
                aria-controls="golden-time-transcript"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                <span>{t('videoSection.transcriptToggle', '📝 영상 내용 텍스트 자막 보기 (접근성 지원)')}</span>
                <span aria-hidden="true">{isTranscriptOpen ? '▲' : '▼'}</span>
              </button>
              {isTranscriptOpen && (
                <div
                  id="golden-time-transcript"
                  className="mt-2 p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed text-start space-y-1.5 shadow-xs"
                >
                  <p className="font-bold text-slate-900">
                    {t('videoSection.transcriptTitle', '[35초 영상 요약 대본]')}
                  </p>
                  <p>
                    {t(
                      'videoSection.transcriptBody',
                      '한밤중 갑자기 시작된 설사와 구토, 동물병원 문이 닫힌 급박한 상황에서 주사기 없이 1초 원터치 펌프로 간편하게 급여하는 파보겔. 고순도 몬모릴로나이트 겔이 장 점막을 부드럽게 감싸고 장내 환경 안정을 도와 골든타임을 지켜줍니다.'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 보호자용 심플 핵심 요약 */}
          <div className="md:col-span-7 text-center md:text-start space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/90 border border-primary-200 text-primary-900 text-xs font-extrabold">
              <span aria-hidden="true">🎬</span>
              <span>{t('videoSection.badge', '35초로 보는 파보겔 기적의 골든타임')}</span>
            </div>

            <h2
              id="parvogel-video-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug break-keep"
            >
              {t('videoSection.titleLine1', '한밤중 갑작스러운 설사·구토,')}
              <span className="block text-primary-700 mt-1">
                {t('videoSection.titleLine2', '기적의 1초 펌프로 지켜주세요')}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed break-keep">
              {t(
                'videoSection.subtitle',
                '병원 문이 닫힌 새벽에도 당황하지 않도록, 우리 아이 장 건강을 지키는 가장 간편한 홈케어 상비 보조사료입니다.'
              )}
            </p>

            <ul className="space-y-2.5 text-start max-w-lg mx-auto md:mx-0">
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-black shrink-0" aria-hidden="true">
                  1
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 break-keep">
                  {t('videoSection.point1', '주사기 없이 원터치 1초 펌프 급여로 스트레스 최소화')}
                </span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-black shrink-0" aria-hidden="true">
                  2
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 break-keep">
                  {t('videoSection.point2', '고순도 몬모릴로나이트 겔이 장 점막 코팅 및 유해물질 흡착')}
                </span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-black shrink-0" aria-hidden="true">
                  3
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 break-keep">
                  {t('videoSection.point3', '강아지·고양이 전 연령 가정 상비 필수템, 온라인 공식몰 빠른 배송')}
                </span>
              </li>
            </ul>

            <div className="pt-1 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href={getStoreUrl('kakaoStore')}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-label={t('stores.kakaoAria', '카카오 쇼핑하기 구매 페이지로 이동 (새 창)')}
                  className="min-h-[48px] px-4 py-3 rounded-2xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] border border-amber-300 font-extrabold text-sm shadow-md transition-all flex items-center justify-center text-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                >
                  {t('stores.kakaoCta', '카카오 쇼핑하기')}
                </a>
                <a
                  href={getStoreUrl('naver')}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-label={t('stores.naverAria', '네이버 스마트스토어 구매 페이지로 이동 (새 창)')}
                  className="min-h-[48px] px-4 py-3 rounded-2xl bg-[#028A3D] hover:bg-[#027734] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center text-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                >
                  {t('stores.naverCta', '네이버 스마트스토어')}
                </a>
                <a
                  href={getStoreUrl('coupang')}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-label={t('stores.coupangAria', '쿠팡 로켓배송 구매 페이지로 이동 (새 창)')}
                  className="min-h-[48px] px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center text-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  {t('stores.coupangCta', '쿠팡 로켓배송')}
                </a>
              </div>
              <div className="text-center md:text-start">
                <a
                  href="#official-stores"
                  className="inline-flex items-center gap-1 min-h-[36px] text-xs font-semibold text-slate-600 hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md px-1"
                >
                  <span>{t('stores.moreMallsLink', '토스 · G마켓 · 옥션 · 11번가 공식몰 전체보기')}</span>
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
