'use client'

export interface AccentOption {
  id: string
  name: string
  /** The swatch shown in the picker — the accent as it renders on paper. */
  /** A `var()` reference, not a hex: the swatch has to swap with the theme. */
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
  { id: 'ink', name: 'Ink', swatch: 'var(--swatch-ink)', note: 'The system as it ships — law 7, one pointer, and the pointer is the mark.' },
  { id: 'clay', name: 'Clay', swatch: 'var(--swatch-clay)', note: 'The warm editorial red the site carried before the White Reset.' },
  { id: 'forest', name: 'Forest', swatch: 'var(--swatch-forest)', note: 'A cool neutral green — quiet enough to sit under a lot of type.' },
  { id: 'cobalt', name: 'Cobalt', swatch: 'var(--swatch-cobalt)', note: 'The most conventional software blue that still clears AA on paper.' },
  { id: 'plum', name: 'Plum', swatch: 'var(--swatch-plum)', note: 'A darker chroma for a brand that wants presence without heat.' },
]

/** The accent is one axis of the theme; the state lives with the rest. */
export { useAccent } from './ThemeProvider'
