import { Slot } from '@radix-ui/react-slot'
import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Heading } from '../../components/Heading/Heading'
import { Text } from '../../components/Text/Text'

export interface SiteShellProps {
  children: ReactNode
  navigation?: ReactNode
  footer?: ReactNode
  skipLabel: string
  contentId?: string
}

/** One main landmark, a keyboard skip link, and the publication's common shell. */
export function SiteShell({ children, navigation, footer, skipLabel, contentId = 'main-content' }: SiteShellProps) {
  return <div className="m22-site-shell"><a className="m22-site-skip" href={`#${contentId}`}>{skipLabel}</a>{navigation}<main id={contentId}>{children}</main>{footer}</div>
}

export interface SiteFooterGroup {
  id: string
  label: string
  items: { id: string; content: ReactNode }[]
  kind?: 'links' | 'files' | 'social'
}

export interface SiteFooterProps {
  brand: ReactNode
  contact?: ReactNode
  description?: ReactNode
  groups: SiteFooterGroup[]
  copyright: ReactNode
  colophon?: ReactNode
}

/** A quiet footer with semantic, independently named destination groups. */
export function SiteFooter({ brand, contact, description, groups, copyright, colophon }: SiteFooterProps) {
  return <footer className="m22-site-footer"><div className="m22-site-container"><div className="m22-site-footer-masthead"><div className="m22-site-wordmark">{brand}</div>{contact}</div>{description && <p className="m22-site-footer-description">{description}</p>}<div className="m22-site-footer-groups">{groups.map(group => <nav key={group.id} aria-label={group.label} data-kind={group.kind ?? 'links'}><h2>{group.label}</h2><ul>{group.items.map(item => <li key={item.id}>{item.content}</li>)}</ul></nav>)}</div><div className="m22-site-colophon"><div>{copyright}</div><div>{colophon}</div></div></div></footer>
}

export interface SiteSectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
}
export function SiteSectionHeading({ title, subtitle, className, ...rest }: SiteSectionHeadingProps) {
  return <div className={cn('m22-site-section-heading', className)} {...rest}><Heading level={2}>{title}</Heading>{subtitle && <Text>{subtitle}</Text>}</div>
}

export interface SiteLinkProps {
  children: ReactElement
  variant?: 'text' | 'back' | 'meta'
  className?: string
}
/** Styling for a host router's link without owning its destination. */
export function SiteLink({ children, variant = 'text', className }: SiteLinkProps) {
  return <Slot className={cn('m22-site-link', `m22-site-link-${variant}`, className)}>{children}</Slot>
}
