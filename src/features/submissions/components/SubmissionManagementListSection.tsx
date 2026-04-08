import { DatePicker, Input } from 'antd'
import { CalendarRange, Search } from 'lucide-react'
import type { Submission } from '@/types'
import { ActionButton } from '@/components/app/ActionButton'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormField } from '@/components/forms/FormField'
import { FormInput, FormTextarea } from '@/components/forms/FormInput'
import { Modal } from '@/components/shared/Modal'
import { SectionCard } from '@/components/shared/SectionCard'
import { formatAppDateTime, parseDateTimeInputValue } from '@/utils/date'
import {
  getSubmissionLifecycle,
  getSubmissionLifecycleMeta,
  SUBMISSION_MANAGEMENT_PAGE_SIZE_OPTIONS
} from '@/features/submissions/helpers/submission-management'
import type { SubmissionManagementFormState } from '@/features/submissions/helpers/submission-management'

interface SubmissionManagementListSectionProps {
  error: Error | null
  isLoading: boolean
  searchValue: string
  deferredSearch: string
  submissions: Submission[]
  totalSubmissions: number
  currentPage: number
  pageSize: number
  isUpdating: boolean
  isDeleting: boolean
  form: SubmissionManagementFormState
  editingId: string | null
  isFormModalOpen: boolean
  deleteConfirmId: string | null
  onSearchChange: (value: string) => void
  onOpenCreateModal: () => void
  onEditSubmission: (submission: Submission) => void
  onDeleteRequest: (submissionId: string) => void
  onPageChange: (page: number, nextPageSize: number) => void
  onCloseFormModal: () => void
  onFormChange: (form: SubmissionManagementFormState) => void
  onSubmit: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export function SubmissionManagementListSection({
  error,
  isLoading,
  searchValue,
  deferredSearch,
  submissions,
  totalSubmissions,
  currentPage,
  pageSize,
  isUpdating,
  isDeleting,
  form,
  editingId,
  isFormModalOpen,
  deleteConfirmId,
  onSearchChange,
  onOpenCreateModal,
  onEditSubmission,
  onDeleteRequest,
  onPageChange,
  onCloseFormModal,
  onFormChange,
  onSubmit,
  onDeleteConfirm,
  onDeleteCancel,
}: SubmissionManagementListSectionProps) {
  return (
    <>
      <SectionCard>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-4 lg:min-w-152 lg:grid-cols-[minmax(0,1fr)]">
            <label className="block">
              <Input
                id="submission-search"
                name="submission-search"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by submission name or description"
                allowClear
                size="large"
                prefix={<Search className="h-4 w-4 text-slate-400" />}
                className="rounded-xl"
              />
            </label>
          </div>

          <ActionButton
            type="button"
            action="add"
            label="Add submission"
            onClick={onOpenCreateModal}
          />
        </div>
        <p className="mb-5 text-sm text-slate-500">
          {totalSubmissions} submissions available, sorted by most recent final closure date.
        </p>

        {error ? (
          <EmptyState
            icon={CalendarRange}
            title="Unable to load submissions"
            description={error.message}
          />
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Loading submissions...
          </div>
        ) : submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions
              .sort(
                (left, right) =>
                  new Date(right.finalClosureDate).getTime() -
                  new Date(left.finalClosureDate).getTime(),
              )
              .map((submission) => {
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
                          'No description has been added for this submission yet.'}
                      </p>
                      <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p>
                          <span className="font-medium text-slate-800">Closure date:</span>{' '}
                          {formatAppDateTime(submission.closureDate)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-800">Final closure date:</span>{' '}
                          {formatAppDateTime(submission.finalClosureDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        action="edit"
                        onClick={() => onEditSubmission(submission)}
                        disabled={isUpdating}
                      />
                      <ActionButton
                        action="delete"
                        onClick={() => onDeleteRequest(submission.id)}
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
              pageSizeOptions={SUBMISSION_MANAGEMENT_PAGE_SIZE_OPTIONS}
              onChange={onPageChange}
              showTotal={(total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} submissions`
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            <EmptyState
              icon={CalendarRange}
              title={
                deferredSearch
                  ? 'No submissions match this search'
                  : 'No submissions found'
              }
              description={
                deferredSearch
                  ? 'Try another keyword or clear the search.'
                  : 'Create the first submission to let staff submit ideas within a controlled campaign period.'
              }
            />

            {totalSubmissions > 0 &&  (
              <AppPagination
                current={currentPage}
                total={totalSubmissions}
                pageSize={pageSize}
                pageSizeOptions={SUBMISSION_MANAGEMENT_PAGE_SIZE_OPTIONS}
                onChange={onPageChange}
                showTotal={(total) => `${total} total submissions`}
              />
            )}
          </div>
        )}
      </SectionCard>

      <Modal
        isOpen={isFormModalOpen}
        title={editingId ? 'Edit submission' : 'Add submission'}
        description="Configure the submission campaign details and timeline."
        onClose={onCloseFormModal}
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={onCloseFormModal}>
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              form="submission-form"
              variant="secondary"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : editingId ? 'Save changes' : 'Create submission'}
            </AppButton>
          </>
        }
      >
        <form
          id="submission-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <FormField label="Submission name" required>
            <FormInput
              id="submission-name"
              name="submission-name"
              value={form.name}
              onChange={(event) => onFormChange({ ...form, name: event.target.value })}
              placeholder="e.g., Spring Innovation Campaign"
            />
          </FormField>

          <FormField
            label="Description"
            hint="Add context so staff understand what this submission is for."
          >
            <FormTextarea
              id="submission-description"
              name="submission-description"
              value={form.description}
              onChange={(event) =>
                onFormChange({ ...form, description: event.target.value })
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
                  onFormChange({
                    ...form,
                    closureDate: value ? value.format('YYYY-MM-DDTHH:mm') : '',
                  })
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
                  onFormChange({
                    ...form,
                    finalClosureDate: value ? value.format('YYYY-MM-DDTHH:mm') : '',
                  })
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
        message="Are you sure you want to delete this submission? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={isDeleting}
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />
    </>
  )
}
