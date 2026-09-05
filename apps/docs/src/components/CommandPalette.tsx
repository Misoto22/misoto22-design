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
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} label="Command palette">
      <CommandInput placeholder="Jump to a component, a page, or change the theme…" />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>

        <CommandGroup heading="Go to">
          <CommandItem value="overview" onSelect={() => go('/')}>
            Overview
          </CommandItem>
          <CommandItem value="principles" onSelect={() => go('/principles/')}>
            Principles
          </CommandItem>
          <CommandItem value="components index" onSelect={() => go('/components/')}>
            All components
          </CommandItem>
          <CommandItem value="templates" onSelect={() => go('/templates/')}>
            Templates
          </CommandItem>
          <CommandItem value="changelog" onSelect={() => go('/changelog/')}>
            Changelog
          </CommandItem>
          {FOUNDATIONS.map((page) => (
            <CommandItem
              key={page.slug}
              value={`foundations ${page.title}`}
              onSelect={() => go(`/foundations/${page.slug}/`)}
            >
              {page.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {groupedComponents().map((section) => (
          <CommandGroup key={section.group} heading={section.group}>
            {section.entries.map((entry) => (
              <CommandItem
                key={entry.slug}
                // The summary is in the searchable text but not on the row: a
                // palette that prints a sentence per option stops being
                // scannable at about six of them.
                value={entry.name}
                keywords={[entry.summary, entry.group, entry.dir]}
                onSelect={() => go(`/components/${entry.slug}/`)}
              >
                {entry.name}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        <CommandGroup heading="Appearance">
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
            Toggle light / dark
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
              Accent: {option.name}
              {accent === option.id && (
                <span className="ms-auto mono-meta text-(--ink-3-aa)">current</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export const COMPONENT_COUNT = COMPONENTS.length
