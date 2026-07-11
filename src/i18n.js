import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko from './locales/ko/translation.json';
import en from './locales/en/translation.json';
import ja from './locales/ja/translation.json';
import zh from './locales/zh/translation.json';
import es from './locales/es/translation.json';
import fr from './locales/fr/translation.json';
import de from './locales/de/translation.json';
import th from './locales/th/translation.json';
import vi from './locales/vi/translation.json';
import ru from './locales/ru/translation.json';
import pt from './locales/pt/translation.json';
import ar from './locales/ar/translation.json';
import id from './locales/id/translation.json';
import ms from './locales/ms/translation.json';
import tr from './locales/tr/translation.json';

const resources = {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
    zh: { translation: zh },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    th: { translation: th },
    vi: { translation: vi },
    ru: { translation: ru },
    pt: { translation: pt },
    ar: { translation: ar },
    id: { translation: id },
    ms: { translation: ms },
    tr: { translation: tr },
};

const getBrowserLanguage = () => {
    if (typeof window === 'undefined' || !window.navigator) return 'ko';
    const browserLang = (window.navigator.language || window.navigator.userLanguage || 'ko').split('-')[0].toLowerCase();
    const supportedLangs = ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'th', 'vi', 'ru', 'pt', 'ar', 'id', 'ms', 'tr'];
    return supportedLangs.includes(browserLang) ? browserLang : 'ko';
};

i18n
     .use(initReactI18next)
     .init({
         resources,
         lng: getBrowserLanguage(),
         fallbackLng: 'en',
         interpolation: {
             escapeValue: false
         }
     });

export default i18n;
