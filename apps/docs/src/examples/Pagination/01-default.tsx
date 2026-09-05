'use client'

import { Pagination } from '@misoto22/design'
import { useState } from 'react'

export function Example() {
  const [page, setPage] = useState(1)

  return (
    <div className="flex flex-col items-center gap-5">
      <Pagination page={page} pageCount={20} onPageChange={setPage} />
      <p className="m-0 mono-meta text-(--ink-3-aa)">page {page} of 20</p>
    </div>
  )
}
