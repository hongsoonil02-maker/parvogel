import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// 파보겔 전용 임상 증례 데이터 (일자별 치료 순서 엄격 동기화)
const PARVOGEL_CASE_DATA = {
  steps: [
    {
      id: 'step1',
      stepNum: 'STEP 01',
      period: 'Day 1 ~ Day 2',
      title: '응급 내원, 전신 발작 및 원터치 펌프 긴급 급여',
      desc: '급성 장염과 장독소 쇼크로 쓰러진 55일령 환축에게 스트레스 없이 원터치 펌프로 1초 급여'
    },
    {
      id: 'step2',
      stepNum: 'STEP 02',
      period: 'Day 3 ~ Day 5',
      title: '소화기 안정, 캔사료 폭풍 완식 먹방',
      desc: '장내 독소 배출과 점막 보호로 3일 만에 곡기를 끊었던 환축이 그릇까지 핥아먹는 기적의 식욕 폭발'
    },
    {
      id: 'step3',
      stepNum: 'STEP 03',
      period: 'Day 6 ~ Day 7',
      title: '네 발 기립 및 최종 완치 퇴원',
      desc: '보행 및 전신 자세 반사가 완벽히 정상화되어 네 발로 당당히 서서 꼬리 치며 감동의 퇴원'
    }
  ],

  videos: [
    {
      id: 'pv1',
      file: 'parvogel_case_01_seizure.mp4',
      thumb: 'case_01.jpg',
      duration: '9.0초',
      stepId: 'step1',
      stepNum: 'STEP 1',
      dayOrder: 1,
      phase: 'Day 1',
      badge: '🚨 초진 응급 발작 순간',
      badgeColor: 'bg-red-600 text-white',
      title: '내원 당시 전신 발작(Seizure) 증상',
      desc: '55일령 초소형 환축이 옆으로 쓰러져 경련하는 위급 순간. 장 점막 붕괴와 내독소 쇼크 위기 관찰.'
    },
    {
      id: 'pv_feed',
      file: 'parvogel_clinical_feeding.mp4',
      thumb: 'case_feeding.jpg',
      duration: '13.5초',
      stepId: 'step1',
      stepNum: 'STEP 1',
      dayOrder: 2,
      phase: 'Day 1~2',
      badge: '💡 1초 원터치 펌프 급여',
      badgeColor: 'bg-blue-600 text-white',
      title: '주사기 거부견도 1초 만에 꿀꺽 급여',
      desc: '바늘이나 가루약 스트레스 없이 원터치 펌프를 입안에 대고 1초 펌핑! 꿀꺽 삼키는 놀라운 기호성 시연.'
    },
    {
      id: 'pv2',
      file: 'parvogel_case_02_lethargy.mp4',
      thumb: 'case_02.jpg',
      duration: '15.5초',
      stepId: 'step1',
      stepNum: 'STEP 1',
      dayOrder: 3,
      phase: 'Day 2',
      badge: '⚠️ 전신 무기력 탈진',
      badgeColor: 'bg-amber-600 text-white',
      title: '케이지 안 전신 무기력(Depression) 상태',
      desc: '미동도 없이 축 늘어져 있는 소화기 허탈 상태. 펌프 급여 후 집중 케어 경과 관찰.'
    },
    {
      id: 'pv3',
      file: 'parvogel_case_03_recovery.mp4',
      thumb: 'case_03.jpg',
      duration: '27.8초',
      stepId: 'step2',
      stepNum: 'STEP 2',
      dayOrder: 4,
      phase: 'Day 3',
      badge: '🌱 신경계 안정 & 회복',
      badgeColor: 'bg-cyan-600 text-white',
      title: '투약 후 고개 들고 또렷한 눈빛 회복',
      desc: '경련이 완전히 멈추고 또렷한 눈빛으로 반응. 기초 생체 활력과 신경 반응이 정상화 단계로 진입.'
    },
    {
      id: 'pv4',
      file: 'parvogel_case_04_eating.mp4',
      thumb: 'case_04.jpg',
      duration: '7.2초',
      stepId: 'step2',
      stepNum: 'STEP 2',
      dayOrder: 5,
      phase: 'Day 4',
      badge: '🔥 기적의 폭풍 완식 먹방',
      badgeColor: 'bg-rose-600 text-white',
      title: '식욕 전폐 환축의 캔사료 폭풍 완식',
      desc: '밥그릇에 머리를 박고 싹싹 핥아먹는 기적의 식욕 폭발! 장내 환경이 정상화되며 식욕 완벽 회복.'
    },
    {
      id: 'pv5',
      file: 'parvogel_case_05_standing.mp4',
      thumb: 'case_05.jpg',
      duration: '24.2초',
      stepId: 'step3',
      stepNum: 'STEP 3',
      dayOrder: 6,
      phase: 'Day 6~7',
      badge: '✨ 네 발 기립 & 완치 퇴원',
      badgeColor: 'bg-emerald-600 text-white',
      title: '네 발로 우뚝! 감동의 기립 완치 퇴원',
      desc: '쓰러져 가망이 없다던 55일령 강아지가 네 발로 당당히 서서 꼬리 흔들며 완벽히 일어선 감동의 순간.'
    }
  ]
};

