'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export interface AccentOption {
  id: string
  name: string
  /** The swatch shown in the picker — the accent as it renders on paper. */
  swatch: string
  note: string
}

/**
 * The accents this site can be re-skinned with.
 *
 * The White Reset itself is monochrome, and law 7 says so plainly: the accent
 * IS ink. That is not being walked back here. What this demonstrates is the
 * thing underneath the law — one pointer, `--clay`, that every component reads
 * through `--accent`. A consumer whose brand is not monochrome changes that one
 * token and the whole system follows, without touching a component.
 *
 * So: `ink` is the system. The rest are the same system wearing somebody
 * else's brand, and each one is picked to clear WCAG AA as text on paper, which
 * is the constraint that actually limits the choice.
 */
export const ACCENTS: AccentOption[] = [
  { id: 'ink', name: 'Ink', swatch: '#101010', note: 'The system as it ships — law 7, one pointer, and the pointer is the mark.' },
  { id: 'clay', name: 'Clay', swatch: '#8a3f24', note: 'The warm editorial red the site carried before the White Reset.' },
  { id: 'forest', name: 'Forest', swatch: '#2f5d42', note: 'A cool neutral green — quiet enough to sit under a lot of type.' },
  { id: 'cobalt', name: 'Cobalt', swatch: '#2b4c9b', note: 'The most conventional software blue that still clears AA on paper.' },
  { id: 'plum', name: 'Plum', swatch: '#6b3a72', note: 'A darker chroma for a brand that wants presence without heat.' },
]

const STORAGE_KEY = 'm22-accent'

interface AccentContextValue {
  accent: string
  setAccent: (id: string) => void
}

const AccentContext = createContext<AccentContextValue>({ accent: 'ink', setAccent: () => {} })

export const useAccent = () => useContext(AccentContext)

/**
 * Holds the chosen accent and mirrors it onto `<html data-accent>`.
 *
 * The attribute rather than inline style, for the same reason the theme is an
 * attribute: it can be written by a script before first paint, and every rule
 * that depends on it lives in one stylesheet rather than being reconstructed
 * per element.
 */
export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setState] = useState('ink')

  useEffect(() => {
    const current = document.documentElement.dataset.accent
    if (current) setState(current)
  }, [])

  const setAccent = useCallback((id: string) => {
    document.documentElement.dataset.accent = id
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // A storage-blocked context still switches; it just does not remember.
    }
    setState(id)
  }, [])

  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>
}
