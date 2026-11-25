import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AnimalSelector from '../components/AnimalSelector'
import GomiPoopStory from '../components/GomiPoopStory'
import AudioTestimonial from '../components/AudioTestimonial'
import StickyBottomCTA from '../components/StickyBottomCTA'
import OrderForm from '../components/OrderForm'
import { getStoreUrl } from '../config/storeLinks'
import SEO from '../components/SEO'
import A11yToolbar from '../components/A11yToolbar'
import FAQ from '../components/FAQ'
import FeedDisclaimer from '../components/FeedDisclaimer'
import PetGallerySection from '../components/PetGallerySection'
import { trackKakaoFormSubmit, trackKakaoViewContent } from '../utils/kakaoPixel'

const ClinicalEvidence = lazy(() => import('../components/ClinicalEvidence'))
const ParvogelClinicalDocumentary = lazy(() => import('../components/ParvogelClinicalDocumentary'))
const ParvogelNanoActionStory = lazy(() => import('../components/ParvogelNanoActionStory'))
const Chatbot = lazy(() => import('../components/Chatbot'))
const QrCode = lazy(() => import('../components/QrCode'))

const Landing = () => {
    const { t, i18n } = useTranslation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isLangOpen, setIsLangOpen] = useState(false)
    const langMenuRef = useRef(null)
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    useEffect(() => {
        if (isOrderModalOpen) {
            trackKakaoViewContent('parvogel_order_modal')
        }
    }, [isOrderModalOpen])
    // Fire Kakao Pixel viewContent once for engaged visitors (>=5s stay or >=300px scroll)
    useEffect(() => {
        let fired = false
        const fireOnce = (reason) => {
            if (fired) return
            fired = true
            trackKakaoViewContent(reason)
            window.removeEventListener('scroll', onScroll)
            clearTimeout(timer)
        }
        const onScroll = () => {
            if (window.scrollY >= 300) fireOnce('parvogel_scroll_view')
        }
        const timer = setTimeout(() => fireOnce('parvogel_5s_view'), 5000)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            clearTimeout(timer)
        }
    }, [])
    const [isOrderComplete, setIsOrderComplete] = useState(false)
    const [legalType, setLegalType] = useState(null) // 'privacy' | 'terms' | 'business' | null
    const [formData, setFormData] = useState({
        requestType: 'consumer',
        hospitalName: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        product: 'parvogel-100ml',
        quantity: 1,
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

    const [isScrolled, setIsScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState('hero')
    const [activeMedia, setActiveMedia] = useState('video')
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
    const aboutVideoRef = useRef(null)

    // 지원 언어 목록 및 현지화 표기 메타데이터
    const languageOptions = useMemo(() => [
        { code: 'ko', label: '한국어', flag: '🇰🇷' },
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
        { code: 'zh', label: '中文', flag: '🇨🇳' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'th', label: 'ไทย', flag: '🇹🇭' },
        { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'pt', label: 'Português', flag: '🇧🇷' },
        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
        { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
        { code: 'tr', label: 'Türkçe', flag: '🇹🇷' }
    ], []);

    // Scroll effect for header (boolean isScrolled) + IntersectionObserver for activeSection
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY > 20;
                    setIsScrolled(prev => (prev !== scrolled ? scrolled : prev));
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const sections = ['hero', 'parvogel-clinical-doc', 'why-parvogel', 'vet-voice', 'clinical', 'about', 'animal-guide', 'features', 'testimonials', 'products', 'target', 'faq', 'order'];
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [])

    // 히어로/어바웃 비디오 지연 로드 — 뷰포트 진입 시에만 네트워크 요청
    useEffect(() => {
        const el = aboutVideoRef.current || document.getElementById('about');
        if (!el) return;
        const obs = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) {
                setShouldLoadVideo(true);
                obs.disconnect();
            }
        }, { rootMargin: '200px' });
        obs.observe(el);
        // 사용자가 비디오 썸네일을 직접 클릭해도 즉시 로드
        const onActivate = () => setShouldLoadVideo(true);
        el.addEventListener('click', onActivate, { once: true });
        return () => { obs.disconnect(); el.removeEventListener('click', onActivate); };
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

    // 모달 열림 시 ESC 닫기 + 배경 스크롤 잠금 + 포커스 트랩 + 포커스 복귀 (접근성)
    const lastFocusRef = useRef(null)
    useEffect(() => {
        const modalOpen = isOrderModalOpen || Boolean(legalType)
        if (!modalOpen) return
        lastFocusRef.current = document.activeElement
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setIsOrderModalOpen(false)
                setIsOrderComplete(false)
                setLegalType(null)
            }
            // 포커스 트랩: Tab이 모달 밖으로 나가지 않도록
            if (e.key === 'Tab') {
                const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
                if (!modal) return
                const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
                if (focusable.length === 0) return
                const first = focusable[0]
                const last = focusable[focusable.length - 1]
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
        document.addEventListener('keydown', handleKey)
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        // 모달 첫 포커스 요소로 이동
        setTimeout(() => {
            const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
            const firstFocus = modal?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            if (firstFocus) firstFocus.focus()
        }, 50)
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = prevOverflow
            // 포커스 복귀
            if (lastFocusRef.current && lastFocusRef.current.focus) {
                lastFocusRef.current.focus()
            }
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
        let { name, value } = e.target
        if (name === 'quantity') {
            // 숫자만 허용, 정수 1~100, 'e', '.' 차단
            let n = parseInt(String(value).replace(/[^0-9]/g, ''), 10)
            if (Number.isNaN(n)) n = ''
            else n = Math.min(100, Math.max(1, n))
            value = n === '' ? '' : String(n)
        }
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.hospitalName || !formData.contactName || !formData.phone) {
            alert('주문자 성함, 수령인 성함, 연락처는 필수 입력 항목입니다.')
            return
        }
        // 전화번호 엄격 검증: 10~11자리 숫자, 01로 시작
        const rawPhone = formData.phone.replace(/[^0-9]/g, '')
        if (!/^01[0-9]{8,9}$/.test(rawPhone)) {
            alert('연락처는 010-1234-5678 형식의 10~11자리 숫자(01로 시작)로 입력해 주세요.')
            return
        }
        // 이메일 선택 입력 시 형식 검증
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            alert('이메일 형식이 올바르지 않습니다.')
            return
        }
        // 수량 정수 검증
        const q = parseInt(formData.quantity, 10)
        if (!Number.isInteger(q) || q < 1 || q > 100) {
            alert('수량은 1~100 사이의 정수로 입력해 주세요.')
            return
        }
        if (submittingRef.current || isSubmitting) return
        submittingRef.current = true
        setIsSubmitting(true)

        const normPhone = rawPhone
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
                || import.meta.env.VITE_APPS_SCRIPT_URL
                || 'https://script.google.com/macros/s/AKfycbzlKnHOihU_r_trfYKQ35P2NKoZFU2loVtTk9C30aiBAvY9Odw4nkSfW3cYKnTZGS90NQ/exec';

            const finalEmail = (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                ? formData.email
                : `a${normPhone}@parvogel.kr`;

            const params = new URLSearchParams()
            params.append('type', 'parvogel_order')
            params.append('requestId', requestIdRef.current)
            params.append('requestType', 'consumer')
            params.append('hospitalName', formData.hospitalName)
            params.append('contactName', formData.contactName)
            params.append('bizNumber', '-')
            params.append('phone', normPhone)
            params.append('email', finalEmail)
            params.append('address', formData.address)
            params.append('product', formData.product || 'parvogel-100ml')
            params.append('quantity', formData.quantity || '1')
            params.append('orderVolume', '-')
            params.append('message', formData.message || '-')
            params.append('timestamp', new Date().toISOString())

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

            trackKakaoFormSubmit('consumer', formData.quantity, formData.product)
            setIsOrderComplete(true)
            setFormData({
                requestType: 'consumer',
                hospitalName: '',
                contactName: '',
                phone: '',
                email: '',
                address: '',
                product: 'parvogel-100ml',
                quantity: 1,
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

    // Fixed Deep Blue + Gold theme (Parvogel Signature Deep Navy)
    const primaryHover = 'hover:bg-primary-900'
    const primaryBg = 'bg-primary-800'
    const primaryText = 'text-primary-900'
    const primaryBgLight = 'bg-primary-50'
    const primaryBorder = 'border-primary-200'
    const primaryTextDark = 'text-primary-950'
    const primaryHoverBg = 'hover:bg-primary-100'
    const primaryHoverBorder = 'hover:border-primary-400'
    const gradientText = 'gradient-text'
    const badgePrimary = 'badge-primary'
    const primaryRing = 'focus:ring-primary-700'
    const primaryShadow = 'shadow-primary-900/25'

    const navItems = [
        { id: 'why-parvogel', label: '원리·검증' },
        { id: 'products', label: '용량·가격' },
        { id: 'testimonials', label: '실제후기' },
        { id: 'faq', label: 'FAQ' },
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
            icon: '🐾',
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
        { icon: '🐶', name: t('target.puppy', '강아지 (아기 강아지/반려견)'), age: t('target.puppyAge', '전 연령 (생후 30일령~)'), diseases: t('target.puppyDisease', '파보바이러스/코로나장염/급성 설사·혈변') },
        { icon: '🐱', name: t('target.cat', '고양이 (아기 고양이/반려묘)'), age: t('target.catAge', '전 연령 (생후 30일령~)'), diseases: t('target.catDisease', '범백(FPLV)/급성 세균성 장염/무른 변') },
        { icon: '🦜', name: t('target.bird', '앵무새·조류 (반려조)'), age: t('target.birdAge', '이유조 및 성조 전 연령'), diseases: t('target.birdDisease', '급성 수양성 설사/소낭 정체/사료 곰팡이 독소') },
        { icon: '🐹', name: '햄스터·소동물 (기니피그/친칠라)', age: '이유기 및 전 연령', diseases: '웻테일(급성 설사) / 식이성 소화장애 / 장 점막 보호' },
        { icon: '🦎', name: '도롱뇽·특수동물 (파충·양서류)', age: '유체 및 성체 전 연령', diseases: '수질·식이성 장염 / 유해 독소 흡착 배출' },
    ]

    const testimonials = [
        {
            id: 't1',
            name: t('testimonials.t1Name'),
            clinic: t('testimonials.t1Clinic'),
            role: t('testimonials.t1Role'),
            content: t('testimonials.t1Content'),
            rating: 5,
            badge: '🐶 푸들 보호자님',
        },
        {
            id: 't2',
            name: t('testimonials.t2Name'),
            clinic: t('testimonials.t2Clinic'),
            role: t('testimonials.t2Role'),
            content: t('testimonials.t2Content'),
            rating: 5,
            badge: '🐱 다묘 보호자님',
        },
        {
            id: 't5',
            name: t('testimonials.t5Name', '홍효선 대표'),
            clinic: t('testimonials.t5Clinic', '반려조 가정 (앵무새 꼬미)'),
            role: t('testimonials.t5Role', '앵무새 보호자 24시간 회복 실화'),
            content: t('testimonials.t5Content', '"앵무새(꼬미)가 갑작스런 설사로 낙조 위기였는데, 파보겔 한 방울 급여 후 다음 날 아침 거짓말처럼 설사가 뚝 멈추고 활력을 되찾았습니다. 조류에게도 정말 안심입니다."'),
            rating: 5,
            badge: '🦜 24시간 회복 실화',
        },
        {
            id: 't6',
            name: '김동준 원장',
            clinic: '하남 사랑동물병원 원장 / 파보겔 학술자문위원',
            role: '55일령 파보 장염 푸들 집중 케어 회복 관찰',
            content: '단순 장 트러블 케어를 넘어 구토와 기력 저하로 힘들어하는 어린 강아지·고양이도 거부감 없이 스스로 잘 받아먹는 뛰어난 기호성이 가장 큰 장점입니다. 가정 내 1차 안심 상비 보조사료로 적극 추천합니다.',
            rating: 5,
            badge: '🩺 수의사 학술자문 총평',
        },
    ]

    const products = [
        { id: 'parvogel-100ml', name: t('products.p1Name'), desc: t('products.p1Desc'), price: t('products.p1Price'), unit: t('products.bottle'), badge: t('products.popular') },
        { id: 'parvogel-200ml', name: t('products.p2Name'), desc: t('products.p2Desc'), price: t('products.p2Price'), unit: t('products.bottle'), badge: t('products.best') },
        { id: 'parvogel-500ml', name: t('products.p3Name'), desc: t('products.p3Desc'), price: t('products.p3Price'), unit: t('products.bottle'), badge: t('products.largeVolume') },
    ]

    return (
        <div className="min-h-screen bg-gray-50 pb-24 overflow-x-clip w-full max-w-full">
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
            <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
                : 'bg-transparent'
                }`}>
                <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8" aria-label="메인 네비게이션">
                    <div className="flex items-center justify-between gap-2 h-14 sm:h-16 md:h-20">
                        {/* Logo (320px~360px 실기기 및 데스크톱 1줄 고정) */}
                        <div className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer shrink-0" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToSection('hero'); } }} onClick={() => scrollToSection('hero')}>
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${primaryBg} shadow-md sm:shadow-lg`}>
                                <span className="text-white font-extrabold text-lg sm:text-xl">P</span>
                            </div>
                            <span className="font-extrabold text-[15px] sm:text-xl lg:text-2xl text-gray-900 tracking-tight leading-tight whitespace-nowrap">
                                <span className="block sm:inline whitespace-nowrap">{t('nav.brandName')}</span>{' '}
                                <span className={`${primaryText} font-black block sm:inline text-[11px] sm:text-xl lg:text-2xl leading-none sm:leading-tight whitespace-nowrap`}>ParvoGel</span>
                            </span>
                        </div>

                        {/* Desktop Nav - Single-Line Zero-Wrap */}
                        <div className="hidden md:flex items-center gap-3 lg:gap-5 shrink-0">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`relative text-sm font-semibold transition-colors px-1 whitespace-nowrap shrink-0 ${activeSection === item.id
                                        ? primaryText
                                        : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                >
                                    {item.label}
                                    {activeSection === item.id && (
                                        <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${primaryBg}`} />
                                    )}
                                </button>
                            ))}
                            <Link to="/blog" className="relative text-sm font-semibold transition-colors px-1 text-gray-700 hover:text-gray-900 whitespace-nowrap shrink-0">
                                칼럼
                            </Link>

                            {/* Language Toggle - Desktop Compact */}
                            <div className="relative shrink-0" ref={langMenuRef}>
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    aria-label="Select Language"
                                    aria-haspopup="listbox"
                                    aria-expanded={isLangOpen}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors whitespace-nowrap"
                                >
                                    <span>{languageOptions.find(o => o.code === i18n.language)?.flag || '🌐'}</span>
                                    <span>{(languageOptions.find(o => o.code === i18n.language)?.code || 'KO').toUpperCase()}</span>
                                </button>
                                <div className={`absolute end-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-200 ${isLangOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                                    <div className="py-1 max-h-64 overflow-y-auto" role="listbox">
                                        {languageOptions.map((opt) => (
                                            <button
                                                key={opt.code}
                                                onClick={() => { i18n.changeLanguage(opt.code); setIsLangOpen(false); }}
                                                role="option"
                                                aria-selected={i18n.language === opt.code}
                                                className={`w-full text-start px-3 py-1.5 text-xs flex items-center justify-between hover:bg-gray-100 transition-colors ${i18n.language === opt.code
                                                    ? `${primaryBg} text-white font-bold`
                                                    : 'text-gray-700'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span>{opt.flag}</span>
                                                    <span>{opt.label}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 카카오톡 상담 바로가기 버튼 */}
                            <a
                                href="https://pf.kakao.com/_rqxnJX/chat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] shadow-sm hover:scale-105 active:scale-95 transition-all border border-amber-300 whitespace-nowrap shrink-0"
                                aria-label="카카오톡 1:1 상담"
                            >
                                <span className="text-sm">💬</span>
                                <span>카톡 1:1 상담</span>
                            </a>

                            {/* 공식몰 즉시구매 메인 버튼 (카카오 쇼핑하기 최우선 연계) */}
                            <a
                                href={getStoreUrl('kakaoStore')}
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer-when-downgrade"
                                data-product-id="parvogel-100ml"
                                aria-label={t('stores.kakaoAria', '카카오 쇼핑하기 구매 페이지로 이동 (새 창)')}
                                className="inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-full text-sm font-extrabold bg-primary-900 hover:bg-primary-950 text-white shadow-md hover:shadow-primary-900/30 hover:scale-105 active:scale-95 transition-all border border-primary-700 whitespace-nowrap shrink-0"
                            >
                                <span className="text-base" aria-hidden="true">🛒</span>
                                <span>{t('stores.headerBuyCta', '공식몰 즉시구매')}</span>
                                <span className="hidden xl:inline-block text-xs bg-[#FEE500] text-[#191919] px-2 py-0.5 rounded-full font-black">{t('stores.headerBuyBadge', '카카오·쿠팡·네이버')}</span>
                            </a>
                        </div>

                        {/* Mobile Header Right: Kakao Shopping + Chat + Menu Hamburger (320px~360px 안전 배치) */}
                        <div className="flex md:hidden items-center gap-1 sm:gap-1.5 shrink-0">
                            <a
                                href={getStoreUrl('kakaoStore')}
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer-when-downgrade"
                                aria-label={t('stores.kakaoAria', '카카오 쇼핑하기 구매 페이지로 이동 (새 창)')}
                                className="inline-flex items-center justify-center gap-1 min-h-[36px] px-2 sm:px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black bg-[#FEE500] text-[#191919] shadow-sm active:scale-95 transition-all border border-amber-300 shrink-0 whitespace-nowrap"
                            >
                                <span aria-hidden="true">🛒</span>
                                <span>{t('stickyCta.kakaoShort', '카카오쇼핑')}</span>
                            </a>

                            <a
                                href="https://pf.kakao.com/_rqxnJX/chat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1 min-h-[36px] px-2 sm:px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black bg-primary-900 text-white shadow-sm active:scale-95 transition-all border border-primary-700 shrink-0 whitespace-nowrap"
                                aria-label={t('stickyCta.chatAria', '카카오톡 1:1 맞춤 상담 (새 창)')}
                            >
                                <span aria-hidden="true">💬</span>
                                <span>{t('stickyCta.chatShort', '상담')}</span>
                            </a>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="min-w-[36px] min-h-[36px] p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center justify-center shrink-0"
                                aria-label={isMobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                                aria-expanded={isMobileMenuOpen}
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down bg-white/95 backdrop-blur-md rounded-b-2xl px-2 shadow-xl">
                            <div className="flex flex-col gap-2">
                                {/* 모바일 드롭다운 메뉴 최상단: 카카오 쇼핑하기 최우선 */}
                                <a
                                    href={getStoreUrl('kakaoStore')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full min-h-[44px] text-start px-4 py-3 rounded-xl text-sm font-black bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] flex items-center justify-between shadow-md active:scale-98 transition-all border border-amber-300"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-base" aria-hidden="true">💬</span>
                                        <span>{t('stores.kakaoCta', '카카오 쇼핑하기')}</span>
                                    </span>
                                    <span className="text-[11px] text-[#191919] bg-white/70 px-2.5 py-0.5 rounded-full font-black">
                                        {t('stores.kakaoTag', '톡딜')}
                                    </span>
                                </a>

                                <a
                                    href={getStoreUrl('naver')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full min-h-[44px] text-start px-4 py-3 rounded-xl text-sm font-black bg-[#028A3D] hover:bg-[#027734] text-white flex items-center justify-between shadow-md active:scale-98 transition-all"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-base" aria-hidden="true">🛍️</span>
                                        <span>{t('stores.naverCta', '네이버 스마트스토어')}</span>
                                    </span>
                                    <span className="text-[11px] text-emerald-100 bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                                        NPay
                                    </span>
                                </a>

                                {/* 카카오톡 1:1 상담 모바일 메뉴 버튼 */}
                                <a
                                    href="https://pf.kakao.com/_rqxnJX/chat"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-black bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] flex items-center justify-between shadow-sm active:scale-98 transition-all border border-amber-300"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-base">💬</span>
                                        <span>카카오톡 1:1 상담 / 구매 문의</span>
                                    </span>
                                    <span className="text-xs font-bold text-amber-900">
                                        실시간 연결 ➔
                                    </span>
                                </a>
                                {navItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeSection === item.id
                                            ? `${primaryBgLight} ${primaryText}`
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                                <Link
                                    to="/blog"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    전문가 칼럼
                                </Link>

                                <div className="pt-3 border-t border-gray-100 px-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-700">🌐 언어 선택 / Language</span>
                                        <span className="text-[10px] text-gray-400">14개국어 지원</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                                        {languageOptions.map((opt) => (
                                            <button
                                                key={opt.code}
                                                type="button"
                                                onClick={() => { i18n.changeLanguage(opt.code); setIsMobileMenuOpen(false); }}
                                                className={`text-[11px] py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${i18n.language === opt.code
                                                    ? 'bg-primary-900 text-white shadow-sm'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-slate-200/60'
                                                    }`}
                                            >
                                                <span>{opt.flag}</span>
                                                <span>{opt.code.toUpperCase()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section — 45~59 실구매 보호자 신뢰·설득 최적화 */}
            <main id="main-content" tabIndex={-1}>
            <section id="hero" className="relative py-6 sm:py-10 lg:py-14 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-white to-sky-50/50">
                {/* Soft Pastel Ambient Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 left-1/4 w-[28rem] h-[28rem] bg-sky-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-[26rem] h-[26rem] bg-emerald-100/40 rounded-full blur-3xl" />
                </div>

                <div className="section-container relative z-10">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center max-w-6xl mx-auto">
                        {/* Left Column: High-Trust Empathetic Copy & Direct Store CTAs */}
                        <div className="lg:col-span-7 text-center lg:text-left">
                            {/* 상단 수의학 신뢰 배지 */}
                            <div className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/90 text-sky-950 text-xs sm:text-sm font-extrabold mb-4 shadow-xs animate-fade-in-up">
                                <span>🩺</span>
                                <span>수의학 자문 · 임상 관찰 · 우리 집 펫 구급함 1순위 응급 상비겔</span>
                            </div>

                            {/* 메인 직관 & 신뢰 헤드라인 */}
                            <h1 className="text-[1.7rem] sm:text-4xl lg:text-[2.65rem] font-black tracking-tight leading-[1.24] mb-4 break-keep text-slate-900 animate-fade-in-up">
                                <span className="block text-slate-700 text-base sm:text-xl lg:text-2xl font-bold mb-1.5">
                                    새벽에 갑자기 토하고 설사할 때 당황하지 마세요
                                </span>
                                <span className="block text-slate-900">
                                    입에 대고 1초 톡! <span className="text-primary-700">‘파보겔’</span>
                                </span>
                                <span className="block mt-2 text-lg sm:text-2xl lg:text-[1.7rem] text-transparent bg-clip-text bg-gradient-to-r from-primary-800 via-sky-700 to-emerald-700 font-black">
                                    체내 흡수 0% 나노 보호막 · 스스로 핥아먹는 겔
                                </span>
                            </h1>

                            <p className="hidden sm:block text-sm sm:text-base text-slate-700 mb-5 max-w-2xl mx-auto lg:mx-0 leading-relaxed break-keep">
                                주사기로 억지로 먹이다 물리고 토하는 스트레스 없이 입가에 1초 펌프!<br className="hidden sm:inline" />
                                몸속에 흡수되지 않는 <strong>100% 천연 고순도 나노 몬모릴로나이트</strong>가 쓰린 장 점막을 부드럽게 감싸고 유해 독소·바이러스만 자석처럼 흡착해 변으로 안전하게 배출합니다.
                            </p>

                            {/* 3단계 회복 타임라인 미니 캡슐 바 */}
                            <div className="hidden sm:grid grid-cols-3 gap-2 sm:gap-3 max-w-xl mx-auto lg:mx-0 mb-5 p-2.5 sm:p-3 rounded-2xl bg-white/95 border border-slate-200 shadow-sm">
                                <div className="text-center p-2.5 rounded-xl bg-rose-50/80 border border-rose-100">
                                    <div className="text-xs font-black text-rose-700">Day 1 · 응급</div>
                                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 break-keep">1초 점막 보호</div>
                                </div>
                                <div className="text-center p-2.5 rounded-xl bg-sky-50/80 border border-sky-100">
                                    <div className="text-xs font-black text-sky-800">Day 3 · 호전</div>
                                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 break-keep">스스로 식욕 회복</div>
                                </div>
                                <div className="text-center p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100">
                                    <div className="text-xs font-black text-emerald-800">Day 7 · 회복</div>
                                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 break-keep">건강한 변·활력</div>
                                </div>
                            </div>

                            {/* 메인 구매 CTA 버튼 (카카오 쇼핑하기 최우선 · 쿠팡 로켓배송 · 네이버 스마트스토어) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-3.5 w-full max-w-2xl mx-auto lg:mx-0">
                                <a
                                    href={getStoreUrl('kakaoStore')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    data-product-id="parvogel-100ml"
                                    aria-label={t('stores.kakaoAria', '카카오 쇼핑하기 구매 페이지로 이동 (새 창)')}
                                    className="w-full min-h-[58px] bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] border border-amber-300 rounded-2xl font-black px-4 py-2.5 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-amber-400/25 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                                >
                                    <span className="text-xl shrink-0" aria-hidden="true">💬</span>
                                    <div className="text-start leading-tight">
                                        <div className="text-[11px] text-amber-950 font-extrabold tracking-tight">{t('stores.kakaoSub', '카카오페이 간편결제·톡딜')}</div>
                                        <div className="text-sm sm:text-base font-black whitespace-nowrap">{t('stores.kakaoCta', '카카오 쇼핑하기')}</div>
                                    </div>
                                </a>

                                <a
                                    href={getStoreUrl('coupang')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    data-product-id="parvogel-100ml"
                                    aria-label={t('stores.coupangAria', '쿠팡 로켓배송 구매 페이지로 이동 (새 창)')}
                                    className="w-full min-h-[58px] bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black px-4 py-2.5 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                                >
                                    <span className="text-xl shrink-0" aria-hidden="true">🚀</span>
                                    <div className="text-start leading-tight">
                                        <div className="text-[11px] text-amber-300 font-extrabold tracking-tight">{t('stores.coupangSub', '내일 아침 문 앞 도착')}</div>
                                        <div className="text-sm sm:text-base font-black whitespace-nowrap">{t('stores.coupangCta', '쿠팡 로켓배송')}</div>
                                    </div>
                                </a>

                                <a
                                    href={getStoreUrl('naver')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    data-product-id="parvogel-100ml"
                                    aria-label={t('stores.naverAria', '네이버 스마트스토어 구매 페이지로 이동 (새 창)')}
                                    className="w-full min-h-[58px] bg-[#028A3D] hover:bg-[#027734] text-white rounded-2xl font-black px-4 py-2.5 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-emerald-700/20 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                                >
                                    <span className="text-xl shrink-0" aria-hidden="true">🛍️</span>
                                    <div className="text-start leading-tight">
                                        <div className="text-[11px] text-emerald-100 font-extrabold tracking-tight">{t('stores.naverSub', '네이버페이 간편결제·적립')}</div>
                                        <div className="text-sm sm:text-base font-black whitespace-nowrap">{t('stores.naverCta', '네이버 스마트스토어')}</div>
                                    </div>
                                </a>
                            </div>

                            {/* 설득 스토리 바로가기 보조 버튼 (신중한 보호자용) */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-4">
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('why-parvogel')}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-primary-50 border border-primary-200 text-primary-900 text-xs sm:text-sm font-extrabold shadow-xs transition-all"
                                >
                                    🔬 왜 파보겔인가? 작용 원리 보기 ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('vet-voice')}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs sm:text-sm font-extrabold shadow-xs transition-all"
                                >
                                    🎙️ 수의사 실제 육성·임상 근거 듣기 ↓
                                </button>
                            </div>

                            {/* 신뢰도 요약 지표 */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-700 mb-3">
                                <span className="flex items-center gap-1">
                                    <span>🩺</span>
                                    <span>수의학 전문가 자문 검증</span>
                                </span>
                                <span className="text-slate-300 hidden sm:inline">|</span>
                                <span className="flex items-center gap-1">
                                    <span>🌿</span>
                                    <span>간·신장 부담 0%</span>
                                </span>
                                <span className="text-slate-300 hidden sm:inline">|</span>
                                <span className="flex items-center gap-1">
                                    <span>🏠</span>
                                    <span>실온 18개월 보관</span>
                                </span>
                            </div>
                        </div>

                        {/* Right Column: Hero Product Visual Card + 100ml Flagship Trust Info */}
                        <div className="lg:col-span-5">
                            <div className="relative max-w-md mx-auto">
                                {/* Main Product Card */}
                                <div className="relative rounded-3xl bg-gradient-to-b from-white via-sky-50/40 to-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-200/90 overflow-hidden">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold">
                                            🌿 체내 흡수 0% 천연 미네랄
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-900 text-xs font-extrabold">
                                            ★ 100ml 표준 상비겔
                                        </span>
                                    </div>

                                    <div className="relative aspect-[4/4] max-h-72 sm:max-h-80 mx-auto flex items-center justify-center">
                                        <img
                                            src={`${import.meta.env.BASE_URL}images/bottle_front.png`}
                                            alt="파보겔 100ml (ParvoGel) 반려동물 1초 펌프 응급 장 케어 보조사료"
                                            width="600"
                                            height="600"
                                            fetchPriority="high"
                                            decoding="async"
                                            className="w-auto h-full max-h-72 sm:max-h-80 object-contain drop-shadow-xl"
                                        />

                                        {/* Floating Pill 1 */}
                                        <div className="absolute top-2 left-0 sm:-left-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-sky-100 flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                                            <span>💧</span>
                                            <span>주사기 스트레스 ZERO</span>
                                        </div>

                                        {/* Floating Pill 2 */}
                                        <div className="absolute bottom-3 right-0 sm:-right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-emerald-100 flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                                            <span>🛡️</span>
                                            <span>노령견·아기동물 안심</span>
                                        </div>
                                    </div>

                                    {/* 응급실 vs 파보겔 상비겔 가성비 비교 캡슐 */}
                                    <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2.5 text-left">
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                            <div className="text-xs font-bold text-slate-600">🚨 24시 야간 응급실</div>
                                            <div className="text-sm sm:text-base font-black text-slate-800 mt-0.5">평균 30~50만 원</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-sky-50/90 border border-sky-200">
                                            <div className="text-xs font-extrabold text-sky-900">🏠 서랍 속 파보겔 100ml</div>
                                            <div className="text-sm sm:text-base font-black text-primary-900 mt-0.5">18,000원 <span className="text-xs font-bold text-sky-800">(약 100회)</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto mt-5">
                        <FeedDisclaimer />
                    </div>
                </div>
            </section>

            {/* 🎬 1단계 설득: 파보겔 기적의 골든타임 35초 핵심 스토리 영상 */}
            <Suspense fallback={<div className="py-12 text-center text-slate-400">영상 로딩 중...</div>}>
                <ParvogelClinicalDocumentary />
            </Suspense>

            {/* 🔬 2단계 설득: 왜 파보겔인가 — 체내 흡수 0% 나노 스펀지 3단계 원리 */}
            <Suspense fallback={<div className="py-12 text-center text-slate-400">스토리라인 로딩 중...</div>}>
                <ParvogelNanoActionStory />
            </Suspense>

            {/* 🎙️ 3단계 설득: 현장 수의사 실제 육성 리포트 (반려견 임상 관찰 — 최하단에서 핵심 설득 구간으로 상향 배치) */}
            <section id="vet-voice" className="py-8 sm:py-10 bg-gradient-to-b from-sky-50/40 to-white">
                <div className="section-container max-w-5xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-5">
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200 mb-2.5">
                            🩺 현직 동물병원 원장님 실제 임상 육성
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 break-keep leading-snug text-balance">
                            수의사가 직접 써보고 확인한<br />기호성과 장 회복 속도
                        </h2>
                        <p className="text-sm sm:text-base text-slate-700 mt-2 break-keep">
                            광고 문구가 아닌 하남 사랑동물병원 김동준 원장님의 실제 통화 육성을 직접 들어보세요.
                        </p>
                    </div>
                    <AudioTestimonial
                        tKey="audioTestimonial"
                        audioUrl={`${import.meta.env.BASE_URL}assets/kimdongjun-call.m4a`}
                    />
                </div>
            </section>

            {/* 📊 4단계 설득: 경상국립대 수의대 시험 데이터 & 수의학 전문가 자문단 리뷰 */}
            <Suspense fallback={<div className="py-16 text-center text-slate-400">임상 데이터 로딩 중...</div>}>
                <ClinicalEvidence />
            </Suspense>

            {/* About Section — 핵심 성분표 & 1초 펌프 급여 가이드 */}
            <section id="about" className="py-[0.98rem] sm:py-[1.47rem] lg:py-[1.96rem] bg-white">
                <div className="section-container">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                        <div>
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-4`}>
                                {t('about.badge')}
                            </span>
                            <h2 className="section-title whitespace-pre-line">{t('about.title')}</h2>
                            <p className="section-subtitle whitespace-pre-line">
                                {t('about.desc1')}
                            </p>
                            <p className="section-subtitle mt-4 whitespace-pre-line">
                                {t('about.desc2')}
                            </p>
                                <div className="mt-5 grid grid-cols-2 gap-3.5">
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
                            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                        <div className="relative" ref={aboutVideoRef}>
                            {/* Main product image / video — 뷰포트 진입 시에만 비디오 Fetch (LCP 차단 해소) */}
                            <div className="relative aspect-[4/5] max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
                                {activeMedia === 'video' ? (
                                    shouldLoadVideo ? (
                                        <video
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="metadata"
                                            poster={`${import.meta.env.BASE_URL}images/bottle_front.png`}
                                            aria-label={t('a11y.productVideo', '파보겔 제품 소개 영상')}
                                            className="w-full h-full object-cover"
                                            src={`${import.meta.env.BASE_URL}assets/video.mp4`}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShouldLoadVideo(true)}
                                            className="w-full h-full relative group focus:outline-none"
                                            aria-label={t('a11y.playProductVideo', '제품 영상 재생')}
                                        >
                                            <img src={`${import.meta.env.BASE_URL}images/bottle_front.png`} alt={t('a11y.productPhoto', '파보겔 제품 사진')} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                            <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                                                <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl text-slate-900 text-2xl">▶</span>
                                            </span>
                                        </button>
                                    )
                                ) : (
                                    <img
                                        src={activeMedia}
                                        alt={t('a11y.productPhoto', '파보겔 제품 사진')}
                                        className="w-full h-full object-cover animate-fade-in"
                                        loading="lazy"
                                        decoding="async"
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
                                    onClick={() => { setShouldLoadVideo(true); setActiveMedia('video'); }}
                                >
                                    <img src={`${import.meta.env.BASE_URL}images/bottle_front.png`} alt="" className="w-full h-full object-cover opacity-80" loading="lazy" decoding="async" />
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
                            {/* Floating badges (모바일 화면 밖으로 삐져나가지 않도록 안전 여백 확보) */}
                            {/* Coupang Floating Badge */}
                            <a href={getStoreUrl('coupang')} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade" className="absolute top-2 end-2 sm:-top-3 sm:-end-3 z-30 flex items-center gap-2 pl-3 pr-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-orange-200 shadow-[0_8px_24px_rgba(249,115,22,0.15)] hover:scale-105 transition-transform animate-cute-float">
                                <span className="text-xl" aria-hidden="true">🚀</span>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-wider">{t('about.coupang')}</span>
                                    <span className="text-xs font-black text-gray-800 mt-0.5">{t('about.rocket')}</span>
                                </div>
                            </a>
                            {/* Naver Floating Badge */}
                            <a href={getStoreUrl('naver')} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade" className="absolute bottom-24 start-2 sm:bottom-16 sm:-start-6 z-30 flex items-center gap-2 pl-3 pr-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-emerald-200 shadow-[0_8px_24px_rgba(16,185,129,0.15)] hover:scale-105 transition-transform animate-cute-float-alt">
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

            {/* 축종별 맞춤 급여량 가이드 (성분·급여법 바로 아래 배치) */}
            <div id="animal-guide" className="section-container pt-4 pb-2">
                <AnimalSelector />
            </div>

            {/* Features Section */}
            <section id="features" className="py-[0.98rem] sm:py-[1.47rem] lg:py-[1.96rem] bg-gray-50">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-3`}>
                            {t('features.badge')}
                        </span>
                        <h2 className="section-title">{t('features.title').split('\n').map((line, i) => (<span key={i} className="block">{line}</span>))}</h2>
                        <p className="section-subtitle">
                            {t('features.subtitle')}
                        </p>
                    </div>

                    {/* Product Images (Front & Back) — lazy + async decode + width/height CLS 방지 (Issue #5 크기 통일) */}
                    <div className="max-w-4xl mx-auto mt-4 mb-6 sm:mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white flex items-center justify-center p-2 sm:p-4">
                            <img src={`${import.meta.env.BASE_URL}images/bottle_front_detail.png`} alt={t('a11y.bottleFront', '파보겔 5가지 복합제 전면')} width="600" height="800" className="w-full h-auto object-contain aspect-[3/4]" loading="lazy" decoding="async" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white flex items-center justify-center p-2 sm:p-4">
                            <img src={`${import.meta.env.BASE_URL}images/bottle_back.png`} alt={t('a11y.bottleBack', '파보겔 후면 성분표')} width="600" height="800" className="w-full h-auto object-contain aspect-[3/4]" loading="lazy" decoding="async" onError={(e) => { e.target.style.display = 'none'; }} />
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
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section (실제 보호자·수의사 회복 후기) */}
            <section id="testimonials" className="py-[0.98rem] sm:py-[1.47rem] lg:py-[1.96rem] bg-white" aria-label={t('testimonials.title')}>
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-3`}>
                            {t('testimonials.badge')}
                        </span>
                        <h2 className="section-title whitespace-pre-line">{t('testimonials.title')}</h2>
                        <p className="section-subtitle">
                            {t('testimonials.subtitle')}
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {testimonials.map((testimonial, i) => (
                            <div
                                key={testimonial.id || i}
                                className={`card relative flex flex-col justify-between ${testimonial.id === 't6' ? 'ring-2 ring-primary-400 bg-gradient-to-b from-sky-50/40 via-white to-white' : ''}`}
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                {testimonial.badge && (
                                    <span className="absolute top-4 right-4 px-2.5 py-0.5 text-xs font-black rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                                        {testimonial.badge}
                                    </span>
                                )}
                                <div>
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, j) => (
                                            <svg key={j} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-6 break-keep">&quot;{testimonial.content}&quot;</p>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="font-bold text-gray-900 break-keep">{testimonial.name}</p>
                                    <p className="text-sm text-gray-600 break-keep">{testimonial.clinic}</p>
                                    <p className="text-xs text-gray-500 mt-1 break-keep">{testimonial.role}</p>

                                    {/* 꼬미 숏츠 영상 링크 */}
                                    {testimonial.id === 't5' && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <a
                                                href="https://youtube.com/shorts/2vGdq9EbDwA?si=ukVhGir33kIiorQU"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-all shadow-xs"
                                            >
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                                </svg>
                                                <span>유튜브 숏츠 직캠 보기</span>
                                                <span className="text-[10px]">↗</span>
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => scrollToSection('gomi-story')}
                                                className="text-xs font-semibold text-blue-700 hover:underline"
                                            >
                                                배변 증거 보기 ↓
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 우리 아이들과 함께하는 파보겔 반려견 포토 갤러리 & 꼬미 배변 회복기 */}
            <PetGallerySection />

            <div className="section-container py-0">
                <GomiPoopStory />
            </div>

            <div className="section-container">
                <FeedDisclaimer />
            </div>

            {/* Products Section — 100ml 표준 주력 강조 + 200ml/500ml 재고 소진 시 단종 안내 + 간편결제 바로연결 */}
            <section id="products" className="py-10 sm:py-14 bg-gray-50">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-3`}>
                            {t('products.badge')}
                        </span>
                        <h2 className="section-title whitespace-pre-line">{t('products.title')}</h2>
                        <p className="section-subtitle">
                            {t('products.subtitle')}
                        </p>
                    </div>

                    {/* Product Lineup Image */}
                    <div className="max-w-2xl mx-auto mt-4 mb-6 sm:mb-8 rounded-3xl shadow-xl border border-slate-100 bg-white p-4 sm:p-6 flex items-center justify-center overflow-hidden">
                        <img
                            src={`${import.meta.env.BASE_URL}images/bottle_group.png`}
                            alt={t('a11y.bottleGroup', '파보겔 100ml, 200ml, 500ml 용량별 라인업')}
                            width="1086"
                            height="1448"
                            className="w-auto h-auto max-h-[520px] sm:max-h-[600px] max-w-full object-contain mx-auto"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
                        {products.map((product, i) => {
                            const isFlagship = i === 0;
                            const isLimitedStock = i > 0;
                            return (
                                <div
                                    key={product.id}
                                    className={`card relative flex flex-col justify-between ${isFlagship ? 'ring-2 ring-primary-600 md:scale-[1.03] z-10 shadow-2xl bg-white' : 'bg-white/95 border-slate-200'}`}
                                    style={{ animationDelay: `${i * 150}ms` }}
                                >
                                    {isFlagship ? (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                            <span className={`px-4 py-1 rounded-full text-xs font-black text-white shadow-md ${primaryBg}`}>
                                                ★ {t('products.recommended', '표준 추천 · 주력')}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
                                                ⏳ 한정 재고 · 소진 시 단종 예정
                                            </span>
                                        </div>
                                    )}

                                    <div>
                                        <div className="text-center mb-5 pt-2">
                                            <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${isFlagship ? primaryBgLight : 'bg-slate-100'}`}>
                                                <div className={`w-10 h-16 rounded-lg ${isFlagship ? primaryBg : 'bg-slate-700'} flex items-center justify-center shadow-md`}>
                                                    <span className="text-white font-extrabold text-lg">P</span>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 break-keep">{product.name}</h3>
                                            <p className="text-gray-700 text-sm mt-1.5 leading-relaxed break-keep">{product.desc}</p>
                                            {isLimitedStock && (
                                                <p className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 mt-2.5 inline-block break-keep">
                                                    ※ 보유 재고 소진 후 재생산 예정 없음
                                                </p>
                                            )}
                                        </div>

                                        <div className={`p-4 rounded-xl ${isFlagship ? primaryBgLight : 'bg-slate-50'} mb-5`}>
                                            <div className="flex items-baseline justify-center gap-1 mb-1">
                                                <span className="text-3xl font-black text-gray-900">{product.price}</span>
                                                <span className="text-gray-600 font-semibold">/{product.unit}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 font-medium text-center">{t('products.vatShippingIncluded')}</p>
                                        </div>
                                    </div>

                                    {/* 일반 보호자 1클릭 공식몰 즉시구매 버튼 (이탈 방지) */}
                                    <div className="space-y-2">
                                        <a
                                            href={getStoreUrl('kakaoStore')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            data-product-id={product.id}
                                            className="w-full min-h-[46px] px-3 py-2.5 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-sm border border-amber-300 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <span aria-hidden="true">💬</span>
                                            <span>카카오 쇼핑하기 구매</span>
                                        </a>
                                        <div className="grid grid-cols-2 gap-2">
                                            <a
                                                href={getStoreUrl('coupang')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                data-product-id={product.id}
                                                className="min-h-[44px] px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-all"
                                            >
                                                <span aria-hidden="true">🚀</span>
                                                <span>쿠팡</span>
                                            </a>
                                            <a
                                                href={getStoreUrl('naver')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                data-product-id={product.id}
                                                className="min-h-[44px] px-2.5 py-2 rounded-xl bg-[#028A3D] hover:bg-[#027734] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-all"
                                            >
                                                <span aria-hidden="true">🛍️</span>
                                                <span>네이버</span>
                                            </a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, requestType: 'consumer', product: product.id }));
                                                setIsOrderModalOpen(true);
                                                setIsOrderComplete(false);
                                            }}
                                            className="w-full py-2 text-xs font-bold text-slate-600 hover:text-primary-800 hover:underline transition-colors"
                                        >
                                            무통장 직영 주문 / 전화 상담 신청 ➔
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Online Store Links — 공식 입점 쇼핑몰 7곳 통합 안내 (용량 선택 바로 아래 배치) */}
                    <div id="official-stores" className="max-w-4xl mx-auto mt-10 scroll-mt-24">
                        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 text-center">
                            <p className="text-xs font-extrabold text-primary-700 uppercase tracking-wider mb-1">
                                {t('stores.sectionEyebrow', 'Official Online Stores')}
                            </p>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1.5 break-keep">
                                {t('order.online', '공식 입점 온라인 쇼핑몰에서 바로 구매하세요')}
                            </h3>
                            <p className="text-sm text-slate-700 mb-5 break-keep">
                                {t('stores.sectionSub', '자주 이용하시는 쇼핑몰을 선택해 정품 파보겔을 빠르게 받아보실 수 있습니다.')}
                            </p>

                            {/* 1단: 대표 공식몰 3곳 (카카오 쇼핑 최우선 · 네이버 · 쿠팡) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-3">
                                <a
                                    href={getStoreUrl('kakaoStore')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    data-product-id="parvogel-100ml"
                                    aria-label={t('stores.kakaoAria', '카카오 쇼핑하기 구매 페이지로 이동 (새 창)')}
                                    className="min-h-[54px] flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] border border-amber-300 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#191919] shrink-0" aria-hidden="true" />
                                        <span className="font-extrabold text-sm sm:text-base">{t('stores.kakaoCta', '카카오 쇼핑하기')}</span>
                                    </span>
                                    <span className="text-xs font-bold shrink-0" aria-hidden="true">{t('stores.kakaoTag', '톡딜')} ➔</span>
                                </a>
                                <a
                                    href={getStoreUrl('naver')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    data-product-id="parvogel-100ml"
                                    aria-label={t('stores.naverAria', '네이버 스마트스토어 구매 페이지로 이동 (새 창)')}
                                    className="min-h-[54px] flex items-center justify-between px-4 py-3 rounded-2xl bg-[#028A3D] hover:bg-[#027734] text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0" aria-hidden="true" />
                                        <span className="font-extrabold text-sm sm:text-base">{t('stores.naverCta', '네이버 스마트스토어')}</span>
                                    </span>
                                    <span className="text-xs font-bold opacity-95 shrink-0" aria-hidden="true">{t('stores.officialTag', '공식몰')} ➔</span>
                                </a>
                                <a
                                    href={getStoreUrl('coupang')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    data-product-id="parvogel-100ml"
                                    aria-label={t('stores.coupangAria', '쿠팡 로켓배송 구매 페이지로 이동 (새 창)')}
                                    className="min-h-[54px] flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" aria-hidden="true" />
                                        <span className="font-extrabold text-sm sm:text-base">{t('stores.coupangCta', '쿠팡 로켓배송')}</span>
                                    </span>
                                    <span className="text-xs font-bold opacity-95 shrink-0" aria-hidden="true">{t('stores.fastTag', '빠른배송')} ➔</span>
                                </a>
                            </div>

                            {/* 2단: 입점 오픈마켓 4곳 (모바일 2×2 / PC 4×1 대칭 그리드) */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto mb-6">
                                {[
                                    { key: 'toss', name: t('stores.toss', '토스쇼핑'), dot: 'bg-blue-600' },
                                    { key: 'gmarket', name: t('stores.gmarket', 'G마켓'), dot: 'bg-emerald-600' },
                                    { key: 'auction', name: t('stores.auction', '옥션'), dot: 'bg-red-600' },
                                    { key: 'elevenst', name: t('stores.elevenst', '11번가'), dot: 'bg-rose-600' },
                                ].map((mall) => (
                                    <a
                                        key={mall.key}
                                        href={getStoreUrl(mall.key)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        data-product-id="parvogel-100ml"
                                        aria-label={`${mall.name} ${t('stores.openNewWindow', '구매 페이지로 이동 (새 창)')}`}
                                        className="min-h-[46px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-200/90 hover:border-primary-300 text-slate-900 hover:text-primary-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                                    >
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${mall.dot}`} aria-hidden="true" />
                                        <span className="font-bold text-sm tracking-tight">{mall.name}</span>
                                    </a>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 border-t border-slate-100">
                                <Suspense fallback={<div className="w-[130px] h-[130px]" />}>
                                    <QrCode value={getStoreUrl('kakaoStore')} size={130} label={t('order.kakaoQr', '카카오 쇼핑하기 주문')} />
                                    <QrCode value={getStoreUrl('coupang')} size={130} label={t('order.coupangQr')} />
                                    <QrCode value={getStoreUrl('naver')} size={130} label={t('order.naverQr')} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 자주 묻는 질문 (FAQ) */}
            <FAQ />

            {/* Target Animals Section (적용 가능 전체 동물 안내) */}
            <section id="target" className="py-[0.98rem] sm:py-[1.47rem] lg:py-[1.96rem] bg-gray-50">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-3`}>
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
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-keep">{animal.name}</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <svg className={`w-4 h-4 ${primaryText}`} fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                                            <span className="break-keep">{t('target.recommendedAge')}: <strong className="text-gray-900">{animal.age}</strong></span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-gray-700">
                                            <svg className={`w-4 h-4 ${primaryText} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a1 1 0 10-2 0 1 1 0 002 0zm0 8a1 1 0 10-2 0 1 1 0 002 0zm0-11a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" /></svg>
                                            <div>
                                                <p className="font-semibold text-gray-900 break-keep">{t('target.mainPathogens')}</p>
                                                <p className="text-gray-700 break-keep">{animal.diseases}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Order Section (일반 보호자 직영 무통장 주문 및 상담) */}
            <section id="order" className="py-10 sm:py-14 bg-white">
                <div className="section-container">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-6 sm:mb-8">
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-3`}>
                                {t('order.badge', '주문 및 상담 안내')}
                            </span>
                            <h2 className="section-title">{t('order.title', '지금 바로 주문하세요')}</h2>
                            <p className="section-subtitle">
                                {t('order.subtitle', '카카오 쇼핑하기·쿠팡 로켓배송·네이버 스마트스토어 간편결제 및 무통장 직영 주문을 지원합니다.')}
                            </p>
                        </div>

                        <div className="card">
                            <OrderForm
                                formData={formData}
                                onChange={handleInputChange}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                products={products}
                                variant="section"
                            />
                        </div>
                    </div>
                </div>
            </section>
            </main>

            {/* Footer (전체 배경색과 일치하는 밝고 세련된 프리미엄 테마) */}
            <footer className="bg-slate-100/90 text-slate-600 py-8 sm:py-10 border-t border-slate-200">

                <div className="section-container">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${primaryBg} shadow-md`}>
                                    <span className="text-white font-extrabold text-xl">P</span>
                                </div>
                                <span className="font-extrabold text-xl text-slate-900">{t('nav.brandName')} <span className={`${primaryText} font-black`}>Parvogel</span></span>
                            </div>
                            <p className="text-slate-600 mb-6 max-w-sm leading-relaxed text-sm">
                                {t('footer.desc')}
                            </p>
                            <div className="flex gap-4">
                                <a href={getStoreUrl('coupang')} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade" className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                </a>
                                <a href={getStoreUrl('naver')} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade" className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                                </a>
                                <a href="mailto:name_hyosun@naver.com" className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </a>
                            </div>
                            <div className="mt-8 flex flex-col items-center md:items-start">
                                <span className="text-xs font-bold text-slate-500 mb-3 text-center md:text-left block w-full">
                                    {t('footer.qrOrderGuide', '스마트폰 카메라로 즉시 주문')}
                                </span>
                                <div className="flex flex-wrap justify-center md:justify-start gap-5 items-center w-full">
                                    <Suspense fallback={<div className="w-[100px] h-[100px]" />}>
                                        <QrCode value={getStoreUrl('kakaoStore')} size={100} label={t('footer.kakao', '카카오 쇼핑')} />
                                        <QrCode value={getStoreUrl('coupang')} size={100} label={t('footer.coupang')} />
                                        <QrCode value={getStoreUrl('naver')} size={100} label={t('footer.naver')} />
                                    </Suspense>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">{t('footer.productInfo')}</h4>
                            <ul className="space-y-2 text-sm">
                                <li><button type="button" onClick={() => scrollToSection('about')} className="hover:text-blue-600 transition-colors">{t('footer.productInfo1')}</button></li>
                                <li><button type="button" onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition-colors">{t('footer.productInfo2')}</button></li>
                                <li><button type="button" onClick={() => scrollToSection('clinical')} className="hover:text-blue-600 transition-colors">{t('footer.productInfo3')}</button></li>
                                <li><button type="button" onClick={() => scrollToSection('target')} className="hover:text-blue-600 transition-colors">{t('footer.productInfo4')}</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">{t('footer.support')}</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="https://pf.kakao.com/_rqxnJX/chat"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-amber-700 font-bold hover:text-amber-800 transition-colors"
                                    >
                                        <span>💬 카카오톡 1:1 상담 / 채널 추가</span>
                                    </a>
                                </li>
                                <li><button type="button" onClick={() => scrollToSection('order')} className="hover:text-blue-600 transition-colors">{t('footer.support1')}</button></li>
                                <li><a href="tel:02-6949-5708" className="hover:text-blue-600 transition-colors">{t('footer.support2')}</a></li>
                                <li><a href="mailto:name_hyosun@naver.com" className="hover:text-blue-600 transition-colors">{t('footer.support3')}</a></li>
                                <li><button type="button" onClick={() => scrollToSection('faq')} className="hover:text-blue-600 transition-colors">{t('footer.support4', '자주 묻는 질문 (FAQ)')}</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-200/90 pt-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                            <p className="text-slate-500 text-sm">
                                {t('footer.copyright')}
                            </p>
                            <div className="flex gap-6 text-sm text-slate-500">
                                <button onClick={() => setLegalType('privacy')} className="hover:text-slate-800 transition-colors">{t('footer.privacy')}</button>
                                <button onClick={() => setLegalType('terms')} className="hover:text-slate-800 transition-colors">{t('footer.terms')}</button>
                                <button onClick={() => setLegalType('business')} className="hover:text-slate-800 transition-colors">{t('footer.business')}</button>
                            </div>
                        </div>
                        <div className="text-center text-slate-500 text-xs space-y-1">
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
