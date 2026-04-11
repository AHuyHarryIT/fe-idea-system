import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react"
import { AppButton } from "@/components/app/AppButton"
import { FormField } from "@/components/forms/FormField"
import { FormTextarea } from "@/components/forms/FormInput"
import { SectionCard } from "@/components/shared/SectionCard"
import { formatAppDateTime } from "@/utils/date"
import type { Idea, Submission } from "@/types"

interface IdeaDetailSidebarProps {
  idea?: Idea
  authorLabel: string
  statusLabel: string
  linkedSubmission?: Submission
  thumbsUpCount: number
  thumbsDownCount: number
  visibleCommentCount: number
  canReview: boolean
  isApprovedStatus: boolean
  isReviewing: boolean
  reviewReason: string
  onReviewReasonChange: (value: string) => void
  onReview: (isApproved: boolean) => void
}

export function IdeaDetailSidebar({
  idea,
  authorLabel,
  statusLabel,
  linkedSubmission,
  thumbsUpCount,
  thumbsDownCount,
  visibleCommentCount,
  canReview,
  isApprovedStatus,
  isReviewing,
  reviewReason,
  onReviewReasonChange,
  onReview,
}: IdeaDetailSidebarProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Idea snapshot"
        description="Review the key metadata, activity totals, and current moderation state."
      >
        <div className="space-y-3 text-sm text-slate-600">
          <div className="rounded-[22px] bg-slate-50 p-4">
            Category: {idea?.categoryName || "Uncategorized"}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Author: {authorLabel}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Status: {statusLabel}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Created: {formatAppDateTime(idea?.createdAt || idea?.createdDate)}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Submission: {idea?.submissionName || "Not provided"}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Closure:{" "}
            {linkedSubmission?.closureDate
              ? formatAppDateTime(linkedSubmission.closureDate)
              : "Not provided"}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Final closure:{" "}
            {linkedSubmission?.finalClosureDate
              ? formatAppDateTime(linkedSubmission.finalClosureDate)
              : "Not provided"}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Views: {idea?.viewCount ?? 0}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Likes: {thumbsUpCount}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Dislikes: {thumbsDownCount}
          </div>
          <div className="rounded-[22px] bg-slate-50 p-4">
            Comments: {visibleCommentCount}
          </div>
        </div>
      </SectionCard>

      {canReview && (
        <SectionCard
          title="Review decision"
          description="Approve the idea for publication or reject it with feedback."
        >
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Moderator controls</p>
                <p className="mt-1 text-sm text-slate-600">
                  Current status: {statusLabel}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <FormField
                label="Rejection reason"
                hint="Required only if you reject the idea."
              >
                <FormTextarea
                  id="review-reason"
                  name="review-reason"
                  value={reviewReason}
                  onChange={(event) => onReviewReasonChange(event.target.value)}
                  placeholder="Explain why the idea was rejected or what must be updated."
                  disabled={isReviewing}
                />
              </FormField>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {!isApprovedStatus && (
                <AppButton
                  type="button"
                  onClick={() => onReview(true)}
                  disabled={isReviewing}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isReviewing ? "Saving..." : "Approve idea"}
                </AppButton>
              )}
              <AppButton
                type="button"
                variant="red"
                onClick={() => onReview(false)}
                disabled={isReviewing}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {isReviewing ? "Saving..." : "Reject idea"}
              </AppButton>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
