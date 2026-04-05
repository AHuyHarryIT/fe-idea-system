import { Input } from 'antd'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Clock3, MessageSquare, Search, XCircle } from 'lucide-react'
import type { Idea } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormField } from '@/components/forms/FormField'
import { FormTextarea } from '@/components/forms/FormInput'
import { SectionCard } from '@/components/shared/SectionCard'
import { formatAppDateTime } from '@/utils/date'
import {
  getReviewStatusLabel,
  REVIEW_PAGE_SIZE_OPTIONS,
} from '@/features/review/helpers/review-queue'

interface ReviewQueueListSectionProps {
  search: string
  onSearchChange: (value: string) => void
  error: Error | null
  isLoading: boolean
  reviewQueue: Idea[]
  reviewReasons: Record<string, string>
  expandedRejectIdeaId: string | null
  onReviewReasonChange: (ideaId: string, value: string) => void
  onToggleRejectReason: (ideaId: string) => void
  onReview: (ideaId: string, isApproved: boolean) => void
  isReviewing: boolean
  activeIdeaId: string | null
  currentPage: number
  totalIdeas: number
  pageSize: number
  onPageChange: (page: number, nextPageSize: number) => void
}

export function ReviewQueueListSection({
  search,
  onSearchChange,
  error,
  isLoading,
  reviewQueue,
  reviewReasons,
  expandedRejectIdeaId,
  onReviewReasonChange,
  onToggleRejectReason,
  onReview,
  isReviewing,
  activeIdeaId,
  currentPage,
  totalIdeas,
  pageSize,
  onPageChange,
}: ReviewQueueListSectionProps) {
  return (
    <SectionCard>
      <label className="mb-6 block">
        <Input
          id="review-search"
          name="review-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
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
            const isRejectExpanded = expandedRejectIdeaId === idea.id

            return (
              <article
                key={idea.id}
                className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                        {getReviewStatusLabel(idea.status)}
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
                      <span>Department: {idea.departmentName || 'Unknown'}</span>
                      <span>
                        Created: {formatAppDateTime(idea.createdAt || idea.createdDate)}
                      </span>
                      <span>Comments: {idea.commentCount ?? 0}</span>
                    </div>
                  </div>

                  <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
                    <AppButton type="button" variant="secondary">
                      Open detail
                    </AppButton>
                  </Link>
                </div>

                <div className="mt-5 flex flex-col gap-4 rounded-[22px] border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Moderation actions
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Approve immediately or open a rejection reason when the idea needs revision.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <AppButton
                        type="button"
                        variant={isRejectExpanded ? 'ghost' : 'red'}
                        onClick={() => onToggleRejectReason(idea.id)}
                        disabled={isSubmitting}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {isRejectExpanded ? 'Hide rejection' : 'Reject with reason'}
                      </AppButton>

                      {isRejectExpanded ? (
                        <AppButton
                          type="button"
                          variant="red"
                          onClick={() => onReview(idea.id, false)}
                          disabled={isSubmitting}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {isSubmitting ? 'Saving...' : 'Submit rejection'}
                        </AppButton>
                      ) : null}

                    <AppButton
                      type="button"
                      onClick={() => onReview(idea.id, true)}
                      disabled={isSubmitting}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Saving...' : 'Approve'}
                    </AppButton>
                  </div>
                </div>

                  {isRejectExpanded ? (
                    <FormField
                      label="Rejection reason"
                      hint="Required before the rejection can be submitted."
                    >
                      <FormTextarea
                        id={`rejection-reason-${idea.id}`}
                        name={`rejection-reason-${idea.id}`}
                        value={reviewReasons[idea.id] ?? ''}
                        onChange={(event) => onReviewReasonChange(idea.id, event.target.value)}
                        placeholder="Explain what needs to change before this idea can be accepted."
                        disabled={isSubmitting}
                      />
                    </FormField>
                  ) : null}
                </div>
              </article>
            )
          })}

          <AppPagination
            current={currentPage}
            total={totalIdeas}
            pageSize={pageSize}
            pageSizeOptions={REVIEW_PAGE_SIZE_OPTIONS}
            onChange={onPageChange}
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
  )
}
