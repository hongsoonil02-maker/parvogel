import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function renderInlineBold(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function renderFormattedAnswer(answer) {
  const lines = String(answer || '').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    // Markdown table block
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      const parseRow = (row) =>
        row
          .slice(1, -1)
          .split('|')
          .map((cell) => cell.trim());

      const isDivider = (row) => /^\|[\s\-:|]+\|$/.test(row);
      const header = tableLines.length > 0 ? parseRow(tableLines[0]) : [];
      const bodyRows = tableLines
        .slice(1)
        .filter((row) => !isDivider(row))
        .map(parseRow);

      blocks.push(
        <div key={`table-${blocks.length}`} className="overflow-x-auto my-3">
          <table className="w-full text-xs sm:text-sm border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                {header.map((col, cIdx) => (
                  <th key={cIdx} className="px-3 py-2 text-left font-bold border-b border-slate-200">
                    {renderInlineBold(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((cells, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-100 last:border-b-0">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700 align-top">
                      {renderInlineBold(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Bullet list block
    if (trimmed.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push(
        <ul key={`list-${blocks.length}`} className="list-disc pl-5 space-y-1 my-2 text-slate-700">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineBold(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    blocks.push(
      <p key={`p-${blocks.length}`} className="mb-2 last:mb-0">
        {renderInlineBold(trimmed)}
      </p>
    );
    i += 1;
  }

  return blocks;
}

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(-1); // 기본 모두 닫힘

  const faqs = [
    {
      id: 'faq-medication',
      q: t('faq.q1', '동물병원 약이랑 같이 먹여도 되나요?'),
      a: t('faq.a1', '네, 같이 급여할 수 있습니다. 다만 파보겔의 주성분인 고순도 나노 몬모릴로나이트는 장에서 유해 물질과 약 성분을 함께 흡착할 수 있으므로, **병원 처방약 투약 전후 1~2시간 간격**을 두고 급여하시는 것을 권장합니다. (구체적인 병용은 담당 수의사 상담 권장)'),
      badge: t('faq.badges.medication', '병용 요령'),
      icon: '💊'
    },
    {
      id: 'faq-safety',
      q: t('faq.q2', '아기 강아지/고양이, 노령견, 임신한 아이도 괜찮나요?'),
      a: t('faq.a2', '네, **전 연령·전 생애주기 반려동물에게 부담이 낮은 보조사료**입니다.\n\n파보겔은 **체내에 흡수되지 않고(흡수율 0%)** 장 점막을 부드럽게 감싸며 유해 물질만 흡착해 대변으로 배출되도록 돕습니다. 간·신장에서 대사되는 화학 약물이 아니므로 생후 30일령 전후 자견·자묘, 노령견·노령묘, 임신 모체에도 부담이 낮습니다.'),
      badge: t('faq.badges.safety', '안전성'),
      icon: '🛡️'
    },
    {
      id: 'faq-stool-color',
      q: t('faq.q3', '먹이고 나서 변 색이 검거나 회색으로 변했어요, 괜찮은 건가요?'),
      a: t('faq.a3', '**자연스러운 반응입니다.**\n\n파보겔에 함유된 천연 미네랄(몬모릴로나이트)이 장내 유해 물질과 노폐물을 흡착해 대변과 함께 배출되면서 일시적으로 변 색이 짙은 회색이나 어둡게 보일 수 있습니다. 급여를 중단하거나 며칠 지나면 정상 색으로 돌아옵니다.'),
      badge: t('faq.badges.stool', '복용 반응'),
      icon: '💩'
    },
    {
      id: 'faq-storage',
      q: t('faq.q4', '개봉 후 어떻게 보관하나요? 유통기한은요?'),
      a: t('faq.a4', '냉장 보관 **필요 없습니다.** 직사광선을 피한 상온(1~30℃)에 보관하시면 **제조일로부터 18개월** 사용 가능합니다.\n\n- 거실 서랍, 펫 구급함, 산책 가방 등 상온 보관 OK\n- 사용 후에는 펌프 캡을 꼭 닫아 보관해 주세요\n- 여름철 차량 내부 등 고온 환경만 피해 주세요'),
      badge: t('faq.badges.storage', '보관 방법'),
      icon: '📦'
    },
    {
      id: 'faq-early-care',
      q: t('faq.q5', '설사는 아닌데 밥을 안 먹고 헛구역질만 할 때도 먹여도 되나요?'),
      a: t('faq.a5', '**초기 위장 불편 신호일 때 미리 급여할 수 있습니다.**\n\n식욕이 떨어지거나 헛구역질을 할 때 무작정 장시간 굶기면 어린 강아지·고양이는 탈수나 저혈당 위험이 커질 수 있습니다.\n\n- 억지로 먹이지 말고 **입가에 1ml(1펌프)만 살짝 묻혀주기**\n- **2~3시간 간격**으로 소량씩 경과 관찰하며 급여\n- 구토·기력 저하·혈변이 지속되면 즉시 동물병원 진료를 병행해 주세요'),
      badge: t('faq.badges.early', '초기 케어·급여 팁'),
      icon: '💧'
    },
    {
      id: 'faq-birds',
      q: t('faq.q6', '앵무새, 햄스터 같은 소동물에게도 먹여도 되나요?'),
      a: t('faq.a6', '**네, 체구가 작은 반려동물에도 급여 가능합니다.**\n\n- **앵무새/반려조:** 부리 끝에 **1~2방울(0.1~0.2ml)**만 살짝 묻혀주거나 이유식·물에 소량 희석\n- **햄스터/기니피그/고슴도치:** 입가에 **콩알만큼** 살짝 발라 자발 섭취 유도\n- **파충류 등 특수동물:** 이유식이나 물에 소량 혼합 급여\n\n체내 흡수율 0%의 물리적 코팅·흡착 원리라 소형 동물에게도 간·신장 부담이 적습니다.'),
      badge: t('faq.badges.birds', '조류/소동물'),
      icon: '🐦'
    },
    {
      id: 'faq-dosage',
      q: t('faq.q7', '우리 아이 체중별로 얼마나, 어떻게 주면 되나요?'),
      a: t('faq.a7', '**체중별 1일 권장량 (펌프 1회 = 약 1ml 기준):**\n\n| 대상 / 체중 | 1일 총량 | 급여 횟수 | 급여 팁 |\n|------|----------|-----------|-----|\n| 1~3kg (초소형) | 1~2ml | 하루 1~2회 | 입가나 앞발에 살짝 |\n| 3~5kg (소형) | 2~4ml | 하루 2회 | 아침·저녁 1펌프씩 |\n| 5~15kg (중형) | 4~8ml | 하루 2~4회 | 체중 5kg당 2~4ml |\n| 15kg+ (대형) | 8~12ml | 하루 3~4회 | 나누어 급여 |\n| 고양이 (전 연령) | 1~2ml | 하루 1~2회 | 잇몸이나 앞발에 |\n| 앵무새/소형조 | 0.1~0.3ml | 하루 2~3회 | 부리 끝에 1~2방울 |\n\n**집중 케어 시:** 2~4시간 간격으로 1~2펌프씩 분할 급여 (중증 증상 시 수의사 진료 병행)\n**평상시 장 케어:** 하루 1~2회 1펌프'),
      badge: t('faq.badges.dosage', '급여 가이드'),
      icon: '⚖️'
    },
    {
      id: 'faq-difference',
      q: t('faq.q8', '일반 화학 지사제와 무엇이 다른가요?'),
      a: t('faq.a8', '**작용 원리가 완전히 다릅니다.**\n\n| 구분 | 일반 화학 지사제 | 파보겔 (보조사료) |\n|------|------------------|--------|\n| **작용 방식** | 장 운동을 **강제로 억제** | 장 점막 **코팅 + 유해 물질 흡착 배출** |\n| **장내 독소** | 장 안에 **체류 우려** | 대변과 함께 **배출 도움** |\n| **대사 부담** | 간·신장 대사 **부담 가능** | 체내 흡수 **0% (부담 낮음)** |\n| **급여 편의** | 주사기 강제 투약 스트레스 | 1초 펌프, **자발 섭취 유도** |\n| **적용 범위** | 어린 개체·노령 주의 필요 | **전 연령 반려동물 안심 급여** |\n\n파보겔은 장 운동을 억지로 멈추지 않고 장 점막 보호와 유해 물질의 물리적 배출을 돕는 보조사료입니다.'),
      badge: t('faq.badges.difference', '차이점'),
      icon: '🔬'
    },
    {
      id: 'faq-buy',
      q: t('faq.q9', '어디서 구매하나요? 정품 확인은 어떻게 하나요?'),
      a: t('faq.a9', '**(주)한국아그로 공식 온라인 판매처에서 정품을 구매하실 수 있습니다:**\n\n1. **카카오 쇼핑하기** (카카오페이 간편결제)\n2. **네이버 스마트스토어** (네이버페이 포인트 적립)\n3. **쿠팡 로켓배송** (빠른 익일 배송)\n\n그 외 G마켓, 옥션, 11번가, 토스쇼핑에도 공식 입점되어 있습니다.\n\n**주의:** 비공식 셀러나 중고 거래 제품은 정품 및 보관 상태를 보장할 수 없으므로 반드시 공식 입점몰을 이용해 주세요.\n\n고객센터 대표전화: **02-6949-5708** ((주)한국아그로 · 카카오톡 공식 채널 1:1 상담 가능)'),
      badge: t('faq.badges.buy', '구매 안내'),
      icon: '🛒'
    }
  ];

  return (
    <section id="faq" className="py-6 sm:py-8 lg:py-10 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-primary-100 text-primary-900 border border-primary-200 mb-3">
            {t('faq.eyebrow', 'FAQ')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 break-keep">
            {t('faq.title', '자주 묻는 질문')}
          </h2>
          <p className="text-slate-700 text-sm sm:text-base mt-2 break-keep">
            {t('faq.subtitle', '파보겔 급여 방법, 안전성, 구매에 대해 보호자님들이 가장 많이 물어보시는 내용을 모았습니다.')}
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  isOpen ? 'border-primary-500 ring-2 ring-primary-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    id={`faq-question-${faq.id}`}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-primary-50 text-primary-700 font-extrabold text-sm flex items-center justify-center border border-primary-200" aria-hidden="true">
                        {faq.icon}
                      </span>
                      <span className="font-bold text-slate-900 text-base sm:text-lg break-keep">
                        {faq.q}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                        {faq.badge}
                      </span>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div id={`faq-answer-${faq.id}`} role="region" aria-labelledby={`faq-question-${faq.id}`} className="px-5 pb-6 sm:px-6 sm:pb-6 text-slate-600 leading-relaxed text-sm sm:text-base border-t border-slate-100 pt-4 animate-fade-in break-keep bg-slate-50/50">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-primary-50 text-primary-700 font-extrabold text-sm flex items-center justify-center border border-primary-200 mt-0.5" aria-hidden="true">
                        {faq.icon}
                      </span>
                      <div className="flex-1 text-slate-700 max-w-none">
                        {renderFormattedAnswer(faq.a)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA 섹션 */}
        <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary-50 via-white to-primary-50 border border-primary-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-bold text-slate-900 text-sm sm:text-base">{t('faq.cta.title', '더 궁금한 점이 있으신가요?')}</p>
            <p className="text-xs sm:text-sm text-slate-700 mt-0.5">{t('faq.cta.desc', '체중별 정확한 급여량, 증상별 케어법, 정품 구매처까지 친절히 안내해 드립니다.')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="https://pf.kakao.com/_rqxnJX/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-bold text-sm sm:text-base rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 border border-amber-300"
            >
              <span>💬</span>
              <span>{t('faq.cta.kakao', '카톡 1:1 상담')}</span>
            </a>
            <a
              href="tel:02-6949-5708"
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>📞</span>
              <span>{t('faq.cta.phone', '02-6949-5708 전화')}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
