import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Card } from './Card'

/**
 * jsdom draws no corners, so nothing here can watch an image lay its square
 * corner over the card's round one. What it can prove is that the box clips —
 * which is the whole of the mechanism, the rest being the browser's.
 */
describe('Card', () => {
  it('clips its children to its own corner', () => {
    // The box rounds at --radius-lg and did not clip, so a full-bleed image or
    // a filled first child overhung the radius at all four corners.
    const { container } = render(<Card>Recent deploys</Card>)
    expect((container.firstElementChild as HTMLElement).className).toContain('overflow-hidden')
  })

  it('lets a caller open the box back up', () => {
    // A card that deliberately overhangs — a marker pinned to its edge — is a
    // real call site, and the class merge is what keeps it possible.
    const { container } = render(<Card className="overflow-visible">Recent deploys</Card>)
    const box = (container.firstElementChild as HTMLElement).className

    expect(box).toContain('overflow-visible')
    expect(box).not.toContain('overflow-hidden')
  })
})
