import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  CalendarDays,
  Eye,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import type { Idea } from '@/api'
import { AppButton } from '@/components/app/AppButton'
import { useVoteOnIdea } from '@/hooks/useIdeas'

interface IdeaCardProps {
  idea: Idea
}

function normalizeRoleLabel(value?: string) {
  if (!value) return 'Staff'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getThumbStatusMeta(thumbStatus?: number) {
  if (thumbStatus === 1) {
    return {
      label: 'Liked',
      className: 'bg-blue-50 text-blue-700',
      upvoteClassName: 'text-blue-700',
      downvoteClassName: 'text-slate-400',
    }
  }

  if (thumbStatus === 0) {
    return {
      label: 'Disliked',
      className: 'bg-rose-50 text-rose-700',
      upvoteClassName: 'text-slate-400',
      downvoteClassName: 'text-rose-700',
    }
  }

  return {
    label: 'No reaction',
    className: 'bg-slate-100 text-slate-500',
    upvoteClassName: 'text-slate-500',
    downvoteClassName: 'text-slate-500',
  }
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: voteOnIdea, isPending: isVoting } = useVoteOnIdea()
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [currentThumbStatus, setCurrentThumbStatus] = useState(idea.thumbStatus ?? -1)
  const [thumbsUpCount, setThumbsUpCount] = useState(idea.thumbsUpCount ?? 0)
  const [thumbsDownCount, setThumbsDownCount] = useState(idea.thumbsDownCount ?? 0)
  const authorLabel = idea.isAnonymous
    ? 'Anonymous'
    : (idea.authorName ?? 'Pending')
  const roleLabel = normalizeRoleLabel((idea as Idea & { authorRole?: string }).authorRole)
  const thumbStatusMeta = getThumbStatusMeta(currentThumbStatus)
  const isLiked = currentThumbStatus === 1
  const isDisliked = currentThumbStatus === 0

  useEffect(() => {
    setCurrentThumbStatus(idea.thumbStatus ?? -1)
    setThumbsUpCount(idea.thumbsUpCount ?? 0)
    setThumbsDownCount(idea.thumbsDownCount ?? 0)
    setFeedbackMessage('')
  }, [idea.id])

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
    setFeedbackMessage('')
    const previousThumbStatus = currentThumbStatus

    const response = await voteOnIdea({
      ideaId: idea.id,
      request: { isThumbsUp },
    })

    if (!response.success) {
      setFeedbackMessage(response.error ?? 'Unable to register your vote.')
      return
    }

    if (isThumbsUp) {
      if (previousThumbStatus === 1) {
        setCurrentThumbStatus(-1)
        setThumbsUpCount((value) => Math.max(0, value - 1))
      } else if (previousThumbStatus === 0) {
        setCurrentThumbStatus(1)
        setThumbsDownCount((value) => Math.max(0, value - 1))
        setThumbsUpCount((value) => value + 1)
      } else {
        setCurrentThumbStatus(1)
        setThumbsUpCount((value) => value + 1)
      }
    } else if (previousThumbStatus === 0) {
      setCurrentThumbStatus(-1)
      setThumbsDownCount((value) => Math.max(0, value - 1))
    } else if (previousThumbStatus === 1) {
      setCurrentThumbStatus(0)
      setThumbsUpCount((value) => Math.max(0, value - 1))
      setThumbsDownCount((value) => value + 1)
    } else {
      setCurrentThumbStatus(0)
      setThumbsDownCount((value) => value + 1)
    }

    await refreshIdeaQueries()
    if (isThumbsUp) {
      setFeedbackMessage(
        previousThumbStatus === 1
          ? 'Your like has been removed.'
          : previousThumbStatus === 0
            ? 'Your vote has been changed to like.'
            : 'Thanks! Your like has been recorded.',
      )
      return
    }

    setFeedbackMessage(
      previousThumbStatus === 0
        ? 'Your dislike has been removed.'
        : previousThumbStatus === 1
          ? 'Your vote has been changed to dislike.'
          : 'Thanks! Your dislike has been recorded.',
    )
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }} className="block flex-1">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {idea.categoryName}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${thumbStatusMeta.className}`}
              >
                {thumbStatusMeta.label}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {idea.text || 'Untitled idea'}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {idea.departmentName ??
                  'Department information will come from API.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <div>
                <span>Author: {authorLabel}</span>
                {!idea.isAnonymous ? (
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {roleLabel}
                  </span>
                ) : null}
              </div>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {idea.createdAt ?? 'Waiting for API date'}
              </span>
            </div>
          </div>
        </Link>
        <div className="flex shrink-0 flex-col gap-4 md:items-end">
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 md:justify-end">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {idea.viewCount ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className={`h-4 w-4 ${thumbStatusMeta.upvoteClassName}`} />
              {thumbsUpCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsDown className={`h-4 w-4 ${thumbStatusMeta.downvoteClassName}`} />
              {thumbsDownCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {idea.commentCount ?? 0}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <AppButton
              type="button"
              variant={isLiked ? 'primary' : 'ghost'}
              onClick={() => handleVote(true)}
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
              onClick={() => handleVote(false)}
              disabled={isVoting}
              aria-pressed={isDisliked}
              className={isDisliked ? 'ring-2 ring-red-200 shadow-sm' : ''}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              {isDisliked ? 'Disliked' : 'Dislike'}
            </AppButton>
            <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
              <AppButton type="button" variant="ghost">
                View details
              </AppButton>
            </Link>
          </div>
        </div>
      </div>
      {feedbackMessage ? (
        <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {feedbackMessage}
        </p>
      ) : null}
    </article>
  )
}
