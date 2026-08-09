import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const animalKeys = [
  { id: 'calf', icon: '🐮' },
  { id: 'piglet', icon: '🐷' },
  { id: 'goat', icon: '🐐' },
  { id: 'lamb', icon: '🐑' },
  { id: 'foal', icon: '🐴' }
];

export default function AnimalSelector() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState('calf');

  const selectedAnimalName = t(`animalSelector.animals.${selectedId}.name`, 
    selectedId === 'calf' ? '송아지' : 
    selectedId === 'piglet' ? '갓난돼지 (자돈)' : 
    selectedId === 'goat' ? '새끼 염소' : 
    selectedId === 'lamb' ? '새끼 양' : '망아지 (말)'
  );

  const selectedAnimalHighlight = t(`animalSelector.animals.${selectedId}.highlight`, 
    selectedId === 'calf' ? '한우/젖소 신생 송아지 설사 고농축 흡착제' : 
    selectedId === 'piglet' ? '양돈 농가 포유자돈 위장관 보호 필수품' : 
    selectedId === 'goat' ? '흑염소/산양 농가 신생아 설사 구원투수' : 
    selectedId === 'lamb' ? '면양/양 사육 농가 신생아 안정제' : '말 신생아 급성 설사 긴급 장 점막 가드'
  );

  const selectedAnimalDosage = t(`animalSelector.animals.${selectedId}.dosage`, 
    selectedId === 'calf' ? '1회 15~30ml (증상시 1일 2회 급여)' : 
    selectedId === 'piglet' ? '1회 2~5ml (주사기 입안 직투여)' : 
    selectedId === 'goat' ? '1회 5~10ml (1일 2회)' : 
    selectedId === 'lamb' ? '1회 5~10ml (1일 2회)' : '1회 20~40ml (1일 2회)'
  );

  // effects 리스트를 t.returns로 배열 처리하거나 개별 인덱스로 안전 호출
  const rawEffects = t(`animalSelector.animals.${selectedId}.effects`, { returnObjects: true });
  const effectsList = Array.isArray(rawEffects) ? rawEffects : [
    selectedId === 'calf' ? '로타·코로나·대장균 바이러스 및 독소 강력 흡착 배출' : '수인성 설사 및 유제품 흡수 장애 진정',
    selectedId === 'calf' ? '장 점막 물리적 보호막 형성으로 탈수 예방' : '장내 유해균 길항작용으로 정상 세균총 유지',
    selectedId === 'calf' ? '설사 발병 즉시 투여 시 24시간 이내 분변 경도 정상화' : '이유 전 신생아 폐사율 대폭 감소'
  ];

  const currentIcon = animalKeys.find(a => a.id === selectedId)?.icon || '🐮';

  return (
    <section 
      aria-label={t('animalSelector.title', '모든 동물의 신생아 설사, 파보겔(Parvogel) 하나로!')}
      className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 my-12 border border-blue-500/30 shadow-2xl"
    >
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-black rounded-full uppercase tracking-wider border border-blue-400/30">
          {t('animalSelector.tag', '🐾 전 축종 신생아 맞춤 솔루션')}
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
          {t('animalSelector.title', '모든 동물의 신생아 설사, 파보겔(Parvogel) 하나로!')}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t('animalSelector.sub', '동물 축종을 선택하시면 권장 용량 및 지사 효과를 확인하실 수 있습니다.')}
        </p>
      </div>

      {/* 탭 버튼 목록 */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8" role="tablist">
        {animalKeys.map((item) => {
          const isSelected = selectedId === item.id;
          const name = t(`animalSelector.animals.${item.id}.name`, 
            item.id === 'calf' ? '송아지' : 
            item.id === 'piglet' ? '갓난돼지 (자돈)' : 
            item.id === 'goat' ? '새끼 염소' : 
            item.id === 'lamb' ? '새끼 양' : '망아지 (말)'
          );

          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedId(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105 ring-2 ring-blue-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-base sm:text-lg">{item.icon}</span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>

      {/* 디테일 카드 */}
      <div role="tabpanel" aria-label={selectedAnimalName} className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-left w-full md:w-2/3">
          <div className="inline-block px-3 py-1 bg-blue-900/60 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30">
            💡 {selectedAnimalHighlight}
          </div>
          <h4 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>{currentIcon}</span> {selectedAnimalName} {t('animalSelector.guideTitle', '맞춤 투여 가이드')}
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            {effectsList.map((effect, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">✓</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-1/3 bg-slate-900 p-4 rounded-xl border border-blue-500/40 text-center">
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
            {t('animalSelector.dosageTag', '권장 급여 용량')}
          </span>
          <span className="text-sm sm:text-base font-black text-amber-400 block mt-1">
            {selectedAnimalDosage}
          </span>
          <span className="text-[11px] text-slate-400 block mt-2">
            {t('animalSelector.notice', '* 초미세 나노 몬모릴로나이트 고농축 액상 제제')}
          </span>
        </div>
      </div>
    </section>
  );
}
