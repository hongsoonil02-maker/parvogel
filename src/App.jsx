import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Chatbot from './components/Chatbot'

const ParvogelLanding = () => {
    const { t, i18n } = useTranslation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    const [isOrderComplete, setIsOrderComplete] = useState(false)
    const [formData, setFormData] = useState({
        hospitalName: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        product: 'parvogel-500ml',
        quantity: 1,
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [scrollY, setScrollY] = useState(0)
    const [activeSection, setActiveSection] = useState('hero')
    const themeRef = useRef('blue') // 'blue' or 'red'

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
            const sections = ['hero', 'about', 'features', 'clinical', 'target', 'testimonials', 'order']
            const scrollPosition = window.scrollY + 200

            for (const section of sections) {
                const element = document.getElementById(section)
                if (element) {
                    const { offsetTop, offsetHeight } = element
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section)
                        break
                    }
                }
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Smooth scroll to section
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            setIsMobileMenuOpen(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.hospitalName || !formData.contactName || !formData.phone) {
            alert('병원명, 담당자명, 연락처는 필수 입력 항목입니다.')
            return
        }

        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSubmitting(false)
        setIsOrderComplete(true)
        setFormData({
            hospitalName: '',
            contactName: '',
            phone: '',
            email: '',
            address: '',
            product: 'parvogel-500ml',
            quantity: 1,
            message: '',
        })
    }

    const toggleTheme = () => {
        themeRef.current = themeRef.current === 'blue' ? 'red' : 'blue'
        document.documentElement.classList.toggle('theme-red')
    }

    const primaryColor = themeRef.current === 'blue' ? 'primary' : 'accent'
    const primaryHover = themeRef.current === 'blue' ? 'hover:bg-primary-700' : 'hover:bg-accent-700'
    const primaryBg = themeRef.current === 'blue' ? 'bg-primary-600' : 'bg-accent-600'
    const primaryText = themeRef.current === 'blue' ? 'text-primary-600' : 'text-accent-600'
    const primaryBgLight = themeRef.current === 'blue' ? 'bg-primary-50' : 'bg-accent-50'
    const primaryBorder = themeRef.current === 'blue' ? 'border-primary-200' : 'border-accent-200'
    const primaryTextDark = themeRef.current === 'blue' ? 'text-primary-800' : 'text-accent-800'
    const primaryHoverBg = themeRef.current === 'blue' ? 'hover:bg-primary-100' : 'hover:bg-accent-100'
    const primaryHoverBorder = themeRef.current === 'blue' ? 'hover:border-primary-300' : 'hover:border-accent-300'
    const gradientText = themeRef.current === 'blue' ? 'gradient-text' : 'gradient-text-accent'
    const badgePrimary = themeRef.current === 'blue' ? 'badge-primary' : 'badge-accent'
    const primaryRing = themeRef.current === 'blue' ? 'focus:ring-primary-500' : 'focus:ring-accent-500'
    const primaryShadow = themeRef.current === 'blue' ? 'shadow-primary-500/25' : 'shadow-accent-500/25'

    const navItems = [
        { id: 'about', label: '제품소개' },
        { id: 'features', label: '핵심특장점' },
        { id: 'clinical', label: '임상증례' },
        { id: 'target', label: '적용대상' },
        { id: 'testimonials', label: '추천사' },
        { id: 'order', label: '주문문의' },
    ]

    const features = [
        {
            icon: '🧬',
            title: 'LIQI 초미세공정 기술',
            desc: '울트라파인 초미세공정(LIQI)으로 기존 정장지사제 원료 대비 15배 미세화된 입자 크기(D90 3μm 이하)',
            color: 'primary',
        },
        {
            icon: '🛡️',
            title: '초미세 몬모릴로나이트',
            desc: 'IgG 고농축으로 신생자동물의 수동면역 즉시 형성, 생존율 획기적 향상',
            color: 'accent',
        },
        {
            icon: '⚡',
            title: '신속한 흡수·작용',
            desc: '경구 투여 후 30분 내 장관 흡수, 설사 증상 24시간 내 현저한 호전',
            color: 'primary',
        },
        {
            icon: '🐄',
            title: '전축종 적용 가능',
            desc: '송아지, 갓난돼지, 염소새끼, 양새끼, 망아지 등 모든 축종 신생아 공통 사용',
            color: 'accent',
        },
        {
            icon: '🌡️',
            title: '상온 보관 가능',
            desc: '냉장 불필요, 상온 24개월 보관으로 농장·약국·온라인 유통 최적화',
            color: 'primary',
        },
        {
            icon: '📦',
            title: '다양한 포장 단위',
            desc: '100ml(개별), 200ml(중형), 500ml(농장용) - 용도별 맞춤 공급',
            color: 'accent',
        },
    ]

    const targetAnimals = [
        { icon: '🐄', name: '송아지', age: '생후 1~30일', diseases: '로타/코로나/대장균성 설사' },
        { icon: '🐐', name: '염소새끼', age: '생후 1~30일', diseases: '로타/코로나/크립토스포리디움' },
        { icon: '🐑', name: '양새끼', age: '생후 1~30일', diseases: '로타바이러스, 대장균성 장염' },
        { icon: '🐎', name: '망아지', age: '생후 1~60일', diseases: '로타바이러스, 살모넬라, 클로스트리디움' },
        { icon: '🐷', name: '갓난돼지', age: '생후 1~21일', diseases: 'PED, TGE, 로타바이러스 설사' },
    ]

    const clinicalData = [
        {
            title: '송아지 로타바이러스 설사 임상시험',
            subject: '생후 3~7일령 홀스타인 수송아지 40두',
            result: '치료군 설사 중단율 92.5% (대조군 45%)',
            detail: '투여 24시간 내 수분성 설사 중단, 체중증가율 대조군 대비 1.8배 향상',
            source: 'Korean J. Vet. Res. 2023'
        },
        {
            title: '갓난돼지 PED/TGE 복합감염 시험',
            subject: '생후 5일령 자돈 60두 (시험군 30, 대조군 30)',
            result: '생존율 86.7% (대조군 40%)',
            detail: '바이러스 배출량 99.9% 감소, 장융모 높이 회복 속도 3배 빠름',
            source: 'J. Vet. Sci. 2024'
        },
        {
            title: '염소·양 신생아 크립토스포리디움증',
            subject: '생후 10일령 염소새끼 24두, 양새끼 24두',
            result: '오오시스트 배출 95% 감소',
            detail: '설사 지속일수 평균 2.3일 (대조군 6.8일), 폐사율 0% 달성',
            source: 'Korean J. Parasitol. 2023'
        },
    ]

    const testimonials = [
        {
            name: '김○○ 원장',
            clinic: '○○동물병원 (경기)',
            role: '소 임상 20년 경력',
            content: '"송아지 설사 시즌마다 파보겔 처방하는데, 24시간 내 설사 멎고 활력 회복되는 케이스가 90% 넘습니다. 농장주 만족도 최고."',
            rating: 5,
        },
        {
            name: '박○○ 원장',
            clinic: '○○축산동물병원 (충남)',
            role: '돼지·소 임상 전문',
            content: '"PED 발생 농장에 파보겔 500ml 응급 투여했더니 폐사율 40%→8%로 급감. 상온보관이라 농장 비치용으로 필수 추천."',
            rating: 5,
        },
        {
            name: '이○○ 약사',
            clinic: '○○동물약국 (전북)',
            role: '동물약국 15년 운영',
            content: '"쿠팡·네이버쇼핑 입점 후 재구매율 78%. 50ml 소포장은 초보 축주도 부담없이 구매, 500ml는 전업농 단골 확보."',
            rating: 5,
        },
    ]

    const products = [
        { id: 'parvogel-100ml', name: '파보겔 100ml', desc: '개별 투약용 / 초보 축주 추천', price: '18,000원', unit: '1병', badge: '인기' },
        { id: 'parvogel-200ml', name: '파보겔 200ml', desc: '중형 농장 / 경제적 선택', price: '45,000원', unit: '1병', badge: '베스트' },
        { id: 'parvogel-500ml', name: '파보겔 500ml', desc: '대규모 농장 / 도매 공급', price: '120,000원', unit: '1병', badge: '대용량' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                aria-label="테마 변경"
                title="블루/레드 테마 전환"
            >
                {themeRef.current === 'blue' ? (
                    <span className="text-accent-600 text-xl">🔴</span>
                ) : (
                    <span className="text-primary-600 text-xl">🔵</span>
                )}
            </button>

            {/* Header */}
            <header className={`sticky top-0 z-40 transition-all duration-300 ${scrollY > 20
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
                : 'bg-transparent'
                }`}>
                <nav className="section-container" aria-label="메인 네비게이션">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 sm:gap-3" onClick={() => scrollToSection('hero')}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${primaryBg} shadow-lg`}>
                                <span className="text-white font-extrabold text-xl">P</span>
                            </div>
                            <span className="font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight hidden sm:block">
                                파보겔 <span className={`${primaryText} font-black`}>Parvogel</span>
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`relative text-sm font-semibold transition-colors ${activeSection === item.id
                                        ? primaryText
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {item.label}
                                    {activeSection === item.id && (
                                        <span className={`absolute bottom -6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${primaryBg}`} />
                                    )}
                                </button>
                            ))}

                            {/* Language Toggle - Desktop Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors">
                                    <span className="text-sm"></span>
                                    <span className="text-xs font-bold text-gray-700">{i18n.language.toUpperCase()}</span>
                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-1 max-h-64 overflow-y-auto">
                                        {['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'th', 'vi', 'ru', 'pt', 'ar', 'id', 'ms', 'tr'].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => i18n.changeLanguage(lang)}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${i18n.language === lang
                                                    ? `${primaryBg} text-white`
                                                    : 'text-gray-700'
                                                    }`}
                                            >
                                                {lang.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setIsOrderModalOpen(true); setIsOrderComplete(false); }}
                                className={`btn-primary ${primaryBg} ${primaryHover} text-sm px-6 py-2.5`}
                            >
                                주문 문의
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            aria-label="메뉴 열기"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
                            <div className="flex flex-col gap-2">
                                {navItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className={`text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${activeSection === item.id
                                            ? `${primaryBgLight} ${primaryText}`
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}

                                {/* Language Toggle - Mobile */}
                                <div className="px-4 py-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">언어 선택</p>
                                    <div className="flex flex-wrap gap-1">
                                        {['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'th', 'vi', 'ru', 'pt', 'ar', 'id', 'ms', 'tr'].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => i18n.changeLanguage(lang)}
                                                className={`text-xs font-bold px-2 py-1 rounded-full transition-all ${i18n.language === lang
                                                    ? `${primaryBg} text-white shadow-sm`
                                                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {lang.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setIsOrderModalOpen(true); setIsOrderComplete(false); setIsMobileMenuOpen(false); }}
                                    className={`btn-primary ${primaryBg} ${primaryHover} mt-2`}
                                >
                                    주문 문의하기
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <div className={`absolute inset-0 bg-gradient-to-br from-${primaryColor}-50 via-white to-${primaryColor === 'primary' ? 'accent' : 'primary'}-50`} />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
                </div>

                <div className="section-container relative z-10 py-10">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-lg mb-6 animate-fade-in-up">
                            <span className={`w-2 h-2 rounded-full ${primaryBg} animate-pulse`} />
                            <span className="text-sm font-semibold text-gray-700">설사 치료 보조제 · 온라인 공식 판매처</span>
                        </div>

                        {/* Main Title */}
                        <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-snug mb-6 animate-fade-in-up ${gradientText}`}>
                            동물의 신생아 설사
                            <br className="mb-4" />
                            <span className="block mt-4">파보겔 하나로 해결</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            송아지·난돼지·염소새끼·양새끼·망아지 등 <strong className="text-gray-900">모든 동물의 신생아</strong> 대상<br />
                            로타·코로나·파보바이러스·대장균·크립토스포리디움 광범위 억제
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <button
                                onClick={() => { setIsOrderModalOpen(true); setIsOrderComplete(false); }}
                                className={`btn-primary w-full sm:w-auto ${primaryBg} ${primaryHover} text-lg px-10 py-5`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                쿠팡·네이버쇼핑 주문하기
                            </button>
                            <button
                                onClick={() => scrollToSection('clinical')}
                                className={`btn-secondary w-full sm:w-auto text-lg px-10 py-5 ${primaryText} ${primaryBgLight} ${primaryBorder} ${primaryHoverBg} ${primaryHoverBorder}`}
                            >
                                임상 데이터 확인
                            </button>
                        </div>


                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 sm:py-28 lg:py-32 bg-white">
                <div className="section-container">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div>
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                                파보겔이란?
                            </span>
                            <h2 className="section-title">초미세 몬모릴로나이트로<br />신생아 생존율을 지킵니다</h2>
                            <p className="section-subtitle">
                                파보겔(Parvogel)은 초미세 몬모릴로나이트를 주성분으로 하는
                                경구용 설사 치료 보조제입니다. 신생아 동물이 초유를 충분히 섭취하지 못했거나,
                                바이러스·세균·원충 감염으로 설사할 때 신속한 보호막을 형성합니다.
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                {[
                                    { label: '주성분', value: 'IgG 30% 이상 고농축' },
                                    { label: '제형', value: '경구 액제 (맛좋은 바닐라향)' },
                                    { label: '용법', value: '체중 10kg당 10ml, 1일 2회' },
                                    { label: '보관', value: '상온 1~30℃, 24개월' },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className={`relative aspect-square max-w-md mx-auto ${primaryBgLight} rounded-3xl p-1`}>
                                <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center">
                                    <div className={`w-24 h-24 rounded-2xl ${primaryBg} flex items-center justify-center mb-6 shadow-lg`}>
                                        <span className="text-white text-4xl font-extrabold">P</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">파보겔 500ml</h3>
                                    <p className="text-gray-600 text-center mb-6">농장 상비약 표준 규격<br />체중 50kg 기준 25회 분량</p>
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                                        <span className={`px-3 py-1 rounded-full ${badgePrimary}`}>IgG 30%+</span>
                                        <span className={`px-3 py-1 rounded-full ${badgePrimary}`}>상온보관</span>
                                        <span className={`px-3 py-1 rounded-full ${badgePrimary}`}>동물의</span>
                                    </div>
                                </div>
                            </div>
                            {/* Floating badges */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-2xl shadow-lg p-4 border-2 border-primary-100 animate-float">
                                <p className="text-xs text-gray-500 text-center mb-1">쿠팡</p>
                                <p className="text-2xl font-extrabold text-gray-900 text-center">로켓배송</p>
                            </div>
                            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white rounded-2xl shadow-lg p-4 border-2 border-accent-100 animate-float" style={{ animationDelay: '1s' }}>
                                <p className="text-xs text-gray-500 text-center mb-1">네이버</p>
                                <p className="text-2xl font-extrabold text-gray-900 text-center">쇼핑입점</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-28 lg:py-32 bg-gray-50">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                            핵심 특장점
                        </span>
                        <h2 className="section-title">6가지 이유로 선택받는 파보겔</h2>
                        <p className="section-subtitle">
                            수의사·축산농가·약국 현장의 목소리를 반영해 개발된 차세대 신생아 설사 치료 보조제
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="card group"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-2xl ${feature.color === 'primary' ? 'bg-primary-100' : 'bg-accent-100'} group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Clinical Evidence Section */}
            <section id="clinical" className="py-20 sm:py-28 lg:py-32 bg-white">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                            임상 근거
                        </span>
                        <h2 className="section-title">검증된 효과, 논문으로 입증</h2>
                        <p className="section-subtitle">
                            국내 유수 대학·연구기관 임상시험에서 확인된 탁월한 치료 효과
                        </p>
                    </div>

                    <div className="space-y-6 max-w-5xl mx-auto">
                        {clinicalData.map((study, i) => (
                            <div
                                key={i}
                                className={`card relative overflow-hidden border-l-4 ${primaryBorder} group`}
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                <div className="grid lg:grid-cols-4 gap-6">
                                    <div className="lg:col-span-1">
                                        <div className={`w-full h-32 ${primaryBgLight} rounded-xl flex items-center justify-center`}>
                                            <span className="text-4xl">{targetAnimals[i % targetAnimals.length].icon}</span>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-3">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className={`badge ${badgePrimary}`}>{study.subject}</span>
                                            <span className="text-sm text-gray-500">{study.source}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{study.title}</h3>
                                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                            <div className={`p-3 rounded-xl ${primaryBgLight}`}>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">핵심 결과</p>
                                                <p className="text-lg font-bold text-gray-900">{study.result}</p>
                                            </div>
                                            <div className={`p-3 rounded-xl ${primaryBgLight}`}>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">상세 지표</p>
                                                <p className="text-sm text-gray-700">{study.detail}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">더 자세한 임상 데이터와 논문 원문이 필요하신가요?</p>
                        <button
                            onClick={() => { setIsOrderModalOpen(true); setIsOrderComplete(false); }}
                            className={`btn-primary ${primaryBg} ${primaryHover} inline-flex`}
                        >
                            자료 요청하기
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* Target Animals Section */}
            <section id="target" className="py-20 sm:py-28 lg:py-32 bg-gray-50">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                            적용 대상 동물
                        </span>
                        <h2 className="section-title">동물의 신생아, 한 병으로 커버</h2>
                        <p className="section-subtitle">
                            동물별 주요 설사 원인체와 권장 투여 시기를 확인하세요
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {targetAnimals.map((animal, i) => (
                            <div
                                key={animal.name}
                                className="card relative overflow-hidden group"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-3xl ${primaryBgLight} opacity-10 group-hover:opacity-20 transition-opacity`} />
                                <div className="relative z-10">
                                    <div className="text-5xl mb-4">{animal.icon}</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{animal.name}</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className={`w-4 h-4 ${primaryText}`} fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                                            <span>적용 시기: <strong className="text-gray-900">{animal.age}</strong></span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <svg className={`w-4 h-4 ${primaryText} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a1 1 0 10-2 0 1 1 0 002 0zm0 8a1 1 0 10-2 0 1 1 0 002 0zm0-11a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" /></svg>
                                            <div>
                                                <p className="font-semibold text-gray-900">주요 원인체</p>
                                                <p className="text-gray-600">{animal.diseases}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${primaryColor}-300 to-transparent`} />
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">기타 동물(사슴, 토끼, 타조 등)도 수의사 처방 하에 적용 가능</p>
                        <button
                            onClick={() => scrollToSection('order')}
                            className={`btn-secondary ${primaryText} ${primaryBgLight} ${primaryBorder} ${primaryHoverBg} ${primaryHoverBorder}`}
                        >
                            우리 농장 맞춤 상담받기
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 sm:py-28 lg:py-32 bg-white">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                            현장의 목소리
                        </span>
                        <h2 className="section-title">수의사·약사·축주님이 직접 증명합니다</h2>
                        <p className="section-subtitle">
                            전국 200+ 동물병원·약국·농장에서 검증된 파보겔의 실력
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {testimonials.map((testimonial, i) => (
                            <div
                                key={i}
                                className="card relative"
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <svg key={j} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-6">"{testimonial.content}"</p>
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.clinic}</p>
                                    <p className="text-xs text-gray-400 mt-1">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="py-20 sm:py-28 lg:py-32 bg-gray-50">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                            제품 라인업
                        </span>
                        <h2 className="section-title">용도별 맞춤 포장 단위</h2>
                        <p className="section-subtitle">
                            농장 규모와 용도에 맞춰 선택하세요. 모두 쿠팡 로켓배송·네이버쇼핑 당일발송
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {products.map((product, i) => (
                            <div
                                key={product.id}
                                className={`card relative ${i === 1 ? 'ring-2 ring-primary-500 scale-105 z-10 shadow-2xl' : ''}`}
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                {i === 1 && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${primaryBg}`}>
                                            추천 상품
                                        </span>
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${primaryBgLight}`}>
                                        <div className={`w-12 h-20 rounded-lg ${primaryBg} flex items-center justify-center shadow-lg`}>
                                            <span className="text-white font-extrabold text-xl">P</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{product.desc}</p>
                                </div>
                                <div className={`p-4 rounded-xl ${primaryBgLight} mb-6`}>
                                    <div className="flex items-baseline justify-center gap-1 mb-1">
                                        <span className="text-3xl font-extrabold text-gray-900">{product.price}</span>
                                        <span className="text-gray-500">/{product.unit}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">부가세 포함 · 배송비 별도</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, product: product.id }));
                                        setIsOrderModalOpen(true);
                                        setIsOrderComplete(false);
                                    }}
                                    className={`w-full ${i === 1 ? 'btn-primary' : 'btn-secondary'} ${i === 1 ? `${primaryBg} ${primaryHover}` : `${primaryText} ${primaryBgLight} ${primaryBorder} ${primaryHoverBg} ${primaryHoverBorder}`}`}
                                >
                                    {i === 1 ? '주문하기' : '문의하기'}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">대량 구매(10병 이상) 및 도매 문의는 별도 상담 바랍니다.</p>
                        <button
                            onClick={() => { setIsOrderModalOpen(true); setIsOrderComplete(false); }}
                            className={`btn-primary ${primaryBg} ${primaryHover} inline-flex`}
                        >
                            도매·대량 구매 상담
                        </button>
                    </div>
                </div>
            </section>

            {/* Order Section */}
            <section id="order" className="py-20 sm:py-28 lg:py-32 bg-white">
                <div className="section-container">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                                주문 및 상담
                            </span>
                            <h2 className="section-title">지금 바로 주문하세요</h2>
                            <p className="section-subtitle">
                                쿠팡 로켓배송·네이버쇼핑 당일발송. 대량구매·도매는 별도 견적 드립니다.
                            </p>
                        </div>

                        <div className="card">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="hospitalName" className="block text-sm font-semibold text-gray-700 mb-2">
                                            병원/농장/업체명 <span className="text-accent-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="hospitalName"
                                            name="hospitalName"
                                            value={formData.hospitalName}
                                            onChange={handleInputChange}
                                            placeholder="예: 서울동물병원, 한우농장, OO약국"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="contactName" className="block text-sm font-semibold text-gray-700 mb-2">
                                            담당자명 <span className="text-accent-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="contactName"
                                            name="contactName"
                                            value={formData.contactName}
                                            onChange={handleInputChange}
                                            placeholder="예: 김철수"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                            연락처 <span className="text-accent-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="010-1234-5678"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            이메일
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="order@clinic.com"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                                        배송 주소
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={2}
                                        placeholder="우편번호 포함 상세 주소"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="product" className="block text-sm font-semibold text-gray-700 mb-2">
                                            희망 제품
                                        </label>
                                        <select
                                            id="product"
                                            name="product"
                                            value={formData.product}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
                                        >
                                            <option value="parvogel-50ml">파보겔 50ml (18,000원)</option>
                                            <option value="parvogel-500ml">파보겔 500ml (120,000원) - 추천</option>
                                            <option value="parvogel-1l">파보겔 1L (220,000원)</option>
                                            <option value="consultation">상담 후 결정</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                                            수량 (병)
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="100"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                        문의사항 / 특이사항
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="예: 초유 섭취 못한 송아지 10두 긴급 투약 필요, 도매가 문의 등"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${primaryBg} ${primaryHover} text-white ${primaryShadow} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            접수 중...
                                        </span>
                                    ) : (
                                        '주문 접수하기'
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-400">
                                    제출된 정보는 주문 상담 목적으로만 사용되며, 개인정보처리방침에 따라 안전하게 관리됩니다.
                                </p>
                            </form>
                        </div>

                        {/* Online Store Links */}
                        <div className="mt-12 text-center">
                            <p className="text-gray-600 mb-4">바로 구매를 원하시면 공식 온라인몰을 이용하세요</p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <a href="https://coupang.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                    <span className="font-semibold">쿠팡 로켓배송</span>
                                </a>
                                <a href="https://shopping.naver.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                                    <span className="font-semibold">네이버쇼핑</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-16">
                <div className="section-container">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${primaryBg}`}>
                                    <span className="text-white font-extrabold text-xl">P</span>
                                </div>
                                <span className="font-extrabold text-xl text-white">파보겔 <span className={`${primaryText} font-black`}>Parvogel</span></span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-sm">
                                동물의 신생아 설사 치료의 새로운 기준. 초미세 몬모릴로나이트로 생존율을 지킵니다.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://coupang.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                </a>
                                <a href="https://shopping.naver.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                                </a>
                                <a href="mailto:parvogel@company.com" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">제품 정보</h4>
                            <ul className="space-y-2">
                                <li><a href="#about" className="hover:text-white transition-colors">제품 소개</a></li>
                                <li><a href="#features" className="hover:text-white transition-colors">핵심 특장점</a></li>
                                <li><a href="#clinical" className="hover:text-white transition-colors">임상 데이터</a></li>
                                <li><a href="#target" className="hover:text-white transition-colors">적용 대상</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">고객 지원</h4>
                            <ul className="space-y-2">
                                <li><a href="#order" className="hover:text-white transition-colors">주문 문의</a></li>
                                <li><a href="tel:02-6949-5708" className="hover:text-white transition-colors">고객센터: 02-6949-5708</a></li>
                                <li><a href="mailto:parvogel@company.com" className="hover:text-white transition-colors">이메일 문의</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">자주 묻는 질문</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                            <p className="text-gray-500 text-sm">
                                © 2025 파보겔 (Parvogel). All rights reserved.
                            </p>
                            <div className="flex gap-6 text-sm text-gray-500">
                                <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
                                <a href="#" className="hover:text-white transition-colors">이용약관</a>
                                <a href="#" className="hover:text-white transition-colors">사업자정보확인</a>
                            </div>
                        </div>
                        <div className="text-center text-gray-500 text-xs space-y-1">
                            <p>판매자: (주)한국아그로</p>
                            <p>주소: 서울특별시 마포구 큰우물로 75 성지빌딩 1506호</p>
                            <p>전화: 02-6949-5708</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Order Modal */}
            {
                isOrderModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-slide-up ${primaryBorder}`}>
                            {isOrderComplete ? (
                                <div className="p-8 sm:p-12 text-center">
                                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${primaryBgLight}`}>
                                        <svg className={`w-10 h-10 ${primaryText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">주문 접수 완료!</h3>
                                    <p className="text-gray-600 mb-6">
                                        담당자가 1시간 내 연락드리겠습니다.<br />
                                        급한 경우 <a href="tel:1588-0000" className={`${primaryText} font-semibold underline`}>1588-0000</a>로 전화 주세요.
                                    </p>
                                    <button
                                        onClick={() => setIsOrderModalOpen(false)}
                                        className={`btn-primary ${primaryBg} ${primaryHover} w-full sm:w-auto`}
                                    >
                                        확인
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">주문 및 상담 신청</h3>
                                        <button
                                            onClick={() => { setIsOrderModalOpen(false); setIsOrderComplete(false); }}
                                            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                            aria-label="닫기"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="modal-hospitalName" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    병원/농장/업체명 <span className="text-accent-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="modal-hospitalName"
                                                    name="hospitalName"
                                                    value={formData.hospitalName}
                                                    onChange={handleInputChange}
                                                    placeholder="예: 서울동물병원"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="modal-contactName" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    담당자명 <span className="text-accent-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="modal-contactName"
                                                    name="contactName"
                                                    value={formData.contactName}
                                                    onChange={handleInputChange}
                                                    placeholder="예: 김철수"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="modal-phone" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    연락처 <span className="text-accent-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="modal-phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="010-1234-5678"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="modal-email" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    이메일
                                                </label>
                                                <input
                                                    type="email"
                                                    id="modal-email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="order@clinic.com"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="modal-address" className="block text-sm font-semibold text-gray-700 mb-1">
                                                배송 주소
                                            </label>
                                            <textarea
                                                id="modal-address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows={2}
                                                placeholder="우편번호 포함 상세 주소"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="modal-product" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    희망 제품
                                                </label>
                                                <select
                                                    id="modal-product"
                                                    name="product"
                                                    value={formData.product}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
                                                >
                                                    <option value="parvogel-50ml">파보겔 50ml (18,000원)</option>
                                                    <option value="parvogel-500ml">파보겔 500ml (120,000원) - 추천</option>
                                                    <option value="parvogel-1l">파보겔 1L (220,000원)</option>
                                                    <option value="consultation">상담 후 결정</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="modal-quantity" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    수량 (병)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="modal-quantity"
                                                    name="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleInputChange}
                                                    min="1"
                                                    max="100"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="modal-message" className="block text-sm font-semibold text-gray-700 mb-1">
                                                문의사항 / 특이사항
                                            </label>
                                            <textarea
                                                id="modal-message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder="예: 초유 섭취 못한 송아지 10두 긴급 투약 필요, 도매가 문의 등"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${primaryBg} ${primaryHover} text-white ${primaryShadow} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    접수 중...
                                                </span>
                                            ) : (
                                                '주문 접수하기'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Custom Styles */}
            <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .theme-red .gradient-text { background: linear-gradient(to right, #dc2626, #991b1b); -webkit-background-clip: text; background-clip: text; color: transparent; }
      `}</style>
        </div >
    )
}

export default ParvogelLanding