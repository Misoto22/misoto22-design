import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * What jsdom does not have, for the suites that render real components.
 *
 * The same shims `packages/design/vitest.setup.ts` installs, and duplicated for
 * the same reason the direction sweep is: the dependency only runs one way, so
 * this app cannot import a setup file out of the package it documents. It is
 * not registered as a vitest `setupFiles` entry either — only two suites here
 * mount anything, and the rest read JSON.
 *
 * jsdom implements no layout, so it ships none of the APIs that observe layout.
 * Radix's overlays call each of these before opening and throw where they are
 * missing; their behaviour is irrelevant with nothing to measure, so a stub
 * that never fires is the right shape. Anything that genuinely depends on a
 * measured size is checked in `e2e/`, where a real browser exists.
 */
class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver ??= ResizeObserverStub

Element.prototype.scrollIntoView ??= function scrollIntoView() {}
Element.prototype.hasPointerCapture ??= function hasPointerCapture() {
  return false
}
Element.prototype.setPointerCapture ??= function setPointerCapture() {}
Element.prototype.releasePointerCapture ??= function releasePointerCapture() {}

// Globals are off, so React Testing Library's own auto-cleanup is not
// registered for us — unmount between tests to keep the DOM isolated.
afterEach(() => {
  cleanup()
})
