import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { MessageSquare } from 'lucide-react'
import type { Comment as IdeaComment } from '@/types'
import { ideaService } from '@/api'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { CATEGORY_SELECT_PAGE_SIZE } from '@/constants/category'
import { SUBMISSION_SELECT_PAGE_SIZE } from '@/constants/submission'
import { useIdeaCategories } from '@/hooks/useCategories'
import {
  useAddComment,
  useDeleteIdea,
  useIdeaById,
  useMyIdeas,
  useReviewIdea,
  useUpdateIdea,
  useVoteOnIdea,
} from '@/hooks/useIdeas'
import { useSubmissions } from '@/hooks/useSubmissions'
import { getDateTimestamp } from '@/utils/date'
import { auth } from '@/utils/auth'
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
import { IdeaDetailHero } from '@/features/ideas/components/IdeaDetailHero'
import { IdeaProposalSection } from '@/features/ideas/components/IdeaProposalSection'
import { IdeaCommentsSection } from '@/features/ideas/components/IdeaCommentsSection'
import { IdeaDetailSidebar } from '@/features/ideas/components/IdeaDetailSidebar'
import {
  EditIdeaModal
  
} from '@/features/ideas/components/EditIdeaModal'
import type {EditIdeaFormState} from '@/features/ideas/components/EditIdeaModal';
import {
  getAttachmentUrl,
  getIdeaStatusLabel,
  isPdfAttachment,
  isPdfFile,
  mergeIdeaComments,
  normalizeIdeaStatus,
} from '@/features/ideas/helpers/idea-detail'

interface IdeaDetailPageProps {
  ideaId: string
}

