import { useTranslation as useI18nTranslation } from 'react-i18next'
import deTranslations from '../locales/de.json'

// Type for translation keys
export type TranslationKeys = keyof typeof deTranslations | string

export const useTranslation = () => {
  const { t, i18n, ready } = useI18nTranslation()

  return {
    t: (key: TranslationKeys, options?: Record<string, unknown>) => 
      ready ? t(key, options) : key,
    i18n,
    ready,
  }
}

export default useTranslation
