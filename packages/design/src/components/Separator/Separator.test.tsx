import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Separator } from './Separator'

describe('Separator', () => {
  it('is not announced by default', () => {
    const { container } = render(<Separator />)
    expect(container.firstElementChild).toHaveAttribute('role', 'none')
  })

  it('becomes a real separator when it is dividing sections', () => {
    render(<Separator decorative={false} />)
    const rule = screen.getByRole('separator')
    expect(rule).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('draws the label between two rules rather than over one', () => {
    // The overlay version has to punch a hole in the rule with a background
    // colour, which means knowing the ground it is sitting on — and getting it
    // wrong puts a --paper notch on a --stone card. Two rules and a gap need to
    // know nothing.
    const { container } = render(<Separator label="or continue with" />)

    expect(screen.getByText('or continue with')).toBeInTheDocument()
    const rules = container.querySelectorAll('[aria-hidden="true"]')
    expect(rules).toHaveLength(2)
    for (const rule of rules) {
      expect(rule.className).not.toContain('bg-(--paper)')
      expect(rule.className).toContain('flex-1')
    }
  })

  it('leaves the label as the only thing announced', () => {
    const { container } = render(<Separator label="Older" />)
    // No role="none" wrapper swallowing it and no role="separator" competing
    // with it: the words are the content, the rules are decoration.
    expect(container.firstElementChild).not.toHaveAttribute('role')
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('carries the chosen weight into both halves of a labelled rule', () => {
    const { container } = render(<Separator label="Older" weight="edge" />)
    for (const rule of container.querySelectorAll('[aria-hidden="true"]')) {
      expect(rule.className).toContain('bg-(--rule-2)')
    }
  })

  it('ignores a label on a vertical rule and stays a plain rule', () => {
    // There is no sensible place for words inside a one-pixel column, and
    // silently rendering a horizontal bar instead would be worse.
    const { container } = render(<Separator orientation="vertical" label="Older" />)
    const rule = container.firstElementChild

    expect(rule).toHaveAttribute('role', 'none')
    expect(rule?.className).toContain('w-px')
    expect(screen.queryByText('Older')).not.toBeInTheDocument()
  })
})
