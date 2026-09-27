import React from 'react';

export default function MonsmectaLineupSection() {
  const lineups = [
    {
      id: 'original',
      badge: 'B2B STANDARD',
      badgeColor: 'bg-emerald-800 text-emerald-200 border-emerald-600/50',
      title: 'MONSMECTA (오리지널)',
      subTitle: '초미세 나노 점막보호 & 전해질 평형 포뮬러',
      description: '급성 바이러스성 장염(CPV/CCoV) 및 유해균 독소로 인한 급성 수양성 설사·구토 응급 제재',
      coreIngredients: [
        { label: '고순도 나노 몬모릴로나이트', val: 'D90 ≤ 3μm, 비표면적 > 800m²/g, 양이온교환능(CEC) ≥ 130 mmol/100g' },
        { label: 'DNG1000', val: '1-DNJ ≥ 1,000 mg/kg 고순도 복합' },
        { label: '유기산 완충계', val: '위산 완충 pH 4.5~5.5 안정화 설계' }
      ],
      clinicalData: [
        '급성 파보(CPV) 및 코로나(CCoV) 장염 환축 장 점막 즉각 피복',
        '투약 20분 내 살모넬라 99.998%, 대장균 99.4% 사멸/흡착 배출',
        'PEDV 바이러스 증식 억제 농도 IC50 = 57.76 μM 증식 차단'
      ],
      icon: '🛡️',
      borderColor: 'border-emerald-600/60',
      accentGradient: 'from-emerald-900/40 to-[#00281d]'
    },
    {
      id: 'hepamax',
      badge: 'GUT-LIVER AXIS',
      badgeColor: 'bg-amber-900/60 text-amber-200 border-amber-600/50',
      title: 'MONSMECTA HEPAMAX',
      subTitle: '간문맥 독소 유입 차단 & 간세포 항산화 방어',
      description: '장-간 순환계 독소 흡착과 간세포 글루타치온(GSH) 합성을 동시 촉진하는 간 기능 특화 처방',
      coreIngredients: [
        { label: '오리지널 나노 포뮬러', val: '나노 몬모릴로나이트 + 1-DNJ 복합 베이스' },
        { label: '실리마린 (Silymarin)', val: '밀크씨슬 고농축 유효 추출물' },
        { label: 'L-메치오닌 (L-Methionine)', val: '간세포 해독 효소 및 항산화 전구체' }
      ],
      clinicalData: [
        '곰팡이독소(아플라톡신 B1) 중독 및 약물성 간 손상 방어',
        '장-간문맥 내피 독소 차단 및 간세포 글루타치온(GSH) 활성화',
        '면역 저하 자견 생독백신 항체 형성률 33% → 90% 수직 상승'
      ],
      icon: '🧪',
      borderColor: 'border-amber-600/60',
      accentGradient: 'from-amber-950/40 to-[#00281d]'
    },
    {
      id: 'renal',
      badge: 'GUT-KIDNEY AXIS',
      badgeColor: 'bg-teal-900/60 text-teal-200 border-teal-600/50',
      title: 'MONSMECTA RENAL DETOX',
      subTitle: '요독증 흡착 배출 & 대사성 산증 완충 교정',
      description: '만성 신부전(CKD) 및 요독 수치 상승 시 장내 요독 전구체를 흡착하여 신장 여과 부담 0% 달성',
      coreIngredients: [
        { label: '오리지널 나노 포뮬러', val: '나노 몬모릴로나이트 정전기 흡착 베이스' },
        { label: '아세트산 / 프로피온산', val: '간외 조직 ACS 대사 즉각 HCO3- 생성계' },
        { label: '비타민 B12 (시아노코발라민)', val: '적혈구 조혈 작용 및 신경계 기력 회복' }
      ],
      clinicalData: [
        '말기 신부전(ESRD), 만성 신장병(CKD) 요독증 환축 전용',
        '장내 요독 전구체(Indoxyl Sulfate) 정전기적 고착 후 대변 배출',
        '조절 T세포(Treg) 확대로 염증 지표 CRP 48.3% 유의적 감소'
      ],
      icon: '🌿',
      borderColor: 'border-teal-600/60',
      accentGradient: 'from-teal-950/40 to-[#00281d]'
    }
  ];

  return (
    <section className="bg-gradient-to-br from-[#003828] via-[#002d20] to-[#001f16] border border-emerald-700/60 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden text-slate-100">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-800/80 pb-6 relative">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-2">
            <span>Gut-Liver-Kidney Axis</span>
            <span>·</span>
            <span>특허 명세서 3대 전문 처방</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-keep">
            수의사 전용 3대 처방 라인업 (장-간-신장 축)
          </h2>
          <p className="text-emerald-100/70 text-xs sm:text-sm mt-1 break-keep">
            단순 장 증상 완화를 넘어, 장 점막 코팅부터 간문맥 독소 차단 및 신장 요독 배출까지 수의약리학적으로 설계되었습니다.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-300 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>동물병원 처방용 v3.0</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 relative">
        {lineups.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border ${item.borderColor} bg-gradient-to-b ${item.accentGradient} p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 shadow-xl backdrop-blur-sm`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className="text-2xl">{item.icon}</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white tracking-tight">{item.title}</h3>
                <p className="text-xs text-emerald-300 font-medium mt-0.5">{item.subTitle}</p>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed break-keep">{item.description}</p>
              </div>

              {/* 핵심 성분 테이블 */}
              <div className="bg-[#002217]/90 rounded-xl p-3.5 border border-emerald-900/80 space-y-2 text-xs">
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">핵심 성분 & 약리 규격</p>
                {item.coreIngredients.map((ing, idx) => (
                  <div key={idx} className="border-b border-emerald-950 last:border-0 pb-1.5 last:pb-0">
                    <span className="text-white font-semibold">{ing.label}</span>
                    <p className="text-[11px] text-emerald-100/70 leading-normal">{ing.val}</p>
                  </div>
                ))}
              </div>

              {/* 임상 데이터 및 검증 지표 */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <span>📊</span> <span>주요 적응증 & 검증 데이터</span>
                </p>
                <ul className="space-y-1 text-xs text-slate-200 leading-relaxed">
                  {item.clinicalData.map((data, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5 font-bold">•</span>
                      <span className="break-keep">{data}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-emerald-800/60 mt-6">
              <div className="text-[11px] text-emerald-200/80 flex items-center justify-between">
                <span>간·신장 대사 부담</span>
                <strong className="text-emerald-300 font-black text-xs">0% (체외 배출)</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
