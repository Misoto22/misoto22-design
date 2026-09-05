'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@misoto22/design'
import { Palette } from 'lucide-react'
<<<<<<< HEAD
import { useMessages } from '@/i18n/useLocale'
=======
>>>>>>> origin/main
import { ACCENTS, useAccent } from './AccentProvider'

/**
 * The accent picker.
 *
 * It says what it is doing in the menu itself, because a colour switcher on a
 * site whose seventh principle is "the accent is ink" would otherwise read as
 * the system contradicting itself. It is not a set of themes — it is one token
 * being changed, to show what the token layer is for.
 */
export function AccentMenu() {
  const { accent, setAccent } = useAccent()
<<<<<<< HEAD
  const t = useMessages()
=======
>>>>>>> origin/main

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
<<<<<<< HEAD
        <Button iconOnly size="sm" variant="ghost" aria-label={t.appearance.accent}>
=======
        <Button iconOnly size="sm" variant="ghost" aria-label="Change the accent">
>>>>>>> origin/main
          <Palette size={16} strokeWidth={1.5} aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
<<<<<<< HEAD
        <DropdownMenuLabel>{t.appearance.accentTitle}</DropdownMenuLabel>
        <p className="m-0 px-2.5 pb-2 text-[12px] leading-relaxed text-(--ink-3-aa)">
          {t.appearance.accentNote}
=======
        <DropdownMenuLabel>Accent</DropdownMenuLabel>
        <p className="m-0 px-2.5 pb-2 text-[12px] leading-relaxed text-(--ink-3-aa)">
          One token, <code className="font-mono text-[11px]">--clay</code>. Every surface that
          marks a choice — a primary button, a checked box, the active tab, the current page —
          reads it through <code className="font-mono text-[11px]">--accent</code>. The system
          ships monochrome; these show what re-pointing it does.
>>>>>>> origin/main
        </p>
        {ACCENTS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onSelect={() => setAccent(option.id)}
            className="items-start gap-3"
          >
            <span
              aria-hidden
              className="mt-1 size-3 shrink-0 rounded-full border border-(--rule-2)"
              style={{ background: option.swatch }}
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                {option.name}
                {accent === option.id && (
<<<<<<< HEAD
                  <span className="mono-meta text-(--ink-3-aa)">{t.appearance.current}</span>
=======
                  <span className="mono-meta text-(--ink-3-aa)">current</span>
>>>>>>> origin/main
                )}
              </span>
              <span className="text-[12px] leading-snug text-(--ink-3-aa)">{option.note}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
