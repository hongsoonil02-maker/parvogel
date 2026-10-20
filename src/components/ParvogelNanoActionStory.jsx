import React from 'react';

export default function ParvogelNanoActionStory() {
  const painPoints = [
    {
      icon: '🚨',
      title: '갑자기 시작된 노란 위산 구토',
      desc: '위장 점막이 헐어 강한 위산이 역류하며 꿀렁거리는 괴로운 구토'
    },
    {
      icon: '🩸',
      title: '피비린내 나는 혈변과 물설사',
      desc: '바이러스와 유해균이 여린 장벽을 파고들어 발생하는 수양성 혈변'
    },
    {
      icon: '💧',
      title: '급격한 탈수와 기력 저하',
      desc: '물조차 마시지 못하고 체온이 떨어지며 축 늘어지는 응급 골든타임'
    }
  ];

  const threeSteps = [
    {
      step: 'STEP 01',
      time: '15분 초스피드',
      title: '위산 완충막 형성 (pH 4.5~5.5)',
      desc: '초미세 나노 보호막이 위장을 부드럽게 감싸주어, 쓰린 위산 구토와 헛구역질을 15분 만에 진정시킵니다.',
      badge: '위산 구토 차단',
      icon: '🛡️',
      color: 'border-primary-200 bg-primary-50/60 text-primary-950'
    },
    {
      step: 'STEP 02',
      time: '20분 내 99.9%',
      title: '정전기 자석 스펀지 흡착 포획',
      desc: '몸에 좋은 유익균은 그대로 남기고, 파보·코로나 바이러스와 유해균 독소만 자석처럼 강력하게 끌어당겨 묶습니다.',
      badge: '바이러스 99.9% 포획',
      icon: '🧲',
      color: 'border-primary-200 bg-primary-50/60 text-primary-950'
    },
    {
      step: 'STEP 03',
      time: '안전한 대변 배출',
      title: '체내 흡수 0%! Flush 안전 배출',
      desc: '체내로 흡수되지 않고 장관만 깨끗이 청소하고 내려가, 연약한 아이의 간과 신장에 부담 없이 변으로 쏙 배출됩니다.',
      badge: '간·신장 부담 0%',
      icon: '🌊',
      color: 'border-primary-200 bg-primary-50/60 text-primary-950'
    }
  ];

  const valueProps = [
    {
      icon: '🧲',
      title: '자석처럼 유해균과 바이러스만 쏙!',
      point: 'CEC ≥ 130 mmol/100g 나노 정전기 흡착',
      desc: '몸에 좋은 유익균은 보존하고, 파보·코로나 바이러스와 유해 독소만 자석처럼 끌어당겨 변으로 안전하게 비워냅니다.'
    },
    {
      icon: '🛡️',
      title: '15분 만에 속쓰림과 위산 구토를 싹!',
      point: 'pH 4.5~5.5 위산 완충막 형성',
      desc: '강한 위산으로 쓰린 위장을 초미세 보호막으로 완충해 주어, 괴로운 구토와 복통을 신속하게 잠재웁니다.'
    },
    {
      icon: '🌿',
      title: '체내 흡수 0%! 간과 신장에 전혀 무리가 없습니다',
      point: '100% 천연 점토 규산염',
      desc: '몸속으로 흡수되지 않고 장관만 쓸고 내려가므로, 아픈 아이의 간과 신장에 부담을 주지 않는 100% 천연 나노 스펀지입니다.'
    },
    {
      icon: '⚡',
      title: '무너진 몸속 전해질과 기력을 빠르게 회복',
      point: '비타민 B12 & 유기산 전해질 복합',
      desc: '심한 설사로 탈수가 온 아이에게 필요한 전해질 밸런스와 미토콘드리아 에너지를 채워 빠른 기력 회복을 돕습니다.'
    }
  ];

  return (
    <section className="py-8 sm:py-10 lg:py-12 bg-gradient-to-b from-white via-[#FAF9F6] to-sky-50/40">
      <div className="section-container space-y-8">
        {/* 1. 상단 공감 (Pain Point) */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-extrabold">
              <span>🐾</span>
              <span>우리 아이가 갑자기 아플 때</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center leading-snug break-keep max-w-2xl mx-auto">
            <span className="block text-balance">"새벽에 갑자기 시작된 노란 위산 토와 물설사…</span>
            <span className="block mt-1 sm:mt-1.5 text-primary-700">얼마나 놀라셨나요?"</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed break-keep text-center max-w-xl mx-auto">
            급성 장 트러블은 초기 골든타임 케어가 가장 중요합니다.<br />
            아픈 아이를 붙잡고 쓴 가루약을 억지로 먹이느라 주사기 실랑이를 하지 마세요.
          </p>

          <div className="grid sm:grid-cols-3 gap-3.5 pt-2 text-left">
            {painPoints.map((p, idx) => (
              <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5">
                <span className="text-2xl">{p.icon}</span>
                <h4 className="text-sm font-extrabold text-slate-800">{p.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 해결책 제시 (Hero Solution Banner — Bright Modern D2C Card) */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-sky-50 via-white to-emerald-50/70 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-sky-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-[11px] font-extrabold">
              ✨ Vet-Verified Gentle Gel Formula
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug break-keep text-slate-900">
              입가에 톡 짜주면 스스로 핥아먹는 장 보호막,<br />
              <span className="text-primary-700">파보겔 (ParvoGel)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-keep">
              연약한 아이의 간·신장에 부담 0%! 자석처럼 유해 독소만 쏙 잡아 변으로 내보내는 100% 천연 나노 미네랄 스펀지
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-center sm:items-end bg-white px-5 py-3.5 rounded-2xl border border-sky-100 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-primary-700">1초 펌핑</span>
            <span className="text-xs font-bold text-slate-500">주사기 스트레스 ZERO</span>
          </div>
        </div>

        {/* 3. 3단계 나노 스펀지 작용 (3-Step Action) */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-primary-600 tracking-wider uppercase">3-Step Gentle Care</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              파보겔이 아이 몸속에서 일하는 3단계 원리
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {threeSteps.map((s, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-shadow ${s.color}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black tracking-wider uppercase opacity-80">{s.step}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 shadow-xs">{s.time}</span>
                  </div>
                  <div className="text-2xl pt-1">{s.icon}</div>
                  <h4 className="text-base font-black text-slate-900 break-keep">{s.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed break-keep">{s.desc}</p>
                </div>
                <div className="pt-2">
                  <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/90 text-slate-800 shadow-xs">
                    ✓ {s.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 소비자 언어 4대 핵심 셀링 포인트 */}
        <div className="max-w-4xl mx-auto space-y-6 pt-2">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-primary-600 tracking-wider uppercase">Why ParvoGel?</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              집사님들이 파보겔을 상비약 1순위로 꼽는 4가지 이유
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {valueProps.map((vp, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start gap-4">
                <span className="text-3xl shrink-0 p-2 rounded-xl bg-sky-50/70">{vp.icon}</span>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-primary-700 uppercase tracking-wide">{vp.point}</span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 break-keep">{vp.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed break-keep">{vp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
