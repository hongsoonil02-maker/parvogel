import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0); // 첫 번째 질문 기본 오픈

  const faqs = [
    {
      q: t('faq.q1', '동물병원 처방약이나 항생제와 함께 급여해도 되나요?'),
      a: t('faq.a1', '네, 함께 병용 가능합니다. 다만, 파보겔의 주성분인 고순도 몬모릴로나이트는 장내 독소 및 물질을 강력하게 흡착하는 특성이 있으므로, 흡수율 간섭을 피하기 위해 병원 처방약이나 경구 항생제 투여 전후 1~2시간의 시간차를 두고 급여하시는 것을 적극 권장합니다.'),
      badge: '병용 요령'
    },
    {
      q: t('faq.q2', '태어난 지 얼마 안 된 어린 새끼나 임신한 모체에게도 안전한가요?'),
      a: t('faq.a2', '안전합니다. 파보겔의 주성분인 천연 나노 몬모릴로나이트는 체내로 화학 흡수되지 않고 장관(소화기) 내벽을 물리적으로 코팅하며 유해 독소를 흡착한 뒤 대변으로 전량 배출됩니다. 따라서 생후 30일령 전후의 자견·자묘, 갓 태어난 신생 송아지 및 임신 동물에게도 체내 부담 없이 안전하게 상비 급여할 수 있습니다.'),
      badge: '안전성'
    },
    {
      q: t('faq.q3', '급여 후 대변 색깔이 검거나 짙은 회색으로 변했는데 괜찮은가요?'),
      a: t('faq.a3', '정상적인 반응입니다. 파보겔에 함유된 고순도 미네랄 점토 광물과 흡착된 장내 노폐물이 변과 함께 체외로 배출되면서 일시적으로 짙은 회색이나 검은빛을 띨 수 있습니다. 이는 유해 독소가 잘 흡착 배출되고 있다는 증거이므로 안심하셔도 됩니다.'),
      badge: '복용 반응'
    },
    {
      q: t('faq.q4', '개봉 후 보관 방법과 유효기간은 어떻게 되나요?'),
      a: t('faq.a4', '직사광선을 피하여 상온(1~30℃)의 건랭한 곳에 보관하시면 제조일로부터 18개월간 안정적으로 보관 가능합니다. 번거로운 냉장 보관이 필요 없어 농가 축사나 가정 상비약 보관함, 진료실 등에 두고 급여하시기 최적화되어 있습니다. (단, 사용 후 펌프 캡을 닫아 이물질 혼입을 방지해 주세요.)'),
      badge: '보관 방법'
    },
    {
      q: t('faq.q5', '동물병원, 농가 대량 주문 시 세금계산서 발행 및 도매 공급이 가능한가요?'),
      a: t('faq.a5', '네, 전액 전자세금계산서 발행 및 채널별 도매가 공급이 가능합니다. 동물병원 수의사 선생님 및 축산 농가, 대량 유통 채널의 경우 신청 폼 또는 고객센터(010-5407-5708)로 문의해 주시면 사업자등록증 확인 후 수량별 공식 도매 공급가 견적서를 즉시 발송해 드립니다.'),
      badge: '도매/세금'
    }
  ];

  return (
    <section id="faq" className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 mb-3">
            {t('faq.badge', 'FAQ')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 break-keep">
            {t('faq.title', '자주 묻는 질문')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 break-keep">
            {t('faq.subtitle', '파보겔 급여 방법 및 안전성에 대해 보호자님과 수의사·농가에서 가장 많이 물으시는 내용입니다.')}
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  isOpen ? 'border-primary-500 ring-2 ring-primary-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-primary-50 text-primary-700 font-extrabold text-sm flex items-center justify-center border border-primary-200">
                      Q
                    </span>
                    <span className="font-bold text-slate-900 text-base sm:text-lg break-keep">
                      {faq.q}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                      {faq.badge}
                    </span>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-slate-600 leading-relaxed text-sm sm:text-base border-t border-slate-100 pt-4 animate-fade-in break-keep bg-slate-50/50">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-sm flex items-center justify-center border border-emerald-200 mt-0.5">
                        A
                      </span>
                      <p className="flex-1 whitespace-pre-line text-slate-700">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-5 rounded-2xl bg-primary-50 border border-primary-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-bold text-slate-900 text-sm">더 궁금한 점이 있으신가요?</p>
            <p className="text-xs text-slate-600 mt-0.5">급여 용량 또는 환축 상태에 대해 수의사/전문 상담사가 친절히 답변해 드립니다.</p>
          </div>
          <a
            href="tel:010-5407-5708"
            className="shrink-0 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>📞</span>
            <span>010-5407-5708 긴급 문의</span>
          </a>
        </div>
      </div>
    </section>
  );
}
