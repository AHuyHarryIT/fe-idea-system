import { ArrowLeft, FileUp, Send } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput, FormTextarea } from '@/components/forms/FormInput'
import { SectionCard } from '@/components/shared/SectionCard'
import { formatAppDateTime } from '@/utils/date'
import type { IdeaCategory, IdeaSubmitPayload, Submission } from '@/types'

interface IdeaSubmissionFormSectionProps {
  selectedSubmission: Submission
  form: IdeaSubmitPayload
  categories: IdeaCategory[]
  categoriesLoading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  fileNames: string
  fileValidationMessage: string
  agreedToTerms: boolean
  isPending: boolean
  onBackToDetails: () => void
  onFormChange: (nextForm: IdeaSubmitPayload) => void
  onAgreedToTermsChange: (value: boolean) => void
  onFileChange: (files: FileList | null) => void
  onSubmit: () => void
}

export function IdeaSubmissionFormSection({
  selectedSubmission,
  form,
  categories,
  categoriesLoading,
  fileInputRef,
  fileNames,
  fileValidationMessage,
  agreedToTerms,
  isPending,
  onBackToDetails,
  onFormChange,
  onAgreedToTermsChange,
  onFileChange,
  onSubmit,
}: IdeaSubmissionFormSectionProps) {
  return (
    <div className="space-y-6">
      <AppButton type="button" variant="ghost" onClick={onBackToDetails}>
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
              id="idea-title"
              name="title"
              value={form.title}
              onChange={(event) => onFormChange({ ...form, title: event.target.value })}
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
              id="idea-description"
              name="description"
              value={form.description}
              onChange={(event) =>
                onFormChange({ ...form, description: event.target.value })
              }
              placeholder="content of the idea"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        title="Classification & privacy"
        description="Categories are loaded from the live API for the selected submission."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Category" required>
            <select
              id="idea-category"
              name="categoryId"
              value={form.categoryId}
              onChange={(event) => onFormChange({ ...form, categoryId: event.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesLoading &&  (
              <p className="text-xs text-slate-500">Loading categories...</p>
            )}
          </FormField>

          <FormField label="Submission">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{selectedSubmission.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                Closure: {formatAppDateTime(selectedSubmission.closureDate)} · Final closure:{' '}
                {formatAppDateTime(selectedSubmission.finalClosureDate)}
              </p>
            </div>
          </FormField>

          <FormField label="Anonymous submission">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                id="idea-is-anonymous"
                name="isAnonymous"
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(event) =>
                  onFormChange({ ...form, isAnonymous: event.target.checked })
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
              <p className="text-sm font-medium text-slate-900">Choose supporting files</p>
              <p className="mt-1 text-xs text-slate-500">PDF files only.</p>
            </div>
            <input
              ref={fileInputRef}
              id="idea-uploaded-files"
              name="uploadedFiles"
              multiple
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(event) => onFileChange(event.target.files)}
            />
          </label>
          <p className="mt-4 text-sm text-slate-600">{fileNames || 'No files selected yet.'}</p>
          {fileValidationMessage &&  (
            <p className="mt-3 text-sm text-red-600">{fileValidationMessage}</p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Terms and Conditions"
        description="Staff must accept the submission terms before an idea can be sent."
      >
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <ul className="list-disc space-y-2 pl-5">
            <li>You confirm that the submitted idea is relevant to university improvement.</li>
            <li>You understand that uploaded files may be reviewed by authorised staff.</li>
            <li>You accept that comments may remain open until the final closure date.</li>
          </ul>
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <input
              id="idea-has-accepted-terms"
              name="hasAcceptedTerms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(event) => onAgreedToTermsChange(event.target.checked)}
              className="mt-1"
            />
            I have read and agree to the Terms and Conditions for idea submission.
          </label>
        </div>
      </SectionCard>

      <div className="flex flex-wrap justify-end gap-3">
        <AppButton type="button" variant="ghost" onClick={onBackToDetails}>
          Cancel
        </AppButton>
        <AppButton type="button" variant="secondary" onClick={onSubmit} disabled={isPending}>
          <Send className="mr-2 h-4 w-4" />
          {isPending ? 'Submitting...' : 'Submit idea'}
        </AppButton>
      </div>
    </div>
  )
}
