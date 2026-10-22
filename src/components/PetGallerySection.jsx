import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function PetGallerySection() {
  const { t } = useTranslation();
  const [activeModalIdx, setActiveModalIdx] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollContainerRef = useRef(null);

  const galleryItems = [
    {
      id: 'daebak-1',
      name: '대박이',
      breed: '골든 리트리버',
      badge: '함께하는 일상',
      desc: '파보겔과 함께하는 든든하고 건강한 일상',
      webp: `${import.meta.env.BASE_URL}images/gallery/gallery_daebak_1.webp`,
      jpg: `${import.meta.env.BASE_URL}images/gallery/gallery_daebak_1.jpg`,
      alt: '파보겔 200ml 제품과 함께 촬영한 반려견 대박이(골든 리트리버)의 건강한 일상'
    },
    {
      id: 'daebak-2',
      name: '대박이',
      breed: '골든 리트리버',
      badge: '소중한 순간',
      desc: '언제나 활력 넘치고 해맑은 우리 집 활력소',
      webp: `${import.meta.env.BASE_URL}images/gallery/gallery_daebak_2.webp`,
      jpg: `${import.meta.env.BASE_URL}images/gallery/gallery_daebak_2.jpg`,
      alt: '파보겔 제품과 함께 활짝 웃고 있는 반려견 대박이의 활력 넘치는 모습'
    },
    {
      id: 'cookie-1',
      name: '쿠키',
      breed: '반려견 일상',
      badge: '편안한 하루',
      desc: '소중한 우리 아이의 편안한 속을 위한 든든한 상비 보조제',
      webp: `${import.meta.env.BASE_URL}images/gallery/gallery_cookie_1.webp`,
      jpg: `${import.meta.env.BASE_URL}images/gallery/gallery_cookie_1.jpg`,
      alt: '파보겔 제품과 함께 편안하게 휴식하는 반려견 쿠키의 일상 포토'
    }
  ];

  // 모달 키보드 조작 (ESC로 닫기, 좌우 화살표로 이전/다음 사진)
  useEffect(() => {
    if (activeModalIdx === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalIdx(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveModalIdx((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveModalIdx((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeModalIdx, galleryItems.length]);

  // 모바일 스크롤 인덱스 추적
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      setActiveSlide(idx);
    }
  };

  const scrollToSlide = (idx) => {
    if (!scrollContainerRef.current) return;
    const clientWidth = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: idx * clientWidth,
      behavior: 'smooth'
    });
    setActiveSlide(idx);
  };

  return (
    <section
      id="pet-gallery"
      aria-label="우리 아이들과 함께하는 파보겔 반려견 포토 갤러리"
      className="py-12 sm:py-16 bg-gradient-to-b from-white via-slate-50/70 to-white relative overflow-hidden"
    >
      {/* 장식용 은은한 배경 블러 */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        {/* 섹션 헤더 */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-primary-50 text-primary-900 border border-primary-200 shadow-xs mb-3">
            <span className="text-base" role="img" aria-label="dog">🐶</span>
            <span>REAL PET LIFE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug break-keep">
            우리 아이들과 함께하는 파보겔
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed break-keep max-w-2xl mx-auto">
            사랑스러운 반려동물과 함께하는 일상 속 파보겔. 우리 아이들과 함께한 특별한 순간을 만나보세요.
          </p>
        </div>

        {/* 갤러리 컨테이너 (PC: 3열 Grid / 모바일: 가로 슬라이더) */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-3 gap-5 sm:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex-none w-[82vw] sm:w-[60vw] md:w-auto snap-center group"
              >
                <div
                  onClick={() => setActiveModalIdx(idx)}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl hover:border-primary-400 transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveModalIdx(idx); } }}
                  aria-label={`${item.name} 사진 확대 보기`}
                >
                  {/* 이미지 영역 */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                    <picture>
                      <source srcSet={item.webp} type="image/webp" />
                      <img
                        src={item.jpg}
                        alt={item.alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </picture>

                    {/* 확대 유도 오버레이 힌트 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-md backdrop-blur-xs">
                        <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                        클릭하여 크게 보기
                      </span>
                    </div>

                    {/* 배지 */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-primary-900 shadow-xs backdrop-blur-xs border border-white/50">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* 캡션 카드 */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow bg-white">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          {item.name}
                        </h3>
                        <span className="text-[11px] sm:text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.breed}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-keep mt-1">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-primary-700 font-semibold">
                      <span>파보겔 일상 갤러리</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">자세히 보기 →</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 모바일 인디케이터 점 및 좌우 넘김 버튼 */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-4">
            {galleryItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToSlide(idx)}
                aria-label={`${idx + 1}번째 사진으로 이동`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? 'w-6 bg-primary-600' : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 라이트박스 확대 모달 (Lightbox Modal) */}
      {activeModalIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setActiveModalIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label="사진 확대 보기"
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setActiveModalIdx(null)}
              className="absolute -top-11 right-0 sm:right-2 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-20 flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
              aria-label="닫기 (ESC)"
            >
              <span>닫기</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 좌우 이동 버튼 */}
            <button
              onClick={() => setActiveModalIdx((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1))}
              className="absolute left-1 sm:-left-12 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-xl backdrop-blur-xs transition-all z-20"
              aria-label="이전 사진"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setActiveModalIdx((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0))}
              className="absolute right-1 sm:-right-12 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-xl backdrop-blur-xs transition-all z-20"
              aria-label="다음 사진"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 모달 이미지 프레임 */}
            <div className="w-full flex items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-black/40 border border-white/10 max-h-[75vh]">
              <picture>
                <source srcSet={galleryItems[activeModalIdx].webp} type="image/webp" />
                <img
                  src={galleryItems[activeModalIdx].jpg}
                  alt={galleryItems[activeModalIdx].alt}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />
              </picture>
            </div>

            {/* 모달 하단 캡션 */}
            <div className="w-full mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md text-slate-900 shadow-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg">{galleryItems[activeModalIdx].name}</span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    {galleryItems[activeModalIdx].breed}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  {galleryItems[activeModalIdx].desc}
                </p>
              </div>
              <div className="text-xs font-bold text-primary-700 self-end sm:self-center">
                {activeModalIdx + 1} / {galleryItems.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
