'use client'

import { Pagination } from '@misoto22/design'
import { useState } from 'react'

export function Example() {
  const [page, setPage] = useState(7)
  return <Pagination page={page} pageCount={20} onPageChange={setPage} />
}
