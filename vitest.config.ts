import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Component tests run under jsdom via @testing-library/react. Test files live
 * next to their component (`*.test.tsx`) and are excluded from the tsup build
 * (see tsup.config.ts) and from `tsc` (see tsconfig.json) so they never ship.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
