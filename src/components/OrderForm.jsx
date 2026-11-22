import React from 'react'
import { useTranslation } from 'react-i18next'
import { getStoreUrl } from '../config/storeLinks'

/**
 * 일반 반려동물 보호자 전용 직영 주문 / 상담 폼
 * variant: 'section' | 'modal' (id 중복 방지 및 간격 차이)
 */
const OrderForm = ({
    formData,
    onChange,
    onSubmit,
    isSubmitting,
    products,
    variant = 'section',
}) => {
    const { t } = useTranslation()
    const idPrefix = variant === 'modal' ? 'modal-' : ''
    const gapClass = variant === 'modal' ? 'gap-4' : 'gap-5'
    const labelMb = variant === 'modal' ? 'mb-1' : 'mb-1.5'

    return (
        <form onSubmit={onSubmit} className={variant === 'modal' ? 'space-y-4' : 'space-y-5'}>
            {/* 공식몰 간편 카드결제 패스트트랙 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary-50 via-slate-50 to-primary-50 border border-primary-200 shadow-sm text-start">
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-primary-950 flex items-center gap-1.5">
                        <span>⚡</span>
                        <span>{t('order.fastTrackTitle', '빠른 익일 수령 & 간편 카드결제를 원하시는 보호자님')}</span>
                    </span>
                    <span className="text-xs font-bold text-primary-900 bg-white/90 px-2.5 py-0.5 rounded-full border border-primary-200">
                        {t('order.fastTrackBadge', '공식 직영몰 당일 출고')}
                    </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 mb-3.5 leading-relaxed break-keep">
                    {t('order.fastTrackDesc', '무통장 입금 주문 외에, 카카오 쇼핑하기(카카오페이), 쿠팡 로켓배송, 네이버 스마트스토어에서 즉시 간편 구매가 가능합니다.')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                        href={getStoreUrl('kakaoStore')}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer-when-downgrade"
                        data-product-id={formData.product || 'parvogel-100ml'}
                        aria-label={t('stores.kakaoAria', '카카오 쇼핑하기 구매 페이지로 이동 (새 창)')}
                        className="min-h-[46px] py-2.5 px-3 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-xs sm:text-sm text-center transition-all shadow flex items-center justify-center gap-1.5 border border-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
                    >
                        <span>💬 {t('order.kakaoBtn', '카카오 쇼핑하기')}</span>
                        <span aria-hidden="true">➔</span>
                    </a>
                    <a
                        href={getStoreUrl('coupang')}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer-when-downgrade"
                        data-product-id={formData.product || 'parvogel-100ml'}
                        aria-label={t('stores.coupangAria', '쿠팡 로켓배송 구매 페이지로 이동 (새 창)')}
                        className="min-h-[46px] py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm text-center transition-all shadow flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1"
                    >
                        <span>🚀 {t('order.coupangBtn', '쿠팡 로켓배송')}</span>
                        <span aria-hidden="true">➔</span>
                    </a>
                    <a
                        href={getStoreUrl('naver')}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer-when-downgrade"
                        data-product-id={formData.product || 'parvogel-100ml'}
                        aria-label={t('stores.naverAria', '네이버 스마트스토어 구매 페이지로 이동 (새 창)')}
                        className="min-h-[46px] py-2.5 px-3 rounded-xl bg-[#028A3D] hover:bg-[#027734] text-white font-black text-xs sm:text-sm text-center transition-all shadow flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
                    >
                        <span>🛍️ {t('order.smartstoreBtn', '네이버 스마트스토어')}</span>
                        <span aria-hidden="true">➔</span>
                    </a>
                </div>
            </div>

            {/* 무통장 직영 주문 / 전화 상담 입력란 */}
            <div className="pt-1">
                <p className="text-sm font-extrabold text-slate-900 mb-3">
                    📝 무통장 직영 주문 / 전화 상담 신청
                </p>

                <div className={`grid sm:grid-cols-2 ${gapClass}`}>
                    <div>
                        <label htmlFor={`${idPrefix}hospitalName`} className={`block text-sm font-semibold text-gray-800 ${labelMb}`}>
                            주문자 성함 <span className="text-accent-500">*</span>
                        </label>
                        <input
                            type="text"
                            id={`${idPrefix}hospitalName`}
                            name="hospitalName"
                            value={formData.hospitalName}
                            onChange={onChange}
                            placeholder="예: 홍길동"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor={`${idPrefix}contactName`} className={`block text-sm font-semibold text-gray-800 ${labelMb}`}>
                            수령인 성함 <span className="text-accent-500">*</span>
                        </label>
                        <input
                            type="text"
                            id={`${idPrefix}contactName`}
                            name="contactName"
                            value={formData.contactName}
                            onChange={onChange}
                            placeholder="예: 홍길동"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className={`grid sm:grid-cols-2 ${gapClass}`}>
                <div>
                    <label htmlFor={`${idPrefix}phone`} className={`block text-sm font-semibold text-gray-800 ${labelMb}`}>
                        {t('order.phone')} <span className="text-accent-500">*</span>
                    </label>
                    <input
                        type="tel"
                        id={`${idPrefix}phone`}
                        name="phone"
                        value={formData.phone}
                        onChange={onChange}
                        placeholder={t('order.phonePh')}
                        inputMode="numeric"
                        pattern="01[0-9\-]{8,11}"
                        maxLength={13}
                        title="010-1234-5678 형식"
                        autoComplete="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base"
                        required
                    />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}email`} className={`block text-sm font-semibold text-gray-800 ${labelMb}`}>
                        {t('order.email')} <span className="text-gray-400 text-xs font-normal">(선택)</span>
                    </label>
                    <input
                        type="email"
                        id={`${idPrefix}email`}
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="order@example.com"
                        autoComplete="email"
                        pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                        title="올바른 이메일 형식으로 입력해 주세요"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base"
                    />
                </div>
            </div>

            <div>
                <label htmlFor={`${idPrefix}address`} className={`block text-sm font-semibold text-gray-800 ${labelMb}`}>
                    {t('order.address')}
                </label>
                <textarea
                    id={`${idPrefix}address`}
                    name="address"
                    value={formData.address}
                    onChange={onChange}
                    rows={2}
                    placeholder={t('order.addressPh')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none text-base"
                />
            </div>

            <div className={`grid sm:grid-cols-2 ${gapClass}`}>
                <div>
                    <label htmlFor={`${idPrefix}product`} className={`block text-sm font-semibold text-gray-800 ${labelMb}`}>
                        {t('order.product')}
                    </label>
                    <select
                        id={`${idPrefix}product`}
                        name="product"
                        value={formData.product}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white text-base"
                    >
                        {products.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.price}){p.id === 'parvogel-100ml' ? ` - ${t('products.recommended', '표준 추천')}` : ''}
                            </option>
                        ))}
                        <option value="consultation">{t('order.consult')}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor={`${idPrefix}quantity`} className={`block text-sm font-semibold text-gray-800 ${labelMb}`}>
                        {t('order.quantity')}
                    </label>
                    <input
                        type="number"
                        id={`${idPrefix}quantity`}
                        name="quantity"
                        value={formData.quantity}
                        onChange={onChange}
                        min="1"
                        max="100"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onKeyDown={(e) => { if (['e', 'E', '.', '-', '+'].includes(e.key)) e.preventDefault() }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base"
                    />
                </div>
            </div>

            <div>
                <label htmlFor={`${idPrefix}message`} className={`block text-sm font-semibold text-gray-800 ${labelMb}`}>
                    {t('order.message')}
                </label>
                <textarea
                    id={`${idPrefix}message`}
                    name="message"
                    value={formData.message}
                    onChange={onChange}
                    rows={2}
                    placeholder="예: 우리 아이 체중·증상 문의, 배송 요청사항 등"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none text-base"
                />
            </div>

            {/* 무통장 입금 계좌 안내 */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 text-center">
                <span className="font-bold block mb-1 text-gray-900">무통장 입금 안내</span>
                농협 301-0133-0281-01 <span className="text-gray-600 ml-2">예금주: (주)한국아그로</span>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 hover:from-primary-900 hover:to-primary-850 shadow-primary-950/30 border border-primary-600/30"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t('order.submitting')}
                    </span>
                ) : (
                    t('order.submit')
                )}
            </button>

            {variant === 'section' && (
                <p className="text-center text-xs text-gray-500">
                    {t('order.privacyNote')}
                </p>
            )}
        </form>
    )
}

export default OrderForm
