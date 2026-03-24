// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    // Load translation files from /public/locales
    .use(Backend)
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    .init({
        fallbackLng: 'en', // Use English if detected language is not available
        debug: process.env.NODE_ENV === 'development', // Enable logs only in development

        interpolation: {
            escapeValue: false, // React already safes from XSS
        },
        // Optional: Organize translations into namespaces
        // defaultNS: 'translation',
        // ns: ['translation'],
    });

export default i18n;