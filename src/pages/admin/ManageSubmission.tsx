import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarRange } from 'lucide-react'
import { ActionButton } from '@/components/app/ActionButton'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput } from '@/components/forms/FormInput'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import {
  useCreateSubmission,
  useDeleteSubmission,
  useSubmissions,
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
  academicYear: '2025-2026',
  closureDate: '',
  finalClosureDate: '',
}

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

export default function ManageSubmissionPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useSubmissions()
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

  const submissions = useMemo(() => data ?? [], [data])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
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
      }

      await refreshSubmissions()
      resetForm()
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
      academicYear: submission.academicYear,
      closureDate: submission.closureDate.slice(0, 10),
      finalClosureDate: submission.finalClosureDate.slice(0, 10),
    })
    setFeedbackMessage('')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return

    try {
      await deleteSubmission(deleteConfirmId)
      await refreshSubmissions()
      setFeedbackMessage('Submission deleted successfully.')
      if (editingId === deleteConfirmId) {
        resetForm()
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
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Manage Submissions"
        description="Create and maintain academic-year submission windows, closure dates, and final closure dates."
      />

      {feedbackMessage ? (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {feedbackMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <SectionCard
          title={editingId ? 'Edit submission' : 'Create submission'}
          description="Use this form to configure the campaign window used by staff when submitting ideas."
        >
          <div className="space-y-4">
            <FormField label="Submission name" required>
              <FormInput
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="e.g., Spring Innovation Campaign"
              />
            </FormField>

            <FormField label="Academic year" required>
              <FormInput
                value={form.academicYear}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    academicYear: event.target.value,
                  }))
                }
                placeholder="e.g., 2025-2026"
              />
            </FormField>

            <FormField label="Closure date" required>
              <FormInput
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

            <div className="flex flex-wrap gap-3 pt-2">
              <AppButton
                type="button"
                variant="secondary"
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating
                  ? 'Saving...'
                  : editingId
                    ? 'Update submission'
                    : 'Create submission'}
              </AppButton>
              <AppButton type="button" variant="ghost" onClick={resetForm}>
                Reset
              </AppButton>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Submission windows"
          description="Review all configured submission campaigns and update them when academic dates change."
        >
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
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const isActiveEdit = editingId === submission.id

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
                        <p className="text-xs text-slate-400">
                          Submission ID: {submission.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          action="edit"
                          onClick={() => handleEdit(submission)}
                          disabled={isActiveEdit}
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
            </div>
          ) : (
            <EmptyState
              icon={CalendarRange}
              title="No submission windows found"
              description="Create the first submission window to let staff submit ideas within a controlled campaign period."
            />
          )}
        </SectionCard>
      </div>

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
