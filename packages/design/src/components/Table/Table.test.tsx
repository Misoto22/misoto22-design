import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Table, TBody, TD, TH, THead, TR } from './Table'

const TABLE = (
  <Table caption="Deploy history">
    <THead>
      <TR>
        <TH>Commit</TH>
      </TR>
    </THead>
    <TBody>
      <TR>
        <TD>
          <span className="sr-only">Succeeded</span>a1b2c3d
        </TD>
      </TR>
    </TBody>
  </Table>
)

/**
 * jsdom has no layout, so nothing here can watch a visually-hidden label
 * escape the table and widen the page. What it CAN prove is the mechanism the
 * escape needs: `sr-only` is `position: absolute`, and an absolute element
 * without a positioned ancestor resolves against the document. The containing
 * block is the fix, and its presence is a fact about the markup.
 *
 * The escape itself is a browser fact and belongs in the documentation site's
 * browser suite — see the note in the report.
 */
describe('Table', () => {
  it('positions its scroll container, so nothing absolute inside it escapes', () => {
    const { container } = render(TABLE)
    const region = container.firstElementChild as HTMLElement
    expect(region.className).toContain('relative')
  })

  it('keeps the scroll container the named, focusable region', () => {
    // The containing block must not cost the region what it already had.
    const { container } = render(TABLE)
    const region = container.firstElementChild as HTMLElement

    expect(region).toHaveAttribute('role', 'region')
    expect(region).toHaveAttribute('aria-label', 'Deploy history')
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region.className).toContain('overflow-x-auto')
  })
})
