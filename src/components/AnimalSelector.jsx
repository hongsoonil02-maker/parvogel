import React, { useState } from 'react';

const animalData = [
  {
    id: 'calf',
    name: '송아지',
    icon: '🐮',
    dosage: '1회 15~30ml (증상시 1일 2회 급여)',
    effects: [
      '로타·코로나·대장균 바이러스 및 독소 강력 흡착 배출',
      '장 점막 물리적 보호막 형성으로 탈수 예방',
      '설사 발병 즉시 투여 시 24시간 이내 분변 경도 정상화'
    ],
    highlight: '한우/젖소 신생 송아지 설사 고농축 흡착제'
  },
  {
    id: 'piglet',
    name: '갓난돼지 (자돈)',
    icon: '🐷',
    dosage: '1회 2~5ml (주사기 입안 직투여)',
    effects: [
      '포유자돈 수인성 설사 및 유제품 흡수 장애 진정',
      '장내 유해균 바실러스 서브틸리스 길항작용으로 정상화',
      '이유 전 자돈 폐사율 대폭 감소'
    ],
    highlight: '양돈 농가 포유자돈 위장관 보호 필수품'
  },
  {
    id: 'goat',
    name: '새끼 염소',
    icon: '🐐',
    dosage: '1회 5~10ml (1일 2회)',
    effects: [
      '초유 미흡 새끼 염소 장 점막 세포 급성 소화불량 치료',
      '나노 몬모릴로나이트 고순도 입자로 독소 흡착',
      '기력 회복 및 사료 섭취 의욕 촉진'
    ],
    highlight: '흑염소/산양 농가 신생아 설사 구원투수'
  },
  {
    id: 'lamb',
    name: '새끼 양',
    icon: '🐑',
    dosage: '1회 5~10ml (1일 2회)',
    effects: [
      '신생 양 수분/전해질 균형 유지 및 설사 억제',
      '장내 세균총 생태계 유용한 프로바이오틱스 증식'
    ],
    highlight: '면양/양 사육 농가 신생아 안정제'
  },
  {
    id: 'foal',
    name: '망아지 (말)',
    icon: '🐴',
    dosage: '1회 20~40ml (1일 2회)',
    effects: [
      '프리미엄 경주마/승용마 망아지 위장 점막 손상 경감',
      '급성 중독성 설사 독소 물리적 정화'
    ],
    highlight: '말 신생아 급성 설사 긴급 장 점막 가드'
  }
];

export default function AnimalSelector() {
  const [selectedAnimal, setSelectedAnimal] = useState(animalData[0]);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 my-12 border border-blue-500/30 shadow-2xl">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-black rounded-full uppercase tracking-wider border border-blue-400/30">
          🐾 전 축종 신생아 맞춤 솔루션
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
          모든 동물의 신생아 설사, 파보겔(Parvogel) 하나로!
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          동물 축종을 선택하시면 권장 용량 및 지사 효과를 확인하실 수 있습니다.
        </p>
      </div>

      {/* 탭 버튼 목록 */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
        {animalData.map((animal) => {
          const isSelected = selectedAnimal.id === animal.id;
          return (
            <button
              key={animal.id}
              onClick={() => setSelectedAnimal(animal)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105 ring-2 ring-blue-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-base sm:text-lg">{animal.icon}</span>
              <span>{animal.name}</span>
            </button>
          );
        })}
      </div>

      {/* 디테일 카드 */}
      <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-left w-full md:w-2/3">
          <div className="inline-block px-3 py-1 bg-blue-900/60 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30">
            💡 {selectedAnimal.highlight}
          </div>
          <h4 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>{selectedAnimal.icon}</span> {selectedAnimal.name} 맞춤 투여 가이드
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            {selectedAnimal.effects.map((effect, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">✓</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-1/3 bg-slate-900 p-4 rounded-xl border border-blue-500/40 text-center">
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">권장 급여 용량</span>
          <span className="text-sm sm:text-base font-black text-amber-400 block mt-1">
            {selectedAnimal.dosage}
          </span>
          <span className="text-[11px] text-slate-400 block mt-2">
            * 초미세 나노 몬모릴로나이트 고농축 액상 제제
          </span>
        </div>
      </div>
    </div>
  );
}
