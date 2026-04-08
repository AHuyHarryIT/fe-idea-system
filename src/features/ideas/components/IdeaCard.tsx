import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Tag,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import type { Idea } from '@/types'
import { ideaService } from '@/api'
import { AppButton } from '@/components/app/AppButton'
import { useVoteOnIdea } from '@/hooks/useIdeas'
import { formatAppDateTime } from '@/utils/date'
import {
  getIdeaVoteFeedbackMessage,
  getNextIdeaVoteState,
  getResolvedIdeaVoteStatus,
  IDEA_VOTE_STATUS_DISLIKED,
  IDEA_VOTE_STATUS_LIKED,
  resolveIdeaVoteStateFromCounts,
  setStoredIdeaVoteStatus,
} from '@/utils/idea-vote-status'
import { appNotification } from '@/utils/notifications'

interface IdeaCardProps {
  idea: Idea
}

function normalizeRoleLabel(value?: string) {
  if (!value) return 'Staff'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getReviewStatusMeta(status?: string) {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_')

  switch (normalizedStatus) {
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-50 text-emerald-700',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-rose-50 text-rose-700',
      }
    case 'submitted':
    case 'under_review':
    case 'pending':
    case 'pending_review':
    case 'awaiting_review':
    default:
      return {
        label: status?.replace(/_/g, ' ') || 'Pending review',
        className: 'bg-amber-50 text-amber-700',
      }
  }
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutateAsync: voteOnIdea, isPending: isVoting } = useVoteOnIdea()
  const [currentThumbStatus, setCurrentThumbStatus] = useState(
    getResolvedIdeaVoteStatus(idea.id, idea.thumbStatus),
  )
  const [thumbsUpCount, setThumbsUpCount] = useState(idea.thumbsUpCount ?? 0)
  const [thumbsDownCount, setThumbsDownCount] = useState(idea.thumbsDownCount ?? 0)
  const authorLabel = idea.isAnonymous
    ? 'Anonymous'
    : (idea.authorName ?? 'Pending')
  const roleLabel = normalizeRoleLabel((idea as Idea & { authorRole?: string }).authorRole)
  const isLiked = currentThumbStatus === IDEA_VOTE_STATUS_LIKED
  const isDisliked = currentThumbStatus === IDEA_VOTE_STATUS_DISLIKED
  const title = idea.title || idea.text || 'Untitled idea'
  const description =
    idea.description?.trim() ||
    'This idea does not include a summary yet. Open the detail view to review the full submission context.'
  const createdLabel = formatAppDateTime(
    idea.createdAt ?? idea.createdDate,
    'Awaiting publish date',
  )
  const categoryLabel = idea.categoryName.trim() || 'Uncategorized'
  const reviewStatusMeta = getReviewStatusMeta(idea.status)

  const openIdeaDetail = () => {
    void navigate({
      to: '/ideas/$ideaId',
      params: { ideaId: idea.id },
    })
  }

  useEffect(() => {
    setCurrentThumbStatus(getResolvedIdeaVoteStatus(idea.id, idea.thumbStatus))
    setThumbsUpCount(idea.thumbsUpCount ?? 0)
    setThumbsDownCount(idea.thumbsDownCount ?? 0)
  }, [idea.id, idea.thumbStatus, idea.thumbsUpCount, idea.thumbsDownCount])

  const refreshIdeaQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['idea', idea.id] }),
      queryClient.invalidateQueries({ queryKey: ['allIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['qaManagerIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['qaCoordinatorIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['adminIdeas'] }),
    ])
  }

  const handleVote = async (isThumbsUp: boolean) => {
    const previousThumbStatus = currentThumbStatus

    const response = await voteOnIdea({
      ideaId: idea.id,
      request: { isThumbsUp },
    })

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to register your vote.')
      return
    }

    let nextVoteState = getNextIdeaVoteState(
      previousThumbStatus,
      isThumbsUp,
      thumbsUpCount,
      thumbsDownCount,
    )

    const refreshedIdeaResponse = await ideaService.getIdeaById(idea.id)

    if (refreshedIdeaResponse.success && refreshedIdeaResponse.data) {
      nextVoteState = resolveIdeaVoteStateFromCounts(
        isThumbsUp,
        previousThumbStatus,
        thumbsUpCount,
        thumbsDownCount,
        refreshedIdeaResponse.data.thumbsUpCount ?? nextVoteState.nextThumbsUpCount,
        refreshedIdeaResponse.data.thumbsDownCount ?? nextVoteState.nextThumbsDownCount,
      )
    }

    setCurrentThumbStatus(nextVoteState.nextThumbStatus)
    setThumbsUpCount(nextVoteState.nextThumbsUpCount)
    setThumbsDownCount(nextVoteState.nextThumbsDownCount)
    setStoredIdeaVoteStatus(idea.id, nextVoteState.nextThumbStatus)

    await refreshIdeaQueries()
    appNotification.success(
      getIdeaVoteFeedbackMessage(
        isThumbsUp,
        nextVoteState.nextThumbStatus,
        previousThumbStatus,
      ),
    )
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openIdeaDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openIdeaDetail()
        }
      }}
      className="group cursor-pointer rounded-[30px] border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_44px_rgba(37,99,235,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              {categoryLabel}
            </span>
            {idea.status &&  (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${reviewStatusMeta.className}`}
              >
                {reviewStatusMeta.label}
              </span>
            )}
          </div>

          <div className="block space-y-3">
            <h3 className="text-xl font-semibold leading-8 tracking-tight text-slate-950 transition group-hover:text-blue-700">
              {title}
            </h3>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-slate-400" />
              {authorLabel}
            </span>
            {!idea.isAnonymous &&  (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {roleLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" />
              {categoryLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              {idea.departmentName || 'Department unavailable'}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {createdLabel}
            </span>
          </div>
        </div>

        <div className="shrink-0 space-y-4 xl:w-65">
          <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Views
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {idea.viewCount ?? 0}
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Comments
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {idea.commentCount ?? 0}
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Likes
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {thumbsUpCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Dislikes
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {thumbsDownCount}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <AppButton
              type="button"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                openIdeaDetail()
              }}
            >
              Open details
            </AppButton>
            <AppButton
              type="button"
              variant={isLiked ? 'primary' : 'ghost'}
              onClick={(event) => {
                event.stopPropagation()
                void handleVote(true)
              }}
              disabled={isVoting}
              aria-pressed={isLiked}
              className={isLiked ? 'ring-2 ring-blue-200 shadow-sm' : ''}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {isLiked ? 'Liked' : 'Like'}
            </AppButton>
            <AppButton
              type="button"
              variant={isDisliked ? 'red' : 'ghost'}
              onClick={(event) => {
                event.stopPropagation()
                void handleVote(false)
              }}
              disabled={isVoting}
              aria-pressed={isDisliked}
              className={isDisliked ? 'ring-2 ring-red-200 shadow-sm' : ''}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              {isDisliked ? 'Disliked' : 'Dislike'}
            </AppButton>
          </div>
        </div>
      </div>
    </article>
  )
}
