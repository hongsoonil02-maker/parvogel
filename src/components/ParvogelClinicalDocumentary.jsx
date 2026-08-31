import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function ParvogelClinicalDocumentary() {
  const { t } = useTranslation();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedVideoId, setSelectedVideoId] = useState('pv1');
  const [isDocuModalOpen, setIsDocuModalOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const videoRef = useRef(null);

  const docuVideoUrl = `${import.meta.env.BASE_URL}assets/parvogel_clinical_documentary_v2.mp4?v=20260828`;
  const shortVideoUrl = `${import.meta.env.BASE_URL}assets/${encodeURIComponent('Video Project 6_final.mp4')}`;
  const shortThumbUrl = `${import.meta.env.BASE_URL}assets/short_story_thumb.jpg`;
  const [isShortModalOpen, setIsShortModalOpen] = useState(false);

  const handleCopyDocuLink = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const url = 'https://parvogel.kr/assets/parvogel_clinical_documentary_v2.mp4';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      });
    } else {
      alert('동영상 링크: ' + url);
    }
  };

  // 모달 키보드 ESC 닫기 접근성 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDocuModalOpen) {
        setIsDocuModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDocuModalOpen]);

  // 모달 활성화 시 배경 스크롤 락
  useEffect(() => {
    if (isDocuModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isDocuModalOpen]);

  // 다국어 자동 변환 지원 임상 단계 데이터
  const steps = useMemo(() => [
    {
      id: 'step1',
      stepNum: t('doc.step1_num', 'STEP 01'),
      period: t('doc.step1_period', 'Day 1 ~ Day 2'),
      title: t('doc.step1_title', '응급 내원, 전신 발작 및 입원 집중 케어'),
      desc: t('doc.step1_desc', '급성 장염과 장독소 쇼크로 쓰러진 55일령 환축에게 스트레스 없이 입원 집중 안정화 진행')
    },
    {
      id: 'step2',
      stepNum: t('doc.step2_num', 'STEP 02'),
      period: t('doc.step2_period', 'Day 2 ~ Day 4'),
      title: t('doc.step2_title', '신경계 정상화, 자가 기립 및 캔사료 폭풍 완식'),
      desc: t('doc.step2_desc', '경련이 완전히 멈추고 네 발로 서서 반응하며, 곡기를 끊었던 환축이 그릇까지 핥아먹는 기적의 식욕 폭발')
    },
    {
      id: 'step3',
      stepNum: t('doc.step3_num', 'STEP 03'),
      period: t('doc.step3_period', 'Day 6 ~ Day 7'),
      title: t('doc.step3_title', '네 발 기립 보행 및 감동의 최종 완치 퇴원'),
      desc: t('doc.step3_desc', '보행 및 전신 자세 반사가 완벽히 정상화되어 네 발로 당당히 서서 꼬리 치며 감동의 퇴원')
    }
  ], [t]);

  // 다국어 자동 변환 지원 6대 직캠 데이터 (대표님 편집본 4-1, 6-1 연동)
  const videos = useMemo(() => [
    {
      id: 'pv1',
      file: 'parvogel_case_01_seizure.mp4',
      thumb: 'case_01.jpg',
      duration: '9.0초',
      stepId: 'step1',
      stepNum: t('doc.step1_num', 'STEP 01'),
      dayOrder: 1,
      phase: 'Day 1',
      badge: t('doc.v1_badge', '🚨 초진 응급 발작 순간'),
      badgeColor: 'bg-red-600 text-white',
      title: t('doc.v1_title', '내원 당시 전신 발작(Seizure) 증상'),
      desc: t('doc.v1_desc', '55일령 초소형 환축이 옆으로 쓰러져 경련하는 위급 순간. 장 점막 붕괴와 내독소 쇼크 위기 관찰.')
    },
    {
      id: 'pv2',
      file: 'parvogel_case_02_lethargy.mp4',
      thumb: 'case_02.jpg',
      duration: '7.5초',
      stepId: 'step1',
      stepNum: t('doc.step1_num', 'STEP 01'),
      dayOrder: 2,
      phase: 'Day 2',
      badge: t('doc.v2_badge', '⚠️ 케이지 집중 케어 & 무기력 안정'),
      badgeColor: 'bg-amber-600 text-white',
      title: t('doc.v2_title', '케이지 안 급성기 탈진 & 안정화'),
      desc: t('doc.v2_desc', '파보겔 집중 처치 후 입원장 안에서 체온을 유지하며 무기력 상태에서 점차 의식을 회복해가는 집중 안정화.')
    },
    {
      id: 'pv3',
      file: 'parvogel_case_03_standing.mp4',
      thumb: 'case_03.jpg',
      duration: '8.0초',
      stepId: 'step2',
      stepNum: t('doc.step2_num', 'STEP 02'),
      dayOrder: 3,
      phase: 'Day 2~3',
      badge: t('doc.v3_badge', '🌱 케이지 안 첫 자가 기립 & 활력'),
      badgeColor: 'bg-cyan-600 text-white',
      title: t('doc.v3_title', '스스로 네 발로 일어서는 첫 기립 반응'),
      desc: t('doc.v3_desc', '장 점막이 코팅되고 흡수되면서 탈진을 딛고 스스로 네 발로 일어나 케이지 철창을 짚고 반응하는 놀라운 활력 회복!')
    },
    {
      id: 'pv4',
      file: '김동준원장_동영상 4-1.mp4',
      thumb: 'case_04.jpg',
      duration: '8.8초',
      stepId: 'step2',
      stepNum: t('doc.step2_num', 'STEP 02'),
      dayOrder: 4,
      phase: 'Day 3',
      badge: t('doc.v4_badge', '✨ 투약 후 신경계 안정 & 반응'),
      badgeColor: 'bg-indigo-600 text-white',
      title: t('doc.v4_title', '투약 후 신경계 안정 및 진료대 반응'),
      desc: t('doc.v4_desc', '경련이 완전히 멈추고 네 발로 체중을 지탱하며 원장님의 촉진에 기민하게 반응하는 안정기 도달.')
    },
    {
      id: 'pv5',
      file: 'parvogel_case_05_eating.mp4',
      thumb: 'case_05.jpg',
      duration: '7.3초',
      stepId: 'step2',
      stepNum: t('doc.step2_num', 'STEP 02'),
      dayOrder: 5,
      phase: 'Day 4',
      badge: t('doc.v5_badge', '🔥 기적의 폭풍 완식 먹방'),
      badgeColor: 'bg-rose-600 text-white',
      title: t('doc.v5_title', '식욕 전폐 환축의 캔사료 폭풍 완식 먹방'),
      desc: t('doc.v5_desc', '곡기를 끊었던 환축이 밥그릇에 머리를 박고 싹싹 핥아먹는 기적의 식욕 폭발! 장내 환경 정상화 입증.')
    },
    {
      id: 'pv6',
      file: '김동준원장_동영상 6-1.mp4',
      thumb: 'case_06.jpg',
      duration: '18.7초',
      stepId: 'step3',
      stepNum: t('doc.step3_num', 'STEP 03'),
      dayOrder: 6,
      phase: 'Day 6~7',
      badge: t('doc.v6_badge', '✨ 네 발 기립 & 완치 퇴원'),
      badgeColor: 'bg-emerald-600 text-white',
      title: t('doc.v6_title', '입원장 회복부터 진료대 보행까지 완치'),
      desc: t('doc.v6_desc', '입원장에서 똘망똘망한 눈빛으로 회복한 후, 진료대 위에서 네 발로 씩씩하게 걸으며 완벽 퇴원 판정.')
    }
  ], [t]);

  const currentStep = steps[activeStepIndex] || steps[0];
  const selectedVideo = videos.find(v => v.id === selectedVideoId) || videos[0];

  const handleSelectStep = (index) => {
    setActiveStepIndex(index);
    const targetStep = steps[index];
    const firstVid = videos.find(v => v.stepId === targetStep.id) || videos[0];
    setSelectedVideoId(firstVid.id);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSelectVideo = (video) => {
    setSelectedVideoId(video.id);
    const stepIndex = steps.findIndex(s => s.id === video.stepId);
    if (stepIndex !== -1) {
      setActiveStepIndex(stepIndex);
    }
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section 
      id="parvogel-clinical-doc" 
      aria-labelledby="parvogel-doc-heading"
      className="py-14 sm:py-22 bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 text-slate-800 relative overflow-hidden border-y border-slate-200/80"
    >
      {/* 배경 은은한 글로우 조명 */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-400/10 blur-[130px] pointer-events-none rounded-full" 
        aria-hidden="true" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 헤더 섹션 */}
        <header className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-xs sm:text-sm font-black mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping motion-reduce:hidden" aria-hidden="true" />
            <span>{t('doc.badge', '📹 파보 장염·급성 설사 7일간의 리얼 임상 다큐멘터리')}</span>
          </div>
          
          {/* 타이틀: 2번째 줄에 '기적의 7일 회복 실화'를 명확하게 단독 배치하여 줄바꿈 완성도 극대화 */}
          <h2 id="parvogel-doc-heading" className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            <span className="block break-keep">
              {t('doc.title_line1', '쓰러진 55일령 강아지의')}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-600 break-keep mt-1 sm:mt-2">
              {t('doc.title_line2', '기적의 7일 회복 실화')}
            </span>
          </h2>
          
          <p className="text-xs sm:text-base text-slate-600 font-medium break-keep leading-relaxed max-w-2xl mx-auto px-2">
            {t('doc.subtitle', '극심한 장염과 발작으로 위기에 처했던 아기 푸들이 주사기 없이 원터치 펌프로 급여 후 네 발로 일어서기까지의 7일간 무편집 직캠 기록입니다.')}
          </p>

          {/* 환축 스펙 & 프로필 바 (화이트 카드 톤앤매너 일치) */}
          <div 
            className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-white/95 p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-md backdrop-blur-md text-start text-slate-800"
            aria-label={t('doc.spec_title', '환축 스펙')}
          >
            <div className="border-e border-slate-200 pe-2.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block">{t('doc.spec_title', '환축 스펙')}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 break-keep">{t('doc.spec_val', '토이푸들 ♂ (55일령, 0.6kg)')}</span>
            </div>
            <div className="border-e border-slate-200 pe-2.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block">{t('doc.symptom_title', '내원시 증상')}</span>
              <span className="text-xs sm:text-sm font-bold text-rose-600 break-keep">{t('doc.symptom_val', '급성 전신 발작·식욕 전폐')}</span>
            </div>
            <div className="border-e border-slate-200 pe-2.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block">{t('doc.admin_title', '급여 방식')}</span>
              <span className="text-xs sm:text-sm font-bold text-blue-700 break-keep">{t('doc.admin_val', '원터치 펌프 1초 직투여')}</span>
            </div>
            <div className="ps-1 sm:ps-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block">{t('doc.prognosis_title', '최종 예후')}</span>
              <span className="text-xs sm:text-sm font-black text-amber-700 break-keep">{t('doc.prognosis_val', '7일 만에 기립 완치 퇴원!')}</span>
            </div>
          </div>
        </header>

        {/* 🎬 2분 55초 풀 다큐멘터리 프리미엄 시청 배너 (사용자 요청: 직캠 파란색 박스 배경색만 약간 짙은 프리미엄 로열 딥블루로 적용) */}
        <div className="max-w-5xl mx-auto mb-10 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#11224d] via-[#1a3473] to-[#11224d] border border-blue-400/40 shadow-2xl shadow-blue-950/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 text-white backdrop-blur-xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          
          <div className="text-start space-y-2 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                {t('doc.docuModalBadge', '🎬 2분 55초 풀 다큐멘터리')}
              </span>
              <span className="text-xs text-cyan-200 font-bold">
                {t('doc.docuSpec', '1080p 세로 직캠 + AI 성우 내레이션')}
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-snug break-keep">
              {t('doc.docuBannerTitle', '55일령 발작 환축의 7일간의 기적 (전편 통합본)')}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl break-keep">
              {t('doc.docuBannerDesc', '응급 내원부터 1차 펌프 투약, 신경 반사 회복, 캔사료 폭풍 완식 먹방, 그리고 최종 완치 퇴원까지 8편의 직캠과 김동준 원장의 실제 자필 차트를 2분 55초의 감동적인 다큐멘터리로 감상하고 원클릭으로 바로 공유해 보세요.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0 z-10">
            <button
              onClick={() => setIsDocuModalOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              aria-label={t('doc.docuWatchBtn', '다큐 영상 전체 시청 (2분 55초)')}
            >
              <span className="text-lg" aria-hidden="true">▶</span>
              <span>{t('doc.docuWatchBtn', '다큐 영상 전체 시청 (2분 55초)')}</span>
            </button>
            <button
              onClick={handleCopyDocuLink}
              className="px-4 py-3.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              aria-label={t('doc.docuCopyBtnMobile', '공유 링크 복사')}
            >
              <span>{copySuccess ? t('doc.docuCopied', '✅ 링크 복사완료!') : t('doc.docuCopyBtnMobile', '🔗 공유 링크 복사')}</span>
            </button>
          </div>
        </div>

        {/* 🎬 숏폼 스토리 배너 */}
        <div className="max-w-5xl mx-auto mb-10 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 shadow-2xl shadow-slate-900/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 text-white backdrop-blur-xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="text-start space-y-2 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 text-slate-950 shadow-md">
                {t('doc.shortModalBadge', '🎬 1분 숏폼 스토리')}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                {t('doc.shortSpec', '케이스 영상 하이라이트 · 반응형 숏폼')}
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-snug break-keep">
              {t('doc.shortBannerTitle', '증상에서 회복까지, 1분으로 보는 파보겔 스토리')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl break-keep">
              {t('doc.shortBannerDesc', '발작·무기력·식욕 회복·기립까지, 실제 임상 케이스 영상으로 엮은 1분 숏폼입니다. 하단 버튼을 누르면 바로 시청할 수 있습니다.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0 z-10">
            <button
              onClick={() => setIsShortModalOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label={t('doc.shortWatchBtn', '숏폼 영상 시청 (약 1분)')}
            >
              <span className="text-lg" aria-hidden="true">▶</span>
              <span>{t('doc.shortWatchBtn', '숏폼 영상 시청 (약 1분)')}</span>
            </button>
          </div>
        </div>

        {/* 3단계 스텝퍼 탭 (밝은 메디컬 테마) */}
        <nav 
          role="tablist" 
          aria-label={t('doc.nav_aria', '치료 경과 단계 네비게이션')} 
          className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 max-w-4xl mx-auto mb-8 sm:mb-12"
        >
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.id}
                role="tab"
                id={`step-tab-${step.id}`}
                aria-selected={isActive}
                aria-controls={`step-panel-${step.id}`}
                onClick={() => handleSelectStep(idx)}
                className={`flex-1 text-start p-3.5 sm:p-4 rounded-2xl border min-h-[48px] transition-all duration-300 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'bg-blue-50/90 border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {step.stepNum}
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                    {step.period}
                  </span>
                </div>
                <h3 className={`text-xs sm:text-base font-bold line-clamp-1 ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                  {step.title}
                </h3>
              </button>
            );
          })}
        </nav>

        {/* 메인 듀얼 스크린 (화이트 카드 룩으로 위아래 섹션과 자연스럽게 연결) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-12 sm:mb-16 items-stretch">
          
          {/* 좌측 카드 (5 cols) */}
          <article 
            id={`step-panel-${currentStep.id}`}
            role="tabpanel"
            aria-labelledby={`step-tab-${currentStep.id}`}
            className="lg:col-span-5 flex flex-col bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-blue-700 font-mono">{currentStep.stepNum} · {currentStep.period}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 mb-3 break-keep">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 break-keep">
                {currentStep.desc}
              </p>

              {/* 법적 리스크 사전 차단 및 신뢰 극대화 배너 */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 mb-5 shadow-sm">
                <img 
                  src={`${import.meta.env.BASE_URL}assets/parvogel-authentic.png`} 
                  alt={t('doc.product_name', '파보겔 Parvo Gel 제품 실사')} 
                  className="w-12 h-20 object-contain drop-shadow-md shrink-0"
                  loading="lazy"
                />
                <div className="text-start">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {t('doc.reg_badge', '✓ 정식등록')}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-mono tracking-tight">
                      {t('doc.dnj_badge', '1-deoxinojirimycin')}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono tracking-tight">
                      {t('doc.patent_badge', 'Patent No. 2011B0042620.8')}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">
                    {t('doc.product_name', '파보겔 (Parvo Gel)')}
                  </span>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug mt-0.5">
                    {t('doc.product_desc', '정식등록 보조사료 · 1-deoxinojirimycin 과 Patent No. 특허균주 복합제')}
                  </p>
                </div>
              </div>

              {/* 핵심 특징 3포인트 */}
              <div className="space-y-2.5 mb-6 text-xs text-slate-700">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-blue-600 font-bold shrink-0">✓</span>
                  <span>{t('doc.point1', '원터치 펌프로 주사기 없이 1초 급여 (스트레스 제로)')}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-blue-600 font-bold shrink-0">✓</span>
                  <span>{t('doc.point2', '장 점막 물리적 보호막 코팅 + 바이러스 흡착 배출')}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-blue-600 font-bold shrink-0">✓</span>
                  <span>{t('doc.point3', '곡기 끊었던 환축의 식욕 3일 만에 폭풍 부활')}</span>
                </div>
              </div>
            </div>

            {/* 구매 전환 CTA 버튼들 */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <a
                href="https://smartstore.naver.com/petschury/products/13718496355"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('doc.smartstore_btn', '네이버 스마트스토어 즉시 구매 (새 창 열림)')}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>{t('doc.smartstore_btn', '🟢 네이버 스마트스토어(펫츄리) 즉시 구매')}</span>
                <span aria-hidden="true">➔</span>
              </a>
              <a
                href="https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('doc.coupang_btn', '쿠팡 로켓배송 즉시 구매 (새 창 열림)')}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <span>{t('doc.coupang_btn', '🚀 쿠팡 로켓배송 즉시 구매')}</span>
                <span aria-hidden="true">➔</span>
              </a>
            </div>
          </article>

          {/* 우측: 스마트폰 세로형 9:16 플레이어 (7 cols) */}
          <article 
            className="lg:col-span-7 flex flex-col bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xl"
            aria-label={t('doc.video_badge', '진료실 무편집 직캠 비디오')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900">{t('doc.video_badge', '진료실 무편집 직캠 비디오')}</h4>
              </div>
              <span className="text-xs text-blue-700 font-mono font-bold">
                {selectedVideo.stepNum} · {selectedVideo.phase}
              </span>
            </div>

            {/* 비디오 9:16 스마트폰 프레임 뷰어 (환한 배경 및 세련된 스마트폰 베젤) */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/80 via-slate-100/90 to-slate-100 border border-slate-200 p-3 sm:p-6 flex items-center justify-center shadow-inner">
              <div className="w-full max-w-[260px] sm:max-w-[290px] aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border-4 border-white shadow-2xl ring-1 ring-slate-200 relative">
                <video
                  ref={videoRef}
                  key={selectedVideo.file}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`${selectedVideo.stepNum} ${selectedVideo.title}`}
                  className="w-full h-full object-cover"
                >
                  <source src={`${import.meta.env.BASE_URL}assets/${encodeURI(selectedVideo.file)}`} type="video/mp4" />
                  {t('doc.video_tag_unsupported', '귀하의 브라우저는 비디오 태그를 지원하지 않습니다.')}
                </video>
              </div>
            </div>

            {/* 비디오 설명 */}
            <div className="mt-4 pt-4 border-t border-slate-200 text-start" aria-live="polite">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                  {selectedVideo.stepNum} · {selectedVideo.phase}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedVideo.badgeColor}`}>
                  {selectedVideo.badge}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {t('doc.video_length', '길이')}: {selectedVideo.duration}
                </span>
              </div>
              <h5 className="text-sm sm:text-base font-bold text-slate-900">{selectedVideo.title}</h5>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedVideo.desc}</p>
            </div>
          </article>
        </div>

        {/* 하단 6대 영상 아카이브 그리드 (화이트/라이트 메디컬 룩) */}
        <section aria-labelledby="parvo-archive-heading" className="mt-8 sm:mt-12">
          <div className="text-start mb-6">
            <h3 id="parvo-archive-heading" className="text-lg sm:text-2xl font-extrabold text-slate-900 break-keep">
              {t('doc.archive_heading', '📹 7일간의 임상 치료 순서별 6대 직캠 아카이브')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 break-keep">
              {t('doc.archive_subheading', '치료 일자별(Day 1 ~ Day 7) 순서대로 정렬된 리얼 진료실 영상입니다. 카드를 클릭하면 상단 플레이어와 STEP이 자동 동기화됩니다.')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {videos.map((vid, idx) => {
              const isSelected = selectedVideo.id === vid.id;
              const isCurrentStep = currentStep.id === vid.stepId;
              return (
                <div
                  key={vid.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectVideo(vid); } }}
                  onClick={() => handleSelectVideo(vid)}
                  aria-label={`${vid.stepNum} ${vid.phase} ${vid.title} ${t('doc.select_video_aria', '영상 선택')}`}
                  className={`group relative rounded-2xl p-2.5 sm:p-3 border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/30 shadow-md'
                      : isCurrentStep
                      ? 'bg-white border-blue-300 hover:border-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm opacity-90 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isCurrentStep ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono text-blue-700 font-bold">
                        {vid.phase}
                      </span>
                    </div>

                    {/* 썸네일 */}
                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black mb-2.5 border border-slate-200 shadow">
                      <img
                        src={`${import.meta.env.BASE_URL}assets/clinical_thumbs/${vid.thumb}`}
                        alt={vid.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-1.5">
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-black/70 text-white font-mono">
                          {vid.duration}
                        </span>
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-blue-600 text-white'
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected ? '■' : '▶'}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1 break-keep">
                      {vid.title}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mt-1 break-keep">
                    {vid.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* 전편 전체화면 모달 (모바일 최적화 & 장애인 전체 자막/대본 포함) */}
      {isDocuModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={t('doc.docuModalTitle', '55일령 발작 환축의 7일간의 기적 다큐멘터리')}
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4"
          onClick={() => setIsDocuModalOpen(false)}
        >
          <div 
            className="relative max-w-sm sm:max-w-md w-[94vw] sm:w-full bg-slate-900/95 rounded-3xl p-3.5 sm:p-5 pb-5 sm:pb-6 border border-blue-500/40 flex flex-col shadow-2xl max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2.5 sm:mb-3 border-b border-white/10 pb-2.5 sm:pb-3 text-start">
              <div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 me-2 inline-block">
                  {t('doc.docuModalBadge', '🎬 2분 55초 풀 다큐멘터리')}
                </span>
                <h4 className="text-xs sm:text-base font-bold text-white block mt-1 line-clamp-1">
                  {t('doc.docuModalTitle', '55일령 발작 환축의 7일간의 기적')}
                </h4>
              </div>
              <button
                onClick={() => setIsDocuModalOpen(false)}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-base shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
                aria-label={t('common.close', '닫기')}
              >
                ✕
              </button>
            </div>
            
            {/* 스마트폰 9:16 세로 핏 비디오 컨테이너 */}
            <div className="w-full max-w-[270px] sm:max-w-[310px] max-h-[48vh] sm:max-h-[54vh] mx-auto aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-blue-500/30 flex items-center justify-center relative">
              <video
                key="parvogel-docu-video-v2"
                controls
                autoPlay
                playsInline
                aria-label={t('doc.docuModalTitle', '김동준 원장 55일령 발작 환축 7일간의 기적 다큐멘터리')}
                className="w-full h-full object-cover"
              >
                <source src={docuVideoUrl} type="video/mp4" />
                브라우저가 비디오를 지원하지 않습니다.
              </video>
            </div>

            {/* 장애인 접근성: 전체 대본/자막 전문 보기 아코디언 */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
                className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-bold rounded-xl border border-blue-500/20 transition-all flex items-center justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-expanded={isTranscriptOpen}
              >
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true">📄</span>
                  <span>{t('doc.docuTranscriptBtn', '다큐멘터리 전체 자막/대본 전문 보기')}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {isTranscriptOpen ? t('doc.docuTranscriptHide', '▲ 닫기') : t('doc.docuTranscriptShow', '▼ 전문 펼치기')}
                </span>
              </button>

              {isTranscriptOpen && (
                <div 
                  tabIndex={0} 
                  role="region" 
                  aria-label="다큐멘터리 전체 대본 텍스트"
                  className="mt-2 p-3 bg-slate-950/85 rounded-xl border border-white/10 text-[11px] sm:text-xs text-slate-300 space-y-2 max-h-40 overflow-y-auto leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <p className="border-b border-white/10 pb-1 text-cyan-400 font-bold">
                    [프롤로그 0:00~0:13] 하남 사랑동물병원 김동준 원장의 실제 임상 치료 일지. 생후 55일 된 환축의 7일간의 기적 같은 파보겔 회복 다큐멘터리입니다.
                  </p>
                  <p className="border-b border-white/10 pb-1">
                    <strong className="text-rose-300">[STEP 1 응급 내원 0:13~0:27]</strong> 2026년 7월 28일 새벽, 어린 푸들 믹스견이 스스로 서지 못하고 온몸을 떨며 응급 내원했습니다. 안락사까지 거론되던 위급한 순간이었습니다.
                  </p>
                  <p className="border-b border-white/10 pb-1">
                    <strong className="text-amber-300">[STEP 1 초진 진단 0:27~0:52]</strong> 파보와 코로나 키트 검사는 음성. 김동준 원장은 원인불명의 급성 장독소증으로 인한 소화기 탈태와 신경 발작으로 진단했습니다.
                  </p>
                  <p className="border-b border-white/10 pb-1">
                    <strong className="text-cyan-300">[STEP 1 파보겔 긴급 투약 0:52~1:07]</strong> 내원 즉시 파보겔 1차 펌프를 긴급 투약했습니다. 1-데옥시노지리마이신과 특허균주 복합체가 장 점막을 코팅하고 장내 독소를 즉시 흡착 배출하며 치료가 시작됩니다.
                  </p>
                  <p className="border-b border-white/10 pb-1">
                    <strong className="text-emerald-300">[자필 차트 기록 1:07~1:18]</strong> 투약 몇 시간 만에 심한 경련이 진정되었고, 다음 날 저녁에는 종합백신 접종이 가능할 정도로 활력이 급호전되었습니다.
                  </p>
                  <p className="border-b border-white/10 pb-1">
                    <strong className="text-cyan-300">[STEP 2 기립 반사 회복 1:18~1:42]</strong> 입원 3일 차. 환축은 네 발로 꼿꼿이 일어서며, 비틀거리던 자세 반사와 보행 능력을 완전히 회복했습니다.
                  </p>
                  <p className="border-b border-white/10 pb-1">
                    <strong className="text-cyan-300">[STEP 2 생기 의식 회복 1:42~2:10]</strong> 입원실 안에서 안정을 취하며 장 점막을 회복 중인 환축. 흐려졌던 눈빛은 생기를 되찾고 고개를 꼿꼿이 들어 정면을 응시합니다.
                  </p>
                  <p className="border-b border-white/10 pb-1">
                    <strong className="text-amber-300">[STEP 2 기적의 식욕 먹방 2:10~2:23]</strong> 식욕을 완전히 잃었던 환축이 밥그릇에 머리를 묻고 캔사료를 폭풍 흡입합니다! 간 기능과 소화기가 완벽히 정상 궤도에 올랐음을 보여줍니다.
                  </p>
                  <p className="border-b border-white/10 pb-1">
                    <strong className="text-emerald-300">[STEP 3 완치 퇴원 2:23~2:46]</strong> 입원 7일 차. 파보겔 복합 처방으로 장 점막을 완벽히 복구하고, 환축은 기적처럼 건강을 회복하고 최종 완치 퇴원했습니다.
                  </p>
                  <p>
                    <strong className="text-slate-400">[에필로그 2:46~2:55]</strong> 원인불명의 급성 장염과 소화기 탈태의 1초 해답. 수의사와 보호자 모두가 신뢰하는 긴급 처방 솔루션, 파보겔입니다.
                  </p>
                </div>
              )}
            </div>

            {/* 원클릭 모바일 공유 & 다운로드 버튼군 */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={handleCopyDocuLink}
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-950/60"
              >
                <span>{copySuccess ? t('doc.docuCopied', '✅ 영상 링크 복사완료!') : t('doc.docuCopyBtnMobile', '🔗 카톡/모바일 공유 링크 복사')}</span>
              </button>
              <a
                href={docuVideoUrl}
                download="파보겔_55일령발작환축_7일임상다큐_v2.mp4"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shrink-0"
              >
                <span>⬇ {t('doc.docuDownload', '영상 다운로드')}</span>
              </a>
            </div>
          </div>
        </div>
      )}
      {/* 숏폼 스토리 영상 모달 */}
      {isShortModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('doc.shortModalTitle', '파보겔 임상 케이스 스토리 숏폼')}
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4"
          onClick={() => setIsShortModalOpen(false)}
        >
          <div
            className="relative max-w-sm sm:max-w-md w-[94vw] sm:w-full bg-slate-900/95 rounded-3xl p-3.5 sm:p-5 pb-5 sm:pb-6 border border-blue-500/40 flex flex-col shadow-2xl max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2.5 sm:mb-3 border-b border-white/10 pb-2.5 sm:pb-3 text-start">
              <div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 me-2 inline-block">
                  {t('doc.shortModalBadge', '🎬 1분 숏폼 스토리')}
                </span>
                <h4 className="text-xs sm:text-base font-bold text-white block mt-1 line-clamp-1">
                  {t('doc.shortModalTitle', '파보겔 임상 케이스 스토리')}
                </h4>
              </div>
              <button
                onClick={() => setIsShortModalOpen(false)}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-base shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
                aria-label={t('common.close', '닫기')}
              >
                ✕
              </button>
            </div>

            <div className="w-full max-w-[270px] sm:max-w-[310px] max-h-[48vh] sm:max-h-[54vh] mx-auto aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-blue-500/30 flex items-center justify-center relative">
              <video
                key="parvogel-short-video"
                controls
                autoPlay
                playsInline
                aria-label={t('doc.shortModalTitle', '파보겔 임상 케이스 스토리 숏폼')}
                className="w-full h-full object-cover"
              >
                <source src={shortVideoUrl} type="video/mp4" />
                브라우저가 비디오를 지원하지 않습니다.
              </video>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <a
                href={shortVideoUrl}
                download="파보겔_임상케이스_스토리_숏폼.mp4"
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-950/60"
              >
                <span>⬇ {t('doc.shortDownload', '숏폼 다운로드')}</span>
              </a>
              <button
                onClick={() => setIsShortModalOpen(false)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shrink-0"
              >
                {t('common.close', '닫기')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
