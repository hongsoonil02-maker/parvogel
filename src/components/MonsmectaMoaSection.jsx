import React from 'react';

export default function MonsmectaMoaSection() {
  const moaModules = [
    {
      id: 'trap',
      step: 'MECHANISM 01',
      title: '정전기적 자성 포획 (LIQI Nano Trap)',
      sub: 'T-O-T 3층 판상 나노 입자의 병원체 흡착',
      desc: '판상 규산염 단면의 국소 양전하(+) 부위가 바이러스 캡시드와 세균 표면 부착 단백질(CS31A)의 음전하(-) 부위를 자석처럼 강력 포획합니다.',
      metrics: [
        { label: '최소 억제 농도 (MIC)', value: '0.05% (0.5g/L)' },
        { label: '유익균(라토바실러스) 사멸률', value: '0% (보존)' },
        { label: '살모넬라/대장균 흡착 소요시간', value: '15~20분 내 99.9%' }
      ],
      icon: '🧲',
      gradient: 'from-emerald-900/50 to-[#002217]',
      border: 'border-emerald-600/50'
    },
    {
      id: 'inhibit',
      step: 'MECHANISM 02',
      title: '바이러스 외피 합성 차단 (DNG1000 1-DNJ)',
      sub: 'α-Glucosidase 억제를 통한 증식 및 감염력 무력화',
      desc: '1-데옥시노지리마이신(1-DNJ) 유효 성분이 바이러스 외피 당단백질의 정상적 당화(N-linked Glycosylation)를 저해하여 침투 능력을 근본적으로 상실시킵니다.',
      metrics: [
        { label: 'PEDV 바이러스 IC50', value: '57.76 μM' },
        { label: '1-DNJ 정량 함량', value: '≥ 1,000 mg/kg' },
        { label: '작용 기전', value: 'α-Glucosidase I, II 경쟁적 저해' }
      ],
      icon: '🛡️',
      gradient: 'from-teal-900/50 to-[#002217]',
      border: 'border-teal-600/50'
    },
    {
      id: 'buffer',
      step: 'MECHANISM 03',
      title: '산증 교정 & 완충 전해질계 (Acetate + Propionate)',
      sub: '간외 조직 대사 즉각 중탄산염(HCO3-) 생성',
      desc: '간 기능 저하 환축에서도 아세틸-CoA 합성효소(ACS)를 통해 즉각 HCO3-를 방출하여 위산 구토와 설사로 인한 급성 대사성 산증을 15분 만에 교정합니다.',
      metrics: [
        { label: '위산 완충 pH 범위', value: 'pH 4.5 ~ 5.5' },
        { label: '수액 요법 병용 시너지', value: '아세트산 링거액 상승 효과' },
        { label: '염증성 지표 (CRP)', value: '48.3% 유의적 감소' }
      ],
      icon: '⚡',
      gradient: 'from-[#004d35]/60 to-[#002217]',
      border: 'border-emerald-500/60'
    }
  ];

  return (
    <section className="bg-gradient-to-br from-[#003828] via-[#002d20] to-[#001f16] border border-emerald-700/60 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden text-slate-100">
      <div className="space-y-2 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
          <span>Mode of Action (MOA)</span>
          <span>·</span>
          <span>수의약리학적 정량 데이터</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-keep">
          특허 출원 3대 나노 작용 기전 (MOA)
        </h2>
        <p className="text-emerald-100/70 text-xs sm:text-sm max-w-3xl leading-relaxed break-keep">
          몸속에 흡수되어 간과 신장에 해독 부담을 주는 화학 약물과 달리, 물리·화학적 정전기 트랩과 효소 제어로 병원체를 즉시 격리 배출합니다.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative">
        {moaModules.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl border ${m.border} bg-gradient-to-b ${m.gradient} p-6 flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-sm`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-emerald-300 uppercase">
                  {m.step}
                </span>
                <span className="text-2xl">{m.icon}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight break-keep leading-snug">
                {m.title}
              </h3>
              <p className="text-xs text-emerald-200/90 font-medium break-keep leading-normal">
                {m.sub}
              </p>
              <p className="text-xs text-slate-200 leading-relaxed break-keep pt-1">
                {m.desc}
              </p>
            </div>

            <div className="bg-[#002217]/90 rounded-xl p-3.5 border border-emerald-900/80 space-y-2 pt-3">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">정량 검증 지표</p>
              {m.metrics.map((met, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-emerald-950 last:border-0">
                  <span className="text-slate-300 text-[11px]">{met.label}</span>
                  <span className="font-bold text-emerald-300 text-xs">{met.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
