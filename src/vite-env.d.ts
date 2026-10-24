/// <reference types="vite/client" />

// Add global types for Vite

declare module '*.json' {
  const value: any
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.jpeg' {
  const value: string
  export default value
}

// For i18next
import 'i18next'

declare module 'i18next' {
  export interface TOptions {
    interpolation?: any
  }
}
