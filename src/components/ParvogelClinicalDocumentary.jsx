import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getStoreUrl } from '../config/storeLinks';

export default function ParvogelClinicalDocumentary() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const videoRef = useRef(null);

  const videoUrl = useMemo(
    () => `${import.meta.env.BASE_URL}assets/parvogel_real_clinical_28s_landing.mp4`,
    []
  );
  const posterUrl = useMemo(
    () => `${import.meta.env.BASE_URL}assets/parvogel_real_clinical_poster.jpg`,
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
                aria-label={t('videoSection.videoAria', '생후 55일 아기 푸들 실제 진료실 28초 회복 기록 영상')}
                className="w-full h-full object-cover"
              />

              {!isPlaying && (
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label={t('videoSection.playAria', '실제 진료실 28초 영상 재생하기')}
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
                  <span className="mt-3 px-4 py-1.5 rounded-full bg-slate-950/85 text-white text-xs sm:text-sm font-bold tracking-tight backdrop-blur-sm">
                    {t('videoSection.playBtn', '실제 진료실 28초 영상 재생 ▶')}
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
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                <span>{t('videoSection.transcriptToggle', '📝 영상 내용 텍스트 자막 보기 (접근성 지원)')}</span>
                <span aria-hidden="true">{isTranscriptOpen ? '▲' : '▼'}</span>
              </button>
              {isTranscriptOpen && (
                <div
                  id="golden-time-transcript"
                  className="mt-2 p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed text-start space-y-1.5 shadow-xs"
                >
                  <p className="font-bold text-slate-900">
                    {t('videoSection.transcriptTitle', '[실제 진료실 28초 영상 자막 전문]')}
                  </p>
                  <p>
                    {t(
                      'videoSection.transcriptBody',
                      'DAY 1 응급 내원: 생후 55일, 갑자기 쓰러져 응급으로 실려온 아기 푸들. 1차 장 점막 보호 급여: 주사기 없이 입가에 톡 짜주자 스스로 혀로 핥아먹기 시작했습니다. DAY 2 자력 기립: 하루 만에 구토가 진정되고 네 발로 스스로 일어섰습니다. DAY 3 사료 완식: 그리고 3일 뒤, 밥 한 입 못 먹던 아이가 사료 그릇을 싹 비웠습니다.'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 보호자용 심플 핵심 요약 */}
          <div className="md:col-span-7 text-center md:text-start space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/90 border border-primary-200 text-primary-900 text-xs sm:text-sm font-extrabold">
              <span aria-hidden="true">🎬</span>
              <span>{t('videoSection.badge', '하남 사랑동물병원 실제 진료실 28초 기록')}</span>
            </div>

            <h2
              id="parvogel-video-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug break-keep"
            >
              {t('videoSection.titleLine1', '생후 55일 쓰러져 실려온 아기 푸들')}
              <span className="block text-primary-700 mt-1">
                {t('videoSection.titleLine2', '1초 펌프 급여 후 3일 만의 회복 기록')}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed break-keep">
              {t(
                'videoSection.subtitle',
                '연출이나 CG가 아닌 실제 동물병원 진료실 기록입니다. 주사기 없이 입가에 1초 톡 짜주자 스스로 핥아먹고 하루 만에 자력 기립·3일 만에 밥그릇을 비웠습니다.'
              )}
            </p>

            <ul className="space-y-2.5 text-start max-w-lg mx-auto md:mx-0">
              <li className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center text-sm font-black shrink-0" aria-hidden="true">
                  1
                </span>
                <span className="text-sm sm:text-[15px] font-bold text-slate-900 break-keep">
                  {t('videoSection.point1', 'DAY 1: 주사기 없이 1초 펌프 급여 — 아픈 아이도 스스로 핥아먹는 기호성')}
                </span>
              </li>
              <li className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center text-sm font-black shrink-0" aria-hidden="true">
                  2
                </span>
                <span className="text-sm sm:text-[15px] font-bold text-slate-900 break-keep">
                  {t('videoSection.point2', 'DAY 2: 체내 흡수 0% 나노 보호막으로 위장 진정 · 네 발 자력 기립')}
                </span>
              </li>
              <li className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center text-sm font-black shrink-0" aria-hidden="true">
                  3
                </span>
                <span className="text-sm sm:text-[15px] font-bold text-slate-900 break-keep">
                  {t('videoSection.point3', 'DAY 3: 식욕 전폐였던 아이가 스스로 사료 그릇 완식 (개체별 상이)')}
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
                  data-product-id="parvogel-100ml"
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
                  data-product-id="parvogel-100ml"
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
                  data-product-id="parvogel-100ml"
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
