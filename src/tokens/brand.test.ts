import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse, rgb } from 'culori'
import { BRAND } from './brand'

/**
 * Drift guard: the hex mirrors in brand.ts MUST recompute from their oklch
 * source tokens in styles/tokens.css. Without this, the two SSOTs silently
 * diverge (the site repo has its own copy of this check).
 */
const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')

const DARK_AT = tokensCss.indexOf('.dark')

function tokenValue(name: string, scope: 'light' | 'dark'): string {
  const body = scope === 'dark' ? tokensCss.slice(DARK_AT) : tokensCss.slice(0, DARK_AT)
  const match = new RegExp(`${name}:\\s*([^;]+);`).exec(body)
  if (!match) throw new Error(`token ${name} not found in ${scope} theme`)
  return match[1].trim()
}

function toRgb255(css: string): number[] {
  const c = rgb(parse(css))
  if (!c) throw new Error(`cannot parse color: ${css}`)
  return [c.r, c.g, c.b].map((v) => Math.round(v * 255))
}

// brand key → [css token, theme]
const MIRRORS: Array<[keyof typeof BRAND, string, 'light' | 'dark']> = [
  ['background', '--background', 'light'],
  ['backgroundDark', '--background', 'dark'],
  ['ink', '--foreground', 'light'],
  ['accent', '--accent', 'light'],
  ['body', '--foreground-muted', 'light'],
  ['muted', '--secondary-text', 'light'],
]

describe('brand.ts ↔ tokens.css drift guard', () => {
  it.each(MIRRORS)('BRAND.%s recomputes from its oklch token (±1/255)', (key, token, scope) => {
    const fromToken = toRgb255(tokenValue(token, scope))
    const fromBrand = toRgb255(BRAND[key])
    fromToken.forEach((channel, i) => {
      expect(Math.abs(channel - fromBrand[i])).toBeLessThanOrEqual(1)
    })
  })
})
