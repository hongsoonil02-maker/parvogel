import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(-1); // 기본 모두 닫힘

  const faqs = [
    {
      id: 'faq-medication',
      q: t('faq.q1', '동물병원 약이랑 같이 먹여도 되나요?'),
      a: t('faq.a1', '네, 같이 먹여도 됩니다! 단, 파보겔의 주성분인 고순도 나노 몬모릴로나이트는 장에서 독소랑 약 성분을 같이 흡착할 수 있어요. 그래서 **병원 약 먹이고 1~2시간 뒤에 파보겔을 주세요.** 이렇게 시간만 띄우면 서로 방해 없이 둘 다 제 역할을 다 할 수 있습니다.'),
      badge: t('faq.badge.medication', '병용 요령'),
      icon: '💊'
    },
    {
      id: 'faq-safety',
      q: t('faq.q2', '아기 강아지/고양이, 노령견, 임신한 아이도 괜찮나요?'),
      a: t('faq.a2', '네, **전 연령, 전 생애주기 안심하고 먹일 수 있습니다.**\n\n이유는 간단해요: 파보겔은 **몸속으로 흡수되지 않아요.** 장 벽을 부드럽게 감싸고(코팅), 나쁜 독소만 자석처럼 끌어당겨 변으로 배출만 시키거든요. 간이랑 신장에서 대사되는 화학 약물이 아니라서, 생후 30일 된 아기부터 노령견, 임신한 엄마, 간·신장 약한 아이까지 부담 제로입니다.'),
      badge: t('faq.badge.safety', '안전성'),
      icon: '🛡️'
    },
    {
      id: 'faq-stool-color',
      q: t('faq.q3', '먹이고 나서 변 색이 검거나 회색으로 변했어요, 괜찮은 건가요?'),
      a: t('faq.a3', '**완전 정상입니다! 안심하세요.**\n\n파보겔에 들어간 천연 미네랄(몬모릴로나이트)이 장 안의 나쁜 독소랑 노폐물을 싹 흡착해서 변이랑 같이 내보내거든요. 그래서 변 색이 일시적으로 진한 회색이나 검게 나올 수 있어요. 이건 **"독소가 잘 빠져나가고 있다"**는 증거니까 오히려 좋은 신호입니다. 며칠 지나면 다시 정상 색으로 돌아와요.'),
      badge: t('faq.badge.stool', '복용 반응'),
      icon: '💩'
    },
    {
      id: 'faq-storage',
      q: t('faq.q4', '개봉 후 어떻게 보관하나요? 유통기한은요?'),
      a: t('faq.a4', '냉장고 **필요 없습니다!** 상온(1~30℃) 그늘진 곳에 두시면 **제조일로부터 18개월** 든든해요.\n\n- 거실 서랍, 펫 구급함, 산책 가방 어디든 OK\n- 쓰신 뒤엔 펌프 캡만 꼭 닫아주세요 (이물질 방지)\n- 여름철 차 안 같은 뜨거운 곳만 피하면 됩니다'),
      badge: t('faq.badge.storage', '보관 방법'),
      icon: '📦'
    },
    {
      id: 'faq-early-care',
      q: t('faq.q5', '설사는 아닌데 밥 안 먹고 구역질만 할 때도 먹여도 되나요?'),
      a: t('faq.a5', '**바로 그때가 파보겔 타이밍입니다!**\n\n놀긴 하는데 밥 거부하고 헛구역질만 한다면, 장이 "나 아파요" 신호 보내는 거예요. 이럴 때 굶기면 탈수·전해질 불균형으로 급격히 나빠져요.\n\n**수의사 추천 초기 케어법:**\n- 억지로 먹이지 말고 **입에 1ml(펌프 1번)만 살짝 묻혀주기**\n- **2~3시간마다** 소량씩 반복\n- 아이가 스스로 핥아먹으며 속이 편해지면 식욕 돌아와요\n\n협업 동물병원에서 월 60병 이상 쓰는 검증된 방법이에요.'),
      badge: t('faq.badge.early', '초기 케어·급여 팁'),
      icon: '💧'
    },
    {
      id: 'faq-birds',
      q: t('faq.q6', '앵무새, 햄스터 같은 소동물에게도 먹여도 되나요?'),
      a: t('faq.a6', '**네, 아주 안전합니다!** 체구 작은 아이일수록 파보겔이 더 빛나요.\n\n- **앵무새/반려조:** 부리 끝에 **1~2방울(0.1~0.2ml)**만 톡 묻혀주세요. 물에 타서 줘도 좋아요.\n- **햄스터/기니피그/고슴도치:** 입가에 **콩알만큼**만 발라주면 스스로 핥아먹어요.\n- **파충류/양서류:** 이유식이나 물에 소량 섞어 급여\n\n화학 약물 아니니까 간·신장 부담 제로, 흡수 안 되니까 과다 복용 걱정도 없어요.'),
      badge: t('faq.badge.birds', '조류/소동물'),
      icon: '🐦'
    },
    {
      id: 'faq-dosage',
      q: t('faq.q7', '우리 아이 체중별로 얼마나, 어떻게 주면 되나요?'),
      a: t('faq.a7', '**체중별 1일 권장량 (펌프 1번 = 약 1ml 기준):**\n\n| 체중 | 1일 총량 | 급여 횟수 | 팁 |\n|------|----------|-----------|-----|\n| 1~3kg (초소형) | 1~2ml | 하루 1~2번 | 입가나 앞발에 살짝 |\n| 3~5kg (소형) | 2~4ml | 하루 2번 | 아침·저녁 1펌프씩 |\n| 5~15kg (중형) | 4~8ml | 하루 2~4번 | 체중 5kg당 2~4ml |\n| 15kg+ (대형) | 8~12ml | 하루 3~4번 | 나눠서 급여 |\n| 고양이 (전 연령) | 1~2ml | 하루 1~2번 | 잇몸이나 앞발에 |\n| 앵무새/소형조 | 0.1~0.3ml | 하루 2~3번 | 부리 끝에 1~2방울 |\n\n**응급 시(구토·설사 심할 때):** 2~4시간마다 1~2펌프씩 집중 케어\n**평상시 장 케어:** 하루 1~2번 간식처럼 1펌프'),
      badge: t('faq.badge.dosage', '급여 가이드'),
      icon: '⚖️'
    },
    {
      id: 'faq-difference',
      q: t('faq.q8', '시중 지사제(로페라마이드 등)랑 뭐가 다른가요?'),
      a: t('faq.a8', '**완전히 다른 원리입니다.**\n\n| 구분 | 일반 화학 지사제 | 파보겔 |\n|------|------------------|--------|\n| **작용** | 장 운동을 **강제로 멈춤** | 장 벽 **코팅 + 독소만 흡착 배출** |\n| **독소** | 장 안에 **가둠** | 변으로 **싹 배출** |\n| **장기 부담** | 간·신장 대사 **부담 있음** | 체내 흡수 **0% (부담 제로)** |\n| **급여** | 주사기 강제, 거품 구토 | 1초 펌프, **스스로 핥아먹음** |\n| **대상** | 어린이/노령 주의 | **생후 30일~ 전 연령 안심** |\n\n설사는 몸이 "나쁜 거 내보내려" 하는 자연 방어예요. 장을 마비시키면 독소가 안에 갇혀 더 위험해져요. 파보겔은 장은 살리고 독소만 내보내는 **똑똑한 케어**입니다.'),
      badge: t('faq.badge.difference', '차이점'),
      icon: '🔬'
    },
    {
      id: 'faq-buy',
      q: t('faq.q9', '어디서 사나요? 정품 확인은 어떻게 하나요?'),
      a: t('faq.a9', '**공식 입점몰 3곳에서만 정품 구매 가능합니다:**\n\n1. 💬 **카카오 쇼핑하기** (톡딜, 카카오페이) — 가장 빠름\n2. 🟢 **네이버 스마트스토어** (네이버페이, 적립금)\n3. 🚀 **쿠팡 로켓배송** (내일 새벽 도착)\n\n그 외 G마켓, 옥션, 11번가, 토스쇼핑에도 공식 입점되어 있어요.\n\n⚠️ **주의:** 중고거래, 비공식 셀러, 해외직구 제품은 정품 보장 안 돼요. 꼭 위 공식몰에서 구매하세요!\n\n📞 급한 문의: **010-5407-5708** (카카오톡 채널도 운영 중)'),
      badge: t('faq.badge.buy', '구매 안내'),
      icon: '🛒'
    }
  ];

  return (
    <section id="faq" className="py-6 sm:py-8 lg:py-10 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-primary-100 text-primary-900 border border-primary-200 mb-3">
            {t('faq.badge', 'FAQ')}
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
                      <div className="flex-1 whitespace-pre-line text-slate-700 prose prose-sm max-w-none">
                        {faq.a.split('\n').map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0">{line}</p>
                        ))}
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
            <p className="font-bold text-slate-900 text-sm sm:text-base">더 궁금한 점이 있으신가요?</p>
            <p className="text-xs sm:text-sm text-slate-700 mt-0.5">체중별 정확한 급여량, 증상별 케어법, 정품 구매까지 친절히 안내해 드려요.</p>
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
              href="tel:010-5407-5708"
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>📞</span>
              <span>{t('faq.cta.phone', '010-5407-5708 전화')}</span>
            </a>
          </div>
        </div>

        {/* 중요 안내: 파보겔 vs 몬스멕타 분리 */}
        <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
            <span>⚠️</span>
            <span>{t('faq.notice.title', '중요: 파보겔과 몬스멕타는 다른 제품입니다')}</span>
          </p>
          <div className="mt-2 text-xs text-amber-800 space-y-1">
            <p>• <strong>파보겔</strong>: {t('faq.notice.parvogel', '온라인 쇼핑몰 전용(카카오/쿠팡/네이버), 보호자 직접 구매, 가정 상비겔')}</p>
            <p>• <strong>몬스멕타</strong>: {t('faq.notice.monsmecta', '동물병원 전용, 수의사 처방/판매, 임상 처방 라인업(HEPAMAX/RENAL DETOX)')}</p>
            <p>{t('faq.notice.guide', '동물병원 진료 시에는 몬스멕타를, 가정 상비용으로는 파보겔을 준비해 주세요.')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
