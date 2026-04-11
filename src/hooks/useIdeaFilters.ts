import { useMemo, useState } from "react"

export function useIdeaFilters() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [submissionId, setSubmissionId] = useState("")

  const query = useMemo(
    () => ({
      search,
      status,
      categoryId,
      submissionId,
    }),
    [categoryId, search, status, submissionId],
  )

  return {
    search,
    setSearch,
    status,
    setStatus,
    categoryId,
    setCategoryId,
    submissionId,
    setSubmissionId,
    query,
  }
}
