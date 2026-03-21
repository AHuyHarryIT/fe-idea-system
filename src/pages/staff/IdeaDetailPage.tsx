import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Lightbulb, MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormTextarea } from '@/components/forms/FormInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { useAddComment, useIdeaById, useVoteOnIdea } from '@/hooks/useIdeas'

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

export default function IdeaDetailPage({ ideaId }: IdeaDetailPageProps) {
  const queryClient = useQueryClient()
  const { data: idea, isLoading, error } = useIdeaById(ideaId)
  const { mutateAsync: addComment, isPending: isCommenting } = useAddComment()
  const { mutateAsync: voteOnIdea, isPending: isVoting } = useVoteOnIdea()
  const [commentText, setCommentText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const canLike = !isLoading
  const canComment = !isLoading && (idea?.canComment ?? true)

  const refreshIdeaQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] }),
      queryClient.invalidateQueries({ queryKey: ['allIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] }),
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
    setFeedbackMessage('Thanks! Your vote has been recorded.')
  }
  const handleDislike = async () => {
    setFeedbackMessage('')

    const response = await voteOnIdea({
      ideaId,
      request: { isThumbsDown: true },
    })

    if (!response.success) {
      setFeedbackMessage(response.error ?? 'Unable to register your vote.')
      return
    }

    await refreshIdeaQueries()
    setFeedbackMessage('Thanks! Your vote has been recorded.')
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
        text: commentText.trim(),
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
        title={isLoading ? 'Loading idea...' : idea?.text || 'Idea Detail'}
        description={
          isLoading
            ? 'Fetching idea details from the API.'
            : idea?.description || 'Idea detail loaded from the idea endpoint.'
        }
        actions={
          <>
            <Link to="/submit-idea">
              <AppButton variant="secondary">
                <Lightbulb className="mr-2 h-4 w-4" />
                Add new idea
              </AppButton>
            </Link>

            <AppButton
              variant="ghost"
              onClick={handleLike}
              disabled={isLoading || isVoting || !canLike}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Like
            </AppButton>
            <AppButton variant="red" onClick={handleDislike}>
              <ThumbsDown className="mr-2 h-4 w-4" />
              Dislike
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
          <SectionCard
            title="Main content"
            description="Live content from the idea detail endpoint."
          >
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Idea text
                </p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  {isLoading
                    ? 'Loading text...'
                    : idea?.text || 'No text provided'}
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
              </div>
            </div>
          </SectionCard>

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
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap">{comment.text}</p>
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
