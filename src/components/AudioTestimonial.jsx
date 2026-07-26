import React, { useState } from 'react';

export default function AudioTestimonial() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 my-10 border border-blue-400/30 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full border border-indigo-400/30">
            🎙️ 현장 수의사 임상 녹음 인터뷰
          </span>
          <h4 className="text-xl sm:text-2xl font-black text-white">
            "송아지 설사 발병 시 파보겔 즉시 투여 반응"
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            동진동물병원 정성대 원장님 & 한우 사육 농가 현장 반응 인터뷰 음성 요약
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-blue-500/40 w-full md:w-80 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg transition-transform active:scale-95 shrink-0"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-white truncate">정성대 원장님 (동진동물병원)</div>
              <div className="text-[10px] text-blue-300">파보겔(로타겔) 임상 오디오 리포트</div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className={`h-full bg-blue-400 ${isPlaying ? 'w-2/3 transition-all duration-1000' : 'w-0'}`} />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            "파보겔 투여 후 설사 송아지의 장 점막 보호 및 기력 회복 속도가 매우 뛰어납니다."
          </p>
        </div>
      </div>
    </div>
  );
}
