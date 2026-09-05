import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const read = (file: string) => readFileSync(join(HERE, '..', file), 'utf8')

const TOKENS = read('tokens.css')
const SEMANTIC = read('semantic.css')
const FONTS = read('fonts.css')

const COMPONENTS = join(HERE, '..', '..', 'components')

/** Every component source, as `[file, text]`. */
function componentSources(): [string, string][] {
  return readdirSync(COMPONENTS)
    .filter((entry) => statSync(join(COMPONENTS, entry)).isDirectory())
    .map((dir) => [`${dir}/${dir}.tsx`, join(COMPONENTS, dir, `${dir}.tsx`)] as const)
    .filter(([, path]) => {
      try {
        return statSync(path).isFile()
      } catch {
        return false
      }
    })
    .map(([file, path]) => [file, readFileSync(path, 'utf8')])
}

/** Declarations as `[name, value]`, comments stripped. */
function declarations(css: string): [string, string][] {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/--([\w-]+):\s*([^;]+);/g)].map(
    ([, name, value]) => [name!, value!.trim()],
  )
}

describe('font stacks', () => {
  /**
   * The bug this guards is invisible in the repository that introduced it.
   *
   * `var(--font-hanken)` with no fallback is invalid at computed-value time in
   * any host that does not define that name — and IACVT discards the WHOLE
   * declaration, not the one term. So the entire stack collapsed and every
   * surface fell back to the platform's system font. Inside misoto22-site,
   * where next/font defines those names, it looked perfect.
   */
  it.each(['sans', 'serif', 'mono', 'cjk-sans', 'cjk-serif'])(
    '--%s only reads a bare var() that this file itself declares',
    (token) => {
      const declared = new Set(declarations(TOKENS).map(([name]) => name))
      const value = declarations(TOKENS).find(([name]) => name === token)?.[1]
      expect(value).toBeDefined()
      // A bare `var(--cjk-sans)` is safe: this file declares it, so it always
      // resolves. A bare `var(--font-hanken)` is not: only the HOST might
      // declare it, and when it does not the whole stack is discarded.
      const unsafe = [...value!.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)]
        .map((match) => match[1]!.slice(2))
        .filter((name) => !declared.has(name))
      expect(unsafe).toEqual([])
    },
  )

  it('falls back to a family that fonts.css actually declares', () => {
    // The fallback is only useful if a vendored @font-face answers to it.
    const declared = new Set(
      [...FONTS.matchAll(/font-family:\s*'([^']+)'/g)].map((match) => match[1]),
    )
    for (const token of ['sans', 'serif', 'mono']) {
      const value = declarations(TOKENS).find(([name]) => name === token)![1]
      const fallback = value.match(/var\(--font-[\w-]+,\s*'([^']+)'\)/)?.[1]
      expect(declared).toContain(fallback)
    }
  })

  it('keeps the generic family last, where it can still be reached', () => {
    // A generic in the middle of a stack terminates it: everything after is
    // unreachable. The CJK stacks are spliced INTO the three above, so they
    // must not carry one at all.
    const GENERIC = /(^|,\s*)(serif|sans-serif|monospace|ui-monospace|system-ui)\s*(,|$)/
    for (const token of ['cjk-sans', 'cjk-serif']) {
      const value = declarations(TOKENS).find(([name]) => name === token)![1]
      expect(value, `--${token} must not end in a generic family`).not.toMatch(GENERIC)
    }
  })
})

describe('the semantic layer', () => {
  it('has no dark counterpart, because dark mode is a value swap', () => {
    // A `[data-mode='dark']` block here would freeze one side of the swap —
    // the exact bug the two-layer split exists to prevent.
    expect(SEMANTIC).not.toContain("[data-mode='dark']")
  })

  it('names only tokens the primitive layer declares', () => {
    const primitives = new Set(declarations(TOKENS).map(([name]) => name))
    const aliases = new Set(declarations(SEMANTIC).map(([name]) => name))
    const dangling = declarations(SEMANTIC)
      .flatMap(([, value]) => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]!.slice(2)))
      .filter((name) => !primitives.has(name) && !aliases.has(name))
    expect([...new Set(dangling)]).toEqual([])
  })
})

describe('lengths inside calc()', () => {
  /**
   * A unitless zero is not a length, and `calc()` will not take one.
   *
   * This is the same IACVT trap the font stacks above guard, reached from the
   * other side. `--table-pad-x` was `0`, which is a perfectly good value for
   * `padding-inline: var(--table-pad-x)` — and makes `calc(0 + 1.5rem)` invalid
   * at computed-value time the moment a second rule adds to it. The declaration
   * is discarded whole rather than falling back, so the table lost its column
   * gutter everywhere and nothing said so: no build error, no console warning,
   * and an `align="end"` column simply touching its neighbour.
   *
   * Anything a `calc()` reads must therefore carry a unit, fallbacks included.
   */
  const CALC = /calc\((?:[^()]|\([^()]*\))*\)/g
  const VAR = /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*?)\s*)?\)/g
  const UNITLESS_ZERO = /^[+-]?0+(?:\.0+)?$/

  /** Every `calc()` in the system, with the file that writes it. */
  function calcExpressions(): [string, string][] {
    const sources: [string, string][] = [
      ['tokens.css', TOKENS],
      ['semantic.css', SEMANTIC],
      ...componentSources(),
    ]
    return sources.flatMap(([file, text]) =>
      [...text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(CALC)].map(
        (match) => [file, match[0]] as [string, string],
      ),
    )
  }

  it('reads no token that is declared as a bare zero', () => {
    const declared = new Map(declarations(TOKENS))
    const offenders = calcExpressions().flatMap(([file, expression]) =>
      [...expression.matchAll(VAR)]
        .map((match) => match[1]!.slice(2))
        .filter((name) => UNITLESS_ZERO.test(declared.get(name) ?? ''))
        .map((name) => `${file}: ${expression} reads --${name}: ${declared.get(name)}`),
    )
    expect(offenders).toEqual([])
  })

  it('writes no bare zero as an inline fallback', () => {
    // `var(--x, 0)` is discarded exactly like `var(--x)` pointing at a bare
    // zero — and it is the harder one to spot, because it looks like a default
    // that makes the calc safe.
    const offenders = calcExpressions().flatMap(([file, expression]) =>
      [...expression.matchAll(VAR)]
        .filter((match) => match[2] !== undefined && UNITLESS_ZERO.test(match[2]))
        .map((match) => `${file}: ${expression} falls back to ${match[2]}`),
    )
    expect(offenders).toEqual([])
  })
})
