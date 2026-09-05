'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * The axes a theme is made of, beyond the accent.
 *
 * Each is an attribute on `<html>` that re-points tokens the package already
 * defines, and each has an unset default — write nothing and you get the White
 * Reset. They are independent on purpose: a preset is a combination, so a
 * reader can reach "warm ground with sharp corners" without anyone having
 * shipped it as a preset.
 */
export const AXES = {
  surface: ['paper', 'warm', 'cool'],
  radius: ['sharp', 'soft', 'round'],
  rules: ['quiet', 'hairline', 'firm'],
  type: ['editorial', 'grotesk', 'bookish'],
  motion: ['still', 'calm', 'snappy'],
  density: ['comfortable', 'compact'],
} as const

export type Axis = keyof typeof AXES
export type AxisValue<A extends Axis> = (typeof AXES)[A][number]

/** What each axis reads when nothing is chosen — the attribute is absent. */
export const DEFAULTS: Record<Axis, string> = {
  surface: 'paper',
  radius: 'soft',
  rules: 'hairline',
  type: 'editorial',
  motion: 'calm',
  density: 'comfortable',
}

export type ThemeState = Record<Axis, string> & { accent: string }

export interface ThemePreset {
  id: string
  name: string
  note: string
  values: Partial<ThemeState>
}

/**
 * Presets, each a whole look rather than a colour.
 *
 * They exist to make the point the accent picker could not: the system is not
 * one design with five tints. Every one of these is the same components and
 * the same tokens, and none of them required a component to change.
 */
/** The system as it ships — also what "Reset" restores. */
export const RESET_PRESET: ThemePreset = {
  id: 'reset',
  name: 'White Reset',
  note: 'The system as it ships. Paper ground, hairline rules, serif headings, and the accent is ink.',
  values: { ...DEFAULTS, accent: 'ink' },
}

export const PRESETS: ThemePreset[] = [
  RESET_PRESET,
  {
    id: 'broadsheet',
    name: 'Broadsheet',
    note: 'Warm stock, square corners, firm rules. A newspaper reads as a grid of boxes, not a stack of cards.',
    values: { surface: 'warm', radius: 'sharp', rules: 'firm', type: 'editorial', motion: 'calm', density: 'comfortable', accent: 'clay' },
  },
  {
    id: 'console',
    name: 'Console',
    note: 'Cool ground, tight rows, quick motion, one interface face. Everything a dense operational screen wants.',
    values: { surface: 'cool', radius: 'sharp', rules: 'firm', type: 'grotesk', motion: 'snappy', density: 'compact', accent: 'cobalt' },
  },
  {
    id: 'salon',
    name: 'Salon',
    note: 'Round corners, quiet rules, the serif carried into the body. A reading surface rather than a working one.',
    values: { surface: 'warm', radius: 'round', rules: 'quiet', type: 'bookish', motion: 'calm', density: 'comfortable', accent: 'plum' },
  },
  {
    id: 'clinic',
    name: 'Clinic',
    note: 'Paper ground and one grotesk, with nothing warm in it. Softened corners keep it from reading as a form.',
    values: { surface: 'paper', radius: 'round', rules: 'hairline', type: 'grotesk', motion: 'snappy', density: 'comfortable', accent: 'forest' },
  },
]

const STORAGE_KEY = 'm22-theme'
const ACCENT_KEY = 'm22-accent'

interface ThemeContextValue {
  theme: ThemeState
  /** Change one axis. `accent` is an axis here too, though it lives elsewhere. */
  set: (axis: Axis | 'accent', value: string) => void
  /** Apply a whole preset at once. */
  apply: (preset: ThemePreset) => void
  /** Which preset the current state matches, if any. */
  matching: ThemePreset | undefined
}

const INITIAL: ThemeState = { ...DEFAULTS, accent: 'ink' } as ThemeState

const ThemeContext = createContext<ThemeContextValue>({
  theme: INITIAL,
  set: () => {},
  apply: () => {},
  matching: RESET_PRESET,
})

export const useTheme = () => useContext(ThemeContext)

/** Reads the axes back off the document, which the pre-paint script has set. */
function readDocument(): ThemeState {
  const data = document.documentElement.dataset
  const next = { ...INITIAL }
  for (const axis of Object.keys(AXES) as Axis[]) {
    next[axis] = data[axis] ?? DEFAULTS[axis]
  }
  next.accent = data.accent ?? 'ink'
  return next
}

/** Writes one axis onto `<html>`, removing the attribute when it is the default. */
function writeAxis(axis: string, value: string, fallback: string) {
  const root = document.documentElement
  if (value === fallback) delete root.dataset[axis]
  else root.dataset[axis] = value
}

/**
 * Holds the whole theme and mirrors it onto `<html>`.
 *
 * Attributes rather than inline styles, for the reason the mode is one: they
 * can be written by a script before first paint, and every rule that depends
 * on them lives in one stylesheet instead of being rebuilt per element.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(INITIAL)

  useEffect(() => setTheme(readDocument()), [])

  const persist = useCallback((next: ThemeState) => {
    try {
      const { accent, ...axes } = next
      localStorage.setItem(STORAGE_KEY, JSON.stringify(axes))
      localStorage.setItem(ACCENT_KEY, accent)
    } catch {
      // A storage-blocked context still switches; it just does not remember.
    }
  }, [])

  const set = useCallback(
    (axis: Axis | 'accent', value: string) => {
      setTheme((previous) => {
        const next = { ...previous, [axis]: value }
        if (axis === 'accent') document.documentElement.dataset.accent = value
        else writeAxis(axis, value, DEFAULTS[axis])
        persist(next)
        return next
      })
    },
    [persist],
  )

  const apply = useCallback(
    (preset: ThemePreset) => {
      setTheme((previous) => {
        const next = { ...previous, ...preset.values } as ThemeState
        for (const axis of Object.keys(AXES) as Axis[]) writeAxis(axis, next[axis], DEFAULTS[axis])
        document.documentElement.dataset.accent = next.accent
        persist(next)
        return next
      })
    },
    [persist],
  )

  const matching = PRESETS.find((preset) =>
    Object.entries(preset.values).every(([key, value]) => theme[key as keyof ThemeState] === value),
  )

  return <ThemeContext value={{ theme, set, apply, matching }}>{children}</ThemeContext>
}

/** Kept so the accent-only consumers read the same state. */
export const useAccent = () => {
  const { theme, set } = useTheme()
  return { accent: theme.accent, setAccent: (id: string) => set('accent', id) }
}
