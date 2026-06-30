/**
 * @misoto22/design — public entry.
 *
 * Components export from here; the look ships separately as CSS:
 *   import '@misoto22/design/styles.css'  // compiled tokens + utilities
 * or, for a Tailwind app that already pulls Tailwind itself:
 *   import '@misoto22/design/tokens.css'  // portable token layer only
 */

// ─── Tokens ───
export { BRAND } from './tokens/brand'
export type { BrandColor } from './tokens/brand'

// ─── Display / foundation ───
export * from './components/Button/Button'
export * from './components/Badge/Badge'
export * from './components/Tag/Tag'
export * from './components/StatusDot/StatusDot'
export * from './components/StatusPill/StatusPill'
export * from './components/FloatingIconButton/FloatingIconButton'
export * from './components/ErrorState/ErrorState'
export * from './components/EmptyState/EmptyState'
export * from './components/Spinner/Spinner'

// ─── Form ───
export * from './components/Input/Input'
export * from './components/Textarea/Textarea'
export * from './components/Select/Select'
export * from './components/Field/Field'
export * from './components/Checkbox/Checkbox'
export * from './components/Switch/Switch'

// ─── Overlays ───
export * from './components/Dialog/Dialog'
export * from './components/DropdownMenu/DropdownMenu'
export * from './components/Tabs/Tabs'
export * from './components/Toast/Toast'

// ─── Surfaces / layout ───
export * from './components/Card/Card'
export * from './components/NavItem/NavItem'
export * from './components/AppShell/AppShell'
