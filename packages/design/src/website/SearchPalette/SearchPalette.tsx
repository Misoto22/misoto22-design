'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { RiArrowLeftLine, RiCloseLine } from '@remixicon/react'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Command, CommandEmpty, CommandFooter, CommandGroup, CommandHint, CommandInput, CommandItem, CommandList } from '../../components/Command/Command'
import { Dialog, DialogContent, type DialogContentProps } from '../../components/Dialog/Dialog'
import { Input } from '../../components/Input/Input'

export interface SearchPaletteItem {
  /** Stable identity, independent of a translated title. */
  id: string
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  meta?: ReactNode
  onSelect: () => void
}

export interface SearchPaletteGroup {
  id: string
  label: string
  items: SearchPaletteItem[]
}

export interface SearchPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: string
  inputLabel: string
  placeholder: string
  query: string
  onQueryChange: (query: string) => void
  /** Already filtered results; search and data access belong to the consumer. */
  groups: SearchPaletteGroup[]
  emptyLabel: ReactNode
  labels: { close: string; navigate: string; select: string; back: string }
  /** Optional answer or detail view, with Escape returning to the results. */
  detail?: { label: string; content: ReactNode; onBack: () => void; onSubmit: () => void; submitDisabled?: boolean }
  onContentLinkClick?: () => void
  onCloseAutoFocus?: DialogContentProps['onCloseAutoFocus']
}

/** Search, actions and an optional result detail inside one accessible modal. */
export function SearchPalette({
  open, onOpenChange, label, inputLabel, placeholder, query, onQueryChange,
  groups, emptyLabel, labels, detail, onContentLinkClick, onCloseAutoFocus,
}: SearchPaletteProps) {
  const input = useRef<HTMLInputElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const showingDetail = Boolean(detail)
  useEffect(() => {
    if (open) input.current?.focus()
  }, [open, showingDetail])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={label} hideTitle showClose={false} aria-describedby={undefined} aria-modal="true"
        className="m22-search-palette translate-y-0"
        onOpenAutoFocus={() => {
          previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event)
          if (!event.defaultPrevented) {
            event.preventDefault()
            previousFocus.current?.focus()
          }
        }}
        onEscapeKeyDown={(event) => {
          if (detail) { event.preventDefault(); detail.onBack() }
        }}
      >
        {detail ? (
          <>
            <form className="m22-search-palette__input" onSubmit={(event) => {
              event.preventDefault()
              if (query.trim() && !detail.submitDisabled) detail.onSubmit()
            }}>
              <Button variant="ghost" iconOnly aria-label={labels.back} onClick={detail.onBack}><RiArrowLeftLine size={18} aria-hidden /></Button>
              <Input ref={input} aria-label={inputLabel} placeholder={placeholder} value={query} onChange={(event) => onQueryChange(event.target.value)} autoComplete="off" />
              <Badge>{detail.label}</Badge>
              <Button variant="ghost" iconOnly aria-label={labels.close} onClick={() => onOpenChange(false)}><RiCloseLine size={18} aria-hidden /></Button>
            </form>
            <div className="m22-search-palette__detail" aria-live="polite" onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) onContentLinkClick?.()
            }}>{detail.content}</div>
          </>
        ) : (
          <Command label={inputLabel} shouldFilter={false} className="m22-search-palette__commands">
            <div className="m22-search-palette__search">
              <CommandInput ref={input} aria-label={inputLabel} placeholder={placeholder} value={query} onValueChange={onQueryChange} autoComplete="off" spellCheck={false} />
              <Button variant="ghost" iconOnly aria-label={labels.close} onClick={() => onOpenChange(false)}><RiCloseLine size={18} aria-hidden /></Button>
            </div>
            <CommandList label={label}>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              {groups.map((group) => (
                <CommandGroup key={group.id} heading={group.label}>
                  {group.items.map((item) => (
                    <CommandItem key={item.id} value={item.id} icon={item.icon} meta={item.meta} onSelect={item.onSelect}>
                      <span className="m22-search-palette__result">
                        <span>{item.title}</span>
                        {item.description && <span className="m22-search-palette__description">{item.description}</span>}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        )}
        <CommandFooter className="m22-search-palette__footer">
          {!detail && <CommandHint keys={['↑', '↓']}>{labels.navigate}</CommandHint>}
          <CommandHint keys={['↵']}>{labels.select}</CommandHint>
          <CommandHint keys={['esc']}>{detail ? labels.back : labels.close}</CommandHint>
        </CommandFooter>
      </DialogContent>
    </Dialog>
  )
}

export interface SearchExcerptProps {
  segments: ReadonlyArray<{ text: string; highlighted: boolean }>
}

/** Render query highlights as text, never as consumer-supplied HTML. */
export function SearchExcerpt({ segments }: SearchExcerptProps) {
  return <>{segments.map((segment, index) => segment.highlighted
    ? <mark className="m22-search-palette__highlight" key={index}>{segment.text}</mark>
    : segment.text)}</>
}
