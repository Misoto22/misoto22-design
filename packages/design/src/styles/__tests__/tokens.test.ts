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

/**
 * The band across the top of an application, and the one number that says how
 * tall it is.
 *
 * It was five literals in two packages before, and they disagreed: `AppShell`
 * said `h-14` and the documentation site said `h-16`, so the same role was
 * 56px in the component this system ships and 64px on the site documenting it.
 * `SidebarHeader` held a sixth as a floor, which is what accidentally kept the
 * rail's head level with the masthead — and what stopped it staying level once
 * either moved. `--scroll-offset` was a seventh: "a masthead plus a line of
 * air", written as `88px`, derived by hand from whichever of the two answers
 * its author had on screen.
 */
describe('the bar height', () => {
  const value = declarations(TOKENS).find(([name]) => name === 'bar-h')?.[1]

  it('is declared once, in the token layer', () => {
    expect(value, 'tokens.css must declare --bar-h').toBeDefined()
  })

  /**
   * A bar is a row of controls and the air around them. Typed as a length it is
   * a bar that can be set shorter than the controls it seats.
   */
  it('derives from the control height rather than naming a length', () => {
    expect(value).toContain('var(--control-h-sm)')
  })

  /**
   * `sm` is the size this system documents as a deliberate below-the-floor
   * density for a mouse, and a finger is not a mouse: a coarse pointer grows
   * these controls to the 44px target WCAG 2.5.5 asks for, so the bar has to
   * grow with them. Sizing it from `--control-h-md` on BOTH is what made it
   * too tall — 56px of bar around 39px of search field, holding room for a
   * target that is not on screen when a mouse is.
   */
  it('grows for a finger rather than reserving the room always', () => {
    const coarse = /@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}\n/.exec(
      TOKENS.replace(/\/\*[\s\S]*?\*\//g, ''),
    )?.[1]
    expect(coarse, 'tokens.css must raise --bar-h on a coarse pointer').toBeDefined()
    expect(coarse).toContain('--bar-h: calc(var(--control-h-md)')
    // On the root, or the substitution argument above stops holding.
    expect(coarse).toContain(':root')
  })

  /**
   * Declared on the ROOT, and that is load-bearing rather than incidental: a
   * `var()` inside a custom property is substituted where the property is
   * DECLARED. So `--control-h-md` resolves once, at the root, and every
   * descendant inherits the same answer — including a rail that pins its own
   * `data-density`, which is how the rail's head stays level with a masthead
   * that is following the page.
   */
  it('is not re-declared per density, or a compact rail leaves the corner', () => {
    const perDensity = /\[data-density=['"]compact['"]\][^{]*\{([\s\S]*?)\n\}/.exec(
      TOKENS.replace(/\/\*[\s\S]*?\*\//g, ''),
    )?.[1]
    expect(perDensity, 'tokens.css must have a compact block').toBeDefined()
    expect(perDensity).not.toContain('--bar-h')
  })

  it('is what an anchored heading measures its offset from', () => {
    const offset = declarations(SEMANTIC).find(([name]) => name === 'scroll-offset')?.[1]
    expect(offset).toContain('var(--bar-h)')
  })

  /** Nothing re-types it. A second answer is how the first one drifts. */
  it('is the only place a bar names a height', () => {
    const guilty = componentSources()
      .filter(([, text]) => /\b(min-)?h-1[46]\b/.test(text))
      .map(([file]) => file)

    expect(guilty).toEqual([])
  })
})

/**
 * A control's height token is a floor, and a floor only binds while the box is
 * under it. The box is the line plus the padding plus the border — and the
 * line was inheriting the body's 1.6 reading leading, which no control asked
 * for. So `sm` measured 39px against its own 36px token, `md` 46 against 44,
 * `lg` 50 against 48: every text button in the system was two to three pixels
 * taller than the number documenting it, and the documentation said 36 and 44.
 *
 * `--control-lh` is the missing term. This is the arithmetic that keeps it
 * sufficient, at every size and on both densities — the check nobody could run
 * while the leading was somebody else's.
 */
describe('a control fits inside its own height', () => {
  const BORDER = 2 // 1px each side, from Button's base ring
  const px = (value: string, base = 16) =>
    value.endsWith('rem') ? parseFloat(value) * base : parseFloat(value)

  const BUTTON = readFileSync(join(COMPONENTS, 'Button', 'Button.tsx'), 'utf8')
  /** Tailwind's own `text-sm`, which the md size uses rather than a literal. */
  const FONT: Record<string, number> = { sm: 13, md: 14, lg: 15 }

  const leading = declarations(TOKENS).find(([name]) => name === 'control-lh')?.[1]

  it('gives a control its own leading rather than the page\'s', () => {
    expect(leading, 'tokens.css must declare --control-lh').toBeDefined()
    expect(Number(leading)).toBeGreaterThan(0)
    expect(Number(leading), 'a control label is one line, not a paragraph').toBeLessThan(1.5)
  })

  it('reaches every button size', () => {
    for (const size of ['sm', 'md', 'lg']) {
      const line = new RegExp(`^\\s*${size}: '([^']+)'`, 'm').exec(BUTTON)?.[1]
      expect(line, `Button's ${size} size`).toBeDefined()
      expect(line, `${size} must set the control leading`).toContain('leading-(--control-lh)')
    }
  })

  it('is not undone by a keycap carrying the reading leading', () => {
    // The last term in the masthead's search field, and the one that kept it
    // at 39px after the button itself was fixed.
    const KBD = readFileSync(join(COMPONENTS, 'Kbd', 'Kbd.tsx'), 'utf8')
    expect(KBD).toContain('leading-(--control-lh)')
    expect(KBD, 'a literal leading is the bug this had').not.toMatch(/leading-\[[\d.]+\]/)
  })

  it.each(['sm', 'md', 'lg'])('leaves %s room to bind at both densities', (size) => {
    const compact = /\[data-density='compact'\]\s*\{([\s\S]*?)\n\}/.exec(
      TOKENS.replace(/\/\*[\s\S]*?\*\//g, ''),
    )![1]!
    const root = declarations(TOKENS)
    const at = (name: string, css?: string) =>
      css
        ? new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim() ??
          root.find(([n]) => n === name)![1]
        : root.find(([n]) => n === name)![1]

    for (const [label, css] of [['comfortable', undefined], ['compact', compact]] as const) {
      const height = px(at(`control-h-${size}`, css))
      const pad = px(at(`control-py-${size}`, css)) * 2
      const box = FONT[size]! * Number(leading) + pad + BORDER

      expect(box, `${size} at ${label}: ${box}px of box in a ${height}px control`)
        .toBeLessThanOrEqual(height)
    }
  })
})
