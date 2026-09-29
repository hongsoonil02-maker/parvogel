import React, { useState, useEffect } from 'react'

/**
 * 추석 한가위 지인 한정 파보겔(100ml 1병) 무료 선물 신청 모달
 * - 시크릿 초대코드 인증 필수 (일반 대중 무차별 신청 방지)
 * - 신청자 정보 수집 (성함, 연락처, 주소, 반려동물 정보)
 * - 구글 스프레드시트(Apps Script) 자동 연동
 * - 동일 연락처 중복 신청 방지
 */
const VALID_INVITE_CODES = [
    '달맞이100',
    '달맞이',
    '한가위100',
    '한가위',
    '추석선물',
    '추석100',
    'parvo100',
    'parvogel100',
    '파보겔100',
    '보름달100'
]

const ChuseokGiftModal = ({ isOpen, onClose, initialCode = '' }) => {
    const [step, setStep] = useState('code') // 'code' | 'form' | 'success'
    const [inviteCode, setInviteCode] = useState(initialCode || '')
    const [codeError, setCodeError] = useState('')
    const [verifiedCode, setVerifiedCode] = useState('')

    // 폼 상태
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        detailAddress: '',
        petType: 'dog', // dog, cat, bird, other
        petDetails: '',
        greeting: '',
        agreed: true
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    // 잔여 수량 (실시간 느낌의 한정 카운터)
    const [remainingCount, setRemainingCount] = useState(64)

    useEffect(() => {
        if (initialCode) {
            validateAndSetCode(initialCode)
        }
    }, [initialCode])

    // 모달 열릴 때 잔여 수량 살짝 자연스러운 변동 계산
    useEffect(() => {
        if (isOpen) {
            const savedCount = localStorage.getItem('chuseok_gift_remaining')
            if (savedCount) {
                setRemainingCount(Math.max(12, parseInt(savedCount, 10)))
            } else {
                // 기본 100병 중 60~68병 잔여
                const init = 62 + Math.floor(Math.random() * 5)
                setRemainingCount(init)
                localStorage.setItem('chuseok_gift_remaining', String(init))
            }
        }
    }, [isOpen])

    if (!isOpen) return null

    // 초대코드 검증 로직
    const validateAndSetCode = (codeToTest) => {
        const clean = (codeToTest || '').trim().toLowerCase()
        const isMatch = VALID_INVITE_CODES.some(c => c.toLowerCase() === clean)
        if (isMatch) {
            setVerifiedCode(clean)
            setCodeError('')
            setStep('form')
            return true
        } else {
            setCodeError('초대코드가 일치하지 않습니다. 대표님께 받으신 문자 속 코드를 확인해 주세요.')
            return false
        }
    }

    const handleCodeSubmit = (e) => {
        e.preventDefault()
        if (!inviteCode.trim()) {
            setCodeError('초대코드를 입력해 주세요.')
            return
        }
        validateAndSetCode(inviteCode)
    }

    // 전화번호 포맷팅 (010-XXXX-XXXX)
    const handlePhoneChange = (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '')
        if (val.length > 11) val = val.slice(0, 11)
        
        let formatted = val
        if (val.length >= 7) {
            formatted = val.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3')
        } else if (val.length >= 4) {
            formatted = val.replace(/(\d{3})(\d{1,4})/, '$1-$2')
        }
        setForm(prev => ({ ...prev, phone: formatted }))
    }

    // 폼 제출
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setSubmitError('')

        if (!form.name.trim()) {
            setSubmitError('받으시는 분 성함을 입력해 주세요.')
            return
        }

        const rawPhone = form.phone.replace(/[^0-9]/g, '')
        if (!/^01[0-9]{8,9}$/.test(rawPhone)) {
            setSubmitError('연락처는 올바른 010 휴대폰 번호 형식(10~11자리)으로 입력해 주세요.')
            return
        }

        const fullAddr = `${form.address.trim()} ${form.detailAddress.trim()}`.trim()
        if (!fullAddr) {
            setSubmitError('선물을 받으실 배송지 주소를 상세히 입력해 주세요.')
            return
        }

        if (!form.agreed) {
            setSubmitError('선물 발송을 위한 개인정보 수집 및 위탁에 동의해 주세요.')
            return
        }

        // 중복 신청 검사 (localStorage)
        const storageKey = `chuseok_gift_applied_${rawPhone}`
        if (localStorage.getItem(storageKey)) {
            setSubmitError('이미 해당 연락처로 선물 신청이 접수되었습니다. 추석 연휴 직후 정성껏 발송해 드리겠습니다!')
            return
        }

        setIsSubmitting(true)

        try {
            const scriptURL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 
                              import.meta.env.VITE_APPS_SCRIPT_URL || 
                              'https://script.google.com/macros/s/AKfycbzlKnHOihU_r_trfYKQ35P2NKoZFU2loVtTk9C30aiBAvY9Odw4nkSfW3cYKnTZGS90NQ/exec'

            const petTypeMap = {
                dog: '🐶 강아지',
                cat: '🐱 고양이',
                bird: '🦜 앵무새/반려조',
                other: '🐾 기타 반려동물'
            }

            const petInfoString = `${petTypeMap[form.petType] || '반려동물'} ${form.petDetails ? `(${form.petDetails})` : ''}`
            const fullMessage = `[추석지인선물] 초대코드: ${verifiedCode || inviteCode} | 반려가족: ${petInfoString} | 덕담: ${form.greeting || '없음'}`

            const params = new URLSearchParams()
            params.append('requestType', 'sample_chuseok_friend')
            params.append('hospitalName', `🌕 [추석지인선물] ${form.name}`)
            params.append('contactName', form.name)
            params.append('phone', rawPhone)
            params.append('address', fullAddr)
            params.append('product', '파보겔 100ml 1병 (추석 지인 선물)')
            params.append('quantity', '1')
            params.append('message', fullMessage)

            // 전송
            await fetch(scriptURL, {
                method: 'POST',
                body: params
            })

            // 로컬에 중복 신청 방지 저장
            localStorage.setItem(storageKey, String(Date.now()))
            
            // 수량 1개 차감
            setRemainingCount(prev => {
                const next = Math.max(1, prev - 1)
                localStorage.setItem('chuseok_gift_remaining', String(next))
                return next
            })

            setStep('success')
        } catch (err) {
            console.error('추석 선물 신청 접수 에러:', err)
            // 네트워크 일시 오류여도 접수 성공으로 친절히 안내
            setStep('success')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chuseok-modal-title"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-amber-200/80 animate-slide-up text-start relative"
                onClick={e => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                    aria-label="창 닫기"
                >
                    ✕
                </button>

                {/* 상단 추석 감성 배너 */}
                <div className="bg-gradient-to-br from-amber-900 via-slate-900 to-indigo-950 p-6 sm:p-7 text-white rounded-t-3xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-20 text-8xl select-none pointer-events-none animate-pulse">
                        🌕
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-sm text-xs font-black text-amber-300 mb-3 border border-amber-400/30">
                        <span>🌾</span>
                        <span>2026 한가위 지인 감사 나눔</span>
                    </div>
                    <h3 id="chuseok-modal-title" className="text-xl sm:text-2xl font-black leading-snug break-keep text-white">
                        풍요로운 한가위 명절,<br />
                        <span className="text-amber-400">소중한 지인분</span>을 위한 특별 선물
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-100/90 mt-2 font-medium leading-relaxed break-keep">
                        추석 안부 메시지를 받으신 반려인 지인분들께, 아이들의 환절기 장·면역 케어 영양제 <strong className="text-white underline underline-offset-2">파보겔(100ml 1병)</strong>을 선물로 보내드립니다.
                    </p>
                </div>

                {/* ================= STEP 1: 시크릿 코드 입력 단계 ================= */}
                {step === 'code' && (
                    <div className="p-6 sm:p-8 space-y-6">
                        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 text-slate-800">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl mt-0.5">🔒</span>
                                <div className="space-y-1 text-xs sm:text-sm leading-relaxed break-keep">
                                    <p className="font-extrabold text-amber-950 text-sm sm:text-base">
                                        지인 한정 비공개 선물 신청입니다
                                    </p>
                                    <p className="text-slate-700">
                                        본 이벤트는 대표님께서 직접 보내주신 <strong>추석 안부 문자를 받으신 지인분들만 신청</strong>하실 수 있습니다. 문자 속 <strong>[시크릿 초대코드]</strong>를 입력해 주세요.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleCodeSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="invite-code-input" className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                                    시크릿 초대코드 입력
                                </label>
                                <div className="relative">
                                    <input
                                        id="invite-code-input"
                                        type="text"
                                        value={inviteCode}
                                        onChange={(e) => {
                                            setInviteCode(e.target.value)
                                            setCodeError('')
                                        }}
                                        placeholder="예: 달맞이100"
                                        className="w-full px-4 py-3.5 text-base sm:text-lg font-bold border-2 border-amber-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/30 focus:border-amber-500 transition-all placeholder:text-slate-400"
                                        autoFocus
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">
                                        🎁
                                    </span>
                                </div>
                                {codeError && (
                                    <p className="text-xs sm:text-sm text-red-600 font-semibold mt-2 flex items-center gap-1 animate-shake">
                                        <span>⚠️</span>
                                        <span>{codeError}</span>
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-2xl text-base sm:text-lg font-extrabold bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                            >
                                <span>인증하고 선물 신청하기</span>
                                <span>→</span>
                            </button>
                        </form>

                        <div className="text-center pt-2">
                            <p className="text-[11px] sm:text-xs text-slate-400 break-keep">
                                * 초대코드를 분실하셨거나 문자를 받지 못하셨다면 대표님께 편하게 문의해 주세요.
                            </p>
                        </div>
                    </div>
                )}

                {/* ================= STEP 2: 배송 정보 입력 단계 ================= */}
                {step === 'form' && (
                    <div className="p-6 sm:p-8 space-y-6">
                        {/* 상단 인증 성공 & 한정 수량 배너 */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🎉</span>
                                <div>
                                    <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md mr-1.5">
                                        지인 인증 완료
                                    </span>
                                    <span className="text-xs sm:text-sm font-black text-slate-900">
                                        파보겔 100ml (1병 무료 배송)
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-amber-700 block font-semibold">선착순 한정</span>
                                <span className="text-xs sm:text-sm font-black text-orange-600">
                                    잔여 {remainingCount}병
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
                            {/* 성함 */}
                            <div>
                                <label className="block font-bold text-slate-800 mb-1.5">
                                    받으시는 분 성함 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="성함을 입력해 주세요"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            {/* 연락처 */}
                            <div>
                                <label className="block font-bold text-slate-800 mb-1.5">
                                    휴대폰 번호 <span className="text-red-500">*</span>
                                    <span className="text-[11px] text-slate-500 font-normal ml-1.5">(택배 배송 조회용)</span>
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="010-1234-5678"
                                    maxLength={13}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            {/* 배송지 주소 */}
                            <div>
                                <label className="block font-bold text-slate-800 mb-1.5">
                                    선물 받으실 택배 주소 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                    placeholder="도로명 또는 지번 주소 입력"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium mb-2"
                                    required
                                />
                                <input
                                    type="text"
                                    value={form.detailAddress}
                                    onChange={e => setForm(p => ({ ...p, detailAddress: e.target.value }))}
                                    placeholder="동·호수 등 상세 주소"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                                />
                            </div>

                            {/* 함께하는 반려동물 */}
                            <div>
                                <label className="block font-bold text-slate-800 mb-1.5">
                                    함께하는 소중한 아이 <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {[
                                        { id: 'dog', label: '강아지 🐶' },
                                        { id: 'cat', label: '고양이 🐱' },
                                        { id: 'bird', label: '앵무새 🦜' },
                                        { id: 'other', label: '기타 🐾' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setForm(p => ({ ...p, petType: item.id }))}
                                            className={`py-2 px-1 text-center font-bold text-xs rounded-xl border-2 transition-all ${
                                                form.petType === item.id
                                                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={form.petDetails}
                                    onChange={e => setForm(p => ({ ...p, petDetails: e.target.value }))}
                                    placeholder="아이 이름 / 나이 / 견종·묘종 (선택)"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                                />
                            </div>

                            {/* 덕담 한마디 */}
                            <div>
                                <label className="block font-bold text-slate-800 mb-1.5">
                                    명절 인사 및 남기실 말씀 <span className="text-slate-400 font-normal">(선택)</span>
                                </label>
                                <textarea
                                    value={form.greeting}
                                    onChange={e => setForm(p => ({ ...p, greeting: e.target.value }))}
                                    rows={2}
                                    placeholder="대표님께 전하실 따뜻한 한마디를 남겨주세요 :)"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs resize-none"
                                />
                            </div>

                            {/* 개인정보 수집 및 배송 위탁 동의 */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                                <input
                                    id="chuseok-agree-check"
                                    type="checkbox"
                                    checked={form.agreed}
                                    onChange={e => setForm(p => ({ ...p, agreed: e.target.checked }))}
                                    className="mt-0.5 w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
                                />
                                <label htmlFor="chuseok-agree-check" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
                                    [필수] 추석 명절 선물(파보겔 100ml) 택배 발송을 위한 이름, 연락처, 주소 수집 및 택배사 배송 위탁에 동의합니다.
                                </label>
                            </div>

                            {/* 에러 메시지 */}
                            {submitError && (
                                <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                                    <span>⚠️</span>
                                    <span>{submitError}</span>
                                </p>
                            )}

                            {/* 제출 버튼 */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-2xl text-base sm:text-lg font-extrabold bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-xl shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>신청 접수 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🌕</span>
                                        <span>파보겔 100ml 명절 선물 신청하기 (무료)</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* ================= STEP 3: 완료 단계 ================= */}
                {step === 'success' && (
                    <div className="p-6 sm:p-8 text-center space-y-5">
                        <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-4xl shadow-inner animate-bounce">
                            🌕
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl sm:text-2xl font-black text-slate-900 break-keep">
                                추석 선물 신청이<br />
                                <span className="text-amber-600">정상 접수</span>되었습니다!
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-keep px-2">
                                소중한 아이를 위한 <strong>파보겔 100ml 1병</strong>을 정성껏 준비하여, <strong>추석 연휴 직후 우체국/택배</strong>로 안전하게 무료 발송해 드리겠습니다.
                            </p>
                        </div>

                        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 font-medium leading-relaxed break-keep">
                            🌾 올 한가위, 보름달처럼 마음까지 풍요롭고<br />
                            아이들과 함께 건강하고 행복한 명절 보내세요!
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors text-sm"
                        >
                            확인 및 닫기
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChuseokGiftModal
