/**
 * Brand colour mirrors for surfaces that cannot read CSS custom properties —
 * OpenGraph/Satori cards, build-time scripts, `theme-color` in a web manifest,
 * a canvas.
 *
 * The RUNTIME theme lives in `styles/tokens.css` (`:root` + `[data-mode="dark"]`)
 * and that is the single place to recolour the system. These literals mirror
 * specific tokens; `brand.test.ts` parses the CSS and fails if the two drift,
 * so this file cannot quietly fall behind the thing it mirrors.
 */
export const BRAND = {
  /** = light --paper. The page ground. */
  paper: '#ffffff',
  /** = dark --paper. The dark viewport's `theme-color`. */
  paperDark: '#0d0d0d',
  /** = light --paper-2. One step off the ground. */
  paperElevated: '#f7f7f5',
  /** = light --ink. The mark. */
  ink: '#101010',
  /** = dark --ink. */
  inkDark: '#f4f4f2',
  /** = light --ink-2. Body copy that is not the mark. */
  body: '#4a4a4a',
  /** = light --ink-3-aa. The lightest text step that still clears AA on paper. */
  muted: '#5c5c5c',
  /** = light --stone. The fill under a skeleton, a bar, a quiet plate. */
  stone: '#f2f1ee',
  /** = light --rule. Hairline. */
  rule: '#edebe6',
  /** = light --rule-2. Edge. */
  ruleStrong: '#dbdbd6',
  /** = --feature-surface. The one reversed plate. */
  feature: '#262626',
  /** = --on-dark. Type over a photograph — a dark ground in BOTH themes. */
  onDark: '#fbfbfa',
  /** Byline weight over a photograph. */
  onDarkMuted: 'rgba(251,251,250,0.82)',
  /** = --photo-scrim, as an "r, g, b" tuple for a gradient. */
  scrimRgb: '16, 16, 16',
  /** = light --ok / --warn / --danger. The only chroma in the system. */
  success: '#3d6b34',
  warning: '#8a5a00',
  danger: '#a83214',
} as const

export type BrandColor = keyof typeof BRAND
