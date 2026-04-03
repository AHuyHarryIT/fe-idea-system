import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarRange, Search } from 'lucide-react'
import { submissionService } from '@/api/submissions'
import { ActionButton } from '@/components/app/ActionButton'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { FormField } from '@/components/forms/FormField'
import { FormInput } from '@/components/forms/FormInput'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal } from '@/components/shared/Modal'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import {
  useCreateSubmission,
  useDeleteSubmission,
  useUpdateSubmission,
} from '@/hooks/useSubmissions'

interface SubmissionFormState {
  name: string
  academicYear: string
  closureDate: string
  finalClosureDate: string
}

const initialForm: SubmissionFormState = {
  name: '',
  academicYear: new Date().getFullYear().toString(),
  closureDate: '',
  finalClosureDate: '',
}

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = ['10', '20', '50']

function formatDateLabel(value: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

type SubmissionLifecycle = 'open' | 'closed' | 'archived'

function getDateTimestamp(value: string) {
  if (!value) return 0
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function getSubmissionLifecycle(submission: {
  closureDate: string
  finalClosureDate: string
}): SubmissionLifecycle {
  const now = Date.now()
  const closureDate = getDateTimestamp(submission.closureDate)
  const finalClosureDate = getDateTimestamp(submission.finalClosureDate)

  if (finalClosureDate && now > finalClosureDate) {
    return 'archived'
  }

  if (closureDate && now > closureDate) {
    return 'closed'
  }

  return 'open'
}

function getSubmissionLifecycleMeta(lifecycle: SubmissionLifecycle) {
  switch (lifecycle) {
    case 'archived':
      return {
        label: 'Archived',
        className: 'bg-slate-200 text-slate-700',
      }
    case 'closed':
      return {
        label: 'Closed',
        className: 'bg-amber-100 text-amber-800',
      }
    case 'open':
    default:
      return {
        label: 'Open',
        className: 'bg-emerald-100 text-emerald-700',
      }
  }
}

export default function ManageSubmissionPage() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const { data, isLoading, error } = useQuery({
    queryKey: ['submissions', currentPage, pageSize],
    queryFn: async () => {
      const response = await submissionService.getSubmissions({
        pageNumber: currentPage,
        pageSize,
      })

      if (!response.success) {
        throw new Error(response.error ?? 'Unable to load submissions.')
      }

      return response.data
    },
  })
  const { mutateAsync: createSubmission, isPending: isCreating } =
    useCreateSubmission()
  const { mutateAsync: updateSubmission, isPending: isUpdating } =
    useUpdateSubmission()
  const { mutateAsync: deleteSubmission, isPending: isDeleting } =
    useDeleteSubmission()

  const [form, setForm] = useState<SubmissionFormState>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionLifecycle>(
    'all',
  )

  const submissions = useMemo(() => data?.submissions ?? [], [data])
  const totalSubmissions = data?.pagination?.totalCount ?? submissions.length
  const totalPages = Math.max(1, Math.ceil(totalSubmissions / pageSize))
  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return [...submissions]
      .sort(
        (left, right) =>
          getDateTimestamp(right.finalClosureDate) -
          getDateTimestamp(left.finalClosureDate),
      )
      .filter((submission) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          [submission.name, submission.academicYear]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(normalizedSearch),
            )
        const lifecycle = getSubmissionLifecycle(submission)
        const matchesLifecycle =
          statusFilter === 'all' || lifecycle === statusFilter

        return matchesSearch && matchesLifecycle
      })
  }, [searchValue, statusFilter, submissions])

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, isLoading, totalPages])

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setEditingId(null)
    setForm(initialForm)
  }

  const openCreateModal = () => {
    setFeedbackMessage('')
    setEditingId(null)
    setForm(initialForm)
    setIsFormModalOpen(true)
  }

  const refreshSubmissions = async () => {
    await queryClient.invalidateQueries({ queryKey: ['submissions'] })
    await queryClient.invalidateQueries({ queryKey: ['adminOverview'] })
  }

  const validateForm = () => {
    if (
      !form.name.trim() ||
      !form.academicYear.trim() ||
      !form.closureDate ||
      !form.finalClosureDate
    ) {
      setFeedbackMessage('Please complete all submission fields.')
      return false
    }

    if (new Date(form.finalClosureDate) < new Date(form.closureDate)) {
      setFeedbackMessage(
        'Final closure date must be later than or equal to closure date.',
      )
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const payload = {
      name: form.name.trim(),
      academicYear: form.academicYear.trim(),
      closureDate: form.closureDate,
      finalClosureDate: form.finalClosureDate,
    }

    setFeedbackMessage('')

    try {
      if (editingId) {
        await updateSubmission({ id: editingId, request: payload })
        setFeedbackMessage('Submission updated successfully.')
      } else {
        await createSubmission(payload)
        setFeedbackMessage('Submission created successfully.')
        setCurrentPage(1)
      }

      await refreshSubmissions()
      closeFormModal()
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : 'Unable to save submission.',
      )
    }
  }

  const handleEdit = (submission: SubmissionFormState & { id: string }) => {
    setEditingId(submission.id)
    setForm({
      name: submission.name,
      academicYear: String(submission.academicYear),
      closureDate: submission.closureDate.slice(0, 10),
      finalClosureDate: submission.finalClosureDate.slice(0, 10),
    })
    setFeedbackMessage('')
    setIsFormModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return

    try {
      await deleteSubmission(deleteConfirmId)
      await refreshSubmissions()
      setFeedbackMessage('Submission deleted successfully.')
      if (editingId === deleteConfirmId) {
        closeFormModal()
      }
    } catch (err) {
      setFeedbackMessage(
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
        description="Create and maintain academic-year submission windows, closure dates, and final closure dates."
      />

      {feedbackMessage && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {feedbackMessage}
        </div>
      )}

      <SectionCard>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-4 lg:min-w-[38rem] lg:grid-cols-[minmax(0,1.3fr)_220px_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="submission-search"
                name="submission-search"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by submission name or academic year"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <select
              id="submission-status-filter"
              name="submission-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'all' | SubmissionLifecycle,
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">All lifecycle states</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            <ActionButton
              type="button"
              action="ghost"
              label="Reset filters"
              onClick={() => {
                setSearchValue('')
                setStatusFilter('all')
                setCurrentPage(1)
              }}
            />
          </div>

          <ActionButton
            type="button"
            action="add"
            label="Add submission"
            onClick={openCreateModal}
          />
        </div>
        <p className="mb-5 text-sm text-slate-500">
          {searchValue.trim() || statusFilter !== 'all'
            ? `${filteredSubmissions.length} matches on this page, sorted by most recent final closure date.`
            : `${totalSubmissions} submission windows available, sorted by most recent final closure date.`}
        </p>

        {error ? (
          <EmptyState
            icon={CalendarRange}
            title="Unable to load submissions"
            description={error.message}
          />
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Loading submission windows...
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const lifecycleMeta = getSubmissionLifecycleMeta(
                getSubmissionLifecycle(submission),
              )

              return (
                <div
                  key={submission.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">
                          {submission.name}
                        </p>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {submission.academicYear}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${lifecycleMeta.className}`}
                        >
                          {lifecycleMeta.label}
                        </span>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p>
                          <span className="font-medium text-slate-800">
                            Closure date:
                          </span>{' '}
                          {formatDateLabel(submission.closureDate)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-800">
                            Final closure date:
                          </span>{' '}
                          {formatDateLabel(submission.finalClosureDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        action="edit"
                        onClick={() => handleEdit(submission)}
                        disabled={isUpdating}
                      />
                      <ActionButton
                        action="delete"
                        onClick={() => setDeleteConfirmId(submission.id)}
                        disabled={isDeleting}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            <AppPagination
              current={currentPage}
              total={totalSubmissions}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onChange={(page, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize)
                  setCurrentPage(1)
                  return
                }

                setCurrentPage(page)
              }}
              showTotal={(total, range) =>
                searchValue.trim() || statusFilter !== 'all'
                  ? `${filteredSubmissions.length} matches on this page · ${total} total submission windows`
                  : `Showing ${range[0]}-${range[1]} of ${total} submission windows`
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            <EmptyState
              icon={CalendarRange}
              title={
                submissions.length > 0
                  ? 'No submissions match this filter'
                  : 'No submission windows found'
              }
              description={
                submissions.length > 0
                  ? 'Try another keyword or lifecycle filter.'
                  : 'Create the first submission window to let staff submit ideas within a controlled campaign period.'
              }
            />

            {totalSubmissions > 0 && (
              <AppPagination
                current={currentPage}
                total={totalSubmissions}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onChange={(page, nextPageSize) => {
                  if (nextPageSize !== pageSize) {
                    setPageSize(nextPageSize)
                    setCurrentPage(1)
                    return
                  }

                  setCurrentPage(page)
                }}
                showTotal={(total) =>
                  searchValue.trim() || statusFilter !== 'all'
                    ? `${filteredSubmissions.length} matches on this page · ${total} total submission windows`
                    : `${total} total submission windows`
                }
              />
            )}
          </div>
        )}
      </SectionCard>

      <Modal
        isOpen={isFormModalOpen}
        title={editingId ? 'Edit submission' : 'Add submission'}
        description="Configure the submission campaign and academic-year timeline."
        onClose={closeFormModal}
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeFormModal}>
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              form="submission-form"
              variant="secondary"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating
                ? 'Saving...'
                : editingId
                  ? 'Save changes'
                  : 'Create submission'}
            </AppButton>
          </>
        }
      >
        <form
          id="submission-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <FormField label="Submission name" required>
            <FormInput
              id="submission-name"
              name="submission-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="e.g., Spring Innovation Campaign"
            />
          </FormField>

          <FormField label="Academic year" required>
            <FormInput
              id="submission-academic-year"
              name="submission-academic-year"
              value={form.academicYear}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  academicYear: event.target.value,
                }))
              }
              placeholder="e.g., 2026"
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Closure date" required>
              <FormInput
                id="submission-closure-date"
                name="submission-closure-date"
                type="date"
                value={form.closureDate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    closureDate: event.target.value,
                  }))
                }
              />
            </FormField>

            <FormField label="Final closure date" required>
              <FormInput
                id="submission-final-closure-date"
                name="submission-final-closure-date"
                type="date"
                value={form.finalClosureDate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    finalClosureDate: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete Submission"
        message="Are you sure you want to delete this submission window? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
