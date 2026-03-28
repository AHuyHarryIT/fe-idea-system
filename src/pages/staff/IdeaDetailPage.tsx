import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormTextarea } from '@/components/forms/FormInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import {
  useAddComment,
  useIdeaById,
  useReviewIdea,
  useVoteOnIdea,
} from '@/hooks/useIdeas'
import { auth } from '@/lib/auth'

interface IdeaDetailPageProps {
  ideaId: string
}

function formatDate(dateString?: string) {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

function getCommentText(comment: { text?: string; content?: string }) {
  return comment.text || comment.content || 'No comment content available.'
}

export default function IdeaDetailPage({ ideaId }: IdeaDetailPageProps) {
  const queryClient = useQueryClient()
  const role = auth.getRole()
  const { data: idea, isLoading, error } = useIdeaById(ideaId)
  const { mutateAsync: addComment, isPending: isCommenting } = useAddComment()
  const { mutateAsync: voteOnIdea, isPending: isVoting } = useVoteOnIdea()
  const { mutateAsync: reviewIdea, isPending: isReviewing } = useReviewIdea()
  const [commentText, setCommentText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [reviewReason, setReviewReason] = useState('')
  const [reviewFeedbackMessage, setReviewFeedbackMessage] = useState('')

  const thumbStatus = idea?.thumbStatus ?? -1
  const isLiked = thumbStatus === 1
  const isDisliked = thumbStatus === 0
  const canComment = !isLoading && (idea?.canComment ?? true)
  const canReview = role === 'qa_manager' || role === 'admin'

  const refreshIdeaQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] }),
      queryClient.invalidateQueries({ queryKey: ['allIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['qaManagerIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['qaCoordinatorIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['adminIdeas'] }),
    ])
  }

  const handleLike = async () => {
    setFeedbackMessage('')

    const response = await voteOnIdea({
      ideaId,
      request: { isThumbsUp: true },
    })

    if (!response.success) {
      setFeedbackMessage(response.error ?? 'Unable to register your vote.')
      return
    }

    await refreshIdeaQueries()
    setFeedbackMessage(
      isLiked
        ? 'Your like has been removed.'
        : isDisliked
          ? 'Your vote has been changed to like.'
          : 'Thanks! Your like has been recorded.',
    )
  }

  const handleDislike = async () => {
    setFeedbackMessage('')

    const response = await voteOnIdea({
      ideaId,
      request: { isThumbsUp: false },
    })

    if (!response.success) {
      setFeedbackMessage(response.error ?? 'Unable to register your vote.')
      return
    }

    await refreshIdeaQueries()
    setFeedbackMessage(
      isDisliked
        ? 'Your dislike has been removed.'
        : isLiked
          ? 'Your vote has been changed to dislike.'
          : 'Thanks! Your dislike has been recorded.',
    )
  }

  const handleCommentSubmit = async () => {
    if (!canComment) {
      setFeedbackMessage('Commenting is currently unavailable for this idea.')
      return
    }

    if (!commentText.trim()) {
      setFeedbackMessage('Please write a comment before posting.')
      return
    }

    setFeedbackMessage('')

    const response = await addComment({
      ideaId,
      request: {
        content: commentText.trim(),
        isAnonymous,
      },
    })

    if (!response.success) {
      setFeedbackMessage(response.error ?? 'Unable to post your comment.')
      return
    }

    setCommentText('')
    setIsAnonymous(false)
    await refreshIdeaQueries()
    setFeedbackMessage('Comment posted successfully.')
  }

  const handleReview = async (isApproved: boolean) => {
    if (!canReview) {
      return
    }

    if (!isApproved && !reviewReason.trim()) {
      setReviewFeedbackMessage('Please provide a rejection reason.')
      return
    }

    setReviewFeedbackMessage('')

    const response = await reviewIdea({
      ideaId,
      request: {
        isApproved,
        rejectionReason: isApproved ? undefined : reviewReason.trim(),
      },
    })

    if (!response.success) {
      setReviewFeedbackMessage(
        response.error ??
          `Unable to ${isApproved ? 'approve' : 'reject'} this idea.`,
      )
      return
    }

    if (!isApproved) {
      setReviewReason('')
    }

    await refreshIdeaQueries()
    setReviewFeedbackMessage(
      isApproved
        ? 'Idea approved successfully.'
        : 'Idea rejected successfully.',
    )
  }

  if (error) {
    return (
      <div className="w-full px-6 py-6 lg:px-8">
        <PageHeader title="Idea Detail" />
        <EmptyState
          icon={MessageSquare}
          title="Unable to load idea"
          description={error.message}
        />
      </div>
    )
  }

  return (
    <div className="w-full px-6 py-6 lg:px-8">
      <PageHeader
        title={isLoading ? 'Loading idea...' : 'Idea Details'}
        description={''}
        actions={
          <>
            <Link to="/submit-idea">
              <AppButton variant="secondary">
                <Lightbulb className="mr-2 h-4 w-4" />
                Add new idea
              </AppButton>
            </Link>

            <AppButton
              variant={isLiked ? 'primary' : 'ghost'}
              onClick={handleLike}
              disabled={isLoading || isVoting}
              aria-pressed={isLiked}
              className={isLiked ? 'ring-2 ring-blue-200' : ''}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {isLiked ? 'Liked' : 'Like'}
            </AppButton>
            <AppButton
              variant={isDisliked ? 'red' : 'ghost'}
              onClick={handleDislike}
              disabled={isLoading || isVoting}
              aria-pressed={isDisliked}
              className={isDisliked ? 'ring-2 ring-red-200' : ''}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              {isDisliked ? 'Disliked' : 'Dislike'}
            </AppButton>
            <AppButton
              onClick={() => {
                document
                  .getElementById('comment-form')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              disabled={!canComment}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Add comment
            </AppButton>
          </>
        }
      />

      {!canComment ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Commenting is currently unavailable for this idea.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,2.2fr)_380px]">
        <div className="space-y-6">
          <SectionCard title="Main content" description="">
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Idea Title
                </p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  {isLoading
                    ? 'Loading text...'
                    : idea?.title || 'No text provided'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Description
                </p>
                <p className="mt-2">
                  {isLoading
                    ? 'Loading description...'
                    : idea?.description || 'No description available.'}
                </p>
                {/* <p className="mt-2">
                  {idea?.attachment ? (
                    <a
                      href={idea.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View attachment
                    </a>
                  ) : null}
                </p> */}
              </div>
            </div>
          </SectionCard>
          {canReview ? (
            <SectionCard
              title="Review decision"
              description="Approve the idea for publication or reject it with feedback."
            >
              {reviewFeedbackMessage ? (
                <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  {reviewFeedbackMessage}
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Moderator controls
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Current status:{' '}
                      {idea?.status?.replace(/_/g, ' ') ?? 'Pending review'}
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
                      onChange={(event) => setReviewReason(event.target.value)}
                      placeholder="Explain why the idea was rejected or what must be updated."
                      disabled={isReviewing}
                    />
                  </FormField>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <AppButton
                    type="button"
                    onClick={() => handleReview(true)}
                    disabled={isReviewing}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isReviewing ? 'Saving...' : 'Approve idea'}
                  </AppButton>
                  <AppButton
                    type="button"
                    variant="red"
                    onClick={() => handleReview(false)}
                    disabled={isReviewing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isReviewing ? 'Saving...' : 'Reject idea'}
                  </AppButton>
                </div>
              </div>
            </SectionCard>
          ) : null}
          <SectionCard
            title="Comments"
            description="View existing comments and post a new one."
          >
            {feedbackMessage ? (
              <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {feedbackMessage}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_360px]">
              {idea?.comments && idea.comments.length > 0 ? (
                <div className="space-y-4">
                  {idea.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"
                    >
                      <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
                        <span>
                          {comment.isAnonymous
                            ? 'Anonymous'
                            : comment.authorName ||
                              comment.createdBy ||
                              'Unknown author'}
                        </span>
                        <span>
                          {formatDate(comment.createdAt || comment.createdDate)}
                        </span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap">
                        {getCommentText(comment)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  No comments yet. Start the discussion below.
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <FormField label="Write a comment">
                  <FormTextarea
                    id="comment-form"
                    name="comment-form"
                    placeholder={
                      canComment
                        ? 'Enter comment content'
                        : 'Commenting is unavailable for this idea'
                    }
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    disabled={!canComment}
                  />
                </FormField>

                <label className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    id="comment-anonymous"
                    name="comment-anonymous"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(event) => setIsAnonymous(event.target.checked)}
                    disabled={!canComment}
                  />
                  Post anonymously
                </label>

                <AppButton
                  className="mt-4 w-full"
                  disabled={isCommenting || !canComment}
                  onClick={handleCommentSubmit}
                >
                  {isCommenting ? 'Posting...' : 'Post comment'}
                </AppButton>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Meta information"
            description="Category, author, dates, and engagement metrics."
          >
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                Category: {idea?.categoryName || 'Uncategorized'}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                Author:{' '}
                {idea?.isAnonymous
                  ? 'Anonymous'
                  : idea?.authorName || 'Unknown author'}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                Status: {idea?.status?.replace(/_/g, ' ') || 'Pending'}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                Created: {formatDate(idea?.createdAt || idea?.createdDate)}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                Views: {idea?.viewCount ?? 0}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                Upvotes: {idea?.thumbsUpCount ?? 0}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                Downvotes: {idea?.thumbsDownCount ?? 0}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                Comments: {idea?.commentCount ?? idea?.comments?.length ?? 0}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
