'use client'

import { SearchableMenu, type MenuAction } from '@misoto22/design'
import { useState } from 'react'

export function Example() {
  const [last, setLast] = useState<string>()

  const actions: MenuAction[] = [
    { id: 'copy-link', label: 'Copy link', group: 'Share', shortcut: 'C', onSelect: () => setLast('Copy link') },
    { id: 'copy-embed', label: 'Copy embed code', group: 'Share', keywords: ['iframe'], onSelect: () => setLast('Copy embed code') },
    { id: 'export-csv', label: 'Export as CSV', group: 'Export', onSelect: () => setLast('Export as CSV') },
    { id: 'export-json', label: 'Export as JSON', group: 'Export', onSelect: () => setLast('Export as JSON') },
    { id: 'export-pdf', label: 'Export as PDF', group: 'Export', onSelect: () => setLast('Export as PDF') },
    { id: 'archive', label: 'Archive', group: 'Manage', onSelect: () => setLast('Archive') },
    { id: 'duplicate', label: 'Duplicate', group: 'Manage', onSelect: () => setLast('Duplicate') },
    { id: 'transfer', label: 'Transfer ownership', group: 'Manage', onSelect: () => setLast('Transfer ownership') },
    { id: 'delete', label: 'Delete', group: 'Manage', destructive: true, onSelect: () => setLast('Delete') },
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      <SearchableMenu label="Actions" actions={actions} searchPlaceholder="Filter actions…">
        Actions
      </SearchableMenu>
      <p className="m-0 mono-meta text-(--ink-3-aa)">{last ? `ran: ${last}` : 'nine actions, one filter'}</p>
    </div>
  )
}
