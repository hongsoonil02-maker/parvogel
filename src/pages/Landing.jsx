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
import findSampleRecipient from '../utils/sampleCheck'
import { verifyBusinessApplicant, VERIFICATION_STATUS, ensureVerificationDataLoaded } from '../utils/businessVerification'

const PartnerNoticeModal = lazy(() => import('../components/PartnerNoticeModal'))
const DuplicateSampleModal = lazy(() => import('../components/DuplicateSampleModal'))
const CertifiedBusinessNoticeModal = lazy(() => import('../components/CertifiedBusinessNoticeModal'))
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
    const [isOrderComplete, setIsOrderComplete] = useState(false)
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false)
    const [duplicateSampleRecipient, setDuplicateSampleRecipient] = useState(null)
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false)
    const [isCertifiedNoticeOpen, setIsCertifiedNoticeOpen] = useState(false)
    const [isPartnerMode, setIsPartnerMode] = useState(false)
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
        const sections = ['hero', 'animal-guide', 'about', 'features', 'clinical', 'target', 'testimonials', 'products', 'faq', 'order'];
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
        const modalOpen = isOrderModalOpen || Boolean(legalType) || isPartnerModalOpen
        if (!modalOpen) return
        lastFocusRef.current = document.activeElement
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setIsOrderModalOpen(false)
                setIsOrderComplete(false)
                setLegalType(null)
                setIsPartnerModalOpen(false)
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
    }, [isOrderModalOpen, legalType, isPartnerModalOpen])

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

    // URL 쿼리 파라미터 감지 (MMS 문자 링크: ?sample=petshop 또는 ?ref=petshop 또는 #/?sample=petshop 등 모든 HashRouter 경로 지원)
    useEffect(() => {
        const checkAndOpenSampleModal = () => {
            // 1) 일반 window.location.search 확인
            let params = new URLSearchParams(window.location.search)
            let sampleType = params.get('sample') || params.get('ref')

            // 2) HashRouter 구조 (예: /#/?sample=petshop 또는 /#/?ref=petshop)인 경우 해시 내부 쿼리스트링 추출
            if (!sampleType && window.location.hash.includes('?')) {
                const hashSearch = window.location.hash.substring(window.location.hash.indexOf('?'))
                params = new URLSearchParams(hashSearch)
                sampleType = params.get('sample') || params.get('ref')
            }

            if (sampleType === 'petshop' || sampleType === 'pet') {
                setIsPartnerMode(true)
                setFormData(prev => ({
                    ...prev,
                    requestType: 'sample_petshop',
                    product: 'parvogel-200ml',
                    quantity: 1,
                    message: '[MMS 문자 유입] 펫샵 본품 1병 무료 샘플 신청'
                }))
                setIsOrderModalOpen(true)
                setIsOrderComplete(false)
            } else if (sampleType === 'breeder' || sampleType === 'kennel') {
                setIsPartnerMode(true)
                setFormData(prev => ({
                    ...prev,
                    requestType: 'sample_breeder',
                    product: 'parvogel-200ml',
                    quantity: 1,
                    message: '[MMS 문자 유입] 브리더/켄넬 본품 1병 무료 샘플 신청'
                }))
                setIsOrderModalOpen(true)
                setIsOrderComplete(false)
            } else if (sampleType === 'b2b' || sampleType === 'partner') {
                setIsPartnerMode(true)
                setFormData(prev => ({
                    ...prev,
                    requestType: 'wholesale',
                    quantity: 10,
                    message: '[B2B VIP 문자 유입] 1·2차 VIP 거래처 추가 도매 발주 신청'
                }))
                setIsOrderModalOpen(true)
                setIsOrderComplete(false)
            }
        }

        // 마운트 즉시 실행 및 비동기 라우터 초기화 대비 200ms 후 재확인
        checkAndOpenSampleModal()
        const timer = setTimeout(checkAndOpenSampleModal, 200)
        return () => clearTimeout(timer)
    }, [])

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

    const handleConvertToOrder = (targetType = 'wholesale') => {
        setIsDuplicateModalOpen(false)
        const recipient = duplicateSampleRecipient
        setFormData(prev => ({
            ...prev,
            requestType: targetType,
            hospitalName: prev.hospitalName || recipient?.shopName || '',
            contactName: prev.contactName || recipient?.name || '',
            phone: prev.phone || recipient?.phoneDisplay || recipient?.phone || '',
            address: prev.address || recipient?.address || '',
            quantity: prev.quantity && parseInt(prev.quantity, 10) > 1 ? prev.quantity : (targetType === 'wholesale' ? 10 : 1),
            message: '[B2B 정식 발주] 1차 무료 샘플(1병) 수령 완료 거래처 추가 도매 발주 신청'
        }))
        setIsOrderModalOpen(true)
        setIsOrderComplete(false)
    }

    const triggerDuplicateSampleGuide = (matched) => {
        setDuplicateSampleRecipient(matched)
        setIsDuplicateModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.hospitalName || !formData.contactName || !formData.phone
            || ((formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder') && !formData.address)) {
            alert('상호명, 담당자 성함, 연락처, 그리고 배송 받으실 주소는 필수 입력 항목입니다.')
            return
        }
        // 전화번호 엄격 검증: 10~11자리 숫자, 01로 시작
        const rawPhone = formData.phone.replace(/[^0-9]/g, '')
        if (!/^01[0-9]{8,9}$/.test(rawPhone)) {
            alert('연락처는 010-1234-5678 형식의 10~11자리 숫자(01로 시작)로 입력해 주세요.')
            return
        }

        // 무료 샘플 신청 시 1,400 사업자 인증 및 중복 신청/일반인 검증
        const isSample = formData.requestType === 'sample_petshop' || formData.requestType === 'sample_breeder'
        if (isSample) {
            await ensureVerificationDataLoaded()
            const vResult = verifyBusinessApplicant(rawPhone, formData.hospitalName, formData.bizNumber)
            // 1. 기존 수령 완료 거래처 -> 기분 좋은 VIP 정식 도매 발주 모달 유도
            if (vResult.status === VERIFICATION_STATUS.ALREADY_RECEIVED) {
                triggerDuplicateSampleGuide(vResult.data)
                return
            }
            // 2. 미등록 일반인 또는 일반 개인 -> 거부감 없는 정중한 사업자 전용 안내 및 쿠팡/네이버 구매 안내 모달 노출
            if (vResult.status === VERIFICATION_STATUS.UNVERIFIED_PUBLIC) {
                setIsCertifiedNoticeOpen(true)
                return
            }
            // 3. 타깃 인허가 사업자(VERIFIED_TARGET) -> 계속 진행하여 본품 1병 무료 발송 접수!
        }
        // 사업자번호 패턴 (도매)
        if (formData.requestType === 'wholesale' && formData.bizNumber) {
            const biz = formData.bizNumber.replace(/[^0-9]/g, '')
            if (biz.length !== 10) {
                alert('사업자등록번호는 10자리 숫자로 입력해 주세요. (예: 123-45-67890)')
                return
            }
        }
        // 이메일 선택 입력 시 형식 검증
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            alert('이메일 형식이 올바르지 않습니다.')
            return
        }
        // 수량 정수 검증 (일반 구매 시)
        if (formData.requestType === 'consumer') {
            const q = parseInt(formData.quantity, 10)
            if (!Number.isInteger(q) || q < 1 || q > 100) {
                alert('수량은 1~100 사이의 정수로 입력해 주세요.')
                return
            }
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
                const matched = findSampleRecipient(normPhone, formData.hospitalName) || {
                    shopName: formData.hospitalName,
                    name: formData.contactName,
                    phoneDisplay: formData.phone,
                    address: formData.address
                }
                triggerDuplicateSampleGuide(matched)
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
        { id: 'features', label: '특징·임상' },
        { id: 'testimonials', label: '실제후기' },
        { id: 'faq', label: '자주묻는질문' },
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
        { icon: '🦜', name: t('target.bird', '앵무새·조류 (반려조)'), age: t('target.birdAge', '이유조 및 성조 전 연령'), diseases: t('target.birdDisease', '급성 수양성 설사/소낭 정체/사료 곰팡이 독소') },
        { icon: '🐹', name: '햄스터·소동물 (기니피그/친칠라)', age: '이유기 및 전 연령', diseases: '웻테일(급성 설사) / 식이성 소화장애 / 장 점막 보호' },
        { icon: '🦎', name: '도롱뇽·특수동물 (파충·양서류)', age: '유체 및 성체 전 연령', diseases: '수질·식이성 장염 / 유해 독소 흡착 배출' },
        { icon: '🐮', name: '송아지·자돈·염소 등 산업동물', age: '신생축 (생후 1~60일)', diseases: '로타·코로나·PED·대장균 설사 (※ (주)엠오바이오 독점 총판 운영)' },
    ]

    const testimonials = [
        {
            id: 't1',
            name: t('testimonials.t1Name'),
            clinic: t('testimonials.t1Clinic'),
            role: t('testimonials.t1Role'),
            content: t('testimonials.t1Content'),
            rating: 5,
            badge: '🐶 푸들 집사님',
        },
        {
            id: 't2',
            name: t('testimonials.t2Name'),
            clinic: t('testimonials.t2Clinic'),
            role: t('testimonials.t2Role'),
            content: t('testimonials.t2Content'),
            rating: 5,
            badge: '🐱 다묘 집사님',
        },
        {
            id: 't5',
            name: t('testimonials.t5Name', '홍효선 대표'),
            clinic: t('testimonials.t5Clinic', '반려조 가정 (앵무새 꼬미)'),
            role: t('testimonials.t5Role', '앵무새 보호자 24시간 완치 실화'),
            content: t('testimonials.t5Content', '"앵무새(꼬미)가 갑작스런 설사로 낙조 위기였는데, 파보겔 한 방울 급여 후 다음 날 아침 거짓말처럼 설사가 뚝 멈추고 활력을 되찾았습니다. 조류에게도 정말 대박입니다."'),
            rating: 5,
            badge: '🦜 24시간 완치 쇼츠',
        },
        {
            id: 't3',
            name: t('testimonials.t3Name'),
            clinic: t('testimonials.t3Clinic'),
            role: t('testimonials.t3Role'),
            content: t('testimonials.t3Content'),
            rating: 5,
            badge: '🏡 전문 브리더',
        },
        {
            id: 't4',
            name: t('testimonials.t4Name'),
            clinic: t('testimonials.t4Clinic'),
            role: t('testimonials.t4Role'),
            content: t('testimonials.t4Content'),
            rating: 5,
            badge: '🏪 펫샵 파트너',
        },
        {
            id: 't6',
            name: '김동준 원장',
            clinic: '하남 사랑동물병원 원장 / 파보겔 학술자문위원',
            role: '55일령 파보 장염 푸들 7일 집중 케어 회복 관찰',
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
            <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
                : 'bg-transparent'
                }`}>
                <nav className="section-container" aria-label="메인 네비게이션">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToSection('hero'); } }} onClick={() => scrollToSection('hero')}>
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${primaryBg} shadow-lg`}>
                                <span className="text-white font-extrabold text-2xl">P</span>
                            </div>
                            <span className="font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight">
                                {t('nav.brandName')} <span className={`${primaryText} font-black`}>ParvoGel</span>
                            </span>
                        </div>

                        {/* Desktop Nav - Clean & Focused */}
                        <div className="hidden md:flex items-center gap-4 lg:gap-6">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`relative text-sm font-semibold transition-colors px-1 ${activeSection === item.id
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
                            <Link to="/blog" className="relative text-sm font-semibold transition-colors px-1 text-gray-600 hover:text-gray-900">
                                칼럼
                            </Link>

                            {/* Language Toggle - Desktop Compact */}
                            <div className="relative" ref={langMenuRef}>
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    aria-label="Select Language"
                                    aria-haspopup="listbox"
                                    aria-expanded={isLangOpen}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
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
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] shadow-sm hover:scale-105 active:scale-95 transition-all border border-amber-300"
                                aria-label="카카오톡 1:1 상담 및 샘플 신청"
                            >
                                <span className="text-sm">💬</span>
                                <span>카톡 1:1 상담</span>
                            </a>

                            {/* 상비약 즉시구매 메인 버튼 (파보겔 딥 네이비 시그니처) */}
                            <a
                                href={getStoreUrl('coupang')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold bg-primary-900 hover:bg-primary-950 text-white shadow-md hover:shadow-primary-900/30 hover:scale-105 active:scale-95 transition-all border border-primary-700"
                            >
                                <span className="text-base">🛒</span>
                                <span>상비약 즉시구매</span>
                                <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">쿠팡·네이버</span>
                            </a>
                        </div>

                        {/* Mobile Header Right: Kakao + Order & Sample Button + Menu Hamburger */}
                        <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
                            <a
                                href="https://pf.kakao.com/_rqxnJX/chat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-black bg-[#FEE500] text-[#191919] shadow-sm active:scale-95 transition-all border border-amber-300 shrink-0"
                                aria-label="카톡 상담"
                            >
                                <span>💬</span>
                                <span>카톡</span>
                            </a>

                            <a
                                href={getStoreUrl('coupang')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-primary-900 text-white shadow-md active:scale-95 transition-all border border-primary-700 shrink-0 whitespace-nowrap"
                            >
                                <span>🛒</span>
                                <span>즉시구매</span>
                            </a>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 shrink-0"
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
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down bg-white/95 backdrop-blur-md rounded-b-2xl px-2 shadow-xl">
                            <div className="flex flex-col gap-2">
                                {/* 모바일 드롭다운 메뉴 최상단 공식 스토어 구매 직결 CTA */}
                                <a
                                    href={getStoreUrl('naver')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white flex items-center justify-between shadow-md active:scale-98 transition-all border border-emerald-400/40"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-base">🛍️</span>
                                        <span>네이버 스마트스토어 공식 구매</span>
                                    </span>
                                    <span className="text-[11px] text-emerald-100 bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                                        NPay 적립
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
                                        <span>카카오톡 1:1 상담 / 샘플 문의</span>
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

            {/* Hero Section — 2040 D2C Pet Healthcare Modern Renewal */}
            <main id="main-content" tabIndex={-1}>
            <section id="hero" className="relative py-6 sm:py-10 lg:py-14 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-white to-sky-50/50">
                {/* Soft Pastel Ambient Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 left-1/4 w-[28rem] h-[28rem] bg-sky-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-[26rem] h-[26rem] bg-emerald-100/40 rounded-full blur-3xl" />
                </div>

                <div className="section-container relative z-10">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center max-w-6xl mx-auto">
                        {/* Left Column: 2040 Pet Parent Empathetic Copy & Direct Store CTAs */}
                        <div className="lg:col-span-7 text-center lg:text-left">
                            {/* 상단 트렌디 피드 배지 */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/90 text-sky-900 text-xs sm:text-sm font-extrabold mb-4 shadow-xs animate-fade-in-up">
                                <span>✨</span>
                                <span>우리 집 펫 구급함 필수템 · 주사기 실랑이 없는 1초 펌프 겔</span>
                            </div>

                            {/* 메인 감성 & 직관 헤드라인 */}
                            <h1 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight leading-[1.22] mb-4 break-keep text-slate-900 animate-fade-in-up">
                                <span className="block text-slate-600 text-base sm:text-xl lg:text-2xl font-bold mb-1.5">
                                    새벽에 갑자기 토하고 설사할 때, 당황하지 말고
                                </span>
                                <span className="block text-slate-900">
                                    입에 대고 1초 톡! <span className="text-primary-700">‘파보겔’</span>
                                </span>
                                <span className="block mt-2 text-lg sm:text-2xl lg:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-sky-600 to-emerald-600 font-black">
                                    가루약 거품 무는 아이도 간식처럼 냠냠 핥아먹어요 🐾
                                </span>
                            </h1>

                            <p className="text-xs sm:text-base text-slate-600 mb-5 max-w-2xl mx-auto lg:mx-0 leading-relaxed break-keep">
                                피딩 주사기로 억지로 먹이다 물리고 토하는 전쟁은 이제 끝!<br className="hidden sm:inline" />
                                체내에 흡수되지 않는 <strong>100% 천연 나노 미네랄 스펀지</strong>가 장 점막을 부드럽게 코팅하고 유해 독소만 자석처럼 끌어안고 배출합니다.
                            </p>

                            {/* 3단계 회복 타임라인 미니 캡슐 바 */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xl mx-auto lg:mx-0 mb-6 p-2.5 sm:p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
                                <div className="text-center p-2 rounded-xl bg-rose-50/70 border border-rose-100">
                                    <div className="text-[10px] sm:text-xs font-black text-rose-600">Day 1 · 응급</div>
                                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5 break-keep">1초 펌프 진정</div>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-sky-50/80 border border-sky-100">
                                    <div className="text-[10px] sm:text-xs font-black text-sky-700">Day 3 · 호전</div>
                                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5 break-keep">맘마 폭풍 완식!</div>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-emerald-50/80 border border-emerald-100">
                                    <div className="text-[10px] sm:text-xs font-black text-emerald-700">Day 7 · 회복</div>
                                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5 break-keep">우다다 활력 회복 🐾</div>
                                </div>
                            </div>

                            {/* 메인 구매 CTA 버튼 (쿠팡 로켓배송 & 네이버 스마트스토어) */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-4 w-full max-w-xl mx-auto lg:mx-0">
                                <a
                                    href={getStoreUrl('coupang')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="w-full sm:flex-1 h-15 sm:h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black px-5 flex items-center justify-center gap-3 shadow-lg hover:shadow-slate-900/20 transition-all transform hover:-translate-y-0.5"
                                >
                                    <span className="text-2xl">🚀</span>
                                    <div className="text-left leading-tight">
                                        <div className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">내일 아침 문 앞 도착</div>
                                        <div className="text-base sm:text-lg font-black">쿠팡 로켓배송 구매</div>
                                    </div>
                                </a>

                                <a
                                    href={getStoreUrl('naver')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="w-full sm:flex-1 h-15 sm:h-16 bg-[#03C75A] hover:bg-[#02b350] text-white rounded-2xl font-black px-5 flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
                                >
                                    <span className="text-2xl">🛍️</span>
                                    <div className="text-left leading-tight">
                                        <div className="text-[10px] text-emerald-50 font-extrabold uppercase tracking-wider">네이버페이 간편결제·적립</div>
                                        <div className="text-base sm:text-lg font-black">네이버 스마트스토어</div>
                                    </div>
                                </a>
                            </div>

                            {/* 신뢰도 요약 지표 */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-xs font-bold text-slate-600 mb-5">
                                <span className="flex items-center gap-1">
                                    <span className="text-amber-400">★★★★★</span>
                                    <span>공식 스토어 평점 4.9/5.0</span>
                                </span>
                                <span className="text-slate-300 hidden sm:inline">|</span>
                                <span className="flex items-center gap-1">
                                    <span>🏠</span>
                                    <span>실온 18개월 서랍 속 보관</span>
                                </span>
                                <span className="text-slate-300 hidden sm:inline">|</span>
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('animal-guide')}
                                    className="text-primary-700 hover:underline flex items-center gap-1 font-extrabold"
                                >
                                    <span>🐾 우리 아이 급여량 계산기</span>
                                    <span aria-hidden="true">➔</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Hero Product Visual Card + 3-Second Floating Trust Pills */}
                        <div className="lg:col-span-5">
                            <div className="relative max-w-md mx-auto">
                                {/* Main Product Card */}
                                <div className="relative rounded-3xl bg-gradient-to-b from-white via-sky-50/40 to-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-200/90 overflow-hidden">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold">
                                            🌿 체내 흡수 0% 천연 미네랄
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold">
                                            100ml · 200ml · 500ml
                                        </span>
                                    </div>

                                    <div className="relative aspect-[4/4] max-h-72 sm:max-h-80 mx-auto flex items-center justify-center">
                                        <img
                                            src={`${import.meta.env.BASE_URL}images/bottle_front.png`}
                                            alt="파보겔 (ParvoGel) 반려동물 1초 펌프 장 케어 보조사료"
                                            width="600"
                                            height="600"
                                            fetchPriority="high"
                                            decoding="async"
                                            className="w-auto h-full max-h-72 sm:max-h-80 object-contain drop-shadow-xl"
                                        />

                                        {/* Floating Pill 1 */}
                                        <div className="absolute top-2 left-0 sm:-left-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-sky-100 flex items-center gap-1.5 text-[11px] font-extrabold text-slate-800">
                                            <span>💧</span>
                                            <span>주사기 스트레스 ZERO</span>
                                        </div>

                                        {/* Floating Pill 2 */}
                                        <div className="absolute bottom-3 right-0 sm:-right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-emerald-100 flex items-center gap-1.5 text-[11px] font-extrabold text-slate-800">
                                            <span>🛡️</span>
                                            <span>생후 30일 아기 동물 안심</span>
                                        </div>
                                    </div>

                                    {/* 응급실 vs 파보겔 상비약 가성비 비교 캡슐 */}
                                    <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
                                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                                            <div className="text-[10px] font-bold text-slate-500">🚨 24시 야간 응급실</div>
                                            <div className="text-xs sm:text-sm font-black text-slate-700 mt-0.5">평균 30~50만 원</div>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-sky-50/90 border border-sky-200">
                                            <div className="text-[10px] font-extrabold text-sky-800">🏠 서랍 속 파보겔 상비</div>
                                            <div className="text-xs sm:text-sm font-black text-primary-800 mt-0.5">18,000원 <span className="text-[10px] font-bold text-sky-700">(1초 급여)</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🏢 B2B 파트너 라운지 (펫샵 · 브리더 전용) & 산업동물 총판 안내 바 */}
                    <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-slate-200/70 flex flex-col md:flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 sm:px-5 border shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-center sm:text-left">
                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-extrabold shrink-0">
                                🏢 Partner Lounge
                            </span>
                            <div className="text-xs text-slate-700 break-keep">
                                <strong className="text-slate-900">전국 펫샵 · 브리더(번식농장) 사장님:</strong> 인허가 사업자 전용 도매 공급가 및 <strong>본품 1병 무료 샘플</strong>을 지원해 드립니다.
                                <span className="text-slate-400 text-[11px] block sm:inline sm:ml-2">
                                    (※ 송아지·자돈 등 산업동물은 독점 총판 <strong>(주)엠오바이오</strong> 운영)
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    requestType: 'sample_petshop',
                                    product: 'parvogel-200ml',
                                    quantity: 1,
                                    message: '[파트너 라운지] 펫샵·브리더 전용 도매 특가 및 무료 샘플 신청'
                                }));
                                setIsOrderModalOpen(true);
                                setIsOrderComplete(false);
                            }}
                            className="w-full md:w-auto shrink-0 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-900 border border-primary-200 text-xs font-extrabold rounded-xl transition-all"
                        >
                            펫샵·브리더 1병 무료샘플 &amp; 도매 신청 ➔
                        </button>
                    </div>

                    <div className="max-w-4xl mx-auto mt-3">
                        <FeedDisclaimer />
                    </div>
                </div>
            </section>

            {/* 📹 하남 사랑동물병원 김동준 원장 55일령 파보 아기 푸들 7일 완치 직캠 다큐멘터리 (상세페이지 최상단 전면 배치) */}
            <Suspense fallback={<div className="py-12 text-center text-slate-400">직캠 다큐멘터리 로딩 중...</div>}>
                <ParvogelClinicalDocumentary />
            </Suspense>

            {/* 축종별 맞춤 효능 탭 (Hero 직하단 황금 배치: 모든 반려동물/소동물/가축 보호자 즉각 확인) */}
            <div id="animal-guide" className="section-container pt-2 pb-1">
                <AnimalSelector />
            </div>

            {/* About Section */}
            <section id="about" className="py-[0.98rem] sm:py-[1.47rem] lg:py-[1.96rem] bg-white">
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
                            {/* Floating badges */}
                            {/* Coupang Floating Badge */}
                            <a href={getStoreUrl('coupang')} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade" className="absolute -top-3 -end-3 z-30 flex items-center gap-2 pl-3 pr-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-orange-200 shadow-[0_8px_24px_rgba(249,115,22,0.15)] hover:scale-105 transition-transform animate-cute-float">
                                <span className="text-xl" aria-hidden="true">🚀</span>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-wider">{t('about.coupang')}</span>
                                    <span className="text-xs font-black text-gray-800 mt-0.5">{t('about.rocket')}</span>
                                </div>
                            </a>
                            {/* Naver Floating Badge */}
                            <a href={getStoreUrl('naver')} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade" className="absolute bottom-16 -start-6 z-30 flex items-center gap-2 pl-3 pr-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-emerald-200 shadow-[0_8px_24px_rgba(16,185,129,0.15)] hover:scale-105 transition-transform animate-cute-float-alt">
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

            {/* 🌟 B2C 나노 스펀지 3단계 작용 & 4대 핵심 셀링포인트 스토리라인 (신규 개편안 반영) */}
            <Suspense fallback={<div className="py-12 text-center text-slate-400">스토리라인 로딩 중...</div>}>
                <ParvogelNanoActionStory />
            </Suspense>

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
                                <p className="text-gray-600 leading-relaxed break-keep">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 우리 아이들과 함께하는 파보겔 반려견 포토 갤러리 (Issue #7: 대박이·쿠키 사진) */}
            <PetGallerySection />

            {/* Clinical Evidence Section — lazy */}
            <Suspense fallback={<div className="py-16 text-center text-slate-400">임상 데이터 로딩 중...</div>}>
                <ClinicalEvidence />
            </Suspense>

            {/* 대표 반려조 '꼬미'의 실제 배변 회복기 및 조류(새/앵무새) 임상 실화 판별 가이드 */}
            <div className="section-container py-0">
                <GomiPoopStory />
            </div>

            <div className="section-container">
                <FeedDisclaimer />
            </div>


            {/* Target Animals Section */}
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

                    <div className="text-center mt-6 sm:mt-8">
                        <p className="text-gray-600 mb-3 text-sm break-keep">{t('target.other')}</p>
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
            <section id="testimonials" className="py-[0.98rem] sm:py-[1.47rem] lg:py-[1.96rem] bg-white" aria-label={t('testimonials.title')}>
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-3`}>
                            {t('testimonials.badge')}
                        </span>
                        <h2 className="section-title">{t('testimonials.title')}</h2>
                        <p className="section-subtitle">
                            {t('testimonials.subtitle')}
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {testimonials.map((testimonial, i) => (
                            <div
                                key={testimonial.id || i}
                                className={`card relative flex flex-col justify-between ${testimonial.id === 't7' ? 'ring-2 ring-amber-400 bg-gradient-to-b from-amber-50/40 via-white to-white' : ''}`}
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                {testimonial.badge && (
                                    <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[10px] font-black rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
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
                                    <p className="text-gray-700 leading-relaxed mb-6 break-keep">&quot;{testimonial.content}&quot;</p>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="font-bold text-gray-900 break-keep">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500 break-keep">{testimonial.clinic}</p>
                                    <p className="text-xs text-gray-400 mt-1 break-keep">{testimonial.role}</p>

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

            {/* Products Section */}
            <section id="products" className="py-[0.98rem] sm:py-[1.47rem] lg:py-[1.96rem] bg-gray-50">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-3`}>
                            {t('products.badge')}
                        </span>
                        <h2 className="section-title">{t('products.title')}</h2>
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
                            className="w-auto h-auto max-h-[560px] sm:max-h-[640px] max-w-full object-contain mx-auto"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
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
                                    className={`w-full ${i === 1 ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {i === 1 ? t('products.order') : t('products.inquiry')}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-6 sm:mt-8">
                        <p className="text-gray-600 mb-2 break-keep">{t('products.bulk')}</p>
                        <p className="text-sm text-gray-500 mb-4 break-keep">{t('products.channelNote')}</p>
                        <button
                            onClick={() => { setFormData(prev => ({ ...prev, requestType: 'wholesale' })); setIsOrderModalOpen(true); setIsOrderComplete(false); }}
                            className="btn-primary inline-flex"
                        >
                            {t('products.bulkCta')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Order Section */}
            <section id="order" className="py-[0.98rem] sm:py-[1.47rem] lg:py-[1.96rem] bg-white">
                <div className="section-container">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-6 sm:mb-8">
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${badgePrimary} mb-3`}>
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
                                onTriggerDuplicateModal={triggerDuplicateSampleGuide}
                                onTriggerCertNotice={() => setIsCertifiedNoticeOpen(true)}
                                isVerifiedPartner={isPartnerMode}
                            />
                        </div>

                        {/* Online Store Links */}
                        <div className="mt-6 sm:mt-8 text-center">
                            <p className="text-gray-600 mb-3">{t('order.online')}</p>
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                                <a href={getStoreUrl('coupang')} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade" className="relative flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
                                    <span className="text-xl">🚀</span>
                                    <span className="font-extrabold text-sm tracking-tight">{t('order.coupang')}</span>
                                </a>
                                <a href={getStoreUrl('naver')} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer-when-downgrade" className="relative flex items-center gap-2 px-6 py-3 bg-primary-900 hover:bg-primary-950 text-white rounded-xl border border-primary-700/50 shadow-md transition-colors">
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

                        {/* 도매점·취급점 사업자 전용 홍보 지원 배너 카드 (Partner Lounge) */}
                        <div className="mt-8 sm:mt-10 p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50/60 text-slate-900 shadow-lg border border-sky-200/80 relative overflow-hidden text-start">
                            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                <div className="space-y-2 max-w-2xl">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-slate-900 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                            🏢 Partner Lounge
                                        </span>
                                        <span className="text-xs text-primary-800 font-extrabold">전국 펫샵·브리더(켄넬)·반려동물 용품점 사장님 전용</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        매장 홍보용 <span className="text-primary-700">맞춤 A4 안내판</span> &amp; <span className="text-emerald-700">실물 POP 보드판</span> 100% 무상 지원
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-keep">
                                        파보겔을 취급하시는 전국 펫샵·브리더 대표님의 매장 판매 활성화를 위해, 상호명·전화번호·희망 판매가가 각인된 
                                        <strong> A4 안내판 즉시 출력 엔진</strong>과 <strong>하드 폼보드 쇼카드(POP) 실물</strong>을 본사에서 무상으로 보내드립니다.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPartnerModalOpen(true)}
                                    className="shrink-0 w-full lg:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <span>🏢 취급점 전용 알림판 만들기 &amp; 보드판 신청</span>
                                    <span>➔</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 현장 수의사 임상 육성 리포트 */}
            <div className="section-container my-4 sm:my-6">
                <AudioTestimonial
                    tKey="audioTestimonial"
                    audioUrl={`${import.meta.env.BASE_URL}assets/kimdongjun-call.m4a`}
                />
                <AudioTestimonial
                    tKey="audioTestimonialDongjin"
                    audioUrl={`${import.meta.env.BASE_URL}assets/jeongseongdae-call.m4a`}
                />
            </div>

            {/* 자주 묻는 질문 (FAQ) */}
            <FAQ />
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
                                <div className="flex justify-center md:justify-start gap-6 items-center w-full">
                                    <Suspense fallback={<div className="w-[100px] h-[100px]" />}>
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
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setIsPartnerModalOpen(true)}
                                        className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                                    >
                                        <span>🏢 취급점·도매 파트너 지원 (A4·보드판)</span>
                                    </button>
                                </li>
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
                                        setFormData={setFormData}
                                        onSubmit={handleSubmit}
                                        isSubmitting={isSubmitting}
                                        products={products}
                                        variant="modal"
                                        onTriggerDuplicateModal={triggerDuplicateSampleGuide}
                                        onTriggerCertNotice={() => setIsCertifiedNoticeOpen(true)}
                                        isVerifiedPartner={isPartnerMode}
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

            {/* 도매점·취급점 전용 B2B 파트너 포털 모달 (A4 알림판 & POP 보드판) */}
            {isPartnerModalOpen && (
                <Suspense fallback={null}>
                    <PartnerNoticeModal
                        isOpen={isPartnerModalOpen}
                        onClose={() => setIsPartnerModalOpen(false)}
                    />
                </Suspense>
            )}

            {/* 무료 샘플 중복 신청자 친절 안내 및 B2B 정식 발주 전환 모달 */}
            {isDuplicateModalOpen && (
                <Suspense fallback={null}>
                    <DuplicateSampleModal
                        isOpen={isDuplicateModalOpen}
                        onClose={() => setIsDuplicateModalOpen(false)}
                        matchedRecipient={duplicateSampleRecipient}
                        onConvertToOrder={handleConvertToOrder}
                    />
                </Suspense>
            )}

            {/* 일반인/미등록 사업자 대상 정중한 무료 샘플 지원 정책 안내 및 쿠팡/네이버 전환 모달 */}
            {isCertifiedNoticeOpen && (
                <Suspense fallback={null}>
                    <CertifiedBusinessNoticeModal
                        isOpen={isCertifiedNoticeOpen}
                        onClose={() => setIsCertifiedNoticeOpen(false)}
                        applicantPhone={formData.phone}
                        applicantShop={formData.hospitalName}
                    />
                </Suspense>
            )}



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
