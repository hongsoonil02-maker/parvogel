import React from 'react';

export default function MonsmectaClinicalCase() {
  const timeline = [
    { time: 'Day 0 (0h)', state: '극심한 허탈 및 신경 발작', detail: '55일령 토이푸들(♂), 체온 저하, 의식 불명에 준하는 경련 상태 내원. IV 카테터 삽입조차 위험한 혈관 허탈.' },
    { time: 'Day 1 (24h)', state: '단독 경구 투약 (수액 0mL)', detail: '수액 전면 배제 후 몬스멕타 1ml 3회 단독 투여. 신경 경련 빈도 급감 및 장 점막 코팅 진행.' },
    { time: 'Day 2 (48h)', state: '발작 완전 소실 & 자발 연하', detail: '경련 완전 멈춤, 스스로 물과 미음을 핥아먹기 시작(연하 복원). 체온 및 전해질 정상치 회복.' },
    { time: 'Day 7 (완치)', state: '100% 임상 완치 & 백신 접종', detail: '수양성 설사 종결, 정상 유구 분변 형성. 활력 지수 100% 회복하여 DHPPL 종합백신 정상 접종 퇴원.' }
  ];

  return (
    <section className="bg-gradient-to-br from-[#003828] via-[#002d20] to-[#001f16] border border-emerald-700/60 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden text-slate-100">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="space-y-3 relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-rose-900/60 text-rose-200 text-xs font-black border border-rose-600/50 animate-pulse">
            🚨 응급 임상 케이스
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/40">
            S&J 동물병원 연합 증례
          </span>
          <span className="text-xs text-emerald-200/70">
            IV 수액 0mL 전면 배제 단독 투약
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug break-keep">
          수액 요법 없이 단독 경구 투약으로 입증된<br />
          소아 자견 급성 허탈·신경 발작 생명 구호 증례
        </h2>

        <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed max-w-3xl break-keep">
          혈관을 찾기 어려울 정도로 허탈된 극소형 환축에서 수액 요법을 배제하고, 오직 장 점막 코팅 및 전해질 완충 기전만으로 생체 징후를 극적으로 회복시킨 공식 임상 차트 기록입니다.
        </p>
      </div>

      {/* 환축 스펙 & 프로토콜 요약 */}
      <div className="grid sm:grid-cols-3 gap-4 relative">
        <div className="bg-[#002217]/90 p-4 rounded-2xl border border-emerald-900/80 space-y-1">
          <span className="text-[11px] text-emerald-300/80 font-bold uppercase">환축 정보</span>
          <p className="text-sm font-bold text-white">55일령 토이푸들 (♂, 0.65kg)</p>
          <p className="text-xs text-slate-300">급성 CPV 의증, 저혈당·저체온성 신경 경련</p>
        </div>
        <div className="bg-[#002217]/90 p-4 rounded-2xl border border-emerald-900/80 space-y-1">
          <span className="text-[11px] text-amber-400 font-bold uppercase">처방 프로토콜</span>
          <p className="text-sm font-bold text-white">수액(IV) 0mL + 몬스멕타 단독</p>
          <p className="text-xs text-slate-300">초미세 나노 겔 1ml 경구 1일 3~4회 급여</p>
        </div>
        <div className="bg-[#002217]/90 p-4 rounded-2xl border border-emerald-900/80 space-y-1">
          <span className="text-[11px] text-emerald-400 font-bold uppercase">최종 예후</span>
          <p className="text-sm font-bold text-emerald-300">48시간 진정, 7일 100% 완치</p>
          <p className="text-xs text-slate-300">신경 후유증 0%, 백신 정상 접종 퇴원</p>
        </div>
      </div>

      {/* 4단계 타임라인 */}
      <div className="space-y-4 pt-2 relative">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">7일 임상 경과 타임라인 (Timeline)</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeline.map((step, idx) => (
            <div key={idx} className="bg-[#002217]/90 rounded-2xl p-4 border border-emerald-900/80 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300">{step.time}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <h4 className="text-sm font-bold text-white break-keep">{step.state}</h4>
              <p className="text-xs text-slate-300 leading-relaxed break-keep">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
