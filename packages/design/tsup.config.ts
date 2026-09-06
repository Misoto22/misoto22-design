import { defineConfig } from 'tsup'
import { fixImportsPlugin } from 'esbuild-fix-imports-plugin'

/**
 * `NODE_OPTIONS=--max-old-space-size=…` in the build script is not optional: the
 * declaration pass bundles every entry through rollup, `pnpm-workspace.yaml`
 * pins rollup to its WASM build (the native binding crashes the DTS worker on
 * GitHub's runners), and WASM rollup over 36 entries exhausts the worker's
 * default heap. It OOMs in CI and survives locally, which is the worst shape a
 * build failure can take.
 *
 * `bundle: false` compiles each source file 1:1 (transpile, not bundle), so the
 * output mirrors the module graph and esbuild keeps each file's `'use client'`
 * banner verbatim — a Next.js App Router app then gets correct server/client
 * boundaries (Button/Card stay server-renderable; Dialog/Switch/etc. carry the
 * client directive). Dependencies stay external imports; fixImportsPlugin adds
 * the `.js` extensions that ESM resolution needs on relative imports.
 */
export default defineConfig({
  entry: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/**/__tests__/**'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  bundle: false,
  target: 'es2022',
  esbuildPlugins: [fixImportsPlugin()],
})
