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
 * Radix's slider measures its thumb and cmdk measures its list; both reach for
 * `ResizeObserver` on mount and throw where it is missing.
 *
 * A stub that never fires is the right shape here rather than a real
 * implementation: these tests assert semantics — roles, names, keyboard
 * behaviour — and there is no layout to observe in this environment anyway.
 * Anything that genuinely depends on a measured size is checked in the browser
 * suite, where the real thing exists.
 */
class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
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
