import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Explicit teardown (globals are off, so React Testing Library's auto-cleanup
// isn't registered for us) — unmount between tests to keep the DOM isolated.
afterEach(() => {
  cleanup()
})
