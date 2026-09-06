import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

/**
 * One flat config for the whole workspace. Each package runs `eslint src` from
 * its own directory; ESLint resolves this file by walking up, and the `files`
 * globs below are matched against paths relative to THIS file — hence
 * `**​/src/**` rather than `src/**`, which would only ever match a package
 * sitting at the repository root.
 *
 * Non type-aware on purpose: fast, and the surface is small enough that
 * syntactic + TS rules catch what matters. `pnpm typecheck` is the type gate.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '**/src/generated/**',
      '.ds-sync',
      'ds-bundle',
      '.design-sync',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Build scripts, the published CLI, and the hand-authored agent catalog it
    // reads: all Node, all plain ESM, none of them part of any bundle.
    files: ['**/scripts/**/*.{mjs,ts}', '**/bin/**/*.mjs', '**/agent/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
)
