import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { submissionService } from '@/api/submissions'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  useCreateSubmission,
  useDeleteSubmission,
  useUpdateSubmission,
} from '@/hooks/useSubmissions'
import { formatDateTimeInputValue } from '@/utils/date'
import { appNotification } from '@/utils/notifications'
import type { Submission } from '@/types'
import { SubmissionManagementListSection } from '@/features/submissions/components/SubmissionManagementListSection'
import {
  buildSubmissionEditForm,
  buildSubmissionManagementPayload,
  DEFAULT_SUBMISSION_MANAGEMENT_PAGE_SIZE,
  initialSubmissionManagementForm,
  validateSubmissionManagementForm
} from '@/features/submissions/helpers/submission-management'
import type { SubmissionManagementFormState } from '@/features/submissions/helpers/submission-management'

export default function SubmissionManagementPage() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_SUBMISSION_MANAGEMENT_PAGE_SIZE)
  const [searchValue, setSearchValue] = useState('')
  const deferredSearch = useDeferredValue(searchValue.trim())
  const { data, isLoading, error } = useQuery({
    queryKey: ['submissions', currentPage, pageSize, deferredSearch],
    queryFn: async () => {
      const response = await submissionService.getSubmissions({
        pageNumber: currentPage,
        pageSize,
        searchTerm: deferredSearch || undefined,
      })

      if (!response.success) {
        throw new Error(response.error ?? 'Unable to load submissions.')
      }

      return response.data
    },
  })
  const { mutateAsync: createSubmission, isPending: isCreating } = useCreateSubmission()
  const { mutateAsync: updateSubmission, isPending: isUpdating } = useUpdateSubmission()
  const { mutateAsync: deleteSubmission, isPending: isDeleting } = useDeleteSubmission()

  const [form, setForm] = useState<SubmissionManagementFormState>(
    initialSubmissionManagementForm,
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const submissions = useMemo(() => data?.submissions ?? [], [data])
  const totalSubmissions = data?.pagination?.totalCount ?? submissions.length
  const totalPages = Math.max(1, Math.ceil(totalSubmissions / pageSize))

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, isLoading, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch])

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setEditingId(null)
    setForm(initialSubmissionManagementForm)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(initialSubmissionManagementForm)
    setIsFormModalOpen(true)
  }

  const refreshSubmissions = async () => {
    await queryClient.invalidateQueries({ queryKey: ['submissions'] })
    await queryClient.invalidateQueries({ queryKey: ['adminOverview'] })
  }

  const handleSubmit = async () => {
    const validationMessage = validateSubmissionManagementForm(form)
    if (validationMessage) {
      appNotification.warning(validationMessage)
      return
    }

    const payload = buildSubmissionManagementPayload(form)

    try {
      if (editingId) {
        await updateSubmission({ id: editingId, request: payload })
        appNotification.success('Submission updated successfully.')
      } else {
        await createSubmission(payload)
        appNotification.success('Submission created successfully.')
        setCurrentPage(1)
      }

      await refreshSubmissions()
      closeFormModal()
    } catch (err) {
      appNotification.error(
        err instanceof Error ? err.message : 'Unable to save submission.',
      )
    }
  }

  const handleEdit = (submission: Submission) => {
    setEditingId(submission.id)
    setForm(buildSubmissionEditForm(submission, formatDateTimeInputValue))
    setIsFormModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return

    try {
      await deleteSubmission(deleteConfirmId)
      await refreshSubmissions()
      appNotification.success('Submission deleted successfully.')
      if (editingId === deleteConfirmId) {
        closeFormModal()
      }
    } catch (err) {
      appNotification.error(
        err instanceof Error ? err.message : 'Unable to delete submission.',
      )
    } finally {
      setDeleteConfirmId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Manage Submissions"
        description="Create and maintain submissions, descriptions, closure dates, and final closure dates."
      />

      <SubmissionManagementListSection
        error={error}
        isLoading={isLoading}
        searchValue={searchValue}
        deferredSearch={deferredSearch}
        submissions={submissions}
        totalSubmissions={totalSubmissions}
        currentPage={currentPage}
        pageSize={pageSize}
        isUpdating={isCreating || isUpdating}
        isDeleting={isDeleting}
        form={form}
        editingId={editingId}
        isFormModalOpen={isFormModalOpen}
        deleteConfirmId={deleteConfirmId}
        onSearchChange={setSearchValue}
        onOpenCreateModal={openCreateModal}
        onEditSubmission={handleEdit}
        onDeleteRequest={setDeleteConfirmId}
        onPageChange={(page, nextPageSize) => {
          if (nextPageSize !== pageSize) {
            setPageSize(nextPageSize)
            setCurrentPage(1)
            return
          }

          setCurrentPage(page)
        }}
        onCloseFormModal={closeFormModal}
        onFormChange={setForm}
        onSubmit={() => void handleSubmit()}
        onDeleteConfirm={() => void handleDeleteConfirm()}
        onDeleteCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
