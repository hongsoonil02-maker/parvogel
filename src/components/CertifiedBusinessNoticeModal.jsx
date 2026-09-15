import React from 'react'
import { getStoreUrl } from '../config/storeLinks'

/**
 * 일반인 및 미인증 사업자 대상 정중한 무료 샘플 지원 안내 및 일반 구매 전환 모달
 */
const CertifiedBusinessNoticeModal = ({
    isOpen,
    onClose,
    applicantPhone = '',
    applicantShop = ''
}) => {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-notice-title"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-blue-100 animate-slide-up text-start"
                onClick={e => e.stopPropagation()}
            >
                {/* 상단 블루/인디고 프리미엄 배너 */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800 p-6 sm:p-7 text-white rounded-t-3xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-15 text-8xl select-none pointer-events-none">🛡️</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black tracking-wide mb-3 border border-white/30">
                        <span>🐾</span>
                        <span>정부 인허가 동물판매업·생산업 전문 지원 프로그램</span>
                    </div>
                    <h3 id="cert-notice-title" className="text-xl sm:text-2xl font-black leading-snug break-keep text-white">
                        파보겔 본품(200ml) 무료 샘플은<br />
                        정식 인허가 사업자 전용 지원 정책입니다
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100 mt-2 font-medium leading-relaxed break-keep">
                        면역력이 취약한 어린 자견의 파보·코로나 장염 집단 폐사를 방어하기 위해 지자체 정식 등록 시설(펫샵·브리더)에 한해 본사 무상 지원되고 있습니다.
                    </p>
                </div>

                {/* 본문 안내 */}
                <div className="p-6 sm:p-8 space-y-5">
                    {/* 일반 반려인 / 보호자 안내 카드 */}
                    <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl mt-0.5">🐶</span>
                            <div className="space-y-1 text-xs sm:text-sm text-slate-800 leading-relaxed break-keep">
                                <p className="font-black text-emerald-950 text-sm sm:text-base">
                                    소중한 반려견의 급성 장염·설사 빠른 회복이 필요하신가요?
                                </p>
                                <p className="text-slate-700">
                                    1~2병 단위의 즉시 수유 및 가정용 상비 구매는 <strong>쿠팡 로켓배송</strong> 및 <strong>네이버 스마트스토어 공식몰</strong>을 통해 가장 빠르고 안전하게 당일 출고로 받아보실 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <a
                                href={getStoreUrl('coupang')}
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm text-center transition-all shadow flex items-center justify-center gap-1.5"
                            >
                                <span>🚀 쿠팡 로켓배송</span>
                                <span className="text-[10px] opacity-80">(내일 도착)</span>
                            </a>
                            <a
                                href={getStoreUrl('naver')}
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm text-center transition-all shadow flex items-center justify-center gap-1.5"
                            >
                                <span>🟢 네이버 공식몰</span>
                                <span className="text-[10px] opacity-80">(포인트 적립)</span>
                            </a>
                        </div>
                    </div>

                    {/* 신규 정식 인허가 사업자 구제 창구 카드 */}
                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl mt-0.5">🏢</span>
                            <div className="space-y-1 text-xs sm:text-sm text-slate-800 leading-relaxed break-keep">
                                <p className="font-black text-amber-950">
                                    최근 신규 오픈하셨거나 명단에 미등록된 정식 대표님이신가요?
                                </p>
                                <p className="text-slate-700">
                                    정식 동물판매업 등록증, 동물생산업 허가증 또는 사업자등록증을 유선이나 문자로 간편 확인해 주시면 <strong>파보겔 200ml 정품 1병과 알림판에 사용되는 예(A4)를 즉시 무료 발송</strong>해 드립니다.
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            <a
                                href="tel:010-5407-5708"
                                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs text-center transition-all shadow flex items-center justify-center gap-1.5"
                            >
                                <span>📞 본사 직통 인증 문의 (010-5407-5708)</span>
                            </a>
                            <a
                                href="sms:010-5407-5708?body=%5B%ED%8C%8C%EB%B3%B4%EA%B2%94%20%EC%82%AC%EC%97%85%EC%9E%90%20%EC%83%98%ED%94%8C%20%EC%9D%B8%EC%A6%9D%20%EC%9A%94%EC%B2%AD%5D%20%EC%83%81%ED%98%B8%EB%AA%85%20%EB%B0%8F%20%EC%82%AC%EC%97%85%EC%9E%90%EB%93%B1%EB%A1%9D%EC%A6%9D%EC%9D%84%20%EC%B2%A8%EB%Bu%ED%95%A9%EB%8B%88%EB%8B%A4."
                                className="py-2.5 px-3 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 font-bold text-xs text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
                            >
                                <span>💬 문자로 등록증 사진 전송</span>
                            </a>
                        </div>
                    </div>

                    {/* 하단 닫기 버튼 */}
                    <div className="pt-1 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
                        >
                            확인 및 닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CertifiedBusinessNoticeModal
