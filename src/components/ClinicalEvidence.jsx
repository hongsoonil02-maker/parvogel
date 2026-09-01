import React from 'react';
import { useTranslation } from 'react-i18next';

const ClinicalEvidence = () => {
  const { t } = useTranslation();
  const [selectedVirus, setSelectedVirus] = React.useState(null);

  // ESC 키로 모달 닫기
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedVirus) {
        setSelectedVirus(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVirus]);

  return (
    <section id="clinical" className="py-[1.8rem] md:py-[3.6rem] bg-slate-100 border-y border-slate-200 overflow-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary-900 break-keep">{t('clinical.title', '학술 검증 및 임상 시험 데이터')}</h2>
          <div className="w-24 h-1.5 bg-accent-400 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 w-full min-w-0">

          {/* Card 1: LIQI Technology Comparison Table */}
          <div className="bg-white min-w-0 p-4 sm:p-6 md:p-9 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-3 break-keep">
                <span className="w-9 h-9 rounded-full shrink-0 bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-md">1</span>
                <span>{t('clinical.card1_title', '초미세공정 기술 차별성')}</span>
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm md:text-base font-normal">
                {t('clinical.card1_desc', '파보겔의 핵심 기술인 올트라파인 초미세공정이 기존 정장지사제 원료와 비교하여 압도적인 성능을 입증합니다.')}
              </p>
              <div className="w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm mb-6">
                <table className="w-full text-xs border-collapse table-fixed">
                  <colgroup>
                    <col style={{width: '26%'}} />
                    <col style={{width: '30%'}} />
                    <col style={{width: '22%'}} />
                    <col style={{width: '22%'}} />
                  </colgroup>
                  <thead>
                    <tr className="bg-primary-700 text-white">
                      <th className="px-1 sm:px-2 py-2.5 sm:py-3.5 text-center font-bold text-[10px] sm:text-xs break-words leading-tight">{t('clinical.table1_col1', '지표')}</th>
                      <th className="px-1 sm:px-2 py-2.5 sm:py-3.5 text-center font-bold text-[10px] sm:text-xs bg-primary-800 break-words leading-tight">{t('clinical.table1_col2', '파보겔 고순도 초미세 나노 몬모릴로나이트')}</th>
                      <th className="px-1 sm:px-2 py-2.5 sm:py-3.5 text-center font-bold text-[10px] sm:text-xs break-words leading-tight">{t('clinical.table1_col3', '약품등급 몬모릴로나이트')}</th>
                      <th className="px-1 sm:px-2 py-2.5 sm:py-3.5 text-center font-bold text-[10px] sm:text-xs break-words leading-tight">{t('clinical.table1_col4', '일반 몬모릴로나이트')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-primary-50/50 transition-colors">
                      <td className="px-1 sm:px-2 py-3 text-center font-bold text-slate-700 text-[10px] sm:text-xs break-words">{t('clinical.table1_row1_label', '표면적 m²/g')}</td>
                      <td className="px-1 sm:px-2 py-3 text-center font-black text-primary-700 text-xs sm:text-sm bg-primary-50/80 break-all">{t('clinical.table1_row1_val1', '≥800')}</td>
                      <td className="px-1 sm:px-2 py-3 text-center text-slate-500 text-[10px] sm:text-xs break-all">{t('clinical.table1_row1_val2', '71 *')}</td>
                      <td className="px-1 sm:px-2 py-3 text-center text-slate-500 text-[10px] sm:text-xs break-all">{t('clinical.table1_row1_val3', '≥100')}</td>
                    </tr>
                    <tr className="hover:bg-primary-50/50 transition-colors">
                      <td className="px-1 sm:px-2 py-3 text-center font-bold text-slate-700 text-[10px] sm:text-xs break-words">{t('clinical.table1_row2_label', '입자도 (um) D90')}</td>
                      <td className="px-1 sm:px-2 py-3 text-center font-black text-red-600 text-xs sm:text-sm bg-primary-50/80 break-all">{t('clinical.table1_row2_val1', '≤6.5')}</td>
                      <td className="px-1 sm:px-2 py-3 text-center text-slate-500 text-[10px] sm:text-xs break-all">{t('clinical.table1_row2_val2', '≥200')}</td>
                      <td className="px-1 sm:px-2 py-3 text-center text-slate-500 text-[10px] sm:text-xs break-all">{t('clinical.table1_row2_val3', '≥325')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 하단 균형용 핵심 요약 박스 */}
            <div className="bg-primary-50/90 border border-primary-200 rounded-2xl p-4 text-xs font-medium text-primary-900 leading-relaxed shadow-sm flex flex-col gap-3">
              <div>
                <span className="font-bold text-sm mb-1 flex items-start gap-1">
                  <span className="shrink-0">💡</span>
                  <span className="break-keep">{t('clinical.techSummaryTitle', '초미세공정 핵심 기술')}</span>
                </span>
                <div className="break-keep">
                  {t('clinical.techSummaryBody', '일반 몬모릴로나이트 대비 표면적 8배 이상(≥800 m²/g), 입자도 50배 이상 초미세화(≤6.5 µm)를 통해 장내 독소 및 유해 바이러스의 물리적 흡착 배출 성능을 극대화하였습니다.')}
                </div>
              </div>
              <div className="pt-2.5 border-t border-primary-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-primary-900 font-semibold flex items-start gap-1">
                  <span className="shrink-0">📚</span>
                  <span className="break-keep">{t('clinical.paperRef1', 'Smectite & Montmorillonite 독소 흡착·지사 글로벌 연구 자료')}</span>
                </span>
                <a
                  href="https://www.google.com/search?q=smectite+and+montmorillonite+adsorption"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 shrink-0 bg-primary-700 hover:bg-primary-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <span>🔍</span>
                  <span className="break-keep">{t('clinical.searchGoogle', 'Google 학술 논문 검색')}</span>
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Clinical Efficacy Test Data */}
          <div className="bg-white min-w-0 p-4 sm:p-6 md:p-9 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-3 break-keep">
                <span className="w-9 h-9 rounded-full shrink-0 bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-md">2</span>
                <span>{t('clinical.card2_title', '임상 효능 시험 데이터')}</span>
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm md:text-base font-normal">
                {t('clinical.card2_desc', '경상국립대 수의과대학 이후장 교수님 연구진의 학술적 근거를 바탕으로 한 시험 결과입니다.')}
              </p>
              <div className="space-y-3.5">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-primary-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-sm break-keep">{t('clinical.table2_row1_label', '곰팡이 독소 (AFB1)')}</span>
                    <span className="text-primary-700 font-black text-lg">98.5%</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t('clinical.table2_row1_cond', '100 ppm 농도 노출')}</p>
                  <p className="text-xs font-bold text-primary-700">{t('clinical.table2_row1_result', '98.5% 흡착 제거')}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-primary-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-sm break-keep">{t('clinical.table2_row2_label', '위내 산도 완충')}</span>
                    <span className="text-primary-700 font-black text-lg">pH 4.5~5.5</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t('clinical.table2_row2_cond', 'pH 2.0 (위산 환경)')}</p>
                  <p className="text-xs font-bold text-primary-700">{t('clinical.table2_row2_result', 'pH 4.5~5.5 유지')}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-primary-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-sm break-keep">{t('clinical.table2_row3_label', '임상 회복 속도')}</span>
                    <span className="text-primary-700 font-black text-base">{t('clinical.table2_row3_value', '회복 단축 보조')}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t('clinical.table2_row3_cond', '파보 장염 환축 약 6,000례 임상 경험')}</p>
                  <p className="text-xs font-bold text-primary-700">{t('clinical.table2_row3_result', '증상 회복 기간 단축에 도움')}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-primary-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-sm break-keep">{t('clinical.table2_row4_label', '바이러스 증식 억제')}</span>
                    <span className="text-primary-700 font-black text-base">{t('clinical.table2_row4_value', '증식 억제에 도움')}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t('clinical.table2_row4_cond', '바실러스 서브틸리스 병용')}</p>
                  <p className="text-xs font-bold text-primary-700">{t('clinical.table2_row4_result', '증식 억제에 도움')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Antiviral Effects Table */}
          <div className="bg-white min-w-0 p-4 sm:p-6 md:p-9 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-3 break-keep">
                <span className="w-9 h-9 rounded-full shrink-0 bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-md">3</span>
                <span>{t('clinical.card3_title', '항바이러스 효과 (바실러스 서브틸리스)')}</span>
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm md:text-base font-normal">
                {t('clinical.card3_desc', 'DNG-1000의 핵심 균주인 Bacillus subtilis MORI가 생산하는 DNJ 성분의 바이러스 계통별 억제 효과입니다.')}
              </p>
              <div className="w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm mb-6">
                <table className="w-full text-sm border-collapse table-fixed">
                  <colgroup>
                    <col style={{width: '32%'}} />
                    <col style={{width: '46%'}} />
                    <col style={{width: '22%'}} />
                  </colgroup>
                  <thead>
                    <tr className="bg-primary-700 text-white">
                      <th className="px-3 py-3 text-left font-bold text-xs">{t('clinical.table3_col1', '바이러스 계통')}</th>
                      <th className="px-3 py-3 text-left font-bold text-xs">{t('clinical.table3_header', '대상 바이러스')}</th>
                      <th className="px-1 py-3 text-center font-bold text-xs">{t('clinical.table3_col3', '효과')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-primary-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-xs text-slate-500 break-words font-medium">Arteriviruses</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-700 break-keep">{t('clinical.table3_row1', 'PRRSV (돼지생식기호흡기증후군)')}</td>
                      <td className="px-1 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedVirus({
                            group: 'Arteriviruses',
                            target: t('clinical.table3_row1', 'PRRSV (돼지생식기호흡기증후군)'),
                            efficacy: t('clinical.table3_effect', '효과 확인'),
                            desc: t('clinical.virusDescArteri', 'DNG-1000 핵심 균주(Bacillus subtilis MORI)가 생산하는 DNJ 성분의 동맥바이러스 복제 억제 기전 입증')
                          })}
                          className="inline-flex items-center justify-center bg-primary-100 hover:bg-primary-600 hover:text-white text-primary-800 text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                          aria-label={`${t('clinical.table3_row1', 'PRRSV')} 효과 확인 모달 열기`}
                        >
                          {t('clinical.table3_effect', '효과 확인')}
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-primary-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-xs text-slate-500 break-words font-medium">Orthomyxoviridae</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-700 break-keep">{t('clinical.table3_row2', '조류독감 A (AIV)')}</td>
                      <td className="px-1 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedVirus({
                            group: 'Orthomyxoviridae',
                            target: t('clinical.table3_row2', '조류독감 A (AIV)'),
                            efficacy: t('clinical.table3_effect', '효과 확인'),
                            desc: t('clinical.virusDescOrtho', '오르토믹소바이러스과 인플루엔자 바이러스 외피 단백질 합성 억제 및 증식 저해 효과 확인')
                          })}
                          className="inline-flex items-center justify-center bg-primary-100 hover:bg-primary-600 hover:text-white text-primary-800 text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                          aria-label={`${t('clinical.table3_row2', '조류독감 A')} 효과 확인 모달 열기`}
                        >
                          {t('clinical.table3_effect', '효과 확인')}
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-primary-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-xs text-slate-500 break-words font-medium">Pestiviruses</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-700 break-keep">{t('clinical.table3_row3', '소 바이러스성 설사병 (BVDV)')}</td>
                      <td className="px-1 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedVirus({
                            group: 'Pestiviruses',
                            target: t('clinical.table3_row3', '소 바이러스성 설사병 (BVDV)'),
                            efficacy: t('clinical.table3_effect', '효과 확인'),
                            desc: t('clinical.virusDescPesti', '소화기 감염 페스티바이러스 복제 억제 및 장점막 손상 완화 보조 작용 입증')
                          })}
                          className="inline-flex items-center justify-center bg-primary-100 hover:bg-primary-600 hover:text-white text-primary-800 text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                          aria-label={`${t('clinical.table3_row3', '소 바이러스성 설사병')} 효과 확인 모달 열기`}
                        >
                          {t('clinical.table3_effect', '효과 확인')}
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-primary-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-xs text-slate-500 break-words font-medium">Bunyaviridae</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-700 break-keep">{t('clinical.table3_row4', '아카바네, 아이노 바이러스')}</td>
                      <td className="px-1 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedVirus({
                            group: 'Bunyaviridae',
                            target: t('clinical.table3_row4', '아카바네, 아이노 바이러스'),
                            efficacy: t('clinical.table3_effect', '효과 확인'),
                            desc: t('clinical.virusDescBunya', '부냐바이러스과 아카바네 및 아이노 바이러스에 대한 항바이러스 활성 및 증식 저해 확인')
                          })}
                          className="inline-flex items-center justify-center bg-primary-100 hover:bg-primary-600 hover:text-white text-primary-800 text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                          aria-label={`${t('clinical.table3_row4', '아카바네, 아이노 바이러스')} 효과 확인 모달 열기`}
                        >
                          {t('clinical.table3_effect', '효과 확인')}
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-primary-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-xs text-slate-500 break-words font-medium">Rhabdoviridae</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-700 break-keep">{t('clinical.table3_row5', '소유행열 바이러스 (BEF)')}</td>
                      <td className="px-1 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedVirus({
                            group: 'Rhabdoviridae',
                            target: t('clinical.table3_row5', '소유행열 바이러스 (BEF)'),
                            efficacy: t('clinical.table3_effect', '효과 확인'),
                            desc: t('clinical.virusDescRhabdo', '랍도바이러스과 소유행열 바이러스에 대한 유의미한 증식 억제 효과 검증')
                          })}
                          className="inline-flex items-center justify-center bg-primary-100 hover:bg-primary-600 hover:text-white text-primary-800 text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                          aria-label={`${t('clinical.table3_row5', '소유행열 바이러스')} 효과 확인 모달 열기`}
                        >
                          {t('clinical.table3_effect', '효과 확인')}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 하단 균형용 연구 요약 박스 */}
            <div className="bg-primary-50/90 border border-primary-200 rounded-2xl p-4 text-xs font-medium text-primary-900 leading-relaxed shadow-sm flex flex-col gap-3">
              <div>
                <span className="font-bold text-sm mb-1 flex items-start gap-1">
                  <span className="shrink-0">🔬</span>
                  <span className="break-keep">{t('clinical.antiviralSummaryTitle', '항바이러스 학술 검증')}</span>
                </span>
                <div className="break-keep">
                  {t('clinical.antiviralSummaryBody', 'DNG-1000 핵심 균주(Bacillus subtilis MORI)가 생산하는 DNJ 성분이 소, 돼지, 조류 등 주요 5대 바이러스 계통의 증식을 유의미하게 억제함을 입증하였습니다.')}
                </div>
              </div>
              <div className="pt-2.5 border-t border-primary-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-primary-900 font-semibold flex items-start gap-1">
                  <span className="shrink-0">📚</span>
                  <span className="break-keep">{t('clinical.paperRef2', '1-Deoxynojirimycin(DNJ) 학술 논문 및 글로벌 연구 자료')}</span>
                </span>
                <a
                  href="https://www.google.com/search?q=1-deoxynojirimycin+antiviral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 shrink-0 bg-primary-700 hover:bg-primary-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <span>🔍</span>
                  <span className="break-keep">{t('clinical.searchGoogle', 'Google 학술 논문 검색')}</span>
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Card 4: Expert Review Meeting Feedback */}
          <div className="bg-white min-w-0 p-4 sm:p-6 md:p-9 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-3 break-keep">
                <span className="w-9 h-9 rounded-full shrink-0 bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-md">4</span>
                <span>{t('clinical.card4_title', '전문가 리뷰 미팅 피드백')}</span>
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm md:text-base font-normal">
                {t('clinical.card4_desc', '파보겔은 현재 수의학계 전문가들과의 리뷰 미팅을 통해 임상 데이터를 검증받고 있습니다.')}
              </p>
              <div className="space-y-3.5">
                <div className="bg-gradient-to-r from-primary-50/80 to-slate-50 p-4 rounded-2xl border-l-4 border-primary-600 shadow-sm">
                  <p className="text-slate-700 italic font-medium text-xs md:text-sm leading-relaxed mb-2">{t('clinical.card4_quote1', '"1-Deoxynojirimycin(DNJ)의 여러 바이러스 억제 효과와 차별화된 유해물질 흡착력은 확실한 차별점입니다."')}</p>
                  <p className="text-xs font-bold text-primary-800">— {t('clinical.card4_quote1_author', '박봉균 교수 (전 농림축산검역본부장, 바이러스학 분야 권위자)')}</p>
                </div>
                <div className="bg-gradient-to-r from-amber-50/80 to-slate-50 p-4 rounded-2xl border-l-4 border-amber-500 shadow-sm">
                  <p className="text-slate-700 italic font-medium text-xs md:text-sm leading-relaxed mb-2">{t('clinical.card4_quote4', '"인체에도 좋을 거 같은데..."')}</p>
                  <p className="text-xs font-bold text-amber-800">— {t('clinical.card4_quote4_author', '윤화영 교수 (전 서울대학교 수의과대학 내과학 교수 · 전 서울대 동물병원 내과과장)')}</p>
                </div>
                <div className="bg-gradient-to-r from-primary-50/80 to-slate-50 p-4 rounded-2xl border-l-4 border-primary-600 shadow-sm">
                  <p className="text-slate-700 italic font-medium text-xs md:text-sm leading-relaxed mb-2">{t('clinical.card4_quote2', '"입자도, 수분 흡수율, 비표면적... 수의사가 원하는 데이터를 다 갖췄습니다."')}</p>
                  <p className="text-xs font-bold text-primary-800">— {t('clinical.card4_quote2_author', '정성대 원장 (동진동물병원)')}</p>
                </div>
                <div className="bg-gradient-to-r from-amber-50/80 to-slate-50 p-4 rounded-2xl border-l-4 border-amber-500 shadow-sm">
                  <p className="text-slate-700 italic font-medium text-xs md:text-sm leading-relaxed mb-2">{t('clinical.card4_quote3', '"단순 설사 치료를 넘어 구토·복통 환축도 잘 받아먹는 압도적 기호성과 즉각적 복통 완화로, 소화기 트러블 전체의 1차 상비·처방 보조제로 필수적입니다."')}</p>
                  <p className="text-xs font-bold text-amber-800">— {t('clinical.card4_quote3_author', '김동준 원장 (사랑동물병원 원장)')}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-5 bg-amber-50/90 border border-amber-200 rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-medium text-amber-900 leading-relaxed">📌 {t('clinical.card4_note', '파보겔의 학술·자문단은 (전)서울대학교 수의과대학 출신 등 수의학 전문가들로 구성되어 임상 데이터와 급여 기준을 철저히 검증하고 있습니다.')}</p>
            </div>
          </div>

        </div>
      </div>

      {/* 효과 확인 상세 검증 모달 (z-[85]) */}
      {selectedVirus && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedVirus(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t('clinical.modalTitle', '항바이러스 임상 효과 상세 검증')}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedVirus(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label={t('common.close', '닫기')}
            >
              ✕
            </button>

            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold shadow-xs">
                🔬
              </span>
              <div>
                <span className="text-xs font-black text-primary-600 uppercase tracking-wider">
                  {selectedVirus.group}
                </span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 break-keep">
                  {selectedVirus.target}
                </h4>
              </div>
            </div>

            {/* 데이터 요약 카드 */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-4 space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-bold">{t('clinical.table3_col3', '임상 효과')}</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  <span>✓</span>
                  <span>{selectedVirus.efficacy}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-1">{t('clinical.mechanismLabel', '검증 연구 및 작용 기전')}</span>
                <p className="font-medium text-slate-800 leading-relaxed break-keep">
                  {selectedVirus.desc}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-500 text-[11px] leading-normal break-keep">
                📌 {t('clinical.researchBasis', '경상국립대학교 수의과대학 이후장 교수 연구진 학술 연구 데이터 기반')}
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="flex gap-2">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent('1-deoxynojirimycin ' + selectedVirus.group + ' antiviral')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer"
              >
                <span>🔍 Google 학술 논문 검색</span>
              </a>
              <button
                onClick={() => setSelectedVirus(null)}
                className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {t('common.close', '닫기')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClinicalEvidence;