export default function IdeaDetailPage({ ideaId }: IdeaDetailPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const role = auth.getRole()
  const { data: idea, isLoading, error } = useIdeaById(ideaId)
  const { data: categoryData, isLoading: categoriesLoading } = useIdeaCategories({
    pageNumber: 1,
    pageSize: CATEGORY_SELECT_PAGE_SIZE,
  })
  const { data: myIdeasData } = useMyIdeas(undefined, {
    fetchAll: true,
  })
  const { data: submissionData } = useSubmissions({
    pageNumber: 1,
    pageSize: SUBMISSION_SELECT_PAGE_SIZE,
  })
  const { mutateAsync: addComment, isPending: isCommenting } = useAddComment()
  const { mutateAsync: voteOnIdea, isPending: isVoting } = useVoteOnIdea()
  const { mutateAsync: updateIdea, isPending: isUpdatingIdea } = useUpdateIdea()
  const { mutateAsync: deleteIdea, isPending: isDeletingIdea } = useDeleteIdea()
  const { mutateAsync: reviewIdea, isPending: isReviewing } = useReviewIdea()
  const [commentText, setCommentText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [postedComments, setPostedComments] = useState<IdeaComment[]>([])
  const [reviewReason, setReviewReason] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [fileValidationMessage, setFileValidationMessage] = useState('')
  const [editForm, setEditForm] = useState<EditIdeaFormState>({
    title: '',
    description: '',
    categoryId: '',
    isAnonymous: false,
    uploadFiles: [],
  })
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
  const visibleComments = useMemo(
    () => mergeIdeaComments(idea?.comments ?? [], postedComments),
    [idea?.comments, postedComments],
  )
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
  const categories = useMemo(
    () =>
      Array.isArray(categoryData?.categories)
        ? categoryData.categories.filter((category) => category.id)
        : [],
    [categoryData],
  )
  const linkedSubmission = useMemo(() => {
    if (!idea) {
      return undefined
    }

    return (submissionData?.submissions ?? []).find(
      (submission) =>
        submission.id === idea.submissionId ||
        submission.name === idea.submissionName,
    )
  }, [idea, submissionData?.submissions])
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
  const canEditIdea = isOwnIdea && !isPastSubmissionClosure
  const canDeleteIdea =
    (role === 'admin' || isOwnIdea) && !isPastSubmissionClosure

  useEffect(() => {
    setPostedComments([])
    setSelectedAttachmentId(null)
  }, [ideaId])

  useEffect(() => {
    if (!idea || !isEditModalOpen) {
      return
    }

    setEditForm((previousForm) => {
      if (previousForm.categoryId) {
        return previousForm
      }

      const matchingCategory = categories.find(
        (category) => category.name === idea.categoryName,
      )

      if (!matchingCategory) {
        return previousForm
      }

      return {
        ...previousForm,
        categoryId: matchingCategory.id,
      }
    })
  }, [categories, idea, isEditModalOpen])

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

  const refreshIdeaListQueries = async () => {
    await Promise.all([
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

  const openEditIdeaModal = () => {
    if (!idea) {
      return
    }

    const matchingCategory = categories.find(
      (category) => category.name === idea.categoryName,
    )

    setEditForm({
      title: ideaTitle,
      description: idea.description?.trim() ?? '',
      categoryId: idea.categoryId ?? matchingCategory?.id ?? '',
      isAnonymous: idea.isAnonymous,
      uploadFiles: [],
    })
    setFileValidationMessage('')
    setIsEditModalOpen(true)
  }

  const closeEditIdeaModal = () => {
    setIsEditModalOpen(false)
    setFileValidationMessage('')
    setEditForm({
      title: '',
      description: '',
      categoryId: '',
      isAnonymous: false,
      uploadFiles: [],
    })
  }

  const handleEditFileChange = (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? [])

    if (!selectedFiles.length) {
      setEditForm((previousForm) => ({ ...previousForm, uploadFiles: [] }))
      setFileValidationMessage('')
      return
    }

    const invalidFile = selectedFiles.find((file) => !isPdfFile(file))

    if (invalidFile) {
      setEditForm((previousForm) => ({ ...previousForm, uploadFiles: [] }))
      setFileValidationMessage(
        `File '${invalidFile.name}' is invalid. Only PDF files are allowed.`,
      )
      return
    }

    setEditForm((previousForm) => ({
      ...previousForm,
      uploadFiles: selectedFiles,
    }))
    setFileValidationMessage('')
  }

  const handleUpdateIdea = async () => {
    if (!idea) {
      return
    }

    if (
      !editForm.title.trim() ||
      !editForm.description.trim() ||
      !editForm.categoryId
    ) {
      appNotification.warning('Please complete all required fields before saving.')
      return
    }

    if (fileValidationMessage) {
      appNotification.warning(fileValidationMessage)
      return
    }

    const formData = new FormData()
    formData.append('Title', editForm.title.trim())
    formData.append('Description', editForm.description.trim())
    formData.append('CategoryId', editForm.categoryId)
    formData.append('IsAnonymous', String(editForm.isAnonymous))
    editForm.uploadFiles.forEach((file) => {
      formData.append('UploadedFiles', file)
    })

    const response = await updateIdea({ ideaId: idea.id, formData })

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to update this idea.')
      return
    }

    await refreshIdeaQueries()
    closeEditIdeaModal()
    appNotification.success('Idea updated successfully.')
  }

  const handleDeleteIdea = async () => {
    const response = await deleteIdea(ideaId)

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to delete this idea.')
      return
    }

    setIsDeleteConfirmOpen(false)
    queryClient.removeQueries({ queryKey: ['idea', ideaId], exact: true })
    await refreshIdeaListQueries()
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
      <IdeaDetailHero
        idea={idea}
        isLoading={isLoading}
        ideaTitle={ideaTitle}
        authorLabel={authorLabel}
        statusLabel={statusLabel}
        linkedSubmission={linkedSubmission}
        isLiked={isLiked}
        isDisliked={isDisliked}
        canComment={canComment}
        canEditIdea={canEditIdea}
        canDeleteIdea={canDeleteIdea}
        isVoting={isVoting}
        isUpdatingIdea={isUpdatingIdea}
        isDeletingIdea={isDeletingIdea}
        isPastSubmissionClosure={isPastSubmissionClosure}
        isPastFinalSubmissionClosure={isPastFinalSubmissionClosure}
        visibleCommentCount={visibleCommentCount}
        thumbsUpCount={thumbsUpCount}
        thumbsDownCount={thumbsDownCount}
        onLike={() => void handleLike()}
        onDislike={() => void handleDislike()}
        onOpenEditIdea={openEditIdeaModal}
        onOpenDeleteConfirm={() => setIsDeleteConfirmOpen(true)}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_340px]">
        <div className="space-y-6">
          <IdeaProposalSection
            isLoading={isLoading}
            ideaDescription={ideaDescription}
            attachments={attachments}
            selectedAttachmentId={selectedAttachmentId}
            selectedAttachmentUrl={selectedAttachmentUrl}
            canPreviewSelectedAttachment={canPreviewSelectedAttachment}
            onSelectAttachment={setSelectedAttachmentId}
            getAttachmentUrl={getAttachmentUrl}
          />
          <IdeaCommentsSection
            visibleCommentCount={visibleCommentCount}
            canComment={canComment}
            commentText={commentText}
            isAnonymous={isAnonymous}
            isCommenting={isCommenting}
            visibleComments={visibleComments}
            onCommentTextChange={setCommentText}
            onCommentAnonymousChange={setIsAnonymous}
            onSubmitComment={() => void handleCommentSubmit()}
          />
        </div>

        <IdeaDetailSidebar
          idea={idea}
          authorLabel={authorLabel}
          statusLabel={statusLabel}
          linkedSubmission={linkedSubmission}
          thumbsUpCount={thumbsUpCount}
          thumbsDownCount={thumbsDownCount}
          visibleCommentCount={visibleCommentCount}
          canReview={canReview}
          isApprovedStatus={isApprovedStatus}
          isReviewing={isReviewing}
          reviewReason={reviewReason}
          onReviewReasonChange={setReviewReason}
          onReview={(approved) => void handleReview(approved)}
        />
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

      <EditIdeaModal
        isOpen={isEditModalOpen}
        isUpdatingIdea={isUpdatingIdea}
        categoriesLoading={categoriesLoading}
        categories={categories}
        editForm={editForm}
        fileValidationMessage={fileValidationMessage}
        onClose={closeEditIdeaModal}
        onSave={() => void handleUpdateIdea()}
        onFormChange={setEditForm}
        onEditFileChange={handleEditFileChange}
      />

    </div>
  )
}
