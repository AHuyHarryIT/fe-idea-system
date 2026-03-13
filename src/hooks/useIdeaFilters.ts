import { useMemo, useState } from 'react'

export function useIdeaFilters() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')

  const query = useMemo(
    () => ({
      search,
      status,
      category,
    }),
    [category, search, status],
  )

  return {
    search,
    setSearch,
    status,
    setStatus,
    category,
    setCategory,
    query,
  }
}
