import React from 'react'
import { getStoreUrl } from '../config/storeLinks'

/**
 * 무료 샘플 중복 신청자 친절 안내 및 B2B 정식 발주 전환 유도 모달
 */
const DuplicateSampleModal = ({
    isOpen,
    onClose,
    matchedRecipient,
    onConvertToOrder
}) => {
    if (!isOpen) return null

    const shopName = matchedRecipient?.shopName || '대표'
    const recipientName = matchedRecipient?.name || ''
    const phoneDisplay = matchedRecipient?.phoneDisplay || matchedRecipient?.phone || ''
    const address = matchedRecipient?.address || ''
    const orderNum = matchedRecipient?.orderNum

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dup-sample-title"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-amber-200 animate-slide-up text-start"
                onClick={e => e.stopPropagation()}
            >
                {/* 상단 앰버/골드 배너 헤더 */}
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-7 text-white rounded-t-3xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-15 text-8xl select-none pointer-events-none">🎁</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black tracking-wide mb-3 border border-white/30">
                        <span>✨</span>
                        <span>파보겔 본품(200ml) 1차 무료 발송 완료 거래처</span>
                    </div>
                    <h3 id="dup-sample-title" className="text-xl sm:text-2xl font-black leading-snug break-keep text-white">
                        {shopName} {recipientName ? `${recipientName} 대표님` : '대표님'},<br />
                        파보겔 무료 샘플이 이미 정상 발송되었습니다!
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-100 mt-2 font-medium leading-relaxed break-keep">
                        전국 펫샵·켄넬·동물병원 대표님들께 고른 무료 체험 기회를 드리기 위해 <strong>사업자당 최초 1회 무료 지원</strong>되고 있습니다.
                    </p>
                </div>

                {/* 본문 콘텐츠 */}
                <div className="p-6 sm:p-8 space-y-5">
                    {/* 발송 완료 내역 카드 */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-200/60">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <span>📋</span>
                                <span>1차 무료 샘플 발송 등록 내역</span>
                            </span>
                            {orderNum && (
                                <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                                    발송 등록번호 #{orderNum}번
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                            <div><span className="font-semibold text-slate-500">상호명:</span> <span className="font-bold text-slate-900">{shopName}</span></div>
                            {recipientName && <div><span className="font-semibold text-slate-500">수령인:</span> <span className="font-bold text-slate-900">{recipientName}</span></div>}
                            {phoneDisplay && <div><span className="font-semibold text-slate-500">연락처:</span> <span className="font-bold text-slate-900">{phoneDisplay}</span></div>}
                            <div className="sm:col-span-2"><span className="font-semibold text-slate-500">배송지:</span> <span className="font-bold text-slate-900">{address || '등록 주소지'}</span></div>
                        </div>
                    </div>

                    {/* 정식 발주 제안 박스 */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-2xl p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl mt-0.5">📦</span>
                            <div className="space-y-1 text-xs sm:text-sm text-slate-700 leading-relaxed break-keep">
                                <p className="font-black text-slate-900 text-sm sm:text-base">
                                    자견 설사 방어 및 추가 상비용 물량이 필요하신가요?
                                </p>
                                <p className="text-slate-600">
                                    이미 1병의 무료 체험 본품을 받아보신 파트너 대표님께는 <strong>B2B 도매 공급 특가(최대 55% 파격 할인)</strong>로 신속하게 정식 발주를 접수해 드립니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 액션 버튼 그룹 */}
                    <div className="space-y-2.5 pt-2">
                        {/* 1. B2B 정식 발주 전환 버튼 */}
                        <button
                            type="button"
                            onClick={() => onConvertToOrder('wholesale')}
                            className="w-full py-4 px-5 rounded-2xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:to-primary-900 shadow-xl shadow-primary-900/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            <span>📦</span>
                            <span>B2B 정식 도매 발주 모달로 이동 (특가 혜택 적용)</span>
                            <span className="group-hover:translate-x-1 transition-transform">➔</span>
                        </button>

                        {/* 2. 빠른 소량 즉시구매 (쿠팡/네이버) */}
                        <div className="grid grid-cols-2 gap-2">
                            <a
                                href={getStoreUrl('coupang')}
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs text-center transition-all shadow flex items-center justify-center gap-1"
                            >
                                <span>🚀 쿠팡 로켓배송</span>
                            </a>
                            <a
                                href={getStoreUrl('naver')}
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition-all shadow flex items-center justify-center gap-1"
                            >
                                <span>🟢 네이버 스마트스토어</span>
                            </a>
                        </div>

                        {/* 3. 본사 직통 전화 & 닫기 */}
                        <div className="flex items-center justify-between pt-1 gap-2">
                            <a
                                href="tel:010-5407-5708"
                                className="text-xs text-slate-500 hover:text-primary-700 font-semibold flex items-center gap-1"
                            >
                                <span>📞 본사 직통 상담:</span>
                                <span className="underline font-bold text-slate-700">010-5407-5708</span>
                            </a>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-xs text-slate-400 hover:text-slate-700 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DuplicateSampleModal
