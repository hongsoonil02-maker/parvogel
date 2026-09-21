import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getStoreUrl } from '../config/storeLinks';

export default function MonsmectaGateway() {
  const [showVetContactModal, setShowVetContactModal] = useState(false);
  const [vetForm, setVetForm] = useState({
    hospitalName: '',
    vetName: '',
    phone: '',
    address: '',
    inquiryType: '납품/단가 문의',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleVetFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Helmet>
        <title>몬스멕타(Monsmecta) 공식 안내 — 동물병원 수의사 전용 처방 점막보호제 | (주)한국아그로</title>
        <meta
          name="description"
          content="몬스멕타(Monsmecta)는 동물병원 수의사 전용 처방 보조제입니다. 일반 온라인 유통이 엄격히 제한되며, 가정 상비용으로는 동일 나노 포뮬러의 파보겔(Parvogel)을 이용해 주시기 바랍니다."
        />
        <meta
          name="keywords"
          content="몬스멕타, monsmecta, 동물병원몬스멕타, 몬스멕타처방, 몬스멕타파보겔, 한국아그로, 동물병원설사약, 나노몬모릴로나이트"
        />
        <meta property="og:title" content="몬스멕타(Monsmecta) 공식 안내 — 동물병원 수의사 전용" />
        <meta
          property="og:description"
          content="몬스멕타는 수의사 진료 및 처방 전용 제품입니다. 일반 가정용은 파보겔 공식몰을 이용해 주세요."
        />
        <link rel="canonical" href="https://parvogel.kr/monsmecta" />
      </Helmet>

      {/* 상단 메디컬 헤더 */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/20">
              Ag
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-sm sm:text-base">(주)한국아그로</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  수의사업부
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Veterinary Healthcare Division</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs sm:text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <span>가정 상비용 [파보겔] 몰</span>
              <span className="text-blue-400">→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 히어로 섹션 */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full space-y-10">
        {/* 긴급 안내 뱃지 및 메인 타이틀 */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold animate-pulse">
            <span>🛡️</span>
            <span>공식 공지: 동물병원 수의사 전용 처방 제품 안내</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight break-keep">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
              몬스멕타(Monsmecta)
            </span>
            는<br />
            동물병원 수의사 전용 처방 제품입니다
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed break-keep">
            네이버 검색을 통해 본 페이지에 유입되신 보호자님 및 원장님께 안내드립니다.<br className="hidden sm:inline" />
            몬스멕타는 환축의 정밀 진단과 전문 수의사의 처방이 수반되어야 하는 임상 전용 제재로,
            <span className="text-amber-300 font-semibold"> 일반 온라인 쇼핑몰 판매가 엄격히 제한</span>됩니다.
          </p>
        </div>

        {/* 방문자 대상 2대 솔루션 선택 카드 (동물병원 내원 유치 vs 파보겔 구매) */}
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {/* 카드 A: 동물병원 내원 안내 (수의사 원장님 윈-윈 레버리지) */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-blue-500/50 transition duration-300 relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition"></div>
            
            <div className="space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl">
                🏥
              </div>
              <div>
                <span className="text-xs font-bold text-blue-400 tracking-wide uppercase">Solution 01 · 보호자용</span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 break-keep">
                  가까운 동물병원에서<br />
                  전문 수의사 상담 및 처방받기
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-keep">
                반려동물이 혈변, 심한 탈진, 발열, 지속적인 구토를 동반한다면 바이러스성 장염(파보·코로나) 등 위중한 질환일 수 있습니다. 즉시 인근 동물병원에 내원하시어 정확한 진단 후 몬스멕타를 처방받으세요.
              </p>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-blue-300 font-semibold">
                  <span>📍</span>
                  <span>취급 동물병원 문의 및 내원 안내</span>
                </div>
                <p className="text-slate-400">
                  거주 지역 인근의 몬스멕타 취급 동물병원 위치가 궁금하시다면 본사 고객지원팀으로 문의 주시면 신속히 안내해 드립니다.
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-2.5 relative">
              <a
                href="tel:010-5407-5708"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition active:scale-[0.99] text-sm"
              >
                <span>📞 본사 직통: 취급 동물병원 안내 (010-5407-5708)</span>
              </a>
              <p className="text-[11px] text-center text-slate-400">
                평일 09:00~18:00 (긴급 문의 시 유선 상담 가능)
              </p>
            </div>
          </div>

          {/* 카드 B: 파보겔 온라인 즉시 구매 (일반 반려인 D2C 전환) */}
          <div className="bg-gradient-to-b from-emerald-950/40 via-slate-800/80 to-slate-800/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-400 transition duration-300 relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition"></div>
            
            <div className="space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
                🚀
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">Solution 02 · 가정 상비용</span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 break-keep">
                  야간·휴일 긴급 상비용<br />
                  동일 성분 <span className="text-emerald-400">[파보겔]</span> 바로 구매
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-keep">
                병원 방문이 어려운 야간이나 경미한 초기 무른 변·소화불량에는 몬스멕타와 동일한 핵심 기술
                <strong className="text-emerald-300 font-bold"> (초미세 나노 몬모릴로나이트 800m²/g & 특허 유산균 포뮬러)</strong>이 적용된 가정 상비용 보조사료 <strong>[파보겔(Parvogel)]</strong>을 온라인에서 즉시 주문하실 수 있습니다.
              </p>

              <div className="bg-emerald-950/60 rounded-2xl p-4 border border-emerald-500/30 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span>✨ 몬스멕타 vs 파보겔 핵심 기술 동일</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px]">익일 로켓 수령</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-normal">
                  • 800m²/g 비표면적 초미세 나노 몬모릴로나이트의 장 점막 코팅 및 장독소 흡착<br />
                  • 1초 원터치 펌프형 겔 타입으로 가루약 거부하는 아이도 간편 급여
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-2.5 relative">
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={getStoreUrl('coupang')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3.5 px-3 bg-[#e31837] hover:bg-[#c9122e] text-white font-bold rounded-2xl shadow-lg shadow-red-900/30 transition active:scale-[0.99] text-xs sm:text-sm"
                >
                  <span>🚀 쿠팡 로켓배송</span>
                </a>
                <a
                  href={getStoreUrl('naver')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3.5 px-3 bg-[#03c75a] hover:bg-[#02b350] text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/30 transition active:scale-[0.99] text-xs sm:text-sm"
                >
                  <span>🟢 네이버 스마트스토어</span>
                </a>
              </div>
              <Link
                to="/"
                className="w-full block text-center py-2.5 text-xs text-emerald-400/90 hover:text-emerald-300 font-semibold underline underline-offset-4"
              >
                파보겔 임상 데이터 및 상세 소개 페이지 보기 →
              </Link>
            </div>
          </div>
        </div>

        {/* 학술 자문단 검증 요약 섹션 (신뢰도 극대화: 박봉균 교수 & 정성대 원장) */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Clinical Authority</span>
              <h3 className="text-lg sm:text-xl font-bold text-white">대한민국 최고 수의학 석학 및 임상 전문가 검증</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-700 self-start sm:self-auto">
              초미세공정 특허 포뮬러
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔬</span>
                <div>
                  <h4 className="text-sm font-bold text-white">박봉균 교수</h4>
                  <p className="text-[11px] text-slate-400">바이러스학 권위자 · 前 농림축산검역본부장</p>
                </div>
              </div>
              <blockquote className="text-xs text-slate-300 italic border-l-2 border-blue-500 pl-3 pt-1">
                "몬스멕타는 단순 지사제를 넘어, 장내 바이러스(파보·코로나)를 물리적으로 흡착·배출하는 강력한 장 점막 보호 차별점을 지니고 있습니다."
              </blockquote>
            </div>

            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🩺</span>
                <div>
                  <h4 className="text-sm font-bold text-white">정성대 원장</h4>
                  <p className="text-[11px] text-slate-400">동진동물병원장 · 대동물/반려동물 임상 전문가</p>
                </div>
              </div>
              <blockquote className="text-xs text-slate-300 italic border-l-2 border-emerald-500 pl-3 pt-1">
                "비표면적 800m²/g 이상의 나노 입자도와 수분 흡수율 등 현장 수의사들이 진료 시 신뢰할 수 있는 완벽한 임상 데이터를 갖췄습니다."
              </blockquote>
            </div>
          </div>
        </div>

        {/* 수의사 전용 비공개 영역 (Restricted Area for Vets Only) */}
        <div className="bg-slate-950/90 border-2 border-dashed border-slate-700/90 rounded-3xl p-6 sm:p-9 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-5 text-9xl pointer-events-none select-none">
            🔒
          </div>

          <div className="space-y-2 border-b border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-bold border border-red-500/30">
              <span>🔒 RESTRICTED AREA</span>
              <span>·</span>
              <span>동물병원 수의사 전용 비공개 영역</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>비공개 영역 (수의사 전용)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium bg-slate-900/90 p-4 rounded-2xl border border-slate-800 break-keep">
              <strong className="text-amber-300 font-bold">공급 단가, 병원 발주 시스템, 수의사 전용 임상 프로토콜 다운로드는 사업자 등록증 인증 회원에게만 노출됩니다.</strong><br />
              일반 반려인 및 비인증 사용자에게는 어떠한 경우에도 도매 가격 및 발주 기능이 공개되지 않으며, 병원 진료 체계를 철저히 보호합니다.
            </p>
          </div>

          {/* 3대 잠금 카드 (블러 & 보안 처리 UI) */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* 잠금 1: 공급 단가 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">RESTRICTED #01</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                    🔒 비공개 락
                  </span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>병원 도매 공급 단가표</span>
                </h4>
                <div className="filter blur-[3px] select-none text-slate-500 text-xs space-y-1 py-1">
                  <p>• 몬스멕타 100ml / 500ml 병원 기준가</p>
                  <p>• 10병 / 30병 / 50병 이상 대량 구매 할인율</p>
                  <p>• VAT 별도 및 전자세금계산서 청구 기준</p>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-normal">
                  * 수의사 면허 및 사업자 등록증 확인 후 즉시 공개
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowVetContactModal(true)}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <span>🔒 사업자 인증 후 단가 확인</span>
                </button>
              </div>
            </div>

            {/* 잠금 2: 병원 발주 시스템 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">RESTRICTED #02</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                    🔒 비공개 락
                  </span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>동물병원 전용 발주 시스템</span>
                </h4>
                <div className="filter blur-[3px] select-none text-slate-500 text-xs space-y-1 py-1">
                  <p>• 동물병원 전용 실시간 직발주 연동</p>
                  <p>• 본사 당일 출고 배송 트래킹 지원</p>
                  <p>• 월간 후불 청구 및 결제 계좌 관리</p>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-normal">
                  * 승인된 정회원 동물병원 계정 전용 발주창
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowVetContactModal(true)}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <span>🔒 발주 시스템 권한 신청</span>
                </button>
              </div>
            </div>

            {/* 잠금 3: 임상 프로토콜 다운로드 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">RESTRICTED #03</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                    🔒 비공개 락
                  </span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>수의사용 임상 프로토콜 (PDF)</span>
                </h4>
                <div className="filter blur-[3px] select-none text-slate-500 text-xs space-y-1 py-1">
                  <p>• 정성대 원장 임상 증례집 및 용법용량 가이드</p>
                  <p>• 바이러스성 장염 환축 집중 처방 매뉴얼</p>
                  <p>• 원내 비치용 환자 설명 리플렛 원본</p>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-normal">
                  * 수의사 학술 세미나 및 원내 진료 참고용 전문 자료
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowVetContactModal(true)}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <span>🔒 학술 프로토콜 PDF 신청</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 수의사 전용 B2B 발주 및 학술 자료 신청 배너 */}
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <span>👨‍⚕️</span>
              <span>동물병원 원장님 및 수의사 전용 창구</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white break-keep">
              병원 납품 단가 및 학술 리플렛이 필요하신가요?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 break-keep">
              (주)한국아그로는 동물병원 수의사 선생님들의 권익과 처방 진료 체계를 최우선으로 보호합니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setShowVetContactModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition text-xs sm:text-sm"
            >
              원장님 전용 발주/학술자료 신청 →
            </button>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-start">
          <div className="space-y-1">
            <p className="font-semibold text-slate-400">(주)한국아그로 수의사업부</p>
            <p>충청남도 아산시 배방읍 배방로 13번길 19-7 · 대표전화: 010-5407-5708</p>
            <p className="text-[11px] text-slate-600">
              * 몬스멕타는 동물병원 수의사 전용 처방 제품이며 온라인 전자상거래를 통해 유통되지 않습니다.
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/" className="hover:text-white transition">파보겔 공식홈</Link>
            <span>·</span>
            <a href="tel:010-5407-5708" className="hover:text-white transition">고객지원실</a>
          </div>
        </div>
      </footer>

      {/* 수의사 전용 문의 모달 */}
      {showVetContactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowVetContactModal(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVetContactModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl p-1"
            >
              ✕
            </button>

            {!formSubmitted ? (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">Veterinary Exclusive</span>
                  <h3 className="text-xl font-bold text-white">동물병원 원장님 전용 상담 신청</h3>
                  <p className="text-xs text-slate-400">
                    신속한 확인 후 본사 담당자가 도매 공급가 및 원장님용 학술 리플렛을 직접 전달해 드립니다.
                  </p>
                </div>

                <form onSubmit={handleVetFormSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">동물병원 명칭 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 행복동물병원"
                      value={vetForm.hospitalName}
                      onChange={(e) => setVetForm({ ...vetForm, hospitalName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">수의사/원장 성함 *</label>
                      <input
                        type="text"
                        required
                        placeholder="홍길동 원장"
                        value={vetForm.vetName}
                        onChange={(e) => setVetForm({ ...vetForm, vetName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">연락처 *</label>
                      <input
                        type="tel"
                        required
                        placeholder="010-0000-0000"
                        value={vetForm.phone}
                        onChange={(e) => setVetForm({ ...vetForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">병원 소재지 (시/군/구)</label>
                    <input
                      type="text"
                      placeholder="예: 서울시 강남구"
                      value={vetForm.address}
                      onChange={(e) => setVetForm({ ...vetForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition text-sm"
                    >
                      상담 및 자료 신청 완료
                    </button>
                  </div>
                </form>

                <div className="pt-2 border-t border-slate-800 text-center">
                  <a
                    href="tel:010-5407-5708"
                    className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>📞 급한 납품 문의: 본사 직통 010-5407-5708 전화걸기</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 text-3xl flex items-center justify-center mx-auto">
                  ✓
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">신청이 접수되었습니다</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    동물병원 확인 후 본사 수의사업부 담당자가 입력해주신 연락처({vetForm.phone})로 신속히 연락드리겠습니다.
                  </p>
                </div>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setShowVetContactModal(false);
                    }}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
