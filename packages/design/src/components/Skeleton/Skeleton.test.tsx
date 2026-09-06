import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton, SkeletonBlock, SkeletonCircle, SkeletonLine } from './Skeleton'

const only = (container: HTMLElement) => container.firstElementChild as HTMLElement

describe('Skeleton', () => {
  it('has a height of its own, so a bare one is something rather than nothing', () => {
    const { container } = render(<Skeleton />)

    // A div is full width by default and gets its colour from --stone, so the
    // one dimension that was missing was the only one that mattered: with no
    // height this rendered a zero-height box and showed nothing at all.
    expect(only(container).className).toContain('h-3')
  })

  it('gives that height up to the caller', () => {
    const { container } = render(<Skeleton className="h-20" />)

    expect(only(container).className).toContain('h-20')
    expect(only(container).className).not.toContain('h-3')
  })

  it('does not push its default onto a circle, which sizes both axes', () => {
    const { container } = render(<SkeletonCircle />)

    expect(only(container).className).toContain('size-9')
    expect(only(container).className).not.toContain('h-3')
  })

  it('leaves a sized block alone', () => {
    const { container } = render(<SkeletonBlock className="h-40" />)

    expect(only(container).className).toContain('h-40')
    expect(only(container).className).not.toContain('h-3')
  })

  it('still draws a line at the height of a line', () => {
    const { container } = render(<SkeletonLine className="w-40" />)

    expect(only(container).className).toContain('h-3')
  })
})
