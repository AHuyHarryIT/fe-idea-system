import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Eye,
  ExternalLink,
  FileText,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from 'lucide-react'
import type { Comment as IdeaComment } from '@/types'
import { ideaService } from '@/api'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormTextarea } from '@/components/forms/FormInput'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { SUBMISSION_SELECT_PAGE_SIZE } from '@/constants/submission'
import {
  useAddComment,
  useDeleteIdea,
  useIdeaById,
  useMyIdeas,
  useReviewIdea,
  useVoteOnIdea,
} from '@/hooks/useIdeas'
import { useSubmissions } from '@/hooks/useSubmissions'
import { formatAppDateTime, getDateTimestamp } from '@/lib/date'
import { auth } from '@/lib/auth'
import {
  getIdeaVoteFeedbackMessage,
  getNextIdeaVoteState,
  getResolvedIdeaVoteStatus,
  IDEA_VOTE_STATUS_DISLIKED,
  IDEA_VOTE_STATUS_LIKED,
  resolveIdeaVoteStateFromCounts,
  setStoredIdeaVoteStatus,
} from '@/lib/idea-vote-status'
import { appNotification } from '@/lib/notifications'

interface IdeaDetailPageProps {
  ideaId: string
}

function getCommentText(comment: { text?: string; content?: string }) {
  return comment.text || comment.content || 'No comment content available.'
}

function getIdeaStatusLabel(status?: string) {
  return status?.replace(/_/g, ' ') || 'Pending review'
}

function normalizeIdeaStatus(status?: string) {
  return status?.toLowerCase().replace(/\s+/g, '_')
}

function getAttachmentUrl(url?: string) {
  return url?.trim() ? encodeURI(url) : ''
}

function isPdfAttachment(fileName?: string, fileUrl?: string) {
  const normalizedName = fileName?.toLowerCase() ?? ''
  const normalizedUrl = fileUrl?.toLowerCase() ?? ''

  return normalizedName.endsWith('.pdf') || normalizedUrl.includes('.pdf')
}

