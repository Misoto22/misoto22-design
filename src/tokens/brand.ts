/**
 * Brand color SSOT for surfaces that cannot read CSS custom properties
 * (OpenGraph/Satori cards, build-time scripts, web manifest / theme-color).
 *
 * Mirrored from misoto22-site/src/lib/brand-colors.ts. The RUNTIME theme lives
 * in styles/tokens.css (:root + .dark) — that is the single place to recolor.
 * These hex values mirror specific tokens; keep them in sync (the site repo has
 * a drift test that recomputes the oklch tokens to hex).
 */
export const BRAND = {
  /** = light --background (warm cream) */
  background: '#F7F3EE',
  /** = dark --background (warm charcoal) — dark viewport theme-color */
  backgroundDark: '#1C1A17',
  /** = light --foreground (ink) */
  ink: '#2C2825',
  /** = light --accent */
  accent: '#634E36',
  /** = light --foreground-muted */
  body: '#4A4540',
  /** = light --secondary-text */
  muted: '#555049',
  /** Brighter accent for eyebrow text over dark photo scrims (hand-picked, not a 1:1 mirror). */
  accentOnDark: '#E4C49C',
  /** pure white title text over photo scrims (= --on-dark) */
  onDark: '#ffffff',
  /** byline text over photo scrims */
  onDarkMuted: 'rgba(255,255,255,0.82)',
  /** photo-scrim gradient base (= --photo-scrim #0f0c0a) as an "r, g, b" tuple */
  scrimRgb: '15, 12, 10',
} as const

export type BrandColor = keyof typeof BRAND
