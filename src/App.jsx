import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Chatbot from './components/Chatbot'
import QrCode from './components/QrCode'

const ParvogelLanding = () => {
    const { t, i18n } = useTranslation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    const [isOrderComplete, setIsOrderComplete] = useState(false)
    const [legalType, setLegalType] = useState(null) // 'privacy' | 'terms' | 'business' | null
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

    // Fixed Deep Blue + Gold theme (no toggle)
    const primaryColor = 'primary'
    const primaryHover = 'hover:bg-primary-700'
    const primaryBg = 'bg-primary-600'
    const primaryText = 'text-primary-600'
    const primaryBgLight = 'bg-primary-50'
    const primaryBorder = 'border-primary-200'
    const primaryTextDark = 'text-primary-800'
    const primaryHoverBg = 'hover:bg-primary-100'
    const primaryHoverBorder = 'hover:border-primary-300'
    const gradientText = 'gradient-text'
    const badgePrimary = 'badge-primary'
    const primaryRing = 'focus:ring-primary-500'
    const primaryShadow = 'shadow-primary-500/25'

    const navItems = [
        { id: 'about', label: t('nav.about') },
        { id: 'features', label: t('nav.features') },
        { id: 'clinical', label: t('nav.clinical') },
        { id: 'tech', label: t('nav.tech') },
        { id: 'experts', label: t('nav.experts') },
        { id: 'target', label: t('nav.target') },
        { id: 'testimonials', label: t('nav.testimonials') },
        { id: 'order', label: t('nav.order') },
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
            desc: '초미세 몬모릴로나이트가 장 내 유해균·바이러스를 강력히 흡착하고, 바실러스 서브틸리스가 장 환경을 개선해 생존율을 향상합니다',
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
            desc: '송아지, 갓난돼지, 새끼 염소, 새끼 양, 망아지 등 모든 축종 신생아 공통 사용',
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
        { icon: '🐐', name: '새끼 염소', age: '생후 1~30일', diseases: '로타/코로나/크립토스포리디움' },
        { icon: '🐑', name: '새끼 양', age: '생후 1~30일', diseases: '로타바이러스, 대장균성 장염' },
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
            subject: '생후 10일령 새끼 염소 24두, 새끼 양 24두',
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
            content: '"쿠팡·네이버쇼핑 입점 후 재구매율 78%. 100ml 소포장은 초보 축주도 부담없이 구매, 500ml는 전업농 단골 확보."',
            rating: 5,
        },
    ]

    const products = [
        { id: 'parvogel-100ml', name: '파보겔 100ml', desc: '개별 투약용 / 초보 축주 추천', price: '18,000원', unit: '1병', badge: '인기' },
        { id: 'parvogel-200ml', name: '파보겔 200ml', desc: '중형 농장 / 경제적 선택', price: '30,000원', unit: '1병', badge: '베스트' },
        { id: 'parvogel-500ml', name: '파보겔 500ml', desc: '대규모 농장 / 도매 공급', price: '75,000원', unit: '1병', badge: '대용량' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className={`sticky top-0 z-40 transition-all duration-300 ${scrollY > 20
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
                : 'bg-transparent'
                }`}>
                <nav className="section-container" aria-label="메인 네비게이션">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 sm:gap-3" onClick={() => scrollToSection('hero')}>
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${primaryBg} shadow-lg`}>
                                <span className="text-white font-extrabold text-2xl">P</span>
                            </div>
                            <span className="font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight">
                                파보겔 <span className={`${primaryText} font-black`}>ParvoGel</span>
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

                <div className="section-container relative z-10 py-6">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-lg mb-6 animate-fade-in-up">
                            <span className={`w-3.5 h-3.5 sm:w-2.5 sm:h-2.5 rounded-full ${primaryBg} animate-pulse flex-shrink-0`} />
                            <span className="text-sm font-semibold text-gray-700 text-center leading-snug">{t('hero.badge').split('\n').map((line, i) => (<span key={i} className="block">{line}</span>))}</span>
                        </div>

                        {/* Main Title */}
                        <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-tight text-center mb-8 animate-fade-in-up ${gradientText}`}>
                            {t('hero.title').split('\n').map((line, i) => (
                                <span key={i} className="block">{line}</span>
                            ))}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            {t('hero.subtitle')}<br />
                            {t('hero.subtitle2')}
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
                                {t('hero.cta1')}
                            </button>
                            <button
                                onClick={() => scrollToSection('clinical')}
                                className={`btn-secondary w-full sm:w-auto text-lg px-10 py-5 ${primaryText} ${primaryBgLight} ${primaryBorder} ${primaryHoverBg} ${primaryHoverBorder}`}
                            >
                                {t('hero.cta2')}
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
                                {t('about.badge')}
                            </span>
                            <h2 className="section-title">{t('about.title')}</h2>
                            <p className="section-subtitle">
                                {t('about.desc1')}
                            </p>
                            <p className="section-subtitle mt-4">
                                {t('about.desc2')}
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                {[
                                    { label: t('about.ingredient'), value: t('about.ingredientVal') },
                                    { label: t('about.form'), value: t('about.formVal') },
                                    { label: t('about.dosage'), value: t('about.dosageVal') },
                                    { label: t('about.storage'), value: t('about.storageVal') },
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
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{products[2].name}</h3>
                                    <p className="text-gray-600 text-center mb-6">{products[2].desc}<br />{products[2].price}</p>
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                                        <span className={`px-3 py-1 rounded-full ${badgePrimary}`}>{t('about.ingredientVal')}</span>
                                        <span className={`px-3 py-1 rounded-full ${badgePrimary}`}>{t('about.storage')}</span>
                                        <span className={`px-3 py-1 rounded-full ${badgePrimary}`}>{t('about.dosage')}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Floating badges */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-2xl shadow-lg p-4 border-2 border-primary-100 animate-float">
                                <p className="text-xs text-gray-500 text-center mb-1">{t('about.coupang')}</p>
                                <p className="text-2xl font-extrabold text-gray-900 text-center">{t('about.rocket')}</p>
                            </div>
                            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white rounded-2xl shadow-lg p-4 border-2 border-accent-100 animate-float" style={{ animationDelay: '1s' }}>
                                <p className="text-xs text-gray-500 text-center mb-1">{t('about.naver')}</p>
                                <p className="text-2xl font-extrabold text-gray-900 text-center">{t('about.shopping')}</p>
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
                            {t('features.badge')}
                        </span>
                        <h2 className="section-title">{t('features.title').split('\n').map((line, i) => (<span key={i} className="block">{line}</span>))}</h2>
                        <p className="section-subtitle">
                            {t('features.subtitle')}
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
                            {t('clinical.badge')}
                        </span>
                        <h2 className="section-title">{t('clinical.title').split('\n').map((line, i) => (<span key={i} className="block">{line}</span>))}</h2>
                        <p className="section-subtitle">
                            {t('clinical.subtitle')}
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

            {/* Technology & Test Data Section */}
            <section id="tech" className="py-20 sm:py-28 lg:py-32 bg-gray-50">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                            {t('tech.badge')}
                        </span>
                        <h2 className="section-title">{t('tech.title').split('\n').map((line, i) => (<span key={i} className="block">{line}</span>))}</h2>
                        <p className="section-subtitle">
                            {t('tech.subtitle')}
                        </p>
                    </div>

                    {/* LIQI vs General Table */}
                    <div className="max-w-5xl mx-auto mb-16">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('tech.tableTitle')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse bg-white rounded-2xl shadow-lg overflow-hidden">
                                <thead>
                                    <tr className={`${primaryBg} text-white`}>
                                        <th className="px-4 py-3 text-left font-semibold">{t('tech.colItem')}</th>
                                        <th className="px-4 py-3 text-left font-semibold">{t('tech.colGeneral')}</th>
                                        <th className="px-4 py-3 text-left font-semibold">{t('tech.colLiqi')}</th>
                                        <th className="px-4 py-3 text-left font-semibold">{t('tech.colEffect')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { item: t('tech.r1Item'), g: t('tech.r1General'), l: t('tech.r1Liqi'), e: t('tech.r1Effect') },
                                        { item: t('tech.r2Item'), g: t('tech.r2General'), l: t('tech.r2Liqi'), e: t('tech.r2Effect') },
                                        { item: t('tech.r3Item'), g: t('tech.r3General'), l: t('tech.r3Liqi'), e: t('tech.r3Effect') },
                                        { item: t('tech.r4Item'), g: t('tech.r4General'), l: t('tech.r4Liqi'), e: t('tech.r4Effect') },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">{row.item}</td>
                                            <td className="px-4 py-3 text-gray-500">{row.g}</td>
                                            <td className="px-4 py-3 font-bold text-primary-700">{row.l}</td>
                                            <td className="px-4 py-3 text-gray-700">{row.e}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Test Data Cards */}
                    <div className="max-w-5xl mx-auto mb-16">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('tech.testTitle')}</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { item: t('tech.t1Item'), cond: t('tech.t1Cond'), result: t('tech.t1Result') },
                                { item: t('tech.t2Item'), cond: t('tech.t2Cond'), result: t('tech.t2Result') },
                                { item: t('tech.t3Item'), cond: t('tech.t3Cond'), result: t('tech.t3Result') },
                                { item: t('tech.t4Item'), cond: t('tech.t4Cond'), result: t('tech.t4Result') },
                            ].map((d, i) => (
                                <div key={i} className="card p-5">
                                    <p className="font-bold text-gray-900 mb-1">{d.item}</p>
                                    <p className="text-xs text-gray-500 mb-2">{d.cond}</p>
                                    <p className={`text-lg font-extrabold ${primaryText}`}>{d.result}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Virus Inhibition */}
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{t('tech.virusTitle').split('\n').map((line, i) => (<span key={i} className="block">{line}</span>))}</h3>
                        <p className="text-center text-gray-600 mb-6">{t('tech.virusSub')}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[t('tech.v1'), t('tech.v2'), t('tech.v3'), t('tech.v4'), t('tech.v5')].map((v, i) => (
                                <div key={i} className={`p-4 rounded-xl ${primaryBgLight} text-center`}>
                                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full ${primaryBg} flex items-center justify-center`}>
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">{v}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-4">{t('tech.virusNote')}</p>
                    </div>

                    {/* Virus Group Inhibition Table */}
                    <div className="max-w-5xl mx-auto mt-16">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('tech.virusTableTitle')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse bg-white rounded-2xl shadow-lg overflow-hidden">
                                <thead>
                                    <tr className={`${primaryBg} text-white`}>
                                        <th className="px-4 py-3 text-left font-semibold">{t('tech.colVirusGroup')}</th>
                                        <th className="px-4 py-3 text-left font-semibold">{t('tech.colTarget')}</th>
                                        <th className="px-4 py-3 text-left font-semibold">{t('tech.colEffect2')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { g: t('tech.vg1Group'), t: t('tech.vg1Target'), e: t('tech.vg1Effect') },
                                        { g: t('tech.vg2Group'), t: t('tech.vg2Target'), e: t('tech.vg2Effect') },
                                        { g: t('tech.vg3Group'), t: t('tech.vg3Target'), e: t('tech.vg3Effect') },
                                        { g: t('tech.vg4Group'), t: t('tech.vg4Target'), e: t('tech.vg4Effect') },
                                        { g: t('tech.vg5Group'), t: t('tech.vg5Target'), e: t('tech.vg5Effect') },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">{row.g}</td>
                                            <td className="px-4 py-3 text-gray-700">{row.t}</td>
                                            <td className="px-4 py-3 font-bold text-primary-700">{row.e}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Experts & Farm Feedback Section */}
            <section id="experts" className="py-20 sm:py-28 lg:py-32 bg-white">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                            {t('experts.badge')}
                        </span>
                        <h2 className="section-title">{t('experts.title').split('\n').map((line, i) => (<span key={i} className="block">{line}</span>))}</h2>
                        <p className="section-subtitle">
                            {t('experts.subtitle')}
                        </p>
                    </div>

                    {/* Expert Quotes */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
                        <div className="card border-l-4 border-accent-400">
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">"{t('experts.e1Quote')}"</p>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full ${primaryBg} flex items-center justify-center text-white font-bold text-lg`}>
                                    {t('experts.e1Name').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{t('experts.e1Name')}</p>
                                    <p className="text-sm text-gray-500">{t('experts.e1Role')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card border-l-4 border-accent-400">
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">"{t('experts.e2Quote')}"</p>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full ${primaryBg} flex items-center justify-center text-white font-bold text-lg`}>
                                    {t('experts.e2Name').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{t('experts.e2Name')}</p>
                                    <p className="text-sm text-gray-500">{t('experts.e2Role')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card border-l-4 border-accent-400">
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">"{t('experts.e3Quote')}"</p>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full ${primaryBg} flex items-center justify-center text-white font-bold text-lg`}>
                                    {t('experts.e3Name').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{t('experts.e3Name')}</p>
                                    <p className="text-sm text-gray-500">{t('experts.e3Role')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Farm Feedback */}
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{t('experts.farmTitle')}</h3>
                        <p className="text-center text-gray-600 mb-6">{t('experts.farmSub')}</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[t('experts.f1'), t('experts.f2'), t('experts.f3'), t('experts.f4')].map((f, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className={`w-7 h-7 flex-shrink-0 rounded-full ${primaryBg} flex items-center justify-center mt-0.5`}>
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{f}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-8 bg-gray-50 rounded-xl py-4 px-6 max-w-3xl mx-auto">
                            {t('experts.advisoryNote')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Target Animals Section */}
            <section id="target" className="py-20 sm:py-28 lg:py-32 bg-gray-50">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                            {t('target.badge')}
                        </span>
                        <h2 className="section-title">{t('target.title')}</h2>
                        <p className="section-subtitle">
                            {t('target.subtitle')}
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
                            {t('testimonials.badge')}
                        </span>
                        <h2 className="section-title">{t('testimonials.title')}</h2>
                        <p className="section-subtitle">
                            {t('testimonials.subtitle')}
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
                            {t('products.badge')}
                        </span>
                        <h2 className="section-title">{t('products.title')}</h2>
                        <p className="section-subtitle">
                            {t('products.subtitle')}
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
                                            {t('products.recommended')}
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
                                    <p className="text-xs text-gray-500 text-center">부가세 포함 · 배송비 포함</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, product: product.id }));
                                        setIsOrderModalOpen(true);
                                        setIsOrderComplete(false);
                                    }}
                                    className={`w-full ${i === 1 ? 'btn-primary' : 'btn-secondary'} ${i === 1 ? `${primaryBg} ${primaryHover}` : `${primaryText} ${primaryBgLight} ${primaryBorder} ${primaryHoverBg} ${primaryHoverBorder}`}`}
                                >
                                    {i === 1 ? t('products.order') : t('products.inquiry')}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">{t('products.bulk')}</p>
                        <button
                            onClick={() => { setIsOrderModalOpen(true); setIsOrderComplete(false); }}
                            className={`btn-primary ${primaryBg} ${primaryHover} inline-flex`}
                        >
                            {t('products.bulkCta')}
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
                                {t('order.badge')}
                            </span>
                            <h2 className="section-title">{t('order.title')}</h2>
                            <p className="section-subtitle">
                                {t('order.subtitle')}
                            </p>
                        </div>

                        <div className="card">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="hospitalName" className="block text-sm font-semibold text-gray-700 mb-2">
                                            {t('order.hospitalName')} <span className="text-accent-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="hospitalName"
                                            name="hospitalName"
                                            value={formData.hospitalName}
                                            onChange={handleInputChange}
                                            placeholder={t('order.hospitalNamePh')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="contactName" className="block text-sm font-semibold text-gray-700 mb-2">
                                            {t('order.contactName')} <span className="text-accent-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="contactName"
                                            name="contactName"
                                            value={formData.contactName}
                                            onChange={handleInputChange}
                                            placeholder={t('order.contactNamePh')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                            {t('order.phone')} <span className="text-accent-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder={t('order.phonePh')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            {t('order.email')}
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder={t('order.emailPh')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('order.address')}
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={2}
                                        placeholder={t('order.addressPh')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="product" className="block text-sm font-semibold text-gray-700 mb-2">
                                            {t('order.product')}
                                        </label>
                                        <select
                                            id="product"
                                            name="product"
                                            value={formData.product}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
                                        >
                                            <option value="parvogel-50ml">{t('order.p50')}</option>
                                            <option value="parvogel-500ml">{t('order.p500')}</option>
                                            <option value="parvogel-1l">{t('order.p1l')}</option>
                                            <option value="consultation">{t('order.consult')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                                            {t('order.quantity')}
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
                                        {t('order.message')}
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder={t('order.messagePh')}
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
                                            {t('order.submitting')}
                                        </span>
                                    ) : (
                                        t('order.submit')
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-400">
                                    {t('order.privacyNote')}
                                </p>
                            </form>
                        </div>

                        {/* Online Store Links */}
                        <div className="mt-12 text-center">
                            <p className="text-gray-600 mb-4">{t('order.online')}</p>
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                                <a href="https://coupang.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                    <span className="font-semibold">{t('order.coupang')}</span>
                                </a>
                                <a href="https://shopping.naver.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                                    <span className="font-semibold">{t('order.naver')}</span>
                                </a>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                <QrCode value="https://coupang.com" size={140} label={t('order.coupangQr')} />
                                <QrCode value="https://shopping.naver.com" size={140} label={t('order.naverQr')} />
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
                            <div className="mt-6 flex gap-4">
                                <QrCode value="https://coupang.com" size={96} label={t('footer.coupang')} />
                                <QrCode value="https://shopping.naver.com" size={96} label={t('footer.naver')} />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">{t('footer.productInfo')}</h4>
                            <ul className="space-y-2">
                                <li><a href="#about" className="hover:text-white transition-colors">{t('footer.productInfo1')}</a></li>
                                <li><a href="#features" className="hover:text-white transition-colors">{t('footer.productInfo2')}</a></li>
                                <li><a href="#clinical" className="hover:text-white transition-colors">{t('footer.productInfo3')}</a></li>
                                <li><a href="#target" className="hover:text-white transition-colors">{t('footer.productInfo4')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">{t('footer.support')}</h4>
                            <ul className="space-y-2">
                                <li><a href="#order" className="hover:text-white transition-colors">{t('footer.support1')}</a></li>
                                <li><a href="tel:02-6949-5708" className="hover:text-white transition-colors">{t('footer.support2')}</a></li>
                                <li><a href="mailto:parvogel@company.com" className="hover:text-white transition-colors">{t('footer.support3')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('footer.support4')}</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                            <p className="text-gray-500 text-sm">
                                {t('footer.copyright')}
                            </p>
                            <div className="flex gap-6 text-sm text-gray-500">
                                <button onClick={() => setLegalType('privacy')} className="hover:text-white transition-colors">{t('footer.privacy')}</button>
                                <button onClick={() => setLegalType('terms')} className="hover:text-white transition-colors">{t('footer.terms')}</button>
                                <button onClick={() => setLegalType('business')} className="hover:text-white transition-colors">{t('footer.business')}</button>
                            </div>
                        </div>
                        <div className="text-center text-gray-500 text-xs space-y-1">
                            <p>{t('footer.seller')}</p>
                            <p>{t('footer.businessNo')}</p>
                            <p>{t('footer.address')}</p>
                            <p>{t('footer.tel')}</p>
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
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('order.complete')}</h3>
                                    <p className="text-gray-600 mb-6">
                                        {t('order.completeDesc')}<br />
                                        {t('order.urgent')} <a href="tel:1588-0000" className={`${primaryText} font-semibold underline`}>1588-0000</a> {t('order.call')}.
                                    </p>
                                    <button
                                        onClick={() => setIsOrderModalOpen(false)}
                                        className={`btn-primary ${primaryBg} ${primaryHover} w-full sm:w-auto`}
                                    >
                                        {t('order.confirm')}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{t('order.modalTitle')}</h3>
                                        <button
                                            onClick={() => { setIsOrderModalOpen(false); setIsOrderComplete(false); }}
                                            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                            aria-label={t('order.close')}
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
                                                    {t('order.hospitalName')} <span className="text-accent-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="modal-hospitalName"
                                                    name="hospitalName"
                                                    value={formData.hospitalName}
                                                    onChange={handleInputChange}
                                                    placeholder={t('order.hospitalNamePh')}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="modal-contactName" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    {t('order.contactName')} <span className="text-accent-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="modal-contactName"
                                                    name="contactName"
                                                    value={formData.contactName}
                                                    onChange={handleInputChange}
                                                    placeholder={t('order.contactNamePh')}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="modal-phone" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    {t('order.phone')} <span className="text-accent-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="modal-phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder={t('order.phonePh')}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="modal-email" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    {t('order.email')}
                                                </label>
                                                <input
                                                    type="email"
                                                    id="modal-email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder={t('order.emailPh')}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="modal-address" className="block text-sm font-semibold text-gray-700 mb-1">
                                                {t('order.address')}
                                            </label>
                                            <textarea
                                                id="modal-address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows={2}
                                                placeholder={t('order.addressPh')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="modal-product" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    {t('order.product')}
                                                </label>
                                                <select
                                                    id="modal-product"
                                                    name="product"
                                                    value={formData.product}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
                                                >
                                                    <option value="parvogel-50ml">{t('order.p50')}</option>
                                                    <option value="parvogel-500ml">{t('order.p500')}</option>
                                                    <option value="parvogel-1l">{t('order.p1l')}</option>
                                                    <option value="consultation">{t('order.consult')}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="modal-quantity" className="block text-sm font-semibold text-gray-700 mb-1">
                                                    {t('order.quantity')}
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
                                                {t('order.message')}
                                            </label>
                                            <textarea
                                                id="modal-message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder={t('order.messagePh')}
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
                                                    {t('order.submitting')}
                                                </span>
                                            ) : (
                                                t('order.submit')
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Legal Modal (Privacy / Terms / Business) */}
            {
                legalType && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setLegalType(null)}>
                        <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-slide-up ${primaryBorder}`} onClick={e => e.stopPropagation()}>
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {legalType === 'privacy' && t('legal.privacyTitle')}
                                        {legalType === 'terms' && t('legal.termsTitle')}
                                        {legalType === 'business' && t('legal.businessTitle')}
                                    </h3>
                                    <button
                                        onClick={() => setLegalType(null)}
                                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                        aria-label={t('order.close')}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {legalType === 'privacy' && t('legal.privacyBody')}
                                    {legalType === 'terms' && t('legal.termsBody')}
                                    {legalType === 'business' && t('legal.businessBody')}
                                </div>
                                <button
                                    onClick={() => setLegalType(null)}
                                    className={`btn-primary ${primaryBg} ${primaryHover} w-full mt-8`}
                                >
                                    {t('order.confirm')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Chatbot */}
            <Chatbot />

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
      `}</style>
        </div >
    )
}

export default ParvogelLanding