import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { DatePicker, Input } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarRange, Search } from 'lucide-react'
import { submissionService } from '@/api/submissions'
import { ActionButton } from '@/components/app/ActionButton'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { FormField } from '@/components/forms/FormField'
import { FormInput, FormTextarea } from '@/components/forms/FormInput'
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
import {
  formatAppDateTime,
  formatDateTimeInputValue,
  getDateTimestamp,
  getDateYear,
  parseDateTimeInputValue,
} from '@/lib/date'
import { appNotification } from '@/lib/notifications'
import type { Submission } from '@/types'

interface SubmissionFormState {
  name: string
  description: string
  closureDate: string
  finalClosureDate: string
}

const initialForm: SubmissionFormState = {
  name: '',
  description: '',
  closureDate: '',
  finalClosureDate: '',
}

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = ['10', '20', '50']

function getSubmissionAcademicYearFallback(closureDate: string) {
  return getDateYear(closureDate)
}

type SubmissionLifecycle = 'open' | 'closed' | 'archived'

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
  const { mutateAsync: createSubmission, isPending: isCreating } =
    useCreateSubmission()
  const { mutateAsync: updateSubmission, isPending: isUpdating } =
    useUpdateSubmission()
  const { mutateAsync: deleteSubmission, isPending: isDeleting } =
    useDeleteSubmission()

  const [form, setForm] = useState<SubmissionFormState>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionLifecycle>(
    'all',
  )

  const submissions = useMemo(() => data?.submissions ?? [], [data])
  const totalSubmissions = data?.pagination?.totalCount ?? submissions.length
  const totalPages = Math.max(1, Math.ceil(totalSubmissions / pageSize))
  const filteredSubmissions = useMemo(() => {
    return [...submissions]
      .sort(
        (left, right) =>
          getDateTimestamp(right.finalClosureDate) -
          getDateTimestamp(left.finalClosureDate),
      )
      .filter((submission) => {
        const lifecycle = getSubmissionLifecycle(submission)
        const matchesLifecycle =
          statusFilter === 'all' || lifecycle === statusFilter

        return matchesLifecycle
      })
  }, [statusFilter, submissions])

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, isLoading, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch, statusFilter])

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setEditingId(null)
    setForm(initialForm)
  }

  const openCreateModal = () => {
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
      !form.closureDate ||
      !form.finalClosureDate
    ) {
      appNotification.warning('Please complete all submission fields.')
      return false
    }

    if (new Date(form.finalClosureDate) < new Date(form.closureDate)) {
      appNotification.warning(
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
      description: form.description.trim() || undefined,
      academicYear: getSubmissionAcademicYearFallback(form.closureDate),
      closureDate: form.closureDate,
      finalClosureDate: form.finalClosureDate,
    }

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
    setForm({
      name: submission.name,
      description: submission.description || '',
      closureDate: formatDateTimeInputValue(submission.closureDate),
      finalClosureDate: formatDateTimeInputValue(submission.finalClosureDate),
    })
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
        description="Create and maintain submission windows, descriptions, closure dates, and final closure dates."
      />

      <SectionCard>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-4 lg:min-w-[38rem] lg:grid-cols-[minmax(0,1.3fr)_220px_auto]">
            <label className="block">
              <Input
                id="submission-search"
                name="submission-search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by submission name or description"
                allowClear
                size="large"
                prefix={<Search className="h-4 w-4 text-slate-400" />}
                className="rounded-xl"
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
          {statusFilter !== 'all'
            ? `${filteredSubmissions.length} lifecycle matches on this page, sorted by most recent final closure date.`
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
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${lifecycleMeta.className}`}
                        >
                          {lifecycleMeta.label}
                        </span>
                      </div>
                      <p className="max-w-3xl text-sm text-slate-600">
                        {submission.description?.trim() ||
                          'No description has been added for this submission window yet.'}
                      </p>
                      <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p>
                          <span className="font-medium text-slate-800">
                            Closure date:
                          </span>{' '}
                          {formatAppDateTime(submission.closureDate)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-800">
                            Final closure date:
                          </span>{' '}
                          {formatAppDateTime(submission.finalClosureDate)}
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
                statusFilter !== 'all'
                  ? `${filteredSubmissions.length} lifecycle matches on this page · ${total} total matching submission windows`
                  : `Showing ${range[0]}-${range[1]} of ${total} submission windows`
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            <EmptyState
              icon={CalendarRange}
              title={
                statusFilter !== 'all'
                  ? 'No submission windows match this lifecycle filter'
                  : deferredSearch
                    ? 'No submission windows match this search'
                    : 'No submission windows found'
              }
              description={
                statusFilter !== 'all'
                  ? 'Try another lifecycle filter or clear the filters.'
                  : deferredSearch
                    ? 'Try another keyword or clear the search.'
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
                  statusFilter !== 'all'
                    ? `${filteredSubmissions.length} lifecycle matches on this page · ${total} total matching submission windows`
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
        description="Configure the submission campaign details and timeline."
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

          <FormField
            label="Description"
            hint="Add context so staff understand what this submission window is for."
          >
            <FormTextarea
              id="submission-description"
              name="submission-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="e.g., Ideas for improving student services during the spring campaign."
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Closure date and time"
              hint="Pick the exact time when idea submissions should stop."
              required
            >
              <DatePicker
                id="submission-closure-date"
                value={parseDateTimeInputValue(form.closureDate)}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    closureDate: value
                      ? value.format('YYYY-MM-DDTHH:mm')
                      : '',
                  }))
                }
                allowClear
                showTime={{ format: 'HH:mm', minuteStep: 1 }}
                format="YYYY-MM-DD HH:mm"
                size="large"
                className="w-full"
              />
            </FormField>

            <FormField
              label="Final closure date and time"
              hint="Pick the exact time when late comments and follow-up close."
              required
            >
              <DatePicker
                id="submission-final-closure-date"
                value={parseDateTimeInputValue(form.finalClosureDate)}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    finalClosureDate: value
                      ? value.format('YYYY-MM-DDTHH:mm')
                      : '',
                  }))
                }
                allowClear
                showTime={{ format: 'HH:mm', minuteStep: 1 }}
                format="YYYY-MM-DD HH:mm"
                size="large"
                className="w-full"
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
