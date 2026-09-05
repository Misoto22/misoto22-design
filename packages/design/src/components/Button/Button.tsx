import { Slot } from '@radix-ui/react-slot'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from '../Spinner/Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * The base every variant shares.
 *
 * A pill, and it does not move on hover. An earlier base lifted a pixel and
 * asked for a shadow the White Reset does not have — `--shadow` resolves to
 * `none`, so that hover state was invisible on every button in the system while
 * still costing a transition. Opacity carries the filled hover; the border
 * carries the outlined one.
 *
 * The transition names its properties rather than using `all`, so a layout
 * change (a width that grows when the label becomes "Saving…") is instant
 * instead of sliding.
 */
const BASE =
  'inline-flex items-center justify-center gap-(--control-gap) rounded-(--radius-pill) font-sans transition-[opacity,color,border-color,background-color] duration-(--duration-fast) ease-(--ease-out-expo) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none aria-disabled:opacity-(--disabled-opacity) aria-disabled:pointer-events-none'

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-(--accent) text-(--accent-foreground) border border-(--accent) hover:opacity-85',
  secondary: 'border border-(--rule-2) text-(--ink) bg-transparent hover:border-(--ink)',
  ghost: 'border border-transparent text-(--ink-2) hover:text-(--ink) hover:bg-(--stone)',
  /* The one place chroma is allowed on a control, and only because the action
     is destructive — that is a state, not a brand colour. */
  danger: 'bg-(--danger) text-(--paper) border border-(--danger) hover:opacity-85',
}

/**
 * `min-h` rather than `h`, so a button that wraps to two lines grows instead of
 * clipping.
 *
 * The heights come from the density tokens rather than from a literal, so a
 * subtree marked `data-density="compact"` shrinks its controls without a single
 * call site being told. At the default density `md` is 44px — the pointer
 * target WCAG 2.5.5 asks for.
 */
const SIZE: Record<ButtonSize, string> = {
  sm: 'min-h-(--control-h-sm) px-(--control-px-sm) py-(--control-py-sm) text-[13px]',
  md: 'min-h-(--control-h-md) px-(--control-px-md) py-(--control-py-md) text-sm',
  lg: 'min-h-(--control-h-lg) px-(--control-px-lg) py-(--control-py-lg) text-[15px]',
}

/** Square, because an icon has no label to give the box its width. */
const ICON_SIZE: Record<ButtonSize, string> = {
  sm: 'size-(--control-h-sm) p-0',
  md: 'size-(--control-h-md) p-0',
  lg: 'size-(--control-h-lg) p-0',
}

const SPINNER_SIZE: Record<ButtonSize, 'sm' | 'md'> = { sm: 'sm', md: 'sm', lg: 'md' }

interface CommonProps {
  children?: ReactNode
  /**
   * Which action this is. `primary` is the one thing the screen wants you to
   * do, so there is at most one per view; `danger` is reserved for destructive
   * actions and is the only place chroma is allowed on a control.
   */
  variant?: ButtonVariant
  /** 36 / 44 / 48px tall. `md` meets the pointer-target floor on its own. */
  size?: ButtonSize
  /** Optional mono keycap glyph rendered after the label (e.g. "P"). */
  keycap?: string
  /**
   * Swaps the leading content for a spinner and blocks interaction. The label
   * stays put — a button that empties out while it works loses its width, and
   * the page reflows under the pointer that just clicked it.
   */
  loading?: boolean
  /**
   * Square control with no label. REQUIRES `aria-label`: an icon-only button
   * with no accessible name is invisible to a screen reader, and this is the
   * single most common way a design system ships an unusable control.
   */
  iconOnly?: boolean
  /**
   * Render the child element instead of a `<button>`, keeping these styles.
   * Use it to hand the styling to a router's `Link` — `asChild` is what keeps
   * this package free of any one router.
   *
   * The decoration slots (`keycap`, `loading`) are not injected into a slotted
   * child; compose them inside it yourself.
   *
   * @example
   * <Button asChild><Link href="/work">Work</Link></Button>
   */
  asChild?: boolean
  className?: string
}

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string }

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined }

export type ButtonProps = ButtonAsLink | ButtonAsButton

function Keycap({ glyph }: { glyph: string }) {
  return (
    <span className="rounded-(--radius-pill) border border-current px-2 py-0.5 font-mono text-[11px] opacity-55">
      {glyph}
    </span>
  )
}

/**
 * The system's action.
 *
 * Renders a `<button>`, or an `<a>` when given `href`, or whatever you hand it
 * via `asChild`. No router is imported, so the package stays framework-agnostic
 * and a Next or React Router app wires its own `Link` at the call site.
 *
 * Server-component friendly: there is no client boundary here, so it renders in
 * a static page as well as an interactive one.
 *
 * @example
 * <Button variant="secondary" keycap="P">View projects</Button>
 * @example
 * <Button loading disabled>Saving…</Button>
 * @example
 * <Button iconOnly aria-label="Close"><X size={16} /></Button>
 */
export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    keycap,
    loading = false,
    iconOnly = false,
    asChild = false,
    className,
  } = props

  const cls = cn(BASE, VARIANT[variant], iconOnly ? ICON_SIZE[size] : SIZE[size], className)

  // A filled ground needs a spinner in the inherited colour; an outlined one
  // reads better against the page's own rule scale.
  const spinnerTone = variant === 'primary' || variant === 'danger' ? 'current' : 'default'
  const decoration = (
    <>
      {loading && <Spinner size={SPINNER_SIZE[size]} tone={spinnerTone} label={null} />}
      {children}
      {keycap && <Keycap glyph={keycap} />}
    </>
  )

  if (asChild) {
    const { children: _c, variant: _v, size: _s, keycap: _k, loading: _l, iconOnly: _i, asChild: _a, className: _cn, ...rest } = props
    return (
      <Slot className={cls} {...rest}>
        {children}
      </Slot>
    )
  }

  if (props.href !== undefined) {
    const { children: _c, variant: _v, size: _s, keycap: _k, loading: _l, iconOnly: _i, asChild: _a, className: _cn, href, ...rest } = props
    return (
      <a
        href={href}
        className={cls}
        // A link cannot be `disabled`; `aria-disabled` plus the pointer-events
        // rule in BASE is the accessible equivalent.
        aria-disabled={loading || undefined}
        {...rest}
      >
        {decoration}
      </a>
    )
  }

  const { children: _c, variant: _v, size: _s, keycap: _k, loading: _l, iconOnly: _i, asChild: _a, className: _cn, ...rest } = props
  return (
    <button
      type={rest.type ?? 'button'}
      aria-busy={loading || undefined}
      disabled={rest.disabled || loading}
      className={cls}
      {...rest}
    >
      {decoration}
    </button>
  )
}

export default Button
