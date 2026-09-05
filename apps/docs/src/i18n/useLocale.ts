'use client'

import { usePathname } from 'next/navigation'
import { getMessages, type Messages } from './messages'
import { localeFromPath, type Locale } from './locales'

/**
 * The current language, read off the URL.
 *
 * Client components take it from the path rather than from a prop, because the
 * alternative is threading a `locale` through every layer of the chrome to
 * reach a search box. Server components pass it explicitly, since they have the
 * route params to hand and no hook.
 */
export function useLocale(): Locale {
  return localeFromPath(usePathname())
}

export function useMessages(): Messages {
  return getMessages(useLocale())
}
