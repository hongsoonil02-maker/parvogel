import React from 'react';

export default function FeedDisclaimer({ variant = 'banner' }) {
  if (variant === 'inline') {
    return (
      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed break-keep">
        * 파보겔은 사료관리법상 보조사료이며 질병의 진단·치료·예방을 대체하지 않습니다. 급여 전 수의사 상담을 권장합니다.
      </p>
    );
  }
  return (
    <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed break-keep flex items-start gap-2">
      <span className="shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
      <p>
        <strong className="font-black">보조사료 고지:</strong> 파보겔은 사료관리법상 보조사료(Feed Supplement)로 질병 치료를 대체하지 않습니다. 특정 효능은 개별 개체·환경에 따라 다를 수 있으며, 급여 전 수의사 상담을 권장합니다. 98.5% 등 수치는 시험 조건에서의 결과이며 체외 흡착 시험 데이터입니다.
      </p>
    </div>
  );
}
