import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import deTranslations from '../locales/de.json'
import enTranslations from '../locales/en.json'

// All translations live in a single "translation" namespace,
// so keys like t('home.welcome') or t('common.more') resolve directly.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'de',
    defaultNS: 'translation',
    ns: ['translation'],
    supportedLngs: ['de', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      htmlTag: document.documentElement,
    },
    resources: {
      de: {
        translation: deTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    returnEmptyString: false,
    saveMissing: false,
  })

export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng)
}

export const getCurrentLanguage = () => {
  return i18n.language?.startsWith('en') ? 'en' : 'de'
}

export default i18n
