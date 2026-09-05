'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@misoto22/design'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ACCENTS, useAccent } from './AccentProvider'
import { FOUNDATIONS } from '@/content/foundations'
import { COMPONENTS, groupedComponents } from '@/content/registry'
import { componentCopy, foundationCopy, groupName } from '@/i18n/content'
import { localePath } from '@/i18n/locales'
import { useLocale, useMessages } from '@/i18n/useLocale'

/**
 * ⌘K, on every page.
 *
 * The site already has a sidebar filter, and this is not a duplicate of it: the
 * sidebar narrows a list you are looking at, and the palette answers "take me
 * to X" without your hands leaving the keyboard. It also carries the things
 * that are not pages — the theme, the accent — which a nav cannot.
 *
 * The list is the same registry the sidebar reads, so a new component appears
 * in both or in neither.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { accent, setAccent } = useAccent()
  const locale = useLocale()
  const t = useMessages()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return
      // Claimed before the browser sees it: ⌘K is Chrome's search-bar focus,
      // and a palette that only works when the page happens to have focus in
      // the right place is a palette nobody trusts.
      event.preventDefault()
      setOpen((previous) => !previous)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    router.push(localePath(locale, href))
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} label={t.palette.label}>
      <CommandInput placeholder={t.palette.placeholder} />
      <CommandList>
        <CommandEmpty>{t.palette.empty}</CommandEmpty>

        <CommandGroup heading={t.palette.goTo}>
          <CommandItem value="overview" onSelect={() => go('/')}>
            {t.nav.overview}
          </CommandItem>
          <CommandItem value="principles" onSelect={() => go('/principles/')}>
            {t.nav.principles}
          </CommandItem>
          <CommandItem value="components index" onSelect={() => go('/components/')}>
            {t.nav.allComponents}
          </CommandItem>
          <CommandItem value="templates" onSelect={() => go('/templates/')}>
            {t.nav.templates}
          </CommandItem>
          <CommandItem value="changelog" onSelect={() => go('/changelog/')}>
            {t.nav.changelog}
          </CommandItem>
          {FOUNDATIONS.map((page) => (
            <CommandItem
              key={page.slug}
              value={`foundations ${page.title}`}
              onSelect={() => go(`/foundations/${page.slug}/`)}
            >
              {foundationCopy(locale, page.slug).title ?? page.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {groupedComponents().map((section) => (
          <CommandGroup key={section.group} heading={groupName(locale, section.group)}>
            {section.entries.map((entry) => (
              <CommandItem
                key={entry.slug}
                // The summary is in the searchable text but not on the row: a
                // palette that prints a sentence per option stops being
                // scannable at about six of them.
                value={entry.name}
                keywords={[
                  entry.summary,
                  componentCopy(locale, entry.slug).summary ?? '',
                  entry.group,
                  groupName(locale, entry.group),
                  entry.dir,
                ]}
                onSelect={() => go(`/components/${entry.slug}/`)}
              >
                {entry.name}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        <CommandGroup heading={t.palette.appearance}>
          <CommandItem
            value="toggle theme light dark"
            onSelect={() => {
              const next = document.documentElement.dataset.mode === 'dark' ? 'light' : 'dark'
              document.documentElement.dataset.mode = next
              try {
                localStorage.setItem('m22-mode', next)
              } catch {
                // A private window still toggles; it just does not remember.
              }
              setOpen(false)
            }}
          >
            {t.palette.toggleTheme}
          </CommandItem>
          {ACCENTS.map((option) => (
            <CommandItem
              key={option.id}
              value={`accent ${option.name}`}
              onSelect={() => {
                setAccent(option.id)
                setOpen(false)
              }}
            >
              {t.appearance.accentTitle}: {option.name}
              {accent === option.id && (
                <span className="ms-auto mono-meta text-(--ink-3-aa)">{t.appearance.current}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export const COMPONENT_COUNT = COMPONENTS.length
