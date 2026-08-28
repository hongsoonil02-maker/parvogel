import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ClinicalEvidence from '../components/ClinicalEvidence'
import ParvogelClinicalDocumentary from '../components/ParvogelClinicalDocumentary'
import AnimalSelector from '../components/AnimalSelector'
import AudioTestimonial from '../components/AudioTestimonial'
import StickyBottomCTA from '../components/StickyBottomCTA'
import OrderForm from '../components/OrderForm'
import { getStoreUrl } from '../config/storeLinks'
import SEO from '../components/SEO'
import A11yToolbar from '../components/A11yToolbar'

const Chatbot = lazy(() => import('../components/Chatbot'))
const QrCode = lazy(() => import('../components/QrCode'))

const Landing = () => {
    const { t, i18n } = useTranslation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isLangOpen, setIsLangOpen] = useState(false)
    const langMenuRef = useRef(null)
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    const [isOrderComplete, setIsOrderComplete] = useState(false)
    const [legalType, setLegalType] = useState(null) // 'privacy' | 'terms' | 'business' | null
    const [formData, setFormData] = useState({
        requestType: 'consumer',
        hospitalName: '',
        contactName: '',
        bizNumber: '',
        phone: '',
        email: '',
        address: '',
        product: 'parvogel-200ml',
        quantity: 1,
        orderVolume: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const submittingRef = useRef(false)
    const requestIdRef = useRef(null)

    const SUBMISSION_LAST_KEY = 'parvogel_order_last_v1'
    const LAST_TTL = 5 * 60 * 1000
    const FETCH_TIMEOUT = 30000

    const genId = () =>
        (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)

    const [scrollY, setScrollY] = useState(0)
    const [activeSection, setActiveSection] = useState('hero')
    const [activeMedia, setActiveMedia] = useState('video')

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
            const sections = ['hero', 'about', 'features', 'clinical', 'target', 'testimonials', 'products', 'order']
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

    // Set document lang & dir attributes for accessibility and cultural respect
    useEffect(() => {
        if (i18n && i18n.language) {
            const base = String(i18n.language).split('-')[0];
            document.documentElement.lang = base;
            document.documentElement.dir = base === 'ar' ? 'rtl' : 'ltr';
        }
    }, [i18n, i18n.language])

    // 모바일 메뉴 오픈 시 배경 스크롤 잠금
    useEffect(() => {
        if (isMobileMenuOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [isMobileMenuOpen]);

    // 언어 메뉴 외부 클릭 / ESC 시 닫기
    useEffect(() => {
        if (!isLangOpen) return
        const handleClickOutside = (e) => {
            if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
                setIsLangOpen(false)
            }
        }
        const handleKey = (e) => {
            if (e.key === 'Escape') setIsLangOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKey)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKey)
        }
    }, [isLangOpen])

    // 모달 열림 시 ESC 닫기 + 배경 스크롤 잠금 (접근성·모바일 UX)
    useEffect(() => {
        const modalOpen = isOrderModalOpen || Boolean(legalType)
        if (!modalOpen) return
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setIsOrderModalOpen(false)
                setIsOrderComplete(false)
                setLegalType(null)
            }
        }
        document.addEventListener('keydown', handleKey)
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = prevOverflow
        }
    }, [isOrderModalOpen, legalType])

    // Smooth scroll to section
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            const headerOffset = 80
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.scrollY - headerOffset
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
            setIsMobileMenuOpen(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.hospitalName || !formData.contactName || !formData.phone
            || (formData.requestType === 'wholesale' && !formData.bizNumber)) {
            alert(t('order.requiredFieldsAlert'))
            return
        }
        if (submittingRef.current || isSubmitting) return
        submittingRef.current = true
        setIsSubmitting(true)

        const normPhone = formData.phone.replace(/[^0-9]/g, '')
        let last = null
        try {
            last = JSON.parse(localStorage.getItem(SUBMISSION_LAST_KEY))
        } catch (err) { /* ignore */ }
        if (last && last.phone && last.phone === normPhone && Date.now() - last.ts < LAST_TTL) {
            submittingRef.current = false
            setIsSubmitting(false)
            alert(t('order.recentSubmit', '방금 접수된 주문입니다. 잠시 후 다시 시도해 주세요.'))
            return
        }

        if (!requestIdRef.current) requestIdRef.current = genId()

        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

        try {
            const scriptURL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
                || 'https://script.google.com/macros/s/AKfycbzlKnHOihU_r_trfYKQ35P2NKoZFU2loVtTk9C30aiBAvY9Odw4nkSfW3cYKnTZGS90NQ/exec'

            const params = new URLSearchParams()
            params.append('type', 'parvogel_order')
            params.append('requestId', requestIdRef.current)
            params.append('requestType', formData.requestType)
            params.append('hospitalName', formData.hospitalName)
            params.append('contactName', formData.contactName)
            params.append('bizNumber', formData.bizNumber)
            params.append('phone', normPhone)
            params.append('email', formData.email)
            params.append('address', formData.address)
            params.append('product', formData.product)
            params.append('quantity', formData.quantity)
            params.append('orderVolume', formData.orderVolume)
            params.append('message', formData.message)
            params.append('timestamp', new Date().toISOString())

            // Apps Script 웹앱은 Access-Control-Allow-Origin: * 로 CORS를 정상 지원하므로
            // 일반 CORS 요청만 사용하고 서버가 반환하는 status 값만 신뢰한다.
            // (no-cors 폴백은 opaque 응답이라 실제 저장 실패도 성공으로 오인되므로 사용하지 않는다.)
            const response = await fetch(scriptURL, {
                method: 'POST',
                body: params,
                signal: controller.signal,
            })

            if (!response.ok) {
                alert(t('order.errorServer', '주문 접수 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'))
                return
            }

            let json = null
            try {
                json = await response.json()
            } catch (err) {
                // 응답을 파싱하지 못하면 저장 여부를 확신할 수 없으므로 실패로 처리한다.
                console.error('Order response parse error:', err)
                alert(t('order.errorServer', '주문 접수 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'))
                return
            }

            if (json.status === 'duplicate') {
                alert(t('order.duplicateError', '이미 접수된 주문입니다. 담당자가 곧 연락드리겠습니다.'))
                return
            }
            if (json.status !== 'success') {
                alert(t('order.errorServer', '주문 접수 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'))
                return
            }

            try {
                localStorage.setItem(SUBMISSION_LAST_KEY, JSON.stringify({ phone: normPhone, ts: Date.now() }))
            } catch (err) { /* ignore */ }

            setIsOrderComplete(true)
            setFormData({
                requestType: 'consumer',
                hospitalName: '',
                contactName: '',
                bizNumber: '',
                phone: '',
                email: '',
                address: '',
                product: 'parvogel-200ml',
                quantity: 1,
                orderVolume: '',
                message: '',
            })
        } catch (error) {
            console.error('Order submit error:', error)
            if (error.name === 'AbortError') {
                alert(t('order.timeoutError', '주문 처리 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'))
            } else {
                alert(t('order.networkError', '주문이 정상 접수되지 않았습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.'))
            }
        } finally {
            clearTimeout(timer)
            submittingRef.current = false
            setIsSubmitting(false)
        }
    }

    // Fixed Deep Blue + Gold theme (no toggle)
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
        { id: 'target', label: t('nav.target') },
        { id: 'testimonials', label: t('nav.testimonials') },
        { id: 'order', label: t('nav.order') },
    ]

    const features = [
        {
            icon: '🧬',
            title: t('features.f2Title'),
            desc: t('features.f2Desc'),
            color: 'primary',
        },
        {
            icon: '🛡️',
            title: t('features.f1Title'),
            desc: t('features.f1Desc'),
            color: 'accent',
        },
        {
            icon: '⚡',
            title: t('features.f3Title'),
            desc: t('features.f3Desc'),
            color: 'primary',
        },
        {
            icon: '🐄',
            title: t('features.f4Title'),
            desc: t('features.f4Desc'),
            color: 'accent',
        },
        {
            icon: '🌡️',
            title: t('features.f5Title'),
            desc: t('features.f5Desc'),
            color: 'primary',
        },
        {
            icon: '📦',
            title: t('features.f6Title'),
            desc: t('features.f6Desc'),
            color: 'accent',
        },
    ]

    const targetAnimals = [
        { icon: '🐶', name: t('target.puppy', '강아지 (자견/반려견)'), age: t('target.puppyAge', '전 연령 (생후 30일령~)'), diseases: t('target.puppyDisease', '파보바이러스/코로나장염/급성 설사·혈변') },
        { icon: '🐱', name: t('target.cat', '고양이 (자묘/반려묘)'), age: t('target.catAge', '전 연령 (생후 30일령~)'), diseases: t('target.catDisease', '범백(FPLV)/급성 세균성 장염/수분 손실') },
        { icon: '🐄', name: t('target.calf'), age: t('target.calfAge'), diseases: t('target.calfDisease') },
        { icon: '🐷', name: t('target.piglet'), age: t('target.pigletAge'), diseases: t('target.pigletDisease') },
        { icon: '🐐', name: t('target.kid'), age: t('target.kidAge'), diseases: t('target.kidDisease') },
        { icon: '🐑', name: t('target.lamb'), age: t('target.lambAge'), diseases: t('target.lambDisease') },
        { icon: '🐎', name: t('target.foal'), age: t('target.foalAge'), diseases: t('target.foalDisease') },
    ]

    const testimonials = [
        {
            name: t('testimonials.t1Name'),
            clinic: t('testimonials.t1Clinic'),
            role: t('testimonials.t1Role'),
            content: t('testimonials.t1Content'),
            rating: 5,
        },
        {
            name: t('testimonials.t2Name'),
            clinic: t('testimonials.t2Clinic'),
            role: t('testimonials.t2Role'),
            content: t('testimonials.t2Content'),
            rating: 5,
        },
        {
            name: t('testimonials.t3Name'),
            clinic: t('testimonials.t3Clinic'),
            role: t('testimonials.t3Role'),
            content: t('testimonials.t3Content'),
            rating: 5,
        },
        {
            name: t('testimonials.t4Name'),
            clinic: t('testimonials.t4Clinic'),
            role: t('testimonials.t4Role'),
            content: t('testimonials.t4Content'),
            rating: 5,
        },
    ]

    const products = [
        { id: 'parvogel-100ml', name: t('products.p1Name'), desc: t('products.p1Desc'), price: t('products.p1Price'), unit: t('products.bottle'), badge: t('products.popular') },
        { id: 'parvogel-200ml', name: t('products.p2Name'), desc: t('products.p2Desc'), price: t('products.p2Price'), unit: t('products.bottle'), badge: t('products.best') },
        { id: 'parvogel-500ml', name: t('products.p3Name'), desc: t('products.p3Desc'), price: t('products.p3Price'), unit: t('products.bottle'), badge: t('products.largeVolume') },
    ]

    return (
        <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden w-full max-w-full">
            <SEO />
            {/* 스크린리더용 본문 바로가기 (접근성) — HashRouter 환경이라 href 대신 스크롤+포커스 처리 */}
            <a
                href="#main-content"
                className="skip-link"
                onClick={(e) => {
                    e.preventDefault()
                    const main = document.getElementById('main-content')
                    if (main) {
                        main.focus()
                        main.scrollIntoView({ behavior: 'smooth' })
                    }
                }}
            >
                {t('a11y.skipToContent', '본문 바로가기')}
            </a>
            {/* Header */}
            <header className={`sticky top-0 z-40 transition-all duration-300 ${scrollY > 20
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
                : 'bg-transparent'
                }`}>
                <nav className="section-container" aria-label="메인 네비게이션">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') scrollToSection('hero') }} onClick={() => scrollToSection('hero')}>
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${primaryBg} shadow-lg`}>
                                <span className="text-white font-extrabold text-2xl">P</span>
                            </div>
                            <span className="font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight">
                                {t('nav.brandName')} <span className={`${primaryText} font-black`}>ParvoGel</span>
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-2 lg:gap-3">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`relative text-[13px] lg:text-sm font-semibold transition-colors px-1 ${activeSection === item.id
                                        ? primaryText
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {item.label}
                                    {activeSection === item.id && (
                                        <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${primaryBg}`} />
                                    )}
                                </button>
                            ))}
                            <Link to="/blog" className="relative text-[13px] lg:text-sm font-semibold transition-colors px-1 text-gray-600 hover:text-gray-900">
                                전문가 칼럼
                            </Link>

                            {/* Language Toggle - Desktop Dropdown */}
                            <div className="relative" ref={langMenuRef}>
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    aria-label="언어 선택 (Select Language)"
                                    aria-haspopup="listbox"
                                    aria-expanded={isLangOpen}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <span className="text-xs font-bold text-gray-700">{i18n.language.toUpperCase()}</span>
                                    <svg className={`w-3 h-3 text-gray-500 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className={`absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transition-all duration-200 ${isLangOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                                    <div className="py-1 max-h-64 overflow-y-auto" role="listbox">
                                        {['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'th', 'vi', 'ru', 'pt', 'ar', 'id', 'ms', 'tr'].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => { i18n.changeLanguage(lang); setIsLangOpen(false); }}
                                                role="option"
                                                aria-selected={i18n.language === lang}
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
                                {t('nav.order')}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            aria-label={isMobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
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
                                    <p className="text-xs font-semibold text-gray-500 mb-2">{t('nav.selectLanguage')}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'th', 'vi', 'ru', 'pt', 'ar', 'id', 'ms', 'tr'].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => { i18n.changeLanguage(lang); setIsMobileMenuOpen(false); }}
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
                                    {t('nav.order')}
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main id="main-content" tabIndex={-1}>
            <section id="hero" className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-32 flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
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
                        <h1 className={`text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-snug text-center mb-8 animate-fade-in-up break-keep ${gradientText}`}>
                            {t('hero.title').split('\n').map((line, i) => (
                                <span key={i} className="block">{line}</span>
                            ))}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-sm sm:text-lg lg:text-xl text-gray-600 mb-10 max-w-3xl mx-auto text-center leading-relaxed animate-fade-in-up whitespace-pre-line break-keep" style={{ animationDelay: '100ms' }}>
                            {t('hero.subtitle')}{'\n'}{t('hero.subtitle2')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <button
                                onClick={() => { setIsOrderModalOpen(true); setIsOrderComplete(false); }}
                                className={`btn-primary w-full sm:w-auto ${primaryBg} ${primaryHover} text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-5`}
                            >
                                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="inline-flex flex-col items-center leading-tight">
                                    {t('hero.cta1').split('\n').map((line, i) => (
                                        <span key={i} className="block whitespace-nowrap">{line}</span>
                                    ))}
                                </span>
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
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                        <div>
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                                {t('about.badge')}
                            </span>
                            <h2 className="section-title">{t('about.title')}</h2>
                            <p className="section-subtitle whitespace-pre-line">
                                {t('about.desc1')}
                            </p>
                            <p className="section-subtitle mt-4 whitespace-pre-line">
                                {t('about.desc2')}
                            </p>
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    {[
                                        { label: t('about.ingredient'), value: t('about.ingredientVal') },
                                        { label: t('about.form'), value: t('about.formVal') },
                                        { label: t('about.dosage'), value: t('about.dosageVal'), colSpan: 2 },
                                    ].map((item, i) => (
                                        <div key={i} className={`p-4 bg-gray-50 rounded-xl ${item.colSpan ? 'col-span-2' : ''}`}>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider break-keep">{item.label}</p>
                                            {item.value.startsWith('✅') ? (
                                                <div className="flex items-start gap-1.5 mt-1 text-lg font-bold text-gray-900">
                                                    <span className="shrink-0">✅</span>
                                                    <div className="flex-1 break-keep">
                                                        {item.value.replace(/^✅\s*/, '').split('\n').map((line, idx) => (
                                                            <div key={idx} className={idx > 0 ? "pl-2 mt-1 whitespace-pre-wrap" : "whitespace-pre-wrap"}>{line}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-lg font-bold text-gray-900 mt-1 whitespace-pre-wrap break-keep">{item.value}</p>
                                            )}
                                        </div>
                                    ))}
                            </div>
                            {/* Trust indicators */}
                            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    <span>{t('about.trust1')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    <span>{t('about.trust2')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    <span>{t('about.trust3')}</span>
                                </div>
                            </div>


                        </div>
                        <div className="relative">
                            {/* Main product image / video */}
                            <div className="relative aspect-[4/5] max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
                                {activeMedia === 'video' ? (
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        aria-label={t('a11y.productVideo', '파보겔 제품 소개 영상')}
                                        className="w-full h-full object-cover"
                                        src={`${import.meta.env.BASE_URL}assets/video.mp4`}
                                    />
                                ) : (
                                    <img
                                        src={activeMedia}
                                        alt={t('a11y.productPhoto', '파보겔 제품 사진')}
                                        className="w-full h-full object-cover animate-fade-in"
                                        loading="eager"
                                    />
                                )}
                            </div>
                            {/* Thumbnail strip */}
                            <div className="mt-4 flex justify-center gap-2 flex-wrap" role="group" aria-label={t('a11y.productMedia', '제품 미디어 선택')}>
                                {/* Video Thumbnail */}
                                <button
                                    type="button"
                                    aria-label={t('a11y.playProductVideo', '제품 영상 재생')}
                                    aria-pressed={activeMedia === 'video'}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-black flex items-center justify-center ${activeMedia === 'video'
                                        ? 'border-primary-500 opacity-100'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    onClick={() => setActiveMedia('video')}
                                >
                                    <video src={`${import.meta.env.BASE_URL}assets/video.mp4`} className="w-full h-full object-cover opacity-80" muted playsInline aria-hidden="true" tabIndex={-1} />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <svg className="w-8 h-8 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path d="M4.5 3a.5.5 0 00-.5.5v13a.5.5 0 00.757.429l11-6.5a.5.5 0 000-.858l-11-6.5A.5.5 0 004.5 3z" />
                                        </svg>
                                    </div>
                                </button>
                                {/* Photo Thumbnails */}
                                {[
                                    { src: `${import.meta.env.BASE_URL}images/bottle_group.png`, alt: '파보겔 라인업 단체컷' },
                                    { src: `${import.meta.env.BASE_URL}images/bottle_front.png`, alt: '파보겔 5가지 복합제 전면' },
                                    { src: `${import.meta.env.BASE_URL}images/bottle_back.png`, alt: '파보겔 후면 성분표' }
                                ].map((img) => (
                                    <button
                                        key={img.src}
                                        type="button"
                                        aria-label={`${img.alt} ${t('a11y.viewImage', '크게 보기')}`}
                                        aria-pressed={activeMedia === img.src}
                                        onClick={() => setActiveMedia(img.src)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${activeMedia === img.src
                                            ? 'border-primary-500 opacity-100'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                            {/* Floating badges */}
                            {/* Coupang Floating Badge */}
                            <a href={getStoreUrl('coupang')} target="_blank" rel="noopener noreferrer" className="absolute -top-3 -right-3 z-30 flex items-center gap-2 pl-3 pr-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-orange-200 shadow-[0_8px_24px_rgba(249,115,22,0.15)] hover:scale-105 transition-transform animate-cute-float">
                                <span className="text-xl" aria-hidden="true">🚀</span>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-wider">{t('about.coupang')}</span>
                                    <span className="text-xs font-black text-gray-800 mt-0.5">{t('about.rocket')}</span>
                                </div>
                            </a>
                            {/* Naver Floating Badge */}
                            <a href={getStoreUrl('naver')} target="_blank" rel="noopener noreferrer" className="absolute bottom-16 -left-6 z-30 flex items-center gap-2 pl-3 pr-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-emerald-200 shadow-[0_8px_24px_rgba(16,185,129,0.15)] hover:scale-105 transition-transform animate-cute-float-alt">
                                <span className="text-xl" aria-hidden="true">🛍️</span>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">{t('about.naver')}</span>
                                    <span className="text-xs font-black text-gray-800 mt-0.5">{t('about.shopping')}</span>
                                </div>
                            </a>
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

                    {/* Product Images (Front & Back) */}
                    <div className="max-w-4xl mx-auto mt-10 mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white">
                            <img src={`${import.meta.env.BASE_URL}images/bottle_front.png`} alt={t('a11y.bottleFront', '파보겔 5가지 복합제 전면')} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white">
                            <img src={`${import.meta.env.BASE_URL}images/bottle_back.png`} alt={t('a11y.bottleBack', '파보겔 후면 성분표')} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2 break-keep">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed break-keep">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Clinical Evidence Section */}
            <ClinicalEvidence />

            {/* 리얼 6단계 임상 다큐멘터리 (일자별 치료 순서 동기화) */}
            <ParvogelClinicalDocumentary />


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
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 break-keep">{animal.name}</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className={`w-4 h-4 ${primaryText}`} fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                                            <span className="break-keep">{t('target.recommendedAge')}: <strong className="text-gray-900">{animal.age}</strong></span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <svg className={`w-4 h-4 ${primaryText} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a1 1 0 10-2 0 1 1 0 002 0zm0 8a1 1 0 10-2 0 1 1 0 002 0zm0-11a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" /></svg>
                                            <div>
                                                <p className="font-semibold text-gray-900 break-keep">{t('target.mainPathogens')}</p>
                                                <p className="text-gray-600 break-keep">{animal.diseases}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4 break-keep">{t('target.other')}</p>
                        <button
                            onClick={() => scrollToSection('order')}
                            className={`btn-secondary ${primaryText} ${primaryBgLight} ${primaryBorder} ${primaryHoverBg} ${primaryHoverBorder}`}
                        >
                            {t('target.cta')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 sm:py-28 lg:py-32 bg-white" aria-label={t('testimonials.title')}>
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
                                <p className="text-gray-700 leading-relaxed mb-6 break-keep">&quot;{testimonial.content}&quot;</p>
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="font-bold text-gray-900 break-keep">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500 break-keep">{testimonial.clinic}</p>
                                    <p className="text-xs text-gray-400 mt-1 break-keep">{testimonial.role}</p>
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

                    {/* Product Lineup Image */}
                    <div className="max-w-4xl mx-auto mt-10 mb-16 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
                        <img src={`${import.meta.env.BASE_URL}images/bottle_group.png`} alt={t('a11y.bottleGroup', '파보겔 100ml, 200ml, 500ml 용량별 라인업')} className="w-full h-auto object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
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
                                    <p className="text-xs text-gray-500 text-center">{t('products.vatShippingIncluded')}</p>
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
                        <p className="text-gray-600 mb-4 break-keep">{t('products.bulk')}</p>
                        <p className="text-sm text-gray-500 mb-4 break-keep">{t('products.channelNote')}</p>
                        <button
                            onClick={() => { setFormData(prev => ({ ...prev, requestType: 'wholesale' })); setIsOrderModalOpen(true); setIsOrderComplete(false); }}
                            className={`btn-primary ${primaryBg} ${primaryHover} inline-flex`}
                        >
                            {t('products.bulkCta')}
                        </button>
                        <div className="mt-3">
                            <button
                                onClick={() => { setFormData(prev => ({ ...prev, requestType: 'wholesale' })); setIsOrderModalOpen(true); setIsOrderComplete(false); }}
                                className={`btn-secondary ${primaryText} ${primaryBgLight} ${primaryBorder} ${primaryHoverBg} ${primaryHoverBorder} inline-flex`}
                            >
                                {t('products.channelCta')}
                            </button>
                        </div>
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
                            <OrderForm
                                formData={formData}
                                onChange={handleInputChange}
                                setFormData={setFormData}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                products={products}
                                variant="section"
                            />
                        </div>

                        {/* Online Store Links */}
                        <div className="mt-12 text-center">
                            <p className="text-gray-600 mb-4">{t('order.online')}</p>
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                                <a href={getStoreUrl('coupang')} target="_blank" rel="noopener noreferrer" className="relative flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
                                    <span className="text-xl">🚀</span>
                                    <span className="font-extrabold text-sm tracking-tight">{t('order.coupang')}</span>
                                </a>
                                <a href={getStoreUrl('naver')} target="_blank" rel="noopener noreferrer" className="relative flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                                    <span className="text-xl">🛍️</span>
                                    <span className="font-extrabold text-sm tracking-tight">{t('order.naver')}</span>
                                </a>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                <Suspense fallback={<div className="w-[140px] h-[140px]" />}>
                                    {/* 입점 후 STORE_LINKS.productUrl을 등록하면 해당 URL QR로 자동 전환됩니다. */}
                                    <QrCode value={getStoreUrl('coupang')} size={140} label={t('order.coupangQr')} />
                                    <QrCode value={getStoreUrl('naver')} size={140} label={t('order.naverQr')} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 축종별 맞춤 효능 탭 & 오디오 리포트 위젯 */}
            <div className="section-container">
                <AnimalSelector />
                <AudioTestimonial
                    tKey="audioTestimonial"
                    audioUrl={`${import.meta.env.BASE_URL}assets/kimdongjun-call.m4a`}
                />
                <AudioTestimonial
                    tKey="audioTestimonialDongjin"
                    audioUrl={`${import.meta.env.BASE_URL}assets/jeongseongdae-call.m4a`}
                />
            </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-16">

                <div className="section-container">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${primaryBg}`}>
                                    <span className="text-white font-extrabold text-xl">P</span>
                                </div>
                                <span className="font-extrabold text-xl text-white">{t('nav.brandName')} <span className={`${primaryText} font-black`}>Parvogel</span></span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-sm">
                                {t('footer.desc')}
                            </p>
                            <div className="flex gap-4">
                                <a href={getStoreUrl('coupang')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                </a>
                                <a href={getStoreUrl('naver')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                                </a>
                                <a href="mailto:name_hyosun@naver.com" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </a>
                            </div>
                            <div className="mt-6 flex gap-4">
                                <Suspense fallback={<div className="w-[96px] h-[96px]" />}>
                                    <QrCode value={getStoreUrl('coupang')} size={96} label={t('footer.coupang')} />
                                    <QrCode value={getStoreUrl('naver')} size={96} label={t('footer.naver')} />
                                </Suspense>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">{t('footer.productInfo')}</h4>
                            <ul className="space-y-2">
                                <li><button type="button" onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">{t('footer.productInfo1')}</button></li>
                                <li><button type="button" onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">{t('footer.productInfo2')}</button></li>
                                <li><button type="button" onClick={() => scrollToSection('clinical')} className="hover:text-white transition-colors">{t('footer.productInfo3')}</button></li>
                                <li><button type="button" onClick={() => scrollToSection('target')} className="hover:text-white transition-colors">{t('footer.productInfo4')}</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">{t('footer.support')}</h4>
                            <ul className="space-y-2">
                                <li><button type="button" onClick={() => scrollToSection('order')} className="hover:text-white transition-colors">{t('footer.support1')}</button></li>
                                <li><a href="tel:02-6949-5708" className="hover:text-white transition-colors">{t('footer.support2')}</a></li>
                                <li><a href="mailto:name_hyosun@naver.com" className="hover:text-white transition-colors">{t('footer.support3')}</a></li>
                                {/* FAQ 페이지가 없어 AI 상담 챗봇으로 연결 */}
                                <li><button type="button" onClick={() => window.dispatchEvent(new CustomEvent('parvogel:open-chat'))} className="hover:text-white transition-colors">{t('footer.support4')}</button></li>
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
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('order.modalTitle')}
                        onClick={() => { setIsOrderModalOpen(false); setIsOrderComplete(false); }}
                    >
                        <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-slide-up ${primaryBorder}`} onClick={e => e.stopPropagation()}>
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
                                        {t('order.urgent')} <a href="tel:010-5407-5708" className={`${primaryText} font-semibold underline`}>010-5407-5708</a> {t('order.call')}.
                                    </p>
                                    <button
                                        onClick={() => setIsOrderModalOpen(false)}
                                        className={`btn-primary ${primaryBg} ${primaryHover} w-full sm:w-auto`}
                                    >
                                        {t('order.confirm')}
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 sm:p-8">
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

                                    <OrderForm
                                        formData={formData}
                                        onChange={handleInputChange}
                                        setFormData={setFormData}
                                        onSubmit={handleSubmit}
                                        isSubmitting={isSubmitting}
                                        products={products}
                                        variant="modal"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Legal Modal (Privacy / Terms / Business) */}
            {
                legalType && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setLegalType(null)} role="dialog" aria-modal="true" aria-label={legalType === 'privacy' ? t('legal.privacyTitle') : legalType === 'terms' ? t('legal.termsTitle') : t('legal.businessTitle')}>
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

            {/* 모바일/데스크톱 반응형 스티키 CTA 바 */}
            <StickyBottomCTA onOpenOrder={() => { setIsOrderModalOpen(true); setIsOrderComplete(false); }} />

            {/* 장애인 접근 편의 도구 (고대비, 큰글씨, 움직임제어, 가독성 줄간격, TTS) */}
            <A11yToolbar />

            {/* Chatbot */}
            <Suspense fallback={null}>
                <Chatbot />
            </Suspense>


            {/* Custom Styles */}
            <style>{`
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

export default Landing