export default function ParvogelClinicalDocumentary() {
  const { t } = useTranslation();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(PARVOGEL_CASE_DATA.videos[0]);
  const videoRef = useRef(null);

  const currentStep = PARVOGEL_CASE_DATA.steps[activeStepIndex];

  const handleSelectStep = (index) => {
    setActiveStepIndex(index);
    const targetStep = PARVOGEL_CASE_DATA.steps[index];
    const firstVid = PARVOGEL_CASE_DATA.videos.find(v => v.stepId === targetStep.id) || PARVOGEL_CASE_DATA.videos[0];
    setSelectedVideo(firstVid);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    const stepIndex = PARVOGEL_CASE_DATA.steps.findIndex(s => s.id === video.stepId);
    if (stepIndex !== -1) {
      setActiveStepIndex(stepIndex);
    }
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section id="parvogel-clinical-doc" className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden border-y border-blue-500/20">
      {/* 배경 글로우 */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 헤더 */}
        <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/90 border border-blue-400/40 text-blue-300 text-xs sm:text-sm font-black mb-4 shadow-lg shadow-blue-950/50">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" aria-hidden="true" />
            📹 파보 장염·급성 설사 7일간의 리얼 임상 다큐멘터리
          </div>
          
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4 break-keep">
            쓰러진 55일령 강아지의{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-amber-300">
              기적의 7일 회복 실화
            </span>
          </h2>
          
          <p className="text-xs sm:text-base text-slate-300 font-medium break-keep leading-relaxed max-w-2xl mx-auto">
            극심한 장염과 발작으로 안락사 위기에 처했던 아기 푸들이 주사기 없이 원터치 펌프로 1초 급여 후 네 발로 일어서기까지의 6단계 무편집 직캠 기록입니다.
          </p>

          {/* 환축 프로필 바 */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-white/5 p-3.5 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-md text-start">
            <div className="border-e border-white/10 pe-2">
              <span className="text-[11px] font-bold text-slate-400 block">환축 스펙</span>
              <span className="text-xs sm:text-sm font-bold text-white">토이푸들 ♂ (55일령, 0.6kg)</span>
            </div>
            <div className="border-e border-white/10 pe-2">
              <span className="text-[11px] font-bold text-slate-400 block">내원시 증상</span>
              <span className="text-xs sm:text-sm font-bold text-rose-400">급성 전신 발작·식욕 전폐</span>
            </div>
            <div className="border-e border-white/10 pe-2">
              <span className="text-[11px] font-bold text-slate-400 block">급여 방식</span>
              <span className="text-xs sm:text-sm font-bold text-blue-400">원터치 펌프 1초 직투여</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">최종 예후</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300">7일 만에 기립 완치 퇴원!</span>
            </div>
          </div>
        </header>

        {/* 3단계 스텝퍼 탭 */}
        <nav aria-label="치료 경과 단계" className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 max-w-4xl mx-auto mb-10">
          {PARVOGEL_CASE_DATA.steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => handleSelectStep(idx)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex-1 text-start p-3.5 sm:p-4 rounded-2xl border min-h-[48px] transition-all duration-300 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-900/90 to-blue-950 border-blue-400 shadow-lg shadow-blue-950/60 ring-2 ring-blue-400/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    {step.stepNum}
                  </span>
                  <span className={`text-[11px] font-mono ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>
                    {step.period}
                  </span>
                </div>
                <h3 className={`text-xs sm:text-base font-bold line-clamp-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {step.title}
                </h3>
              </button>
            );
          })}
        </nav>

        {/* 메인 듀얼 스크린 (좌: 현재 STEP 설명 & 쇼핑몰 직결 CTA / 우: 세로형 비디오 플레이어) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-16 items-stretch">
          
          {/* 좌측 카드: 현재 스텝 요약 & 즉시 구매 배너 (5 cols) */}
          <article className="lg:col-span-5 flex flex-col bg-slate-950/90 rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl backdrop-blur-xl justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-blue-400" aria-hidden="true" />
                <span className="text-xs font-bold text-blue-400 font-mono">{currentStep.stepNum} · {currentStep.period}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white mb-3 break-keep">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 break-keep">
                {currentStep.desc}
              </p>

              {/* 핵심 특징 3포인트 */}
              <div className="space-y-2.5 mb-6 text-xs text-slate-200">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>1초 펌핑 급여:</strong> 주사기 거부견도 입가에 대고 살짝 누르면 꿀꺽!</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>장 점막 긴급 코팅:</strong> 고순도 점막 보호 성분이 유해 독소 흡착 배출</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>공식 판매처:</strong> 쿠팡 로켓배송 / 네이버 스마트스토어 익일 수령</span>
                </div>
              </div>
            </div>

            {/* 구매 전환 CTA 버튼들 */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <a
                href="https://smartstore.naver.com/petschury/products/13718496355"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>🟢 네이버 스마트스토어(펫츄리) 즉시 구매</span>
                <span>➔</span>
              </a>
              <a
                href="https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>🚀 쿠팡 로켓배송 즉시 구매</span>
                <span>➔</span>
              </a>
            </div>
          </article>

          {/* 우측: 스마트폰 세로형 9:16 플레이어 (7 cols) */}
          <article className="lg:col-span-7 flex flex-col bg-slate-950/90 rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" aria-hidden="true" />
                <h4 className="text-sm sm:text-base font-bold text-white">진료실 무편집 직캠 비디오</h4>
              </div>
              <span className="text-xs text-blue-300 font-mono">
                {selectedVideo.stepNum} · {selectedVideo.phase}
              </span>
            </div>

            {/* 비디오 9:16 뷰어 */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 p-3 sm:p-5 flex items-center justify-center">
              <div className="w-full max-w-[260px] sm:max-w-[290px] aspect-[9/16] rounded-2xl overflow-hidden bg-black border-2 border-white/20 shadow-2xl relative">
                <video
                  ref={videoRef}
                  key={selectedVideo.file}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                >
                  <source src={`${import.meta.env.BASE_URL}assets/${selectedVideo.file}`} type="video/mp4" />
                  귀하의 브라우저는 비디오 태그를 지원하지 않습니다.
                </video>
              </div>
            </div>

            {/* 비디오 설명 */}
            <div className="mt-4 pt-4 border-t border-white/10 text-start">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-400 text-slate-950 font-mono">
                  {selectedVideo.stepNum} · {selectedVideo.phase}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedVideo.badgeColor}`}>
                  {selectedVideo.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">길이: {selectedVideo.duration}</span>
              </div>
              <h5 className="text-sm sm:text-base font-bold text-white">{selectedVideo.title}</h5>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedVideo.desc}</p>
            </div>
          </article>
        </div>

        {/* 하단 6대 영상 아카이브 그리드 (치료 일자 순서 엄격 정렬 & STEP 동기화) */}
        <section aria-labelledby="parvo-archive-heading" className="mt-8 sm:mt-12">
          <div className="text-start mb-6">
            <h3 id="parvo-archive-heading" className="text-lg sm:text-2xl font-extrabold text-white">
              📹 7일간의 임상 치료 순서별 6대 직캠 아카이브
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              치료 일자별(Day 1 ~ Day 7) 순서대로 정렬된 리얼 진료실 영상입니다. 카드를 클릭하면 상단 플레이어와 STEP이 자동 동기화됩니다.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {PARVOGEL_CASE_DATA.videos.map((vid, idx) => {
              const isSelected = selectedVideo.id === vid.id;
              const isCurrentStep = currentStep.id === vid.stepId;
              return (
                <div
                  key={vid.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectVideo(vid); } }}
                  onClick={() => handleSelectVideo(vid)}
                  aria-label={`${vid.stepNum} ${vid.phase} ${vid.title} 영상 선택`}
                  className={`group relative rounded-2xl p-2.5 sm:p-3 border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-blue-950/90 border-blue-400 ring-2 ring-blue-400 shadow-lg shadow-blue-950/60'
                      : isCurrentStep
                      ? 'bg-slate-900/90 border-blue-500/50 hover:border-blue-400'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isCurrentStep ? 'bg-blue-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono text-blue-300 font-bold">
                        {vid.phase}
                      </span>
                    </div>

                    {/* 썸네일 */}
                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black mb-2.5 border border-white/10 shadow">
                      <img
                        src={`${import.meta.env.BASE_URL}assets/clinical_thumbs/${vid.thumb}`}
                        alt={vid.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-1.5">
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-black/70 text-white font-mono">
                          {vid.duration}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-blue-500 text-white'
                        }`}>
                          {isSelected ? '■' : '▶'}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 mb-1">
                      {vid.title}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
                    {vid.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </section>
  );
}
