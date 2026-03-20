import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { FileUp, Send } from 'lucide-react'
import type { IdeaSubmitPayload } from '@/types/idea'
import { submissionService } from '@/api'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput, FormTextarea } from '@/components/forms/FormInput'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { useStaffCategories } from '@/hooks/useCategories'
import { useSubmitIdea } from '@/hooks/useIdeas'

const initialForm: IdeaSubmitPayload = {
  title: '',
  brief: '',
  content: '',
  categoryId: '',
  submissionId: '',
  isAnonymous: false,
  attachments: [],
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

export default function SubmitIdeaPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categoryData, isLoading: categoriesLoading } =
    useStaffCategories()
  const { data: submissionData, isLoading: submissionsLoading } = useQuery({
    queryKey: ['activeSubmissions'],
    queryFn: async () => {
      const response = await submissionService.getActiveSubmissions()

      if (!response.success) {
        throw new Error(response.error ?? 'Unable to load active submissions.')
      }

      return response.data
    },
  })
  const { mutateAsync: submitIdea, isPending } = useSubmitIdea()
  const [form, setForm] = useState<IdeaSubmitPayload>(initialForm)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const fileNames = useMemo(
    () => form.attachments.map((file) => file.name).join(', '),
    [form.attachments],
  )
  const categories = useMemo(() => categoryData ?? [], [categoryData])
  const submissions = useMemo(() => submissionData ?? [], [submissionData])

  const handleSubmit = async () => {
    setFeedbackMessage('')

    if (
      !form.title.trim() ||
      !form.brief.trim() ||
      !form.content.trim() ||
      !form.categoryId ||
      !form.submissionId
    ) {
      setFeedbackMessage(
        'Please complete all required fields before submitting.',
      )
      return
    }

    const formData = new FormData()
    formData.append('Text', form.title.trim())
    formData.append(
      'Description',
      `${form.brief.trim()}\n\n${form.content.trim()}`,
    )
    formData.append('CategoryId', form.categoryId)
    formData.append('SubmissionId', form.submissionId)
    formData.append('IsAnonymous', String(form.isAnonymous))

    form.attachments.forEach((file) => {
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
    ])

    setForm(initialForm)
    setFeedbackMessage('Idea submitted successfully.')
    navigate({ to: '/ideas' })
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Submit Idea"
        description="Create a new staff idea and send it directly to the submission API."
      />

      <div className="space-y-6">
        <SectionCard
          title="Idea information"
          description="Core fields expected from the submit-idea flow."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Idea title" required>
              <FormInput
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Enter a concise title"
              />
            </FormField>
            <FormField label="Academic year" required>
              <select
                value={form.submissionId}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    submissionId: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select active submission</option>
                {submissions.map((submission) => (
                  <option key={submission.id} value={submission.id}>
                    {submission.name} · closes{' '}
                    {formatDate(submission.closureDate)}
                  </option>
                ))}
              </select>
              {submissionsLoading ? (
                <p className="text-xs text-slate-500">
                  Loading active submissions...
                </p>
              ) : null}
            </FormField>
          </div>

          <div className="mt-5 grid gap-5">
            <FormField
              label="Brief summary"
              required
              hint="Useful for card preview, moderation queue, or search result snippet."
            >
              <FormTextarea
                value={form.brief}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, brief: event.target.value }))
                }
                placeholder="Short summary of the idea"
              />
            </FormField>
            <FormField label="Idea content" required>
              <FormTextarea
                value={form.content}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, content: event.target.value }))
                }
                placeholder="Describe the problem, proposal, benefits, and expected impact"
              />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard
          title="Classification & privacy"
          description="Categories and submission windows are loaded from the live API."
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
                <p className="text-xs text-slate-500">Loading categories...</p>
              ) : null}
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

        {feedbackMessage ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {feedbackMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <AppButton
            type="button"
            variant="ghost"
            onClick={() => setForm(initialForm)}
          >
            Reset form
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
    </div>
  )
}
