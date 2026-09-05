import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// 기본 파트너 인증 코드 (실제 운영 시 여러 유효 코드 목록 또는 접두어 검증 가능)
const VALID_PARTNER_CODES = ['PARVO-BIZ', 'PARVO2026', 'PARTNER', 'VET-PRO', 'DOG-CARE', 'PET-CARE']

const PartnerNoticeModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation()

    // 탭: 'auth' (사업자 인증/확인), 'editor' (A4 맞춤 제작 & 인쇄), 'board' (실물 보드판 배송 신청)
    const [step, setStep] = useState('auth')
    const [authTab, setAuthTab] = useState('code') // 'code' (기존 파트너 코드) | 'register' (신규 파트너 간편 신청)

    // 인증 폼 데이터
    const [partnerCode, setPartnerCode] = useState('')
    const [authError, setAuthError] = useState('')

    // 신규 파트너 등록 폼
    const [bizForm, setBizForm] = useState({
        bizType: 'vet', // 'vet' (동물병원/약국) | 'wholesale' (도매/유통) | 'petshop' (펫샵/용품점)
        storeName: '',
        managerName: '',
        phone: '',
        bizNumber: '',
        addr: '',
    })

    // A4 알림판 커스텀 데이터
    const [noticeData, setNoticeData] = useState(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('parvogel_partner_custom_copy') : null
        return {
            storeName: '',
            topTel: '',
            botTel: '',
            addr: '',
            price: '18,000',
            includeQr: true,
            theme: saved ? 'custom' : 'all',
            customCopy: saved || '✨ 우리 동네 1등 상비약 | 갑작스런 구토·설사로 지친 우리 아이 | 동물용 활명수 파보겔로 빠르게 활력을 되찾아주세요',
        }
    })

    // 사용자 정의 카피 변경 시 로컬스토리지 자동 저장
    useEffect(() => {
        if (noticeData.customCopy) {
            try {
                localStorage.setItem('parvogel_partner_custom_copy', noticeData.customCopy)
            } catch (e) {
                console.warn('localStorage save failed:', e)
            }
        }
    }, [noticeData.customCopy])

    // 실물 POP 보드판 신청 상태
    const [boardRequest, setBoardRequest] = useState({
        recipientName: '',
        phone: '',
        address: '',
        requestQty: '1',
        notes: '',
    })
    const [isBoardSubmitted, setIsBoardSubmitted] = useState(false)
    const [isSubmittingBoard, setIsSubmittingBoard] = useState(false)

    if (!isOpen) return null

    // 코드 인증 처리
    const handleCodeVerify = (e) => {
        e.preventDefault()
        const clean = partnerCode.trim().toUpperCase()
        if (VALID_PARTNER_CODES.includes(clean) || clean.startsWith('PARVO') || clean.length >= 6) {
            setAuthError('')
            setStep('editor')
            if (!noticeData.storeName && bizForm.storeName) {
                setNoticeData(prev => ({
                    ...prev,
                    storeName: bizForm.storeName,
                    topTel: bizForm.phone,
                    botTel: bizForm.phone,
                    addr: bizForm.addr
                }))
            }
        } else {
            setAuthError('유효하지 않은 파트너 코드입니다. 안내받으신 코드(예: PARVO-BIZ)를 입력하시거나 신규 파트너 등록 탭을 이용해 주세요.')
        }
    }

    // 신규 파트너 등록 후 즉시 에디터 오픈
    const handleRegister = (e) => {
        e.preventDefault()
        if (!bizForm.storeName.trim() || !bizForm.phone.trim()) {
            alert('상호명(병원/매장명)과 연락처를 입력해 주세요.')
            return
        }

        // 알림판 초기값 자동 주입
        setNoticeData({
            storeName: bizForm.storeName,
            topTel: bizForm.phone,
            botTel: bizForm.phone,
            addr: bizForm.addr,
            price: '18,000',
            includeQr: true,
        })
        setBoardRequest(prev => ({
            ...prev,
            recipientName: bizForm.managerName || bizForm.storeName,
            phone: bizForm.phone,
            address: bizForm.addr,
        }))

        // 신규 파트너 DB 전송 (Apps Script 백그라운드)
        try {
            const scriptURL = 'https://script.google.com/macros/s/AKfycbyfD0j2r08gZ5mZ9sL1Fh_hJ-zW8t5q3l7k/exec'
            const params = new URLSearchParams()
            params.append('requestType', 'new_partner_lead')
            params.append('hospitalName', bizForm.storeName)
            params.append('contactName', bizForm.managerName || '대표자')
            params.append('phone', bizForm.phone)
            params.append('address', bizForm.addr)
            params.append('message', `[신규 사업자 알림판 신청] 업종: ${bizForm.bizType}, 사업자번호: ${bizForm.bizNumber}`)
            fetch(scriptURL, { method: 'POST', body: params, mode: 'no-cors' }).catch(() => {})
        } catch (err) {
            // 무시
        }

        setStep('editor')
    }

    // A4 새창 열기 (인쇄 페이지)
    const openPrintWindow = (autoPrint = false) => {
        const baseUrl = import.meta.env.BASE_URL || '/'
        const targetUrl = new URL(`${baseUrl}assets/parvogel-notice-A4.html`, window.location.origin)
        
        targetUrl.searchParams.set('name', noticeData.storeName || '파보겔 공식 취급점')
        if (noticeData.addr) targetUrl.searchParams.set('addr', noticeData.addr)
        if (noticeData.topTel) targetUrl.searchParams.set('topTel', noticeData.topTel)
        if (noticeData.botTel) targetUrl.searchParams.set('botTel', noticeData.botTel)
        if (noticeData.price) targetUrl.searchParams.set('price', noticeData.price)
        if (!noticeData.includeQr) targetUrl.searchParams.set('qr', 'false')
        if (noticeData.theme) targetUrl.searchParams.set('theme', noticeData.theme)
        if (noticeData.theme === 'custom' && noticeData.customCopy) {
            targetUrl.searchParams.set('customCopy', noticeData.customCopy)
        }
        if (autoPrint) targetUrl.searchParams.set('autoPrint', 'true')

        window.open(targetUrl.toString(), '_blank')
    }

    // 실물 보드판 배송 신청 제출
    const handleBoardSubmit = async (e) => {
        e.preventDefault()
        if (!boardRequest.recipientName || !boardRequest.phone || !boardRequest.address) {
            alert('수령자명, 연락처, 배송지 주소를 모두 입력해 주세요.')
            return
        }

        setIsSubmittingBoard(true)
        try {
            const scriptURL = 'https://script.google.com/macros/s/AKfycbyfD0j2r08gZ5mZ9sL1Fh_hJ-zW8t5q3l7k/exec'
            const params = new URLSearchParams()
            params.append('requestType', 'partner_board_pop')
            params.append('hospitalName', noticeData.storeName || bizForm.storeName || '파트너 매장')
            params.append('contactName', boardRequest.recipientName)
            params.append('phone', boardRequest.phone)
            params.append('address', boardRequest.address)
            params.append('quantity', boardRequest.requestQty)
            params.append('message', `[실물 POP 보드판 무료 발송 신청] 수량: ${boardRequest.requestQty}개 / 전달사항: ${boardRequest.notes}`)

            await fetch(scriptURL, { method: 'POST', body: params, mode: 'no-cors' })
            setIsBoardSubmitted(true)
        } catch (err) {
            console.error(err)
            setIsBoardSubmitted(true) // no-cors 특성 감안
        } finally {
            setIsSubmittingBoard(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
                {/* 상단 프리미엄 헤더 */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                                B2B Partner Portal
                            </span>
                            <span className="text-xs text-blue-200 font-medium">도매점·동물약품·펫샵 전용</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            파보겔 파트너스 웰컴 패키지 지원센터
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-200 mt-1">
                            매장 홍보용 맞춤 A4 알림판 즉시 출력 및 고급 매장 디스플레이 보드판(POP) 무상 지원
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="닫기"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 본문 컨텐츠 영역 */}
                <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
                    {/* STEP 1: 비즈니스 인증 게이트 */}
                    {step === 'auth' && (
                        <div className="space-y-5">
                            {/* 안내 배너 */}
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                                <span className="text-2xl mt-0.5">🛡️</span>
                                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                    <p className="font-bold text-blue-950 mb-0.5">일반 소비자와 분리된 사업자 전용 페이지입니다.</p>
                                    기존 거래처 코드를 보유 중이시거나, 파보겔을 취급 중인 동물약품 대리점·동물병원·펫샵 대표님께만 매장 인쇄물 제작기 및 보드판 지원 서비스를 무료로 제공합니다.
                                </div>
                            </div>

                            {/* 탭 버튼 */}
                            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setAuthTab('code')}
                                    className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                                        authTab === 'code' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    🔑 기존 파트너 코드 인증
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthTab('register')}
                                    className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                                        authTab === 'register' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    ✨ 신규 취급점 무료 인증/신청
                                </button>
                            </div>

                            {/* [탭 1] 파트너 코드 입력 */}
                            {authTab === 'code' && (
                                <form onSubmit={handleCodeVerify} className="space-y-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            발주처 전용 파트너 인증 코드
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={partnerCode}
                                                onChange={(e) => {
                                                    setPartnerCode(e.target.value)
                                                    setAuthError('')
                                                }}
                                                placeholder="예: PARVO-BIZ (또는 배송 라벨 안내 코드)"
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                                                autoFocus
                                            />
                                        </div>
                                        {authError ? (
                                            <p className="text-xs font-bold text-red-600 mt-1.5">{authError}</p>
                                        ) : (
                                            <p className="text-[11px] text-slate-500 mt-1.5">
                                                * 발송된 DM 안내문이나 제품 박스에 표기된 코드를 입력해 주세요. (테스트용: <code className="text-blue-600 font-bold">PARVO-BIZ</code>)
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>인증하고 맞춤 알림판 에디터 열기</span>
                                        <span>➔</span>
                                    </button>
                                </form>
                            )}

                            {/* [탭 2] 신규 취급점 신청 & 즉시 해금 */}
                            {authTab === 'register' && (
                                <form onSubmit={handleRegister} className="space-y-3 pt-1">
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'vet', label: '동물병원/약국' },
                                            { id: 'wholesale', label: '도매/대리점' },
                                            { id: 'petshop', label: '펫샵/용품점' },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setBizForm(prev => ({ ...prev, bizType: t.id }))}
                                                className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                                                    bizForm.bizType === t.id
                                                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                                                        : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                상호명 (매장명/병원명) *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="예: 한강 동물약품"
                                                value={bizForm.storeName}
                                                onChange={(e) => setBizForm(prev => ({ ...prev, storeName: e.target.value }))}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                대표자/담당자명
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="예: 홍길동 대표"
                                                value={bizForm.managerName}
                                                onChange={(e) => setBizForm(prev => ({ ...prev, managerName: e.target.value }))}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                담당 연락처 (전화번호) *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="010-0000-0000"
                                                value={bizForm.phone}
                                                onChange={(e) => setBizForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                사업자등록번호 (선택)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="000-00-00000"
                                                value={bizForm.bizNumber}
                                                onChange={(e) => setBizForm(prev => ({ ...prev, bizNumber: e.target.value }))}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            매장 위치 (주소)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="예: 경기도 수원시 팔달구 ..."
                                            value={bizForm.addr}
                                            onChange={(e) => setBizForm(prev => ({ ...prev, addr: e.target.value }))}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <span>취급점 등록 완료 & 즉시 A4 알림판 만들기</span>
                                        <span>➔</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* STEP 2: A4 맞춤 에디터 & 실시간 미리보기/인쇄 */}
                    {step === 'editor' && (
                        <div className="space-y-6">
                            {/* 상단 단계 내비 및 실물보드판 탭 전환 */}
                            <div className="flex items-center justify-between bg-slate-100 p-2 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold">1</span>
                                    <span className="text-xs sm:text-sm font-black text-slate-800">우리 매장 전용 A4 알림판 인쇄</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep('board')}
                                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm flex items-center gap-1 transition-all"
                                >
                                    <span>📦 실물 POP 보드판 신청하기</span>
                                    <span>➔</span>
                                </button>
                            </div>

                            {/* 알림판 입력 폼 그리드 */}
                            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                    <span>✏️</span>
                                    <span>인쇄용 매장 정보 실시간 입력 (인쇄물에 즉시 반영)</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            알림판 상단 매장명 *
                                        </label>
                                        <input
                                            type="text"
                                            value={noticeData.storeName}
                                            onChange={(e) => setNoticeData(prev => ({ ...prev, storeName: e.target.value }))}
                                            placeholder="예: 에스앤제이 동물약품"
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black text-blue-900 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            매장 판매가격 (원)
                                        </label>
                                        <input
                                            type="text"
                                            value={noticeData.price}
                                            onChange={(e) => setNoticeData(prev => ({ ...prev, price: e.target.value }))}
                                            placeholder="18,000"
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black text-red-600 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            상단 대표 전화번호
                                        </label>
                                        <input
                                            type="text"
                                            value={noticeData.topTel}
                                            onChange={(e) => setNoticeData(prev => ({ ...prev, topTel: e.target.value }))}
                                            placeholder="010-0000-0000"
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            하단 구매처 문의전화
                                        </label>
                                        <input
                                            type="text"
                                            value={noticeData.botTel}
                                            onChange={(e) => setNoticeData(prev => ({ ...prev, botTel: e.target.value }))}
                                            placeholder="031-000-0000"
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        하단 매장 주소
                                    </label>
                                    <input
                                        type="text"
                                        value={noticeData.addr}
                                        onChange={(e) => setNoticeData(prev => ({ ...prev, addr: e.target.value }))}
                                        placeholder="매장 도로명 주소 (미입력 시 생략됨)"
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                    />
                                </div>

                                {/* 메인 카피 테마 선택기 */}
                                <div className="bg-white p-3.5 rounded-xl border border-blue-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-[11.5px] font-black text-blue-950 flex items-center gap-1">
                                            <span>🎯</span>
                                            <span>A4 알림판 메인 카피 테마 선택 (랜딩페이지 4대 카피 연동)</span>
                                        </span>
                                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                            매장 타겟 맞춤 선택
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {[
                                            { 
                                                id: 'copy-a', 
                                                icon: '✨', 
                                                tag: '임상 실화',
                                                title: '7일간의 기적 임상 실화', 
                                                desc: '단 3일 만에 밥그릇 싹싹 비워내고 다시 건강하게 네 발로 일어섭니다' 
                                            },
                                            { 
                                                id: 'copy-b', 
                                                icon: '🚨', 
                                                tag: '응급 상비약',
                                                title: '24시간 안심 응급 상비약', 
                                                desc: '병원 문 닫은 새벽 갑작스런 구토·물설사, 엄마가 건넬 수 있는 가장 빠른 1초' 
                                            },
                                            { 
                                                id: 'copy-c', 
                                                icon: '🩺', 
                                                tag: '수의사 고백',
                                                title: '수의사 진료실 고백 실화', 
                                                desc: '안락사 위기 55일령 아기 푸들, 수액·독한 약 없이 오직 파보겔 단독 회복' 
                                            },
                                            { 
                                                id: 'copy-d', 
                                                icon: '🌿', 
                                                tag: '간편 급여',
                                                title: '스트레스 0% 간편 급여', 
                                                desc: '약 먹이기 전쟁 끝, 주사기 거품 토해냄 없이 1초 만에 맛있게 핥아먹습니다' 
                                            },
                                            { 
                                                id: 'all', 
                                                icon: '🐾', 
                                                tag: '전축종 추천',
                                                title: '통합형 (반려동물 & 가축)', 
                                                desc: '개·고양이부터 송아지까지, 토하고 설사할 때 동물용 활명수 한 병이면 든든합니다' 
                                            },
                                            { 
                                                id: 'livestock', 
                                                icon: '🐮', 
                                                tag: '축산 전문',
                                                title: '가축·축산 농가 전용', 
                                                desc: '신생 송아지·자돈 수양성 설사 발생 시 24시간 내 빠른 분변 정상화' 
                                            },
                                            { 
                                                id: 'custom', 
                                                icon: '✍️', 
                                                tag: '직접 입력',
                                                title: '우리 매장 맞춤 카피', 
                                                desc: '지역 상권이나 단골 고객 맞춤형으로 원하는 메인 문구를 직접 자유롭게 작성' 
                                            },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setNoticeData(prev => ({ ...prev, theme: opt.id }))}
                                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                                    noticeData.theme === opt.id
                                                        ? 'border-blue-600 bg-blue-50/90 text-blue-950 shadow-sm ring-2 ring-blue-600'
                                                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                                                        <span>{opt.icon}</span>
                                                        <span>{opt.title}</span>
                                                    </div>
                                                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                                                        noticeData.theme === opt.id 
                                                            ? 'bg-blue-600 text-white' 
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {opt.tag}
                                                    </span>
                                                </div>
                                                <div className="text-[10.5px] text-slate-500 mt-1 leading-snug line-clamp-2">
                                                    {opt.desc}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* 사용자 정의 카피 선택 시 전체 3줄 한 번에 입력하는 텍스트에어리어 */}
                                    {noticeData.theme === 'custom' && (
                                        <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                                                    <span>✍️</span>
                                                    <span>전체 카피 직접 입력 (상단뱃지 | 서브설명 | 메인강조)</span>
                                                </label>
                                                <span className="text-[10px] font-bold text-amber-700">
                                                    구분자: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-black">|</code> (또는 줄바꿈)
                                                </span>
                                            </div>
                                            <textarea
                                                rows={3}
                                                value={noticeData.customCopy}
                                                onChange={(e) => setNoticeData(prev => ({ ...prev, customCopy: e.target.value }))}
                                                placeholder="예: ✨ 우리 동네 1등 상비약 | 갑작스런 구토·설사로 지친 우리 아이 | 동물용 활명수 파보겔로 빠르게 활력을 되찾아주세요"
                                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 placeholder:font-normal placeholder:text-slate-400"
                                            />
                                            <div className="flex flex-wrap items-center justify-between text-[10px] text-amber-800/90 pt-0.5">
                                                <span>💡 <b>입력 팁:</b> `상단 뱃지문구 | 서브 헤드라인 | 메인 굵은 글씨` 순으로 입력하시면 A4에 최적 분할 렌더링됩니다</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={noticeData.includeQr}
                                            onChange={(e) => setNoticeData(prev => ({ ...prev, includeQr: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span>소비자용 온라인 상세설명 QR코드 포함</span>
                                    </label>
                                </div>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => openPrintWindow(false)}
                                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2"
                                >
                                    <span>🔍 전체화면 미리보기</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openPrintWindow(true)}
                                    className="py-3 px-4 bg-blue-900 hover:bg-blue-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 animate-pulse"
                                >
                                    <span>🖨️ A4 용지 즉시 칼라인쇄 (원클릭)</span>
                                </button>
                            </div>

                            {/* 안내 및 보드판 유도 박스 */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-4">
                                <div className="text-xs text-amber-900">
                                    <span className="font-black">💡 종이 출력이 번거로우신가요?</span>
                                    <p className="mt-0.5 text-amber-800">
                                        카운터나 매대에 세워둘 수 있는 두꺼운 하드 폼보드 POP 실물을 본사에서 무료 택배 배송해 드립니다.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep('board')}
                                    className="shrink-0 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
                                >
                                    실물 보드판 신청
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: 실물 매장 디스플레이 POP 보드판 무료 발송 신청 */}
                    {step === 'board' && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between bg-slate-100 p-2 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                                    <span className="text-xs sm:text-sm font-black text-slate-800">매장 디스플레이용 하드 POP 보드판 무료 신청</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep('editor')}
                                    className="text-xs font-bold text-slate-600 hover:text-slate-900"
                                >
                                    ➔ A4 알림판 인쇄로 돌아가기
                                </button>
                            </div>

                            {isBoardSubmitted ? (
                                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-3">
                                    <span className="text-4xl">🎉</span>
                                    <h4 className="text-lg font-black text-emerald-950">보드판 무료 발송 신청이 접수되었습니다!</h4>
                                    <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                                        대표님의 매장으로 파보겔 공식 하드 POP 보드판을 택배 발송해 드립니다. 발송 전 담당자가 배송 안내 문자를 발송해 드립니다.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsBoardSubmitted(false)
                                            setStep('editor')
                                        }}
                                        className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                                    >
                                        A4 알림판 인쇄기 이용하기
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleBoardSubmit} className="space-y-4">
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-1">
                                        <p className="font-bold text-slate-900">📦 파보겔 파트너스 POP 보드판 스펙 안내:</p>
                                        <p>• 5T 고밀도 하드 폼보드 + 무광 코팅 (오염 방지 및 고급스러운 질감)</p>
                                        <p>• 뒷면 접이식 종이 삼각대 내장으로 카운터, 쇼케이스, 매대 위에 즉시 직립 거치 가능</p>
                                        <p>• 배송비 및 제작비 전액 파보겔 본사 지원 (1매장당 1~2개 지원)</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                받으실 분 (매장명 / 대표자) *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={boardRequest.recipientName}
                                                onChange={(e) => setBoardRequest(prev => ({ ...prev, recipientName: e.target.value }))}
                                                placeholder="예: 에스앤제이 / 정성대"
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                연락처 (송장 안내용) *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={boardRequest.phone}
                                                onChange={(e) => setBoardRequest(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="010-0000-0000"
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            수령하실 택배 배송 주소 *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={boardRequest.address}
                                            onChange={(e) => setBoardRequest(prev => ({ ...prev, address: e.target.value }))}
                                            placeholder="매장 도로명 주소 및 상세 주소"
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                희망 수량
                                            </label>
                                            <select
                                                value={boardRequest.requestQty}
                                                onChange={(e) => setBoardRequest(prev => ({ ...prev, requestQty: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                                            >
                                                <option value="1">1개 (소형 매장/단일 카운터용)</option>
                                                <option value="2">2개 (카운터 1개 + 약품 진열대 1개)</option>
                                                <option value="3">3개 이상 (대형 도매 매장)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                배송 시 요청사항 (선택)
                                            </label>
                                            <input
                                                type="text"
                                                value={boardRequest.notes}
                                                onChange={(e) => setBoardRequest(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="예: 부재 시 문 앞 보관"
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingBoard}
                                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>{isSubmittingBoard ? '접수 처리 중...' : '실물 POP 보드판 무료 발송 신청하기'}</span>
                                        <span>➔</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* 하단 풋터 바 */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
                    <span>본사 파트너 직통: 010-5407-5708</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="font-bold text-slate-700 hover:text-slate-900"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PartnerNoticeModal
