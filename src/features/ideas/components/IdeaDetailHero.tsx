import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react"
import { AppButton } from "@/components/app/AppButton"
import { formatAppDateTime } from "@/utils/date"
import type { Idea, Submission } from "@/types"

interface IdeaDetailHeroProps {
  idea?: Idea
  isLoading: boolean
  ideaTitle: string
  authorLabel: string
  statusLabel: string
  linkedSubmission?: Submission
  isLiked: boolean
  isDisliked: boolean
  canComment: boolean
  canEditIdea: boolean
  canDeleteIdea: boolean
  isVoting: boolean
  isUpdatingIdea: boolean
  isDeletingIdea: boolean
  isPastSubmissionClosure: boolean
  isPastFinalSubmissionClosure: boolean
  visibleCommentCount: number
  thumbsUpCount: number
  thumbsDownCount: number
  onLike: () => void
  onDislike: () => void
  onOpenDeleteConfirm: () => void
}

export function IdeaDetailHero({
  idea,
  isLoading,
  ideaTitle,
  authorLabel,
  statusLabel,
  linkedSubmission,
  isLiked,
  isDisliked,
  canComment,
  canEditIdea,
  canDeleteIdea,
  isVoting,
  isDeletingIdea,
  isPastSubmissionClosure,
  isPastFinalSubmissionClosure,
  visibleCommentCount,
  thumbsUpCount,
  thumbsDownCount,
  onLike,
  onDislike,
  onOpenDeleteConfirm,
}: IdeaDetailHeroProps) {
  return (
    <>
      <Link
        to="/ideas"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to ideas
      </Link>

      <section className="rounded-4xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
                {idea?.categoryName || "Uncategorized"}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {statusLabel}
              </span>
              {idea?.departmentName && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {idea.departmentName}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl leading-tight font-semibold tracking-tight text-slate-950 lg:text-4xl">
                {isLoading ? "Loading idea..." : ideaTitle}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                {authorLabel}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                {formatAppDateTime(idea?.createdAt || idea?.createdDate)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                {idea?.viewCount ?? 0} views
              </span>
              {idea?.submissionName ? (
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {idea.submissionName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  No submission linked
                </span>
              )}
              {linkedSubmission?.closureDate && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  Closure: {formatAppDateTime(linkedSubmission.closureDate)}
                </span>
              )}
              {linkedSubmission?.finalClosureDate && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  Final closure:{" "}
                  {formatAppDateTime(linkedSubmission.finalClosureDate)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/submit-idea">
                <AppButton variant="secondary">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Add new idea
                </AppButton>
              </Link>

              <AppButton
                variant={isLiked ? "primary" : "ghost"}
                onClick={onLike}
                disabled={isLoading || isVoting}
                aria-pressed={isLiked}
                className={isLiked ? "shadow-sm ring-2 ring-blue-200" : ""}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                {isLiked ? "Liked" : "Like"}
              </AppButton>
              <AppButton
                variant={isDisliked ? "red" : "ghost"}
                onClick={onDislike}
                disabled={isLoading || isVoting}
                aria-pressed={isDisliked}
                className={isDisliked ? "shadow-sm ring-2 ring-red-200" : ""}
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                {isDisliked ? "Disliked" : "Dislike"}
              </AppButton>
              {canComment && (
                <AppButton
                  onClick={() => {
                    document
                      .getElementById("comment-form")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add comment
                </AppButton>
              )}
              {canEditIdea && (
                <Link
                  to={`/ideas/$ideaId/edit`}
                  params={{ ideaId: idea?.id ?? "" }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100"
                >
                  Edit idea
                </Link>
              )}
              {canDeleteIdea && (
                <AppButton
                  variant="red"
                  onClick={onOpenDeleteConfirm}
                  disabled={isDeletingIdea}
                >
                  {isDeletingIdea ? "Deleting..." : "Delete idea"}
                </AppButton>
              )}
              {isPastSubmissionClosure && (
                <div className="w-full rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Editing and deleting are unavailable after the submission
                  closure date.
                </div>
              )}
              {isPastFinalSubmissionClosure && (
                <div className="w-full rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Commenting is unavailable after the final closure date.
                </div>
              )}
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 xl:w-[320px]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Views
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {idea?.viewCount ?? 0}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Comments
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {visibleCommentCount}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Likes
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {thumbsUpCount}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Dislikes
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {thumbsDownCount}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
