'use client'

import { Button, cn } from '@misoto22/design'
import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { useState } from 'react'
import { TEMPLATE_COMPONENTS } from '@/generated/template-registry'

const WIDTHS = {
  mobile: { label: 'Mobile', width: 390, icon: Smartphone },
  tablet: { label: 'Tablet', width: 768, icon: Tablet },
  desktop: { label: 'Desktop', width: 0, icon: Monitor },
} as const

type Size = keyof typeof WIDTHS

export interface TemplateFrameProps {
  templateId: string
  name: string
}

/**
 * A template at a chosen width.
 *
 * Rendered inline rather than in an iframe, so it inherits the reader's own
 * theme, accent and density — the whole point being that these screens are made
 * of the same tokens as the page around them, and an iframe would quietly prove
 * the opposite by needing its own copy of everything.
 *
 * The width is set with `max-width` on a centred wrapper rather than by resizing
 * anything, and that wrapper is the query container: the templates are written
 * with `@2xl:` / `@3xl:` / `@5xl:` rather than `sm:` / `md:` / `lg:`, so they
 * answer the frame's width.
 *
 * They used to use the viewport breakpoints, which never changed — picking
 * "Mobile" on a desktop left a two-column dashboard crushed into 390px.
 */
export function TemplateFrame({ templateId, name }: TemplateFrameProps) {
  const [size, setSize] = useState<Size>('desktop')
  const Template = TEMPLATE_COMPONENTS[templateId]

  if (!Template) {
    return (
      <p className="m-0 rounded-(--radius) border border-(--danger) p-4 text-sm text-(--danger)">
        No template is registered for <code className="font-mono text-xs">{templateId}</code>.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-(--radius-lg) border border-(--rule)">
      <div
        role="radiogroup"
        aria-label={`${name} width`}
        className="flex items-center justify-end gap-1 border-b border-(--rule) bg-(--paper-2) px-2 py-1.5"
      >
        {(Object.keys(WIDTHS) as Size[]).map((key) => {
          const option = WIDTHS[key]
          const Icon = option.icon
          return (
            <Button
              key={key}
              size="sm"
              variant="ghost"
              role="radio"
              aria-checked={size === key}
              aria-label={option.label}
              onClick={() => setSize(key)}
              className={cn('gap-2', size === key && 'text-(--ink)')}
            >
              <Icon size={14} strokeWidth={1.5} aria-hidden />
              <span className="max-sm:sr-only">{option.label}</span>
            </Button>
          )
        })}
      </div>

      <div className="bg-(--paper-2) p-4">
        <div
          // A named region, so the preview is one thing a reader can skip past
          // rather than an unannounced pile of controls in the middle of a
          // documentation page.
          role="region"
          aria-label={`${name} preview`}
          className="@container mx-auto overflow-hidden rounded-(--radius) border border-(--rule) bg-(--paper) transition-[max-width] duration-(--duration-slow) ease-(--ease-out-expo)"
          style={{ maxWidth: WIDTHS[size].width || undefined }}
        >
          {/* Inside the container, not on it: a container query unit resolves
              against an ancestor container, so the element that re-bases the
              fluid ramp cannot be the one declaring the container. */}
          <div data-fluid-frame className="[--fluid:1cqi]">
            <Template />
          </div>
        </div>
      </div>
    </div>
  )
}
