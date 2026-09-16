import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function GomiPoopStory() {
  const { t } = useTranslation();
  const [selectedAfterIdx, setSelectedAfterIdx] = useState(0);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState('');
  const [zoomImageTitle, setZoomImageTitle] = useState('');

  const afterImages = [
    {
      src: '/images/gomi/gomi_after_close.jpg',
      label: '포인트 1: 알맹이 형성',
      desc: '짙은 쑥색의 알맹이 대변과 흰색 요산이 또렷하게 분리된 모습'
    },
    {
      src: '/images/gomi/gomi_after_close2.jpg',
      label: '포인트 2: 단단한 또아리',
      desc: '굵고 탱탱하게 형태를 유지하며 배출된 건강한 정상 변'
    }
  ];

  const handleOpenZoom = (src, title) => {
    setZoomImageSrc(src);
    setZoomImageTitle(title);
    setIsZoomModalOpen(true);
  };

  return (
    <section 
      id="gomi-story" 
      aria-label="대표 반려조 꼬미의 배변 회복 실화"
      className="my-16 sm:my-20 bg-gradient-to-b from-amber-50/70 via-white to-emerald-50/50 rounded-3xl p-6 sm:p-10 lg:p-12 border border-amber-200/80 shadow-2xl relative overflow-hidden"
    >
      {/* 배경 장식 패턴 */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 섹션 */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-100 to-emerald-100 text-amber-900 text-xs sm:text-sm font-black rounded-full uppercase tracking-wider border border-amber-300 shadow-sm mb-4">
          <span className="text-base">🦜</span>
          <span>파보겔 대표 반려조 '꼬미'의 24시간 리얼 회복기</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 break-keep leading-snug">
          "새 안 키워본 사람은 몰라요!"<br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent ml-1 sm:ml-2">
            물기가 번졌어도 알맹이가 잡히면 멎은 겁니다
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-3 break-keep max-w-2xl mx-auto leading-relaxed">
          새는 장이 짧아 급성 설사 시 24~48시간 만에 탈수로 낙조(폐사) 위험에 처합니다.<br className="hidden md:inline" />
          파보겔 홍대표가 앵무새 '꼬미'의 급성 설사를 직접 케어하며 기록한 리얼 배변 데이터와 조류 집사 필독 상식을 공개합니다.
        </p>
      </div>

      {/* 2단 구성: 좌측 리얼 카톡 대화 / 우측 비포-애프터 실물 비교 */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start relative z-10">
        
        {/* 좌측: 리얼 부녀 카카오톡 대화방 UI (5컬럼) */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
          {/* 카톡 헤더 */}
          <div className="bg-[#a0c0d6] px-4 py-3 border-b border-[#8fb3ca] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                JH
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  Jessica Hong (홍대표)
                  <span className="text-[10px] font-normal text-slate-600 bg-white/60 px-1.5 py-0.5 rounded">파보겔 개발대표</span>
                </div>
                <div className="text-[10px] text-slate-600">반려조 '꼬미' 케어 리얼톡</div>
              </div>
            </div>
            <button
              onClick={() => setIsChatModalOpen(true)}
              className="text-[11px] font-semibold text-sky-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-md transition-colors shadow-xs flex items-center gap-1"
              title="실제 카톡 캡처 원본 보기"
            >
              <span>📷 원본 캡처</span>
            </button>
          </div>

          {/* 카톡 메시지 본문 */}
          <div className="bg-[#bacee0] p-4 space-y-3.5 text-xs sm:text-sm font-sans min-h-[360px] flex flex-col justify-start">
            <div className="text-center my-1">
              <span className="bg-black/15 text-white/90 text-[10px] px-3 py-1 rounded-full font-medium">
                2026년 9월 16일 오전 8:54 ~ 9:11
              </span>
            </div>

            {/* 홍대표 메시지 1: 사진 전송 */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden flex-shrink-0 border border-white/50">
                <img src="/images/gomi/kakao_chat_proof.png" alt="Jessica" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 max-w-[80%]">
                <div className="text-[11px] text-slate-700 font-medium">Jessica Hong</div>
                <div className="bg-white p-2 rounded-2xl rounded-tl-none shadow-xs text-slate-800 space-y-1.5 border border-slate-100">
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center gap-1">
                    <span>🖼️ 사진 2장</span>
                    <span className="font-bold text-amber-700">"설사꼬미"</span>
                  </div>
                  <p className="leading-snug">
                    이게 멎은건데 ㅎㅎㅎ 이게 근데 나는 아는데.. 아빠가 보기에도 알겠나?
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 text-right">오전 9:09</div>
              </div>
            </div>

            {/* 아빠 답장 */}
            <div className="flex items-start justify-end gap-2">
              <div className="space-y-1 max-w-[80%] text-right">
                <div className="bg-[#fee500] p-2.5 rounded-2xl rounded-tr-none shadow-xs text-slate-900 text-left leading-snug border border-[#f0d800]">
                  잘 모르겠다. 제미나이(AI)한테 줘보고....
                </div>
                <div className="text-[10px] text-slate-500">오전 9:10</div>
              </div>
            </div>

            {/* 홍대표 메시지 2 */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden flex-shrink-0 border border-white/50">
                <img src="/images/gomi/kakao_chat_proof.png" alt="Jessica" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 max-w-[80%]">
                <div className="text-[11px] text-slate-700 font-medium">Jessica Hong</div>
                <div className="bg-white p-2.5 rounded-2xl rounded-tl-none shadow-xs text-slate-800 leading-snug border border-slate-100">
                  난 알아 ㅋ <strong>새 안 키워본 사람은 모름</strong>
                </div>
                <div className="text-[10px] text-slate-500 text-right">오전 9:10</div>
              </div>
            </div>

            {/* 아빠 확인 */}
            <div className="flex items-start justify-end gap-2">
              <div className="space-y-1 max-w-[80%] text-right">
                <div className="bg-[#fee500] px-3 py-1.5 rounded-2xl rounded-tr-none shadow-xs text-slate-900 text-center font-bold border border-[#f0d800]">
                  ㅇㅇ
                </div>
                <div className="text-[10px] text-slate-500">오전 9:11</div>
              </div>
            </div>

            {/* AI 정밀 분석 콜아웃 */}
            <div className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-xl shadow-md text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <span>🤖 AI 수의생리학 정밀 판정</span>
                <span className="bg-white text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-black">설사 완전 종료 확인</span>
              </div>
              <p className="text-emerald-50 text-[11px] leading-relaxed">
                "홍대표님 말씀이 정확합니다. 고체 대변이 둥글게 모양(형태)을 뭉쳐 내보내고 있으며, 흰 요산이 정상 분리되었습니다. 신문지 테두리 수분은 정상적인 소변(다뇨) 배출일 뿐 설사가 아닙니다!"
              </p>
            </div>
          </div>
        </div>

        {/* 우측: 리얼 배변 비포 & 애프터 실물 비교 카드 (7컬럼) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* BEFORE: 급성 설사 */}
            <div className="bg-white rounded-2xl border-2 border-red-200/80 shadow-md p-4 flex flex-col relative overflow-hidden group">
              <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-[11px] font-black px-2.5 py-1 rounded-full border border-red-200">
                BEFORE · 설사
              </div>
              <div className="text-xs font-bold text-red-600 flex items-center gap-1 mb-2">
                <span>⚠️</span>
                <span>형태 붕괴 · 액상 물변</span>
              </div>
              
              {/* 이미지 뷰어 */}
              <div 
                onClick={() => handleOpenZoom('/images/gomi/gomi_before_close.jpg', 'BEFORE: 형태가 완전히 무너진 묽은 설사')}
                className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative cursor-pointer group-hover:shadow-inner transition-shadow"
              >
                <img 
                  src="/images/gomi/gomi_before_close.jpg" 
                  alt="꼬미 설사 상태" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-xs">
                  <span>🔍 클릭하여 확대</span>
                </div>
              </div>

              {/* 분석 설명 */}
              <div className="mt-3 text-xs text-slate-700 space-y-1.5 flex-1">
                <div className="font-bold text-slate-900">🚨 장 점막 자극 & 흡수 장애</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  고체 대변의 덩어리 형태가 전혀 잡히지 않고, 겨자색 액체처럼 신문지에 넓게 스며든 상태입니다. 요산과 변이 뒤섞여 묽은 죽처럼 퍼져 있는 전형적인 조류 설사입니다.
                </p>
              </div>
            </div>

            {/* AFTER: 회복된 정상 변 */}
            <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-md p-4 flex flex-col relative overflow-hidden group">
              <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-1 rounded-full border border-emerald-300">
                AFTER · 회복 완벽
              </div>
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-2">
                <span>✅</span>
                <span>알맹이 형성 · 정상 대변</span>
              </div>
              
              {/* 이미지 뷰어 */}
              <div 
                onClick={() => handleOpenZoom(afterImages[selectedAfterIdx].src, 'AFTER: 단단하게 모양을 잡고 나온 건강한 정상 변')}
                className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-emerald-200 relative cursor-pointer group-hover:shadow-inner transition-shadow"
              >
                <img 
                  src={afterImages[selectedAfterIdx].src} 
                  alt="꼬미 정상 변" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-xs">
                  <span>🔍 클릭하여 확대</span>
                </div>
              </div>

              {/* 서브 앵글 탭 */}
              <div className="flex gap-1.5 mt-2">
                {afterImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAfterIdx(idx)}
                    className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-md transition-colors ${
                      selectedAfterIdx === idx 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {img.label}
                  </button>
                ))}
              </div>

              {/* 분석 설명 */}
              <div className="mt-3 text-xs text-slate-700 space-y-1.5 flex-1">
                <div className="font-bold text-emerald-900">🟢 장벽 물리적 코팅 & 안정화</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  짙은 쑥색의 <strong>고체 대변이 동글동글하게 알맹이 형태를 완벽히 유지</strong>하고 있습니다. 위에 하얀 요산(Urate)이 분리되어 얹혔으며, 신문지 테두리 수분은 정상 소변(다뇨)입니다.
                </p>
              </div>
            </div>

          </div>

          {/* 조류 집사를 위한 수의학적 3대 배변 상식 */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h3 className="text-sm sm:text-base font-bold text-amber-400">
                  초보 조류 집사가 꼭 알아야 할 '새 똥' 3요소
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">조류 소화생리학</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1">
                  <span>1. 고체 대변</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  음식물이 소화된 본체. 둥글거나 또아리 형태로 <strong>형태가 또렷이 뭉쳐 있어야</strong> 장이 건강한 것입니다.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="text-slate-200 font-bold mb-1 flex items-center gap-1">
                  <span>2. 흰색 요산</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  신장에서 배출된 단백질 대사 노폐물. 크림색 캡 형태로 대변 위에 <strong>분리되어 얹히는 게 정상</strong>입니다.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="text-sky-300 font-bold mb-1 flex items-center gap-1">
                  <span>3. 투명한 소변</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  신문지가 젖는 투명한 물은 소변입니다. 물 섭취나 긴장에 의한 <strong>다뇨 현상일 뿐 설사가 아닙니다.</strong>
                </p>
              </div>
            </div>

            {/* 조류 맞춤 파보겔 급여 권장량 안내 */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-3">
              <span className="text-2xl">🦜</span>
              <div className="text-xs">
                <span className="font-bold text-emerald-300">조류·앵무새 파보겔 안심 급여법:</span>
                <p className="text-emerald-100 text-[11px] mt-0.5 leading-relaxed">
                  새는 매우 예민하여 주사기로 억지로 먹이면 기도 흡인(질식) 위험이 있습니다. 파보겔은 <strong>부리 끝에 1~2방울(0.1~0.2ml) 톡 묻혀주면</strong> 아이가 혀로 핥아먹어 스트레스 없이 1초 만에 장 점막을 코팅할 수 있습니다.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 카톡 원본 캡처 모달 */}
      {isChatModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsChatModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <span>📱 실제 카카오톡 대화 캡처 원본</span>
              </div>
              <button 
                onClick={() => setIsChatModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-100 max-h-[80vh] overflow-y-auto flex justify-center">
              <img 
                src="/images/gomi/kakao_chat_proof.png" 
                alt="카톡 대화 캡처 원본" 
                className="w-full max-w-xs rounded-lg shadow-md border border-slate-300"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
              * 프라이버시 보호를 위해 일부 신문지 광고 텍스트는 정돈되었습니다.
            </div>
          </div>
        </div>
      )}

      {/* 변 사진 확대 모달 */}
      {isZoomModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="font-bold text-sm">{zoomImageTitle}</div>
              <button 
                onClick={() => setIsZoomModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex justify-center">
              <img 
                src={zoomImageSrc} 
                alt={zoomImageTitle} 
                className="w-full max-h-[70vh] object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
