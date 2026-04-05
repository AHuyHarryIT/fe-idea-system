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
  onReviewReasonChange: (ideaId: string, value: string) => void
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
  onReviewReasonChange,
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

            return (
              <article
                key={idea.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
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
                      onChange={(event) => onReviewReasonChange(idea.id, event.target.value)}
                      placeholder="Explain what needs to change before this idea can be accepted."
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <div className="flex flex-wrap gap-3">
                    <AppButton
                      type="button"
                      onClick={() => onReview(idea.id, true)}
                      disabled={isSubmitting}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Saving...' : 'Approve'}
                    </AppButton>
                    <AppButton
                      type="button"
                      variant="red"
                      onClick={() => onReview(idea.id, false)}
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
