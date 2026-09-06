import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Explicit teardown (globals are off, so React Testing Library's auto-cleanup
// isn't registered for us) — unmount between tests to keep the DOM isolated.
afterEach(() => {
  cleanup()
})

/**
 * jsdom implements no layout, so it ships none of the APIs that observe layout.
 * Radix's slider measures its thumb, cmdk measures its list, and Recharts'
 * responsive container measures the box it is asked to fill; all three reach
 * for `ResizeObserver` on mount and throw where it is missing.
 *
 * The stub reports one fixed box, once, rather than never firing. That
 * distinction is load-bearing for the chart suite: a container measured at
 * zero renders NOTHING — no axes, no legend, no marks — so a suite running
 * against a silent observer would have been asserting against an empty `<svg>`
 * and passing. A fixed box is not real layout, and nothing here asserts
 * geometry; it is the minimum that makes the markup exist to be checked.
 */
const OBSERVED_BOX = { width: 640, height: 320 }

class ResizeObserverStub implements ResizeObserver {
  #callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback
  }

  observe(target: Element): void {
    const rect = { ...OBSERVED_BOX, top: 0, left: 0, bottom: OBSERVED_BOX.height, right: OBSERVED_BOX.width, x: 0, y: 0 }
    const entry = {
      target,
      contentRect: rect as DOMRectReadOnly,
      borderBoxSize: [{ inlineSize: OBSERVED_BOX.width, blockSize: OBSERVED_BOX.height }],
      contentBoxSize: [{ inlineSize: OBSERVED_BOX.width, blockSize: OBSERVED_BOX.height }],
      devicePixelContentBoxSize: [{ inlineSize: OBSERVED_BOX.width, blockSize: OBSERVED_BOX.height }],
    } as unknown as ResizeObserverEntry
    // Synchronously, because a chart's first paint depends on it and a test
    // should not have to await a frame that jsdom never schedules.
    this.#callback([entry], this)
  }

  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver ??= ResizeObserverStub

/**
 * Guarded, because this setup file also runs for the server-render suite, which
 * declares `@vitest-environment node` and therefore has no `Element` at all.
 * That is the point of that suite — it must fail if a component reaches for the
 * DOM — so the guard has to be here rather than a DOM being provided there.
 *
 * Radix's overlays call each of these before opening, and jsdom has none of
 * them. Their absence throws; their behaviour is irrelevant without layout.
 */
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView ??= function scrollIntoView() {}
  Element.prototype.hasPointerCapture ??= function hasPointerCapture() {
    return false
  }
  Element.prototype.setPointerCapture ??= function setPointerCapture() {}
  Element.prototype.releasePointerCapture ??= function releasePointerCapture() {}
}

/**
 * Recharts measures label widths through a 2D canvas context, and jsdom ships
 * `<canvas>` without one — so every chart render printed a "not implemented"
 * page of noise that buried whatever the suite was actually saying.
 *
 * Stubbed rather than installing `canvas`: the metric only decides where a tick
 * label is placed, and there is no layout in this environment for it to be
 * right about. A zero width is as true as any other number here, and the real
 * measurement is exercised in the browser suite.
 */
if (typeof HTMLCanvasElement !== 'undefined') {
  // Assigned, not `??=`: jsdom DOES define the method — it just throws.
  HTMLCanvasElement.prototype.getContext = function getContext() {
    return { measureText: () => ({ width: 0 }) } as unknown as CanvasRenderingContext2D
  } as HTMLCanvasElement['getContext']
}

/**
 * jsdom has no media engine, so `matchMedia` is simply absent — and a component
 * that asks a question about the viewport throws on mount rather than getting a
 * wrong answer. `Sidebar` asks one: whether there is room for a column or only
 * for a drawer.
 *
 * The stub answers "no" to everything, which puts every query at its false
 * branch — the wide layout, the un-reduced motion — and that is the state the
 * suite is written against. A test that needs the other answer replaces
 * `window.matchMedia` for its own duration; there is no layout here for a real
 * implementation to be right about.
 */
if (typeof window !== 'undefined') {
  window.matchMedia ??= ((query: string) => ({
    media: query,
    matches: false,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}
