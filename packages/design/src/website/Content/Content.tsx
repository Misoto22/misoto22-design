import type { HTMLAttributes, ReactNode, TableHTMLAttributes } from 'react'
import { Tag } from '../../components/Tag/Tag'
import { cn } from '../../lib/cn'

export interface SequenceStep {
  n: string
  label: string
  note?: string
  anchor?: boolean
  tags?: string[]
}

export interface StepSequenceSpec {
  steps: SequenceStep[]
  caption?: string
  label?: string
}

export interface StepSequenceProps extends HTMLAttributes<HTMLElement> {
  spec: StepSequenceSpec
}

/** A process rail whose source order, counters and annotations belong to the host. */
export function StepSequence({ spec, className, ...rest }: StepSequenceProps) {
  return (
    <figure className={cn('m22-step-sequence', className)} role="group" aria-label={spec.label ?? spec.caption} {...rest}>
      <div role="list">
        {spec.steps.map((step, index) => (
          <div className="m22-sequence-step" role="listitem" key={step.n} data-anchor={step.anchor || undefined}>
            <div className="m22-sequence-rail" aria-hidden="true">
              <span className="m22-sequence-counter">{step.n}</span>
              {index < spec.steps.length - 1 && <span className="m22-sequence-connector" />}
            </div>
            <div className="m22-sequence-copy">
              <span className="m22-sequence-label">{step.label}</span>
              <span className="m22-sequence-note">{step.note ?? '\u00a0'}</span>
              {step.tags && step.tags.length > 0 && <span className="m22-sequence-tags">{step.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</span>}
            </div>
          </div>
        ))}
      </div>
      {spec.caption && <div className="m22-sequence-caption">{spec.caption}</div>}
    </figure>
  )
}

export type ContentTableProps = TableHTMLAttributes<HTMLTableElement>

/** Keeps a rendered article table intact inside a keyboard-scrollable region. */
export function ContentTable({ children, ...props }: ContentTableProps) {
  return <div className="m22-content-table" tabIndex={0}><table {...props}>{children}</table></div>
}

export interface ExternalLinkMarkProps {
  children?: ReactNode
}

export function ExternalLinkMark({ children = '↗' }: ExternalLinkMarkProps) {
  return <span className="m22-external-link-mark" aria-hidden="true">{children}</span>
}
