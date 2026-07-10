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

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ko',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
