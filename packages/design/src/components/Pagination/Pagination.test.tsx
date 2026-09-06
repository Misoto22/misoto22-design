import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Pagination, paginationRange } from './Pagination'

describe('paginationRange', () => {
  it('lists every page when they all fit', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('elides both sides in the middle of a long list', () => {
    expect(paginationRange(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20])
  })

  it('prints a single skipped page instead of eliding it', () => {
    // "1 … 3" is longer than "1 2 3" and says less.
    expect(paginationRange(4, 9)).toEqual([1, 2, 3, 4, 5, '…', 9])
  })

  it('keeps the window inside the range at the first page', () => {
    expect(paginationRange(1, 20)).toEqual([1, 2, '…', 20])
  })

  it('keeps the window inside the range at the last page', () => {
    expect(paginationRange(20, 20)).toEqual([1, '…', 19, 20])
  })

  it('widens the window with siblings', () => {
    expect(paginationRange(10, 20, 2)).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 20])
  })

  it('never repeats a page number', () => {
    for (let pageCount = 1; pageCount <= 12; pageCount += 1) {
      for (let page = 1; page <= pageCount; page += 1) {
        const numbers = paginationRange(page, pageCount).filter((n) => typeof n === 'number')
        expect(new Set(numbers).size).toBe(numbers.length)
      }
    }
  })
})

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('marks the current page and disables the step it cannot take', () => {
    render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
  })
})

describe('Pagination in a language other than English', () => {
  it('takes the name of each step control', () => {
    render(
      <Pagination
        page={2}
        pageCount={5}
        onPageChange={() => {}}
        previousLabel="Page précédente"
        nextLabel="Page suivante"
      />,
    )

    // Both controls are an icon and nothing else, so these strings are their
    // entire accessible name.
    expect(screen.getByRole('button', { name: 'Page précédente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page suivante' })).toBeInTheDocument()
  })

  it('takes the name of a numbered page, which is a phrase and not a word', () => {
    render(
      <Pagination
        page={2}
        pageCount={5}
        onPageChange={() => {}}
        pageLabel={(page) => `第 ${page} 页`}
      />,
    )

    // A function rather than a template string: the number does not sit in the
    // same place in every language, and neither does the noun.
    expect(screen.getByRole('button', { name: '第 2 页' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: '第 5 页' })).toBeInTheDocument()
  })

  it('still says the English words when nothing else is offered', () => {
    render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />)

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument()
  })
})
