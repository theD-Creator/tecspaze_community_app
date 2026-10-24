import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import deTranslations from '../locales/de.json'
import enTranslations from '../locales/en.json'

// Fallback translations
const fallbackTranslations = {
  de: deTranslations,
  en: enTranslations,
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'de',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'localStorage', 'htmlTag'],
      caches: ['localStorage'],
    },
    resources: {
      de: {
        ...deTranslations,
      },
      en: {
        ...enTranslations,
      },
    },
    // If a translation is missing, use the key as fallback
    returnEmptyString: false,
    // Allow dynamic namespace loading
    ns: ['common'],
    saveMissing: false,
  })

export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng)
}

export const getCurrentLanguage = () => {
  return i18n.language
}

export const loadTranslation = (lng: string) => {
  // In a real app, you would fetch translations from an API
  // For now, we just add the fallback translations
  if (!i18n.hasResourceBundle(lng, 'common')) {
    i18n.addResourceBundle(lng, 'common', fallbackTranslations[lng as keyof typeof fallbackTranslations] || {})
  }
}

export default i18n
