import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Input } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Clock3,
  MessageSquare,
  Search,
  XCircle,
} from 'lucide-react'
import type { Idea } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { FormField } from '@/components/forms/FormField'
import { FormTextarea } from '@/components/forms/FormInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { useAllIdeas, useReviewIdea } from '@/hooks/useIdeas'
import { formatAppDateTime, getDateTimestamp } from '@/lib/date'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'
import { appNotification } from '@/lib/notifications'

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = ['10', '20', '50']

function getStatusLabel(status?: string) {
  if (!status) return 'Pending review'
  return status.replace(/_/g, ' ')
}

function getReviewErrorMessage(error?: string) {
  if (error === 'HTTP 404') {
    return 'This idea could not be found in the review queue.'
  }

  return error ?? 'Unable to update the review decision.'
}

function sortByNewest(left: Idea, right: Idea) {
  return (
    getDateTimestamp(right.createdAt || right.createdDate) -
    getDateTimestamp(left.createdAt || left.createdDate)
  )
}

function isReviewableIdea(status?: string) {
  if (!status) return true

  return [
    'submitted',
    'under_review',
    'pending',
    'pending_review',
    'awaiting_review',
  ].includes(status.toLowerCase().replace(/\s+/g, '_'))
}

export default function ReviewIdea() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
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
    () => [...ideas].filter((idea) => isReviewableIdea(idea.status)).sort(sortByNewest),
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

  const handleReview = async (ideaId: string, isApproved: boolean) => {
    const rejectionReason = (reviewReasons[ideaId] || '').trim()

    if (!isApproved && !rejectionReason) {
      appNotification.warning(
        'Please provide a rejection reason before rejecting.',
      )
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
      isApproved
        ? 'Idea approved successfully.'
        : 'Idea rejected successfully.',
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Review Ideas"
        description={`${reviewQueue.length} ideas currently need a moderation decision.`}
      />

      <SectionCard>
        <label className="mb-6 block">
          <Input
            id="review-search"
            name="review-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by idea title, description, author, or category"
            allowClear
            size="large"
            prefix={<Search className="h-4 w-4 text-slate-400" />}
            className="rounded-xl"
          />
        </label>

        {error ? (
          <EmptyState
            icon={MessageSquare}
            title="Unable to load review queue"
            description={error.message}
          />
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Loading ideas for review...
          </div>
        ) : reviewQueue.length > 0 ? (
          <div className="space-y-5">
            {reviewQueue.map((idea) => {
              const isSubmitting = isReviewing && activeIdeaId === idea.id

              return (
                <article
                  key={idea.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                          {getStatusLabel(idea.status)}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                          {idea.categoryName || 'Uncategorized'}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {idea.text || idea.title || 'Untitled idea'}
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                          {idea.description || 'No description available.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span>Author: {idea.authorName || 'Anonymous'}</span>
                        <span>
                          Department: {idea.departmentName || 'Unknown'}
                        </span>
                        <span>
                          Created:{' '}
                          {formatAppDateTime(
                            idea.createdAt || idea.createdDate,
                          )}
                        </span>
                        <span>Comments: {idea.commentCount ?? 0}</span>
                      </div>
                    </div>

                    <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
                      <AppButton type="button" variant="ghost">
                        Open detail
                      </AppButton>
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                    <FormField
                      label="Rejection reason"
                      hint="Required only if you reject the idea."
                    >
                      <FormTextarea
                        id={`rejection-reason-${idea.id}`}
                        name={`rejection-reason-${idea.id}`}
                        value={reviewReasons[idea.id] ?? ''}
                        onChange={(event) =>
                          setReviewReasons((prev) => ({
                            ...prev,
                            [idea.id]: event.target.value,
                          }))
                        }
                        placeholder="Explain what needs to change before this idea can be accepted."
                        disabled={isSubmitting}
                      />
                    </FormField>

                    <div className="flex flex-wrap gap-3">
                      <AppButton
                        type="button"
                        onClick={() => handleReview(idea.id, true)}
                        disabled={isSubmitting}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Saving...' : 'Approve'}
                      </AppButton>
                      <AppButton
                        type="button"
                        variant="red"
                        onClick={() => handleReview(idea.id, false)}
                        disabled={isSubmitting}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Saving...' : 'Reject'}
                      </AppButton>
                    </div>
                  </div>
                </article>
              )
            })}

            <AppPagination
              current={currentPage}
              total={totalIdeas}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onChange={(page, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize)
                  setCurrentPage(1)
                  return
                }

                setCurrentPage(page)
              }}
              showTotal={(total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} ideas awaiting review`
              }
            />
          </div>
        ) : (
          <EmptyState
            icon={Clock3}
            title="No ideas waiting for review"
            description="Submitted or under-review ideas will show up here when they need approval or rejection."
          />
        )}
      </SectionCard>
    </div>
  )
}
