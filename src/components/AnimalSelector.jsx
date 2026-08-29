import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const animalKeys = [
  { id: 'puppy', icon: '🐶' },
  { id: 'cat', icon: '🐱' },
  { id: 'calf', icon: '🐮' },
  { id: 'piglet', icon: '🐷' },
  { id: 'goat', icon: '🐐' },
  { id: 'lamb', icon: '🐑' },
  { id: 'foal', icon: '🐴' }
];

export default function AnimalSelector() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState('puppy');

  const selectedAnimalName = t(`animalSelector.animals.${selectedId}.name`, 
    selectedId === 'puppy' ? '강아지 (자견/반려견)' :
    selectedId === 'cat' ? '고양이 (자묘/반려묘)' :
    selectedId === 'calf' ? '송아지' : 
    selectedId === 'piglet' ? '갓난돼지 (자돈)' : 
    selectedId === 'goat' ? '새끼 염소' : 
    selectedId === 'lamb' ? '새끼 양' : '망아지 (말)'
  );

  const selectedAnimalHighlight = t(`animalSelector.animals.${selectedId}.highlight`, 
    selectedId === 'puppy' ? '55일령 0.6kg 푸들 7일 완치 실화! 파보·급성장염 1초 펌프 긴급 케어' :
    selectedId === 'cat' ? '범백·급성장염 고양이 주사기 스트레스 ZERO 1초 안심 케어' :
    selectedId === 'calf' ? '한우/젖소 신생 송아지 설사 고농축 흡착제' : 
    selectedId === 'piglet' ? '양돈 농가 포유자돈 위장관 보호 필수품' : 
    selectedId === 'goat' ? '흑염소/산양 농가 신생아 설사 구원투수' : 
    selectedId === 'lamb' ? '면양/양 사육 농가 신생아 안정제' : '말 신생아 급성 설사 긴급 장 점막 가드'
  );

  const selectedAnimalDosage = t(`animalSelector.animals.${selectedId}.dosage`, 
    selectedId === 'puppy' ? '1회 1~2 펌프 (1초 입안 직투여, 1일 2~3회)' :
    selectedId === 'cat' ? '1회 1 펌프 (1초 입가 직투여, 1일 2회)' :
    selectedId === 'calf' ? '1회 15~30ml (증상시 1일 2회 급여)' : 
    selectedId === 'piglet' ? '1회 2~5ml (주사기 입안 직투여)' : 
    selectedId === 'goat' ? '1회 5~10ml (1일 2회)' : 
    selectedId === 'lamb' ? '1회 5~10ml (1일 2회)' : '1회 20~40ml (1일 2회)'
  );

  // effects 리스트를 t.returns로 배열 처리하거나 개별 인덱스로 안전 호출
  const rawEffects = t(`animalSelector.animals.${selectedId}.effects`, { returnObjects: true });
  const effectsList = Array.isArray(rawEffects) ? rawEffects : [
    selectedId === 'puppy' ? '1-deoxinojirimycin & 특허균주 복합제가 장 점막 즉각 물리적 코팅' :
    selectedId === 'cat' ? '초미세 몬모릴로나이트의 위장관 벽 보호 및 탈수 방지' :
    selectedId === 'calf' ? '로타·코로나·대장균 바이러스 및 독소 강력 흡착 배출' : '수인성 설사 및 유제품 흡수 장애 진정',

    selectedId === 'puppy' ? '바이러스 및 병원성 독소 체외 흡착 배출로 혈변·경련 급속 안정화' :
    selectedId === 'cat' ? '주사기 거부하는 예민한 고양이도 1초 펌프로 스트레스 제로 급여' :
    selectedId === 'calf' ? '장 점막 물리적 보호막 형성으로 탈수 예방' : '장내 유해균 길항작용으로 정상 세균총 유지',

    selectedId === 'puppy' ? '곡기 끊고 쓰러진 환축의 식욕 3일 만에 폭풍 완식 부활' :
    selectedId === 'cat' ? '빠른 전해질 및 에너지 공급으로 활력 정상화' :
    selectedId === 'calf' ? '설사 발병 즉시 투여 시 24시간 이내 분변 경도 정상화' : '이유 전 신생아 폐사율 대폭 감소'
  ];

  const currentIcon = animalKeys.find(a => a.id === selectedId)?.icon || '🐶';

  return (
    <section 
      aria-label={t('animalSelector.title', '모든 동물의 신생아 설사, 파보겔(Parvogel) 하나로!')}
      className="bg-white text-slate-800 rounded-3xl p-6 sm:p-10 my-12 border border-slate-200 shadow-xl"
    >
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="px-3.5 py-1.5 bg-blue-100 text-blue-800 text-xs font-black rounded-full uppercase tracking-wider border border-blue-200">
          {t('animalSelector.tag', '🐾 전 축종 신생아 맞춤 솔루션')}
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 break-keep leading-snug">
          {t('animalSelector.title', '모든 동물의 신생아 설사, 파보겔(Parvogel) 하나로!')}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
          {t('animalSelector.sub', '동물 축종을 선택하시면 권장 용량 및 지사 효과를 확인하실 수 있습니다.')}
        </p>
      </div>

      {/* 탭 버튼 목록 (강아지/고양이/송아지/자돈/염소/양/말) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8" role="tablist">
        {animalKeys.map((item) => {
          const isSelected = selectedId === item.id;
          const name = t(`animalSelector.animals.${item.id}.name`, 
            item.id === 'puppy' ? '강아지 (반려견)' :
            item.id === 'cat' ? '고양이 (반려묘)' :
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
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 ring-2 ring-blue-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/90 border border-slate-200'
              }`}
            >
              <span className="text-base sm:text-lg">{item.icon}</span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>

      {/* 디테일 카드 (밝고 화사한 스타일) */}
      <div role="tabpanel" aria-label={selectedAnimalName} className="bg-slate-50/90 rounded-2xl p-6 sm:p-7 border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3 text-left w-full md:w-2/3">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200">
            💡 {selectedAnimalHighlight}
          </div>
          <h4 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>{currentIcon}</span> {selectedAnimalName} {t('animalSelector.guideTitle', '맞춤 투여 가이드')}
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {effectsList.map((effect, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-1/3 bg-white p-5 rounded-2xl border border-blue-200 shadow-md text-center">
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
            {t('animalSelector.dosageTag', '권장 급여 용량')}
          </span>
          <span className="text-sm sm:text-base font-black text-amber-700 block mt-1">
            {selectedAnimalDosage}
          </span>
          <span className="text-[11px] text-slate-500 block mt-2">
            {t('animalSelector.notice', '* 1-deoxinojirimycin & 특허균주 고농축 액상 제제')}
          </span>
        </div>
      </div>
    </section>
  );
}
