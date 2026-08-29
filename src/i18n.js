import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 한국어(기본) + 영어(fallback)만 초기 번들에 포함하고,
// 나머지 언어는 선택 시점에 동적으로 로드해 초기 번들 크기를 줄입니다.
import ko from './locales/ko/translation.json';
import en from './locales/en/translation.json';

const PRELOADED = { ko, en };

const LOCALE_LOADERS = {
    ja: () => import('./locales/ja/translation.json'),
    zh: () => import('./locales/zh/translation.json'),
    es: () => import('./locales/es/translation.json'),
    fr: () => import('./locales/fr/translation.json'),
    de: () => import('./locales/de/translation.json'),
    th: () => import('./locales/th/translation.json'),
    vi: () => import('./locales/vi/translation.json'),
    ru: () => import('./locales/ru/translation.json'),
    pt: () => import('./locales/pt/translation.json'),
    ar: () => import('./locales/ar/translation.json'),
    id: () => import('./locales/id/translation.json'),
    ms: () => import('./locales/ms/translation.json'),
    tr: () => import('./locales/tr/translation.json'),
};

const loaded = new Set(['ko', 'en']);

const SUPPORTED_LANGS = ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'th', 'vi', 'ru', 'pt', 'ar', 'id', 'ms', 'tr'];

// 최초 방문 시 브라우저 navigator(해외롬, 직구폰, 번역기 등)로 인해 중국어 등으로 멋대로 바뀌는 현상 원천 차단:
// 1. URL 쿼리스트링(?lng=xx)이 명시된 경우 해당 언어 우선
// 2. 사용자가 사이트 내에서 직접 언어 드롭다운을 통해 선택한 이력(parvogel_user_lang)이 있는 경우만 유지
// 3. 그 외의 모든 최초 접속/일반 접속은 무조건 'ko' (한국어) 기본 적용
const resolveInitialLanguage = () => {
    if (typeof window === 'undefined') return 'ko';
    
    try {
        const params = new URLSearchParams(window.location.search);
        const qLng = params.get('lng');
        if (qLng) {
            const baseQuery = qLng.split('-')[0].toLowerCase();
            if (SUPPORTED_LANGS.includes(baseQuery)) {
                return baseQuery;
            }
        }

        const userSelected = localStorage.getItem('parvogel_user_lang');
        if (userSelected) {
            const baseUser = userSelected.split('-')[0].toLowerCase();
            if (SUPPORTED_LANGS.includes(baseUser)) {
                return baseUser;
            }
        }

        // 사용자가 명시적으로 선택한 적이 없는데 기존 i18nextLng에 zh 등이 남아있다면 ko로 정화
        localStorage.setItem('i18nextLng', 'ko');
    } catch (e) {
        // localStorage 접근 제한 환경 대비
    }

    return 'ko';
};

const initialLng = resolveInitialLanguage();

const loadLanguage = async (lng) => {
    const base = String(lng || '').split('-')[0];
    if (!base || loaded.has(base)) return;
    const loader = LOCALE_LOADERS[base];
    if (!loader) return;
    loaded.add(base);
    try {
        const mod = await loader();
        i18n.addResourceBundle(base, 'translation', mod.default || mod, true, true);
    } catch (err) {
        loaded.delete(base);
        console.error('Failed to load locale:', base, err);
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ko: { translation: PRELOADED.ko },
            en: { translation: PRELOADED.en },
        },
        lng: initialLng,
        fallbackLng: 'ko',
        supportedLngs: SUPPORTED_LANGS,
        interpolation: { escapeValue: false }
    });

const syncDocumentLanguage = (language) => {
    if (typeof document === 'undefined') return;
    const base = String(language || 'ko').split('-')[0];
    document.documentElement.lang = base;
    document.documentElement.dir = base === 'ar' ? 'rtl' : 'ltr';
};

// 감지된 초기 언어가 preload 대상이 아니면 동적 로드 및 문서 속성 동기화
if (initialLng !== 'ko' && initialLng !== 'en') {
    loadLanguage(initialLng).then(() => {
        syncDocumentLanguage(initialLng);
        i18n.changeLanguage(initialLng);
    });
} else {
    syncDocumentLanguage(initialLng);
}

i18n.on('languageChanged', (lng) => {
    syncDocumentLanguage(lng);
    const base = String(lng || '').split('-')[0];
    try {
        localStorage.setItem('parvogel_user_lang', base);
        localStorage.setItem('i18nextLng', base);
    } catch (e) {}

    if (!loaded.has(base)) {
        loadLanguage(base).then(() => i18n.changeLanguage(lng));
    }
});

export default i18n;
