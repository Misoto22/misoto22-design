import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { Timestamp } from './Timestamp'

/** A fixed "now", so a relative time is a function of its input and nothing else. */
const NOW = new Date('2026-09-06T12:00:00.000Z')

/** `now` minus a gap, as a Date. */
const ago = (ms: number) => new Date(NOW.getTime() - ms)

const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

/** The rendered `<time>`, or null when the value was unparseable. */
const time = (container: HTMLElement) => container.querySelector('time')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Timestamp', () => {
  it('hydrates the server’s markup without a mismatch', async () => {
    // The failure this exists for: a relative time computed on a build server
    // and re-computed in a browser are two different strings, and React tears
    // the tree apart over it. Every page here is statically exported, so that
    // would be every page with a date on it.
    //
    // Hydrated for real rather than compared as strings — a mismatch is only
    // ever reported by React, and only during hydration.
    const value = ago(3 * HOUR)
    const container = document.createElement('div')
    container.innerHTML = renderToString(<Timestamp value={value} />)
    document.body.appendChild(container)

    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, <Timestamp value={value} />)
    })

    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
    await act(async () => root?.unmount())
    container.remove()
  })

  it('reads the UTC calendar date before it knows the reader’s time zone', () => {
    // Sliced out of the ISO string, not formatted: `Intl` on a build server and
    // `Intl` in a browser are two different time zones and two different
    // locales, which is the mismatch above.
    expect(renderToString(<Timestamp value={ago(3 * HOUR)} />)).toContain('>2026-09-06<')
  })

  it('carries the exact instant in datetime whether or not the effect has run', () => {
    const value = new Date('2026-01-14T09:30:00.000Z')
    // Lower-cased before the match: HTML attribute names are case-insensitive,
    // so React's `dateTime="…"` in the emitted string is the `datetime`
    // attribute a parser reads back — which the DOM assertion below confirms.
    expect(renderToString(<Timestamp value={value} />).toLowerCase()).toContain(
      'datetime="2026-01-14t09:30:00.000z"',
    )

    const { container } = render(<Timestamp value={value} />)
    expect(time(container)).toHaveAttribute('datetime', '2026-01-14T09:30:00.000Z')
  })

  it.each([
    { gap: 59_999, name: 'a tick under a minute', expected: 'now' },
    { gap: MINUTE, name: 'exactly a minute', expected: '1 minute ago' },
    { gap: HOUR - 1, name: 'a tick under an hour', expected: '59 minutes ago' },
    { gap: HOUR, name: 'exactly an hour', expected: '1 hour ago' },
    { gap: DAY - 1, name: 'a tick under a day', expected: '23 hours ago' },
    { gap: DAY, name: 'exactly a day', expected: 'yesterday' },
    { gap: 7 * DAY, name: 'exactly a week', expected: 'last week' },
    { gap: 400 * DAY, name: 'over a year', expected: 'last year' },
  ])('crosses at $name', ({ gap, expected }) => {
    const { container } = render(<Timestamp value={ago(gap)} format="relative" />)
    expect(time(container)).toHaveTextContent(expected)
  })

  it('reads a future instant forwards', () => {
    const { container } = render(
      <Timestamp value={new Date(NOW.getTime() + DAY)} format="relative" />,
    )
    expect(time(container)).toHaveTextContent('tomorrow')
  })

  it('truncates rather than rounds, so ninety seconds is one minute', () => {
    // A reader who has just watched something happen is not helped by being
    // told it was two minutes ago.
    const { container } = render(<Timestamp value={ago(90_000)} format="relative" />)
    expect(time(container)).toHaveTextContent('1 minute ago')
  })

  it('falls back to the calendar date once auto’s window has passed', () => {
    const { container } = render(<Timestamp value={ago(30 * DAY)} />)
    const text = time(container)?.textContent ?? ''
    expect(text).not.toContain('ago')
    expect(text).toContain('2026')
  })

  it('honours an explicit window for auto', () => {
    const { container } = render(<Timestamp value={ago(2 * DAY)} relativeWithin={DAY} />)
    expect(time(container)?.textContent).not.toContain('ago')
  })

  it('adds the clock time to the absolute form only when asked', () => {
    const value = new Date('2026-01-14T09:30:00.000Z')
    const plain = render(<Timestamp value={value} format="absolute" />)
    const withTime = render(<Timestamp value={value} format="absolute" showTime />)

    expect(withTime.container.textContent?.length).toBeGreaterThan(
      plain.container.textContent?.length ?? 0,
    )
  })

  it('renders an em dash for a value nothing can parse, never "Invalid Date"', () => {
    const { container } = render(<Timestamp value="not a date" />)
    expect(container.textContent).toBe('—')
    expect(container.textContent).not.toContain('Invalid')
    // No <time>: an element whose datetime cannot be written is not a time.
    expect(time(container)).toBeNull()
  })

  it('does not throw on the server for an unparseable value either', () => {
    expect(() => renderToString(<Timestamp value={Number.NaN} />)).not.toThrow()
    expect(renderToString(<Timestamp value={Number.NaN} />)).toContain('—')
  })

  it('accepts an ISO string and epoch milliseconds as well as a Date', () => {
    const value = new Date('2026-01-14T09:30:00.000Z')
    for (const input of [value, value.toISOString(), value.getTime()]) {
      const { container, unmount } = render(<Timestamp value={input} format="absolute" />)
      expect(time(container)).toHaveAttribute('datetime', '2026-01-14T09:30:00.000Z')
      unmount()
    }
  })
})
