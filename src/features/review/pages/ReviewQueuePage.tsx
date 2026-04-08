import { PageHeader } from '@/components/shared/PageHeader'
import { ReviewQueueListSection } from '@/features/review/components/ReviewQueueListSection'
import {
  DEFAULT_REVIEW_PAGE_SIZE,
  isReviewableIdea,
  sortReviewIdeasByNewest
} from '@/features/review/helpers/review-queue'
import { useAllIdeas } from '@/hooks/useIdeas'
import { normalizeIdeaResponse } from '@/utils/idea-response-mapper'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'

export default function ReviewQueuePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_REVIEW_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search.trim())
  const { data, isLoading, error } = useAllIdeas({
    pageNumber: currentPage,
    pageSize,
    reviewStatus: 0,
    searchTerm: deferredSearch || undefined,
  })

  const ideas = useMemo(() => normalizeIdeaResponse(data), [data])

  const reviewQueue = useMemo(
    () =>
      [...ideas]
        .filter((idea) => isReviewableIdea(idea.status))
        .sort(sortReviewIdeasByNewest),
    [ideas],
  )
  const totalIdeas =
    data?.pagination?.totalCount ?? data?.totalCount ?? reviewQueue.length
  const totalPages = Math.max(1, Math.ceil(totalIdeas / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch])

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, isLoading, totalPages])


  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Review Ideas"
        description={`${reviewQueue.length} ideas currently need a moderation decision.`}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Awaiting review
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {reviewQueue.length}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Decisions still needed in the current moderation queue.
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Search scope
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-950">
            {deferredSearch ? 'Filtered queue' : 'All pending ideas'}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {deferredSearch
              ? `Showing results for “${deferredSearch}”.`
              : 'Search by title, author, description, or category.'}
          </p>
        </div>
      </div>

      <ReviewQueueListSection
        search={search}
        onSearchChange={setSearch}
        error={error}
        isLoading={isLoading}
        reviewQueue={reviewQueue}
        currentPage={currentPage}
        totalIdeas={totalIdeas}
        pageSize={pageSize}
        onPageChange={(page, nextPageSize) => {
          if (nextPageSize !== pageSize) {
            setPageSize(nextPageSize)
            setCurrentPage(1)
            return
          }

          setCurrentPage(page)
        }}
      />
    </div>
  )
}
