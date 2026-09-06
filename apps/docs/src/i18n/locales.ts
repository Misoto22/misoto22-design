/**
 * The two languages this site is published in.
 *
 * English has no prefix and Chinese sits under `/zh`, which is the same shape
 * misoto22.com uses. That is not only for consistency: the English pages were
 * already linked before Chinese existed, and a locale scheme that moves every
 * existing URL to `/en/…` breaks them for nothing.
 */
export const LOCALES = ['en', 'zh'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** How each language names itself. A locale menu written in the reader's own language is the point. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

/** `/components/button/` → `/zh/components/button/`, and back. */
export function localePath(locale: Locale, path: string): string {
  const bare = path.replace(/^\/zh(?=\/|$)/, '') || '/'
  if (locale === DEFAULT_LOCALE) return bare
  return bare === '/' ? '/zh/' : `/zh${bare}`
}

/** Which language a path is in. */
export function localeFromPath(path: string): Locale {
  return path === '/zh' || path.startsWith('/zh/') ? 'zh' : 'en'
}

/** The same path with its locale prefix removed — `/zh/themes/` → `/themes/`. */
export function stripLocale(path: string): string {
  return path.replace(/^\/zh(?=\/|$)/, '') || '/'
}
