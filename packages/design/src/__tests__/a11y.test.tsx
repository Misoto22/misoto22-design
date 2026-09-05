import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { SURFACE } from './surface'

/**
 * Runs axe over every component in the surface fixture.
 *
 * What this catches: a missing accessible name, a role that does not match the
 * element, an `aria-*` pointing at nothing, a heading order that jumps, a list
 * with a non-`<li>` child, a control with no label.
 *
 * What it CANNOT catch, and this is the important half: jsdom has no layout and
 * no rendering, so `color-contrast` cannot run here at all. That rule is
 * checked in a real browser against the documentation site — see
 * `apps/docs/e2e/a11y.spec.ts`. A repository that runs axe only in jsdom and
 * calls it "accessibility tested" has verified about half of what the word
 * implies.
 */
/**
 * Rules that only have meaning for a whole PAGE, and none for a component
 * rendered on its own.
 *
 * `region` asks whether every piece of content sits inside a landmark. A
 * component fixture has no landmarks by construction — and Radix portals its
 * overlays to the end of `<body>`, which is outside anything a fixture could
 * provide. Asserting it here would either fail forever or be silenced
 * per-component, and per-component silencing is how a rule quietly dies.
 *
 * So it is evaluated where it means something: on the real pages, in a real
 * browser, by `apps/docs/e2e/a11y.spec.ts`. Same for the other two — a
 * document needs exactly one `<h1>` and one `<main>`, which is a property of a
 * page, not of a card.
 */
const PAGE_LEVEL_RULES = ['region', 'page-has-heading-one', 'landmark-one-main'] as const

async function analyse(container: HTMLElement, disabled: string[] = []) {
  const results = await axe.run(container, {
    resultTypes: ['violations'],
    rules: Object.fromEntries(
      [...PAGE_LEVEL_RULES, ...disabled].map((rule) => [rule, { enabled: false }]),
    ),
  })
  return results.violations
}

function describeViolations(violations: axe.Result[]): string {
  return violations
    .map((violation) => {
      const where = violation.nodes.map((node) => node.html).join('\n      ')
      return `${violation.id} (${violation.impact}): ${violation.help}\n      ${where}`
    })
    .join('\n')
}

describe.each(SURFACE)('$dir', (entry) => {
  it('has no axe violations', async () => {
    const { container, baseElement } = render(entry.render())

    if (entry.opensWith) {
      // A closed dialog or menu has almost no surface to check. Open it, so the
      // pass covers the markup a user actually meets.
      await userEvent.click(
        screen.getByRole('button', { name: new RegExp(entry.opensWith, 'i') }),
      )
    }

    // Radix portals its overlays to <body>, outside `container`. Checking
    // baseElement is what makes the opened state visible to axe at all.
    const target = entry.opensWith ? (baseElement as HTMLElement) : container
    const disabled = (entry.axeExceptions ?? []).map((exception) => exception.rule)
    const violations = await analyse(target, disabled)

    expect(violations, describeViolations(violations)).toEqual([])
  })
})

describe('axe exceptions', () => {
  it('each carries a reason', () => {
    // An exception without a written reason is a suppression, and a suppression
    // nobody explained is how a rule stays off for three years.
    for (const entry of SURFACE) {
      for (const exception of entry.axeExceptions ?? []) {
        expect(exception.because.length, `${entry.dir}/${exception.rule}`).toBeGreaterThan(40)
      }
    }
  })

  it('stays rare', () => {
    // Not a style rule: the moment suppressing is routine, the suite stops
    // being evidence of anything.
    const total = SURFACE.reduce((n, entry) => n + (entry.axeExceptions?.length ?? 0), 0)
    expect(total).toBeLessThanOrEqual(3)
  })
})
