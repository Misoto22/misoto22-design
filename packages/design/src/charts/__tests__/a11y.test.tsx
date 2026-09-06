import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import axe from 'axe-core'
import { CHART_SURFACE } from './surface'

/**
 * Runs axe over every chart.
 *
 * The limit is worth stating rather than assuming: jsdom has no layout, so the
 * plot renders at the container's `initialDimension` and nothing here can check
 * a mark's geometry, an overlapping label, or `color-contrast`. What it DOES
 * check is the half that matters most for a chart — that the figure is named,
 * that the hidden table is a real table with headers, and that a clickable
 * legend entry is a control rather than a `<div>` with a handler.
 */
const PAGE_LEVEL_RULES = ['region', 'page-has-heading-one', 'landmark-one-main']

describe.each(CHART_SURFACE)('$dir', (entry) => {
  it('has no axe violations', async () => {
    const { container } = render(entry.render())

    const results = await axe.run(container, {
      resultTypes: ['violations'],
      rules: Object.fromEntries(PAGE_LEVEL_RULES.map((rule) => [rule, { enabled: false }])),
    })

    const described = results.violations
      .map((violation) => `${violation.id}: ${violation.help}`)
      .join('\n')
    expect(results.violations, described).toEqual([])
  })
})
