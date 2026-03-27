import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, CalendarRange, FileUp, Send } from 'lucide-react'
import type { IdeaSubmitPayload } from '@/types/idea'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput, FormTextarea } from '@/components/forms/FormInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useIdeaCategories } from '@/hooks/useCategories'
import { SectionCard } from '@/components/shared/SectionCard'
import { useSubmitIdea } from '@/hooks/useIdeas'
import { useSubmissions } from '@/hooks/useSubmissions'

const initialForm: IdeaSubmitPayload = {
  title: '',
  description: '',
  hasAcceptedTerms: false,
  categoryId: '',
  submissionId: '',
  isAnonymous: false,
  uploadFiles: [],
}

function formatDateLabel(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function isSubmissionClosed(closureDate?: string) {
  if (!closureDate) return false
  return new Date(closureDate).getTime() < new Date().setHours(0, 0, 0, 0)
}

export default function SubmitIdeaPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categoryData, isLoading: categoriesLoading } =
    useIdeaCategories()
  const {
    data: submissionData,
    isLoading: submissionsLoading,
    error,
  } = useSubmissions()
  const { mutateAsync: submitIdea, isPending } = useSubmitIdea()
  const [form, setForm] = useState<IdeaSubmitPayload>(initialForm)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null)
  const [showSubmitForm, setShowSubmitForm] = useState(false)

  const fileNames = useMemo(
    () => form.uploadFiles?.map((file) => file.name).join(', ') ?? '',
    [form.uploadFiles],
  )
  const categories = useMemo(() => categoryData ?? [], [categoryData])
  const submissions = useMemo(() => submissionData ?? [], [submissionData])

  const selectedSubmission = useMemo(
    () =>
      submissions.find((submission) => submission.id === selectedSubmissionId),
    [selectedSubmissionId, submissions],
  )

  const handleReset = () => {
    setForm(initialForm)
    setAgreedToTerms(false)
    setFeedbackMessage('')
  }

  const openSubmissionDetails = (submissionId: string) => {
    setSelectedSubmissionId(submissionId)
    setShowSubmitForm(false)
    setFeedbackMessage('')
    setForm((prev) => ({ ...prev, submissionId }))
  }

  const handleOpenSubmitForm = () => {
    if (!selectedSubmission) return
    setForm((prev) => ({ ...prev, submissionId: selectedSubmission.id }))
    setFeedbackMessage('')
    setShowSubmitForm(true)
  }

  const handleBackToList = () => {
    setSelectedSubmissionId(null)
    setShowSubmitForm(false)
    handleReset()
  }

  const handleBackToDetails = () => {
    setShowSubmitForm(false)
    setFeedbackMessage('')
  }

  const handleSubmit = async () => {
    setFeedbackMessage('')

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.categoryId ||
      !selectedSubmission
    ) {
      setFeedbackMessage(
        'Please complete all required fields before submitting.',
      )
      return
    }

    if (isSubmissionClosed(selectedSubmission.closureDate)) {
      setFeedbackMessage(
        'This submission window is already closed. Please choose another available submission.',
      )
      return
    }

    if (!agreedToTerms) {
      setFeedbackMessage('You must agree to the Terms and Conditions.')
      return
    }

    const formData = new FormData()
    formData.append('Title', form.title.trim())
    formData.append('Description', form.description.trim())
    formData.append('HasAcceptedTerms', String(agreedToTerms))
    formData.append('CategoryId', form.categoryId)
    formData.append('SubmissionId', selectedSubmission.id)
    formData.append('IsAnonymous', String(form.isAnonymous))

    form.uploadFiles?.forEach((file) => {
      formData.append('Files', file)
    })

    const response = await submitIdea(formData)

    if (!response.success) {
      setFeedbackMessage(response.error ?? 'Unable to submit your idea.')
      return
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['allIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['pagedIdeas'] }),
    ])

    handleReset()
    navigate({ to: '/ideas' })
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Submit Idea"
        description="Browse available submission windows, review the details, then open the idea form when you are ready to submit."
      />

      {!selectedSubmission ? (
        <SectionCard
          title="Available submission windows"
          description="Choose one submission campaign to review its dates and academic year before you continue."
        >
          {error ? (
            <EmptyState
              icon={CalendarRange}
              title="Unable to load submissions"
              description={error.message}
            />
          ) : submissionsLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Loading submission windows...
            </div>
          ) : submissions.length ? (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const closed = isSubmissionClosed(submission.closureDate)
                return (
                  <div
                    key={submission.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">
                          {submission.name}
                        </p>
                        {/* <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {submission.academicYear}
                        </span> */}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${closed ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}
                        >
                          {closed ? 'Closed' : 'Open'}
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

                    <div>
                      <AppButton
                        type="button"
                        variant="secondary"
                        onClick={() => openSubmissionDetails(submission.id)}
                      >
                        View details
                      </AppButton>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarRange}
              title="No submissions available"
              description="Please wait for an administrator or QA manager to create a submission window."
            />
          )}
        </SectionCard>
      ) : !showSubmitForm ? (
        <div className="space-y-6">
          <AppButton type="button" variant="ghost" onClick={handleBackToList}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to submissions
          </AppButton>

          <SectionCard
            title={selectedSubmission.name}
            description="Review the submission window details before opening the submit form."
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {selectedSubmission.academicYear}
                </span> */}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    isSubmissionClosed(selectedSubmission.closureDate)
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isSubmissionClosed(selectedSubmission.closureDate)
                    ? 'Closed for new ideas'
                    : 'Open for submission'}
                </span>
              </div>

              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Closure date
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDateLabel(selectedSubmission.closureDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Final closure date
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDateLabel(selectedSubmission.finalClosureDate)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <AppButton
                  type="button"
                  variant="ghost"
                  onClick={handleBackToList}
                >
                  Back
                </AppButton>
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={handleOpenSubmitForm}
                  disabled={isSubmissionClosed(selectedSubmission.closureDate)}
                >
                  Submit idea
                </AppButton>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : (
        <div className="space-y-6">
          <AppButton
            type="button"
            variant="ghost"
            onClick={handleBackToDetails}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to submission details
          </AppButton>

          <SectionCard
            title="Idea information"
            description={`Submitting to ${selectedSubmission.name}`}
          >
            <div className="grid gap-5">
              <FormField label="Idea title" required>
                <FormInput
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Enter a concise title"
                />
              </FormField>
            </div>

            <div className="mt-5 grid gap-5">
              <FormField
                label="Content"
                required
                hint="Useful for card preview, moderation queue, or search result snippet."
              >
                <FormTextarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="content of the idea"
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            title="Classification & privacy"
            description="Categories are loaded from the live API for the selected submission window."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Category" required>
                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryId: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoriesLoading ? (
                  <p className="text-xs text-slate-500">
                    Loading categories...
                  </p>
                ) : null}
              </FormField>

              <FormField label="Submission window">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">
                    {selectedSubmission.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Closure: {formatDateLabel(selectedSubmission.closureDate)} ·
                    Final closure:{' '}
                    {formatDateLabel(selectedSubmission.finalClosureDate)}
                  </p>
                </div>
              </FormField>

              <FormField label="Anonymous submission">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isAnonymous}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isAnonymous: event.target.checked,
                      }))
                    }
                  />
                  Hide author identity from public idea views.
                </label>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Attachments">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <FileUp className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Choose supporting files
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PDF, DOCX, images, or other allowed formats.
                  </p>
                </div>
                <input
                  multiple
                  type="file"
                  className="hidden"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      attachments: Array.from(event.target.files ?? []),
                    }))
                  }
                />
              </label>
              <p className="mt-4 text-sm text-slate-600">
                {fileNames || 'No files selected yet.'}
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="Terms and Conditions"
            description="Staff must accept the submission terms before an idea can be sent."
          >
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  You confirm that the submitted idea is relevant to university
                  improvement.
                </li>
                <li>
                  You understand that uploaded files may be reviewed by
                  authorised staff.
                </li>
                <li>
                  You accept that comments may remain open until the final
                  closure date.
                </li>
              </ul>
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(event) => setAgreedToTerms(event.target.checked)}
                  className="mt-1"
                />
                I have read and agree to the Terms and Conditions for idea
                submission.
              </label>
            </div>
          </SectionCard>

          {feedbackMessage ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {feedbackMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            <AppButton
              type="button"
              variant="ghost"
              onClick={handleBackToDetails}
            >
              Cancel
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              onClick={handleSubmit}
              disabled={isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {isPending ? 'Submitting...' : 'Submit idea'}
            </AppButton>
          </div>
        </div>
      )}
    </div>
  )
}
