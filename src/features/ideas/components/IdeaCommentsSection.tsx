import { FormField } from "@/components/forms/FormField"
import { FormTextarea } from "@/components/forms/FormInput"
import { AppButton } from "@/components/app/AppButton"
import { SectionCard } from "@/components/shared/SectionCard"
import { formatAppDateTime } from "@/utils/date"
import type { Comment as IdeaComment } from "@/types"
import { getCommentText } from "@/features/ideas/helpers/idea-detail"

interface IdeaCommentsSectionProps {
  visibleCommentCount: number
  canComment: boolean
  commentText: string
  isAnonymous: boolean
  isCommenting: boolean
  visibleComments: IdeaComment[]
  onCommentTextChange: (value: string) => void
  onCommentAnonymousChange: (value: boolean) => void
  onSubmitComment: () => void
}

export function IdeaCommentsSection({
  visibleCommentCount,
  canComment,
  commentText,
  isAnonymous,
  isCommenting,
  visibleComments,
  onCommentTextChange,
  onCommentAnonymousChange,
  onSubmitComment,
}: IdeaCommentsSectionProps) {
  return (
    <SectionCard
      title={`Comments (${visibleCommentCount})`}
      description="Share feedback or review the ongoing discussion around this idea."
    >
      <div className="space-y-5">
        {canComment ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
            <FormField label="Add a comment">
              <FormTextarea
                id="comment-form"
                name="comment-form"
                placeholder="Share your thoughts on this proposal"
                value={commentText}
                onChange={(event) => onCommentTextChange(event.target.value)}
              />
            </FormField>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  id="comment-anonymous"
                  name="comment-anonymous"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) =>
                    onCommentAnonymousChange(event.target.checked)
                  }
                />
                Post anonymously
              </label>

              <AppButton disabled={isCommenting} onClick={onSubmitComment}>
                {isCommenting ? "Posting..." : "Post comment"}
              </AppButton>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Commenting is unavailable after the final closure date.
          </div>
        )}

        {visibleComments.length > 0 ? (
          <div className="space-y-4">
            {visibleComments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-600"
              >
                <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">
                    {comment.isAnonymous
                      ? "Anonymous"
                      : comment.authorName ||
                        comment.createdBy ||
                        "Unknown author"}
                  </span>
                  <span>
                    {formatAppDateTime(
                      comment.createdAt || comment.createdDate,
                    )}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap">
                  {getCommentText(comment)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No comments yet. Start the discussion below.
          </div>
        )}
      </div>
    </SectionCard>
  )
}
