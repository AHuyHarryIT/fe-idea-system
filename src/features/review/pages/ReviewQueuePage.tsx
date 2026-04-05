import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAllIdeas, useReviewIdea } from '@/hooks/useIdeas'
import { normalizeIdeaResponse } from '@/utils/idea-response-mapper'
import { appNotification } from '@/utils/notifications'
import { ReviewQueueListSection } from '@/features/review/components/ReviewQueueListSection'
import {
  DEFAULT_REVIEW_PAGE_SIZE,
  getReviewErrorMessage,
  isReviewableIdea,
  sortReviewIdeasByNewest,
} from '@/features/review/helpers/review-queue'

export default function ReviewQueuePage() {
  const queryClient = useQueryClient()
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
  const { mutateAsync: reviewIdea, isPending: isReviewing } = useReviewIdea()
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null)
  const [reviewReasons, setReviewReasons] = useState<Record<string, string>>({})

  const ideas = useMemo(() => normalizeIdeaResponse(data), [data])

  const reviewQueue = useMemo(
    () => [...ideas].filter((idea) => isReviewableIdea(idea.status)).sort(sortReviewIdeasByNewest),
    [ideas],
  )
  const totalIdeas = data?.pagination?.totalCount ?? data?.totalCount ?? reviewQueue.length
  const totalPages = Math.max(1, Math.ceil(totalIdeas / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch])

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, isLoading, totalPages])

  const handleReview = async (ideaId: string, isApproved: boolean) => {
    const rejectionReason = (reviewReasons[ideaId] || '').trim()

    if (!isApproved && !rejectionReason) {
      appNotification.warning('Please provide a rejection reason before rejecting.')
      return
    }

    setActiveIdeaId(ideaId)

    const response = await reviewIdea({
      ideaId,
      request: {
        isApproved,
        rejectionReason: isApproved ? undefined : rejectionReason,
      },
    })

    if (!response.success) {
      appNotification.error(getReviewErrorMessage(response.error))
      setActiveIdeaId(null)
      return
    }

    setReviewReasons((prev) => ({
      ...prev,
      [ideaId]: '',
    }))

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['allIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['allIdeasMatching'] }),
      queryClient.invalidateQueries({ queryKey: ['qaManagerIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['adminIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] }),
    ])

    setActiveIdeaId(null)
    appNotification.success(
      isApproved ? 'Idea approved successfully.' : 'Idea rejected successfully.',
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Review Ideas"
        description={`${reviewQueue.length} ideas currently need a moderation decision.`}
      />

      <ReviewQueueListSection
        search={search}
        onSearchChange={setSearch}
        error={error}
        isLoading={isLoading}
        reviewQueue={reviewQueue}
        reviewReasons={reviewReasons}
        onReviewReasonChange={(ideaId, value) =>
          setReviewReasons((prev) => ({
            ...prev,
            [ideaId]: value,
          }))
        }
        onReview={(ideaId, isApproved) => void handleReview(ideaId, isApproved)}
        isReviewing={isReviewing}
        activeIdeaId={activeIdeaId}
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
