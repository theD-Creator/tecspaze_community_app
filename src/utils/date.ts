import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'

// Get locale based on language
const getLocale = (lang: string) => {
  switch (lang) {
    case 'de':
      return de
    case 'en':
    default:
      return enUS
  }
}

export const formatDate = (dateString: string, lang: string = 'de') => {
  try {
    const date = parseISO(dateString)
    const locale = getLocale(lang)
    return format(date, 'PPP', { locale })
  } catch {
    return dateString
  }
}

export const formatRelativeDate = (dateString: string, lang: string = 'de') => {
  try {
    const date = parseISO(dateString)
    const locale = getLocale(lang)
    return formatDistanceToNow(date, { locale, addSuffix: true })
  } catch {
    return dateString
  }
}

export const formatDateShort = (dateString: string, lang: string = 'de') => {
  try {
    const date = parseISO(dateString)
    const locale = getLocale(lang)
    return format(date, 'MMM d, yyyy', { locale })
  } catch {
    return dateString
  }
}

export const formatTimeAgo = (dateString: string, lang: string = 'de') => {
  try {
    const date = parseISO(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const locale = getLocale(lang)
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)

    if (seconds < 60) {
      return formatDistanceToNow(date, { locale, addSuffix: false })
    }
    if (minutes < 60) {
      return formatDistanceToNow(date, { locale, addSuffix: true })
    }
    if (hours < 24) {
      return formatDistanceToNow(date, { locale, addSuffix: true })
    }
    if (days < 7) {
      return formatDistanceToNow(date, { locale, addSuffix: true })
    }
    if (weeks < 4) {
      return formatDistanceToNow(date, { locale, addSuffix: true })
    }
    if (months < 12) {
      return format(date, 'MMM d', { locale })
    }
    return format(date, 'MMM yyyy', { locale })
  } catch {
    return dateString
  }
}

export default formatDate
