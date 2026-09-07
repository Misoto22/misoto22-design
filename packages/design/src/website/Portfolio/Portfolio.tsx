import FrameLayout from './FrameLayout'
import { Slot } from '@radix-ui/react-slot'
import type { ReactElement, ReactNode } from 'react'
import { Heading } from '../../components/Heading/Heading'

export interface PortfolioProps {
  name: string
  monogram?: string
  biography: ReactNode
  facts?: ReactNode[]
  quotation?: ReactNode
  feature?: ReactNode
}
/** An introduction and a chosen photograph, with content supplied by the host. */
export function Portfolio({ name, monogram, biography, facts = [], quotation, feature }: PortfolioProps) {
  return <section className="m22-portfolio-intro" aria-label={name}><div className="m22-portfolio-intro-copy"><div className="m22-portfolio-byline">{monogram && <span aria-hidden className="m22-portfolio-monogram">{monogram}</span>}<Heading level={1}>{name}</Heading></div><div className="m22-portfolio-biography">{biography}</div><div className="m22-portfolio-facts">{facts.map((fact, index) => <div key={index}>{fact}</div>)}</div>{quotation && <blockquote>{quotation}</blockquote>}</div>{feature && <div className="m22-portfolio-feature">{feature}</div>}</section>
}

export interface PortfolioImageProps {
  children: ReactElement
  title?: ReactNode
  metadata?: ReactNode
  index?: string
  size?: 'feature' | 'tile' | 'thumbnail'
  /** Preserve the supplied image's intrinsic dimensions instead of cropping. */
  natural?: boolean
}
export function PortfolioImage({ children, title, metadata, index, size = 'tile', natural = false }: PortfolioImageProps) {
  return <figure className="m22-portfolio-image" data-size={size} data-natural={natural || undefined}><Slot className="m22-portfolio-image-frame">{children}</Slot>{(title || metadata) && <figcaption>{index && <span aria-hidden>{index}</span>}<span>{title}</span>{metadata && <small>{metadata}</small>}</figcaption>}</figure>
}

export interface PortfolioRecordProps {
  title: ReactNode
  description?: ReactNode
  context?: ReactNode
  image?: ReactNode
  action?: ReactNode
  metadata?: ReactNode
}
export function PortfolioRecord({ title, description, context, image, action, metadata }: PortfolioRecordProps) {
  return <article className="m22-portfolio-record" data-has-image={!!image || undefined}>{image}<div>{context && <div className="m22-portfolio-record-context">{context}</div>}<Heading level={2} size="sub">{title}</Heading>{description && <p className="m22-portfolio-record-description">{description}</p>}{(action || metadata) && <div className="m22-portfolio-record-meta">{action}{metadata && <span>{metadata}</span>}</div>}</div></article>
}

export interface PortfolioListProps {
  children: ReactNode
  variant?: 'records' | 'frames' | 'thumbnails'
  label?: string
}
export function PortfolioList({ children, variant = 'records', label }: PortfolioListProps) {
  return <div className="m22-portfolio-list" data-variant={variant}>{label && <h2>{label}</h2>}{variant === 'frames' ? <FrameLayout>{children}</FrameLayout> : <div>{children}</div>}</div>
}

export interface PortfolioCategoriesProps {
  label: string
  items: { id: string; label: ReactNode; count: number }[]
}
export function PortfolioCategories({ label, items }: PortfolioCategoriesProps) {
  if (!items.length) return null
  return <section className="m22-portfolio-categories" aria-label={label}><h2>{label}</h2><dl>{items.map(item => <div key={item.id}><dt>{item.label}</dt><dd>{item.count}</dd></div>)}</dl></section>
}
