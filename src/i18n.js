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
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ko: { translation: PRELOADED.ko },
            en: { translation: PRELOADED.en },
        },
        fallbackLng: 'ko',
        supportedLngs: ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'th', 'vi', 'ru', 'pt', 'ar', 'id', 'ms', 'tr'],
        interpolation: { escapeValue: false },
        detection: {
            order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupQuerystring: 'lng',
            lookupLocalStorage: 'i18nextLng',
        }
    });

const syncDocumentLanguage = (language) => {
    if (typeof document === 'undefined') return;
    const base = String(language || 'ko').split('-')[0];
    document.documentElement.lang = base;
    document.documentElement.dir = base === 'ar' ? 'rtl' : 'ltr';
};

// 감지된 초기 언어가 preload 대상이 아니면 동적 로드 및 문서 속성 동기화
loadLanguage(i18n.language).then(() => {
    syncDocumentLanguage(i18n.language);
    if (i18n.language && !['ko', 'en'].includes(i18n.language.split('-')[0])) {
        i18n.changeLanguage(i18n.language);
    }
});

syncDocumentLanguage(i18n.language);
i18n.on('languageChanged', (lng) => {
    syncDocumentLanguage(lng);
    const base = String(lng || '').split('-')[0];
    if (!loaded.has(base)) {
        loadLanguage(base).then(() => i18n.changeLanguage(lng));
    }
});

export default i18n;
