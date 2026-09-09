import React from 'react'
import { useTranslation } from 'react-i18next'
import { getStoreUrl } from '../config/storeLinks'

// 채널별 할인율 (소비자 정가 대비). 실제 공급 정책에 맞게 조정하세요.
const PRICING = {
    hospitalDiscount: 45,
    wholesaleTiers: [
        { min: 10, max: 49, discount: 50 },
        { min: 50, max: 199, discount: 55 },
        { min: 200, max: null, discount: null },
    ],
}

/**
 * 주문/상담 폼 — 페이지 섹션과 모달에서 공통 사용
 * variant: 'section' | 'modal' (id 중복 방지 및 간격 차이)
 */
const OrderForm = ({ formData, onChange, setFormData, onSubmit, isSubmitting, products, variant = 'section' }) => {
    const { t } = useTranslation()
    const idPrefix = variant === 'modal' ? 'modal-' : ''
    const gapClass = variant === 'modal' ? 'gap-4' : 'gap-6'
    const labelMb = variant === 'modal' ? 'mb-1' : 'mb-2'

    return (
        <form onSubmit={onSubmit} className={variant === 'modal' ? 'space-y-4' : 'space-y-6'}>
            {/* 신청 구분 */}
            <div>
                <p className="block text-sm font-semibold text-gray-700 mb-2">{t('order.requestType')}</p>
                <div className={`grid gap-2 ${variant === 'modal' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-5'}`}>
                    {[
                        { value: 'sample_petshop', icon: '🎁', label: '펫샵 본품 1병 무료' },
                        { value: 'sample_breeder', icon: '🐾', label: '브리더 본품 1병 무료' },
                        { value: 'consumer', icon: '🛒', label: t('order.requestConsumer') },
                        { value: 'hospital', icon: '🏥', label: t('order.requestHospital') },
                        { value: 'wholesale', icon: '📦', label: t('order.requestWholesale') },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, requestType: opt.value }))}
                            className={`${variant === 'modal' ? 'px-2 text-xs' : 'px-2.5 text-xs sm:text-sm'} py-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1 ${formData.requestType === opt.value
                                ? 'border-primary-600 bg-primary-50 text-primary-800 shadow-md ring-2 ring-primary-500/20'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                        >
                            <span className="text-lg">{opt.icon}</span>
                            <span className="break-keep text-center leading-tight">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 채널별 가격 안내 및 소비자 즉시 구매 패스트트랙 */}
            {formData.requestType === 'consumer' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-blue-50 to-emerald-50 border border-emerald-300 shadow-sm text-start">
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                            <span>⚡</span>
                            <span>{t('order.fastTrackTitle', '빠른 익일 수령 & 간편 카드결제를 원하시는 보호자님')}</span>
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-white/90 px-2 py-0.5 rounded-full border border-blue-200">
                            {t('order.fastTrackBadge', '공식 직영몰 당일 출고')}
                        </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed break-keep">
                        {t('order.fastTrackDesc', '무통장 입금 주문 외에, 쿠팡 로켓배송 및 네이버 스마트스토어(네이버페이)에서 즉시 간편 구매가 가능합니다.')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <a
                            href={getStoreUrl('coupang')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs text-center transition-all shadow flex items-center justify-center gap-1.5"
                        >
                            <span>🚀 {t('order.coupangBtn', '쿠팡 로켓배송 (내일 아침 도착)')}</span>
                            <span aria-hidden="true">➔</span>
                        </a>
                        <a
                            href={getStoreUrl('naver')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs text-center transition-all shadow flex items-center justify-center gap-1.5"
                        >
                            <span>🟢 {t('order.smartstoreBtn', '네이버 펫츄리 (네이버페이 구매)')}</span>
                            <span aria-hidden="true">➔</span>
                        </a>
                    </div>
                </div>
            )}
            {formData.requestType === 'sample_petshop' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 shadow-sm text-start">
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                            <span>🎁</span>
                            <span>[전국 펫샵·분양샵 전용] 파보겔 본품 1병 무료 체험 & 도매 제휴 신청</span>
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-white/90 px-2 py-0.5 rounded-full border border-amber-300">
                            선착순 1병 증정
                        </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed break-keep">
                        {t('order.sampleNotePetshop', '💡 펫샵/분양샵 대표님께 파보겔 본품 1병과 B2B 특별 공급 단가표를 무료 발송해 드립니다. (발송 완료 후 송장번호 안내)')}
                    </p>
                </div>
            )}
            {formData.requestType === 'sample_breeder' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-300 shadow-sm text-start">
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                            <span>🐾</span>
                            <span>[전문 브리더·켄넬 전용] 자견 설사 방어용 파보겔 본품 1병 무료 체험</span>
                        </span>
                        <span className="text-[10px] font-bold text-blue-800 bg-white/90 px-2 py-0.5 rounded-full border border-blue-300">
                            선착순 1병 증정
                        </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed break-keep">
                        {t('order.sampleNoteBreeder', '💡 전문 브리더/켄넬 대표님께 자견 설사 방어용 파보겔 본품 1병과 농장 전용 번들 특가표를 무료 발송해 드립니다.')}
                    </p>
                </div>
            )}
            {formData.requestType === 'hospital' && (
                <div className="bg-accent-50 border border-accent-200 rounded-xl px-4 py-3 text-sm font-medium text-accent-900 break-keep">
                    💡 {t('order.hospitalDiscountNote', '동물병원·수의사 공급가는 소비자 정가 대비 {{discount}}% 할인된 병원 공급가로, 견적서를 통해 안내드립니다.', { discount: PRICING.hospitalDiscount })}
                </div>
            )}
            {formData.requestType === 'wholesale' && (
                <div className="bg-accent-50 border border-accent-200 rounded-xl px-4 py-3 text-sm font-medium text-accent-900 break-keep">
                    💡 {t('order.wholesaleDiscountNote', '도매가는 소비자 정가 대비 수량별 할인(10병 이상 {{d1}}%, 50병 이상 {{d2}}%, 200병 이상 별도 협의)입니다. 견적서를 통해 안내드립니다.', { d1: PRICING.wholesaleTiers[0].discount, d2: PRICING.wholesaleTiers[1].discount })}
                </div>
            )}

            <div className={`grid sm:grid-cols-2 ${gapClass}`}>
                <div>
                    <label htmlFor={`${idPrefix}hospitalName`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                        {formData.requestType === 'hospital'
                            ? t('order.hospitalNameOnly')
                            : formData.requestType === 'sample_petshop'
                                ? '펫샵/매장명'
                                : formData.requestType === 'sample_breeder'
                                    ? '켄넬/견사명 (농장명)'
                                    : formData.requestType === 'wholesale'
                                        ? t('order.companyName')
                                        : t('order.hospitalName')} <span className="text-accent-500">*</span>
                    </label>
                    <input
                        type="text"
                        id={`${idPrefix}hospitalName`}
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={onChange}
                        placeholder={t('order.hospitalNamePh')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        required
                    />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}contactName`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                        {formData.requestType === 'hospital'
                            ? t('order.vetName')
                            : (formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder' || formData.requestType === 'wholesale')
                                ? '대표자명'
                                : t('order.contactName')} <span className="text-accent-500">*</span>
                    </label>
                    <input
                        type="text"
                        id={`${idPrefix}contactName`}
                        name="contactName"
                        value={formData.contactName}
                        onChange={onChange}
                        placeholder={formData.requestType === 'hospital' ? t('order.vetNamePh') : '예: 홍길동 (대표자)'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        required
                    />
                </div>
            </div>

            {formData.requestType === 'wholesale' && (
                <div>
                    <label htmlFor={`${idPrefix}bizNumber`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                        {t('order.bizNumber')} <span className="text-accent-500">*</span>
                    </label>
                    <input
                        type="text"
                        id={`${idPrefix}bizNumber`}
                        name="bizNumber"
                        value={formData.bizNumber}
                        onChange={onChange}
                        placeholder={t('order.bizNumberPh')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        required
                    />
                </div>
            )}

            <div className={`grid sm:grid-cols-2 ${gapClass}`}>
                <div>
                    <label htmlFor={`${idPrefix}phone`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                        {t('order.phone')} <span className="text-accent-500">*</span>
                    </label>
                    <input
                        type="tel"
                        id={`${idPrefix}phone`}
                        name="phone"
                        value={formData.phone}
                        onChange={onChange}
                        placeholder={t('order.phonePh')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        required
                    />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}email`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                        {t('order.email')}
                    </label>
                    <input
                        type="email"
                        id={`${idPrefix}email`}
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder={t('order.emailPh')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div>
                <label htmlFor={`${idPrefix}address`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                    {formData.requestType === 'wholesale'
                        ? t('order.region')
                        : (formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder')
                            ? '우편번호 및 택배 받으실 주소 (필수)'
                            : t('order.address')} {(formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder') && <span className="text-accent-500">*</span>}
                </label>
                <textarea
                    id={`${idPrefix}address`}
                    name="address"
                    value={formData.address}
                    onChange={onChange}
                    rows={2}
                    placeholder={(formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder')
                        ? '예: 경기도 남양주시 화도읍 ... (우체국 택배로 무료 발송됩니다)'
                        : formData.requestType === 'wholesale' ? t('order.regionPh') : t('order.addressPh')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                    required={(formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder')}
                />
            </div>

            {formData.requestType === 'wholesale' ? (
                <div>
                    <label htmlFor={`${idPrefix}orderVolume`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                        {t('order.orderVolume')}
                    </label>
                    <select
                        id={`${idPrefix}orderVolume`}
                        name="orderVolume"
                        value={formData.orderVolume}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
                    >
                        <option value="">{t('order.selectVolume')}</option>
                        <option value="10-49">{t('order.volume1')}</option>
                        <option value="50-199">{t('order.volume2')}</option>
                        <option value="200+">{t('order.volume3')}</option>
                    </select>
                </div>
            ) : (formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder') ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <span>📦</span>
                    <span>지원 혜택: 파보겔 정품 1병 무료 제공 + B2B 특가 공급 안내문 동봉 (배송비 전액 본사 부담)</span>
                </div>
            ) : (
                <div className={`grid sm:grid-cols-2 ${gapClass}`}>
                    <div>
                        <label htmlFor={`${idPrefix}product`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                            {t('order.product')}
                        </label>
                        <select
                            id={`${idPrefix}product`}
                            name="product"
                            value={formData.product}
                            onChange={onChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
                        >
                            {products.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.price}){p.id === 'parvogel-200ml' ? ` - ${t('products.recommended')}` : ''}
                                </option>
                            ))}
                            <option value="consultation">{t('order.consult')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`${idPrefix}quantity`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                            {formData.requestType === 'hospital' ? t('order.quantityMonthly') : t('order.quantity')}
                        </label>
                        <input
                            type="number"
                            id={`${idPrefix}quantity`}
                            name="quantity"
                            value={formData.quantity}
                            onChange={onChange}
                            min="1"
                            max="100"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            )}

            <div>
                <label htmlFor={`${idPrefix}message`} className={`block text-sm font-semibold text-gray-700 ${labelMb}`}>
                    {t('order.message')}
                </label>
                <textarea
                    id={`${idPrefix}message`}
                    name="message"
                    value={formData.message}
                    onChange={onChange}
                    rows={2}
                    placeholder={(formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder')
                        ? '배송 시 요청사항이나 추가로 궁금하신 점을 적어주세요.'
                        : t('order.messagePh')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                />
            </div>

            {/* 결제 계좌 정보 (샘플 신청 시에는 숨김) */}
            {!(formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder') && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 text-center">
                    <span className="font-bold block mb-1 text-gray-900">무통장 입금 안내</span>
                    농협 301-0133-0281-01 <span className="text-gray-500 ml-2">예금주: (주)한국아그로</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${(formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder')
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-orange-500/25'
                    : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/25'}`}
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
                    (formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder')
                        ? '🎁 파보겔 본품 1병 무료체험 신청하기 (택배비 무료)'
                        : t('order.submit')
                )}
            </button>

            {variant === 'section' && (
                <p className="text-center text-xs text-gray-400">
                    {t('order.privacyNote')}
                </p>
            )}
        </form>
    )
}

export default OrderForm
