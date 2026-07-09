import { clsx } from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary'

/** Shared base + variant styles for misoto22's keycap-style buttons. */
const BASE =
  'inline-flex items-center gap-2.5 px-4 py-[11px] rounded-(--radius) text-sm transition-all duration-150 ease-(--ease-out-expo) hover:shadow-(--shadow) hover:-translate-y-px disabled:opacity-50 disabled:pointer-events-none'

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-(--foreground) text-(--background) border border-(--foreground) hover:bg-(--accent) hover:border-(--accent) hover:text-(--accent-foreground)',
  secondary:
    'border border-(--border-color) text-(--foreground) hover:border-(--accent) hover:text-(--accent)',
}

interface CommonProps {
  children: ReactNode
  variant?: ButtonVariant
  /** Optional mono keycap glyph rendered after the label (e.g. "P"). */
  keycap?: string
  className?: string
}

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & {
    href: string
  }

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined
  }

export type ButtonProps = ButtonAsLink | ButtonAsButton

function Keycap({ glyph }: { glyph: string }) {
  return (
    <span className="font-mono text-[11px] px-1.5 py-0.5 border border-current rounded-(--radius-sm) opacity-55">
      {glyph}
    </span>
  )
}

/**
 * Keycap-style button. Renders a native `<a>` when given `href`, otherwise a
 * `<button>`. Framework-agnostic — wrap with your router's Link at the call site
 * for client-side navigation. Server-component friendly (no client boundary).
 */
export function Button(props: ButtonProps) {
  const { children, variant = 'primary', keycap, className } = props
  const cls = clsx(BASE, VARIANT[variant], className)

  if (props.href !== undefined) {
    const { children: _c, variant: _v, keycap: _k, className: _cn, href, ...rest } = props
    return (
      <a href={href} className={cls} {...rest}>
        {children}
        {keycap && <Keycap glyph={keycap} />}
      </a>
    )
  }

  const { children: _c, variant: _v, keycap: _k, className: _cn, ...rest } = props
  return (
    <button type={rest.type ?? 'button'} className={cls} {...rest}>
      {children}
      {keycap && <Keycap glyph={keycap} />}
    </button>
  )
}

export default Button
