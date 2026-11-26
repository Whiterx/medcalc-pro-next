export interface TelegramBackButton {
  onClick(callback: () => void): void
  offClick(callback: () => void): void
  show(): void
  hide(): void
}

export interface TelegramWebApp {
  ready(): void
  expand(): void
  setHeaderColor?(color: string): void
  setBackgroundColor?(color: string): void
  BackButton?: TelegramBackButton
  initData?: string
  platform?: string
  version?: string
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

export function initializeTelegramWebApp(): TelegramWebApp | null {
  const webApp = getTelegramWebApp()
  if (!webApp) return null
  try {
    webApp.ready()
    webApp.expand()
    webApp.setHeaderColor?.('#101d32')
    webApp.setBackgroundColor?.('#f4f7fb')
    return webApp
  } catch {
    return null
  }
}