export default function IdeaDetailPage({ ideaId }: IdeaDetailPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const role = auth.getRole()
  const { data: idea, isLoading, error } = useIdeaById(ideaId)
  const { data: myIdeasData } = useMyIdeas(undefined, {
    fetchAll: true,
    enabled: role !== 'admin',
  })
  const { data: submissionData } = useSubmissions({
    pageNumber: 1,
    pageSize: SUBMISSION_SELECT_PAGE_SIZE,
  })
  const { mutateAsync: addComment, isPending: isCommenting } = useAddComment()
  const { mutateAsync: voteOnIdea, isPending: isVoting } = useVoteOnIdea()
  const { mutateAsync: deleteIdea, isPending: isDeletingIdea } = useDeleteIdea()
  const { mutateAsync: reviewIdea, isPending: isReviewing } = useReviewIdea()
  const [commentText, setCommentText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [postedComments, setPostedComments] = useState<IdeaComment[]>([])
  const [reviewReason, setReviewReason] = useState('')
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null)
  const [currentThumbStatus, setCurrentThumbStatus] = useState(
    getResolvedIdeaVoteStatus(ideaId),
  )
  const [thumbsUpCount, setThumbsUpCount] = useState(0)
  const [thumbsDownCount, setThumbsDownCount] = useState(0)

  const thumbStatus = currentThumbStatus
  const isLiked = thumbStatus === IDEA_VOTE_STATUS_LIKED
  const isDisliked = thumbStatus === IDEA_VOTE_STATUS_DISLIKED
  const canReview =
    role === 'admin' || role === 'qa_manager' || role === 'qa_coordinator'
  const myIdeas = useMemo(() => {
    if (Array.isArray(myIdeasData?.ideas)) {
      return myIdeasData.ideas
    }

    if (Array.isArray(myIdeasData?.items)) {
      return myIdeasData.items
    }

    return []
  }, [myIdeasData])
  const visibleComments = useMemo(() => {
    const apiComments = idea?.comments ?? []
    const mergedComments = [...postedComments]

    for (const comment of apiComments) {
      if (!mergedComments.some((postedComment) => postedComment.id === comment.id)) {
        mergedComments.push(comment)
      }
    }

    return mergedComments
  }, [idea?.comments, postedComments])
  const visibleCommentCount = Math.max(
    idea?.commentCount ?? 0,
    visibleComments.length,
  )
  const ideaTitle = idea?.title || idea?.text || 'Untitled idea'
  const ideaDescription =
    idea?.description?.trim() || 'No description available for this idea.'
  const attachments = idea?.attachments ?? []
  const selectedAttachment =
    attachments.find((attachment) => attachment.id === selectedAttachmentId) ??
    attachments.at(0)
  const selectedAttachmentUrl = getAttachmentUrl(selectedAttachment?.fileUrl)
  const canPreviewSelectedAttachment = Boolean(
    selectedAttachmentUrl &&
      isPdfAttachment(selectedAttachment?.fileName, selectedAttachment?.fileUrl),
  )
  const authorLabel = idea?.isAnonymous
    ? 'Anonymous'
    : idea?.authorName || 'Unknown author'
  const statusLabel = getIdeaStatusLabel(idea?.status)
  const normalizedStatus = normalizeIdeaStatus(idea?.status)
  const isApprovedStatus = normalizedStatus === 'approved'
  const isOwnIdea = useMemo(
    () => myIdeas.some((myIdea) => myIdea.id === ideaId),
    [ideaId, myIdeas],
  )
  const closedSubmissionIds = useMemo(() => {
    const currentTimestamp = Date.now()

    return new Set(
      (submissionData?.submissions ?? [])
        .filter((submission) => getDateTimestamp(submission.closureDate) < currentTimestamp)
        .map((submission) => submission.id),
    )
  }, [submissionData?.submissions])
  const closedSubmissionNames = useMemo(() => {
    const currentTimestamp = Date.now()

    return new Set(
      (submissionData?.submissions ?? [])
        .filter((submission) => getDateTimestamp(submission.closureDate) < currentTimestamp)
        .map((submission) => submission.name),
    )
  }, [submissionData?.submissions])
  const finalClosedSubmissionIds = useMemo(() => {
    const currentTimestamp = Date.now()

    return new Set(
      (submissionData?.submissions ?? [])
        .filter(
          (submission) =>
            getDateTimestamp(submission.finalClosureDate) < currentTimestamp,
        )
        .map((submission) => submission.id),
    )
  }, [submissionData?.submissions])
  const finalClosedSubmissionNames = useMemo(() => {
    const currentTimestamp = Date.now()

    return new Set(
      (submissionData?.submissions ?? [])
        .filter(
          (submission) =>
            getDateTimestamp(submission.finalClosureDate) < currentTimestamp,
        )
        .map((submission) => submission.name),
    )
  }, [submissionData?.submissions])
  const isPastSubmissionClosure = Boolean(
    idea &&
      ((idea.submissionId && closedSubmissionIds.has(idea.submissionId)) ||
        (idea.submissionName && closedSubmissionNames.has(idea.submissionName))),
  )
  const isPastFinalSubmissionClosure = Boolean(
    idea &&
      ((idea.submissionId && finalClosedSubmissionIds.has(idea.submissionId)) ||
        (idea.submissionName &&
          finalClosedSubmissionNames.has(idea.submissionName))),
  )
  const canComment =
    !isLoading &&
    !isPastFinalSubmissionClosure &&
    ((idea?.canComment ?? true) || isOwnIdea)
  const canDeleteIdea =
    (role === 'admin' || isOwnIdea) && !isPastSubmissionClosure

  useEffect(() => {
    setPostedComments([])
    setSelectedAttachmentId(null)
  }, [ideaId])

  useEffect(() => {
    setCurrentThumbStatus(getResolvedIdeaVoteStatus(ideaId, idea?.thumbStatus))
    setThumbsUpCount(idea?.thumbsUpCount ?? 0)
    setThumbsDownCount(idea?.thumbsDownCount ?? 0)
  }, [ideaId, idea?.thumbStatus, idea?.thumbsUpCount, idea?.thumbsDownCount])

  useEffect(() => {
    if (!attachments.length) {
      setSelectedAttachmentId(null)
      return
    }

    setSelectedAttachmentId((currentAttachmentId) =>
      attachments.some((attachment) => attachment.id === currentAttachmentId)
        ? currentAttachmentId
        : attachments[0]?.id ?? null,
    )
  }, [attachments])

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
    const previousThumbStatus = currentThumbStatus

    const response = await voteOnIdea({
      ideaId,
      request: { isThumbsUp: true },
    })

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to register your vote.')
      return
    }

    let nextVoteState = getNextIdeaVoteState(
      previousThumbStatus,
      true,
      thumbsUpCount,
      thumbsDownCount,
    )

    const refreshedIdeaResponse = await ideaService.getIdeaById(ideaId)

    if (refreshedIdeaResponse.success && refreshedIdeaResponse.data) {
      nextVoteState = resolveIdeaVoteStateFromCounts(
        true,
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
    setStoredIdeaVoteStatus(ideaId, nextVoteState.nextThumbStatus)

    await refreshIdeaQueries()
    appNotification.success(
      getIdeaVoteFeedbackMessage(
        true,
        nextVoteState.nextThumbStatus,
        previousThumbStatus,
      ),
    )
  }

  const handleDislike = async () => {
    const previousThumbStatus = currentThumbStatus

    const response = await voteOnIdea({
      ideaId,
      request: { isThumbsUp: false },
    })

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to register your vote.')
      return
    }

    let nextVoteState = getNextIdeaVoteState(
      previousThumbStatus,
      false,
      thumbsUpCount,
      thumbsDownCount,
    )

    const refreshedIdeaResponse = await ideaService.getIdeaById(ideaId)

    if (refreshedIdeaResponse.success && refreshedIdeaResponse.data) {
      nextVoteState = resolveIdeaVoteStateFromCounts(
        false,
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
    setStoredIdeaVoteStatus(ideaId, nextVoteState.nextThumbStatus)

    await refreshIdeaQueries()
    appNotification.success(
      getIdeaVoteFeedbackMessage(
        false,
        nextVoteState.nextThumbStatus,
        previousThumbStatus,
      ),
    )
  }

  const handleCommentSubmit = async () => {
    if (!canComment) {
      appNotification.warning('Commenting is currently unavailable for this idea.')
      return
    }

    if (!commentText.trim()) {
      appNotification.warning('Please write a comment before posting.')
      return
    }

    const response = await addComment({
      ideaId,
      request: {
        content: commentText.trim(),
        isAnonymous,
      },
    })

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to post your comment.')
      return
    }

    setCommentText('')
    setIsAnonymous(false)
    if (response.data) {
      setPostedComments((prev) => [response.data!, ...prev])
    }
    await refreshIdeaQueries()
    appNotification.success('Comment posted successfully.')
  }

  const handleReview = async (isApproved: boolean) => {
    if (!canReview) {
      return
    }

    if (!isApproved && !reviewReason.trim()) {
      appNotification.warning('Please provide a rejection reason.')
      return
    }

    const response = await reviewIdea({
      ideaId,
      request: {
        isApproved,
        rejectionReason: isApproved ? undefined : reviewReason.trim(),
      },
    })

    if (!response.success) {
      appNotification.error(
        response.error === 'HTTP 403'
          ? 'The backend is still denying review permission for this account.'
          : response.error ??
              `Unable to ${isApproved ? 'approve' : 'reject'} this idea.`,
      )
      return
    }

    if (!isApproved) {
      setReviewReason('')
    }

    await refreshIdeaQueries()
    appNotification.success(
      isApproved
        ? 'Idea approved successfully.'
        : 'Idea rejected successfully.',
    )
  }

  const handleDeleteIdea = async () => {
    const response = await deleteIdea(ideaId)

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to delete this idea.')
      return
    }

    await refreshIdeaQueries()
    setIsDeleteConfirmOpen(false)
    appNotification.success('Idea deleted successfully.')
    void navigate({ to: '/ideas' })
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Idea detail
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Unable to load idea
          </h1>
        </div>
        <EmptyState
          icon={MessageSquare}
          title="Unable to load idea"
          description={error.message}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-6 lg:px-8">
      <Link
        to="/ideas"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to ideas
      </Link>

      <section className="rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
                {idea?.categoryName || 'Uncategorized'}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {statusLabel}
              </span>
              {idea?.departmentName ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {idea.departmentName}
                </span>
              ) : null}
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 lg:text-4xl">
                {isLoading ? 'Loading idea...' : ideaTitle}
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
                <Eye className="h-4 w-4 text-slate-400" />
                {idea?.viewCount ?? 0} views
              </span>
              {idea?.submissionName ? (
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {idea.submissionName}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
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
                className={isLiked ? 'ring-2 ring-blue-200 shadow-sm' : ''}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                {isLiked ? 'Liked' : 'Like'}
              </AppButton>
              <AppButton
                variant={isDisliked ? 'red' : 'ghost'}
                onClick={handleDislike}
                disabled={isLoading || isVoting}
                aria-pressed={isDisliked}
                className={isDisliked ? 'ring-2 ring-red-200 shadow-sm' : ''}
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                {isDisliked ? 'Disliked' : 'Dislike'}
              </AppButton>
              {canComment && (
                <AppButton
                  onClick={() => {
                    document
                      .getElementById('comment-form')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add comment
                </AppButton>
              )}
              {canDeleteIdea ? (
                <AppButton
                  variant="red"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={isDeletingIdea}
                >
                  {isDeletingIdea ? 'Deleting...' : 'Delete idea'}
                </AppButton>
              ) : null}
              {isPastSubmissionClosure ? (
                <div className="w-full rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Editing and deleting are unavailable after the submission closure date.
                </div>
              ) : null}
              {isPastFinalSubmissionClosure ? (
                <div className="w-full rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Commenting is unavailable after the final closure date.
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 xl:w-[320px]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Views
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {idea?.viewCount ?? 0}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Comments
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {visibleCommentCount}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Likes
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {thumbsUpCount}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Dislikes
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {thumbsDownCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_340px]">
        <div className="space-y-6">
          <SectionCard
            title="Proposal"
          >
            <div className="space-y-5 text-sm leading-7 text-slate-600">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {isLoading ? 'Loading description...' : ideaDescription}
                </p>
              </div>

              {attachments.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Attached documents
                  </p>
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={`flex flex-col gap-4 rounded-[22px] border bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                          attachment.id === selectedAttachment?.id
                            ? 'border-blue-200 ring-2 ring-blue-100'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {attachment.fileName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {attachment.fileSize || 'Attachment available'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <AppButton
                            variant={
                              attachment.id === selectedAttachment?.id
                                ? 'primary'
                                : 'ghost'
                            }
                            onClick={() => setSelectedAttachmentId(attachment.id)}
                            disabled={!attachment.fileUrl}
                          >
                            View document
                          </AppButton>
                          {attachment.fileUrl ? (
                            <AppButton
                              variant="ghost"
                              type="button"
                              onClick={() =>
                                window.open(
                                  getAttachmentUrl(attachment.fileUrl),
                                  '_blank',
                                  'noopener,noreferrer',
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open tab
                            </AppButton>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedAttachment ? (
                    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {selectedAttachment.fileName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {selectedAttachment.fileSize || 'Document preview'}
                          </p>
                        </div>
                        {selectedAttachment.fileUrl ? (
                          <AppButton
                            variant="ghost"
                            type="button"
                            onClick={() =>
                              window.open(
                                selectedAttachmentUrl,
                                '_blank',
                                'noopener,noreferrer',
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open in new tab
                          </AppButton>
                        ) : null}
                      </div>

                      {selectedAttachment.fileUrl ? (
                        canPreviewSelectedAttachment ? (
                          <iframe
                            title={selectedAttachment.fileName}
                            src={selectedAttachmentUrl}
                            className="h-[680px] w-full border-0 bg-slate-50"
                          />
                        ) : (
                          <div className="px-5 py-8">
                            <EmptyState
                              icon={FileText}
                              title="Preview is not available for this file type"
                              description="Open the document in a new tab to view it."
                            />
                          </div>
                        )
                      ) : (
                        <div className="px-5 py-8">
                          <EmptyState
                            icon={FileText}
                            title="Document link unavailable"
                            description="This attachment does not include a file URL from the backend."
                          />
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </SectionCard>
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
                      onChange={(event) => setCommentText(event.target.value)}
                    />
                  </FormField>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 text-sm text-slate-700">
                      <input
                        id="comment-anonymous"
                        name="comment-anonymous"
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(event) => setIsAnonymous(event.target.checked)}
                      />
                      Post anonymously
                    </label>

                    <AppButton
                      disabled={isCommenting}
                      onClick={handleCommentSubmit}
                    >
                      {isCommenting ? 'Posting...' : 'Post comment'}
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
                            ? 'Anonymous'
                            : comment.authorName ||
                              comment.createdBy ||
                              'Unknown author'}
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
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Idea snapshot"
            description="Review the key metadata, activity totals, and current moderation state."
          >
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-[22px] bg-slate-50 p-4">
                Category: {idea?.categoryName || 'Uncategorized'}
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                Author: {authorLabel}
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                Status: {statusLabel}
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                Created:{' '}
                {formatAppDateTime(idea?.createdAt || idea?.createdDate)}
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

          {canReview ? (
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
                    <p className="font-medium text-slate-900">
                      Moderator controls
                    </p>
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
                      onChange={(event) => setReviewReason(event.target.value)}
                      placeholder="Explain why the idea was rejected or what must be updated."
                      disabled={isReviewing}
                    />
                  </FormField>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {!isApprovedStatus ? (
                    <AppButton
                      type="button"
                      onClick={() => handleReview(true)}
                      disabled={isReviewing}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {isReviewing ? 'Saving...' : 'Approve idea'}
                    </AppButton>
                  ) : null}
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
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete idea"
        message={`Delete "${ideaTitle}"? This action cannot be undone.`}
        confirmText="Delete idea"
        isDangerous
        isLoading={isDeletingIdea}
        onConfirm={() => void handleDeleteIdea()}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />

    </div>
  )
}
