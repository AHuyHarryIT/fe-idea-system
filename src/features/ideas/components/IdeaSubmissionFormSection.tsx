import type { UIEvent } from "react"
import { ArrowLeft, Send } from "lucide-react"
import { AppButton } from "@/components/app/AppButton"
import { SectionCard } from "@/components/shared/SectionCard"
import { formatAppDateTime } from "@/utils/date"
import type { IdeaCategory, IdeaSubmitPayload, Submission } from "@/types"
import { IdeaFormFields } from "@/features/ideas/components/IdeaFormFields"
import type { IdeaFormData } from "./IdeaFormFields"

interface IdeaSubmissionFormSectionProps {
  selectedSubmission: Submission
  form: IdeaSubmitPayload
  categories: IdeaCategory[]
  categoriesLoading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  fileValidationMessage: string
  agreedToTerms: boolean
  isPending: boolean
  onBackToDetails: () => void
  onCategoryPopupScroll: (event: UIEvent<HTMLDivElement>) => void
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
  fileValidationMessage,
  agreedToTerms,
  isPending,
  onBackToDetails,
  onCategoryPopupScroll,
  onFormChange,
  onAgreedToTermsChange,
  onFileChange,
  onSubmit,
}: IdeaSubmissionFormSectionProps) {
  const handleFormChange = (formData: IdeaFormData) => {
    onFormChange({
      ...form,
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId,
      isAnonymous: formData.isAnonymous,
      uploadFiles: formData.uploadFiles,
    })
  }

  return (
    <div className="space-y-6">
      <AppButton type="button" variant="ghost" onClick={onBackToDetails}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to submission details
      </AppButton>

      <IdeaFormFields
        editForm={{
          title: form.title,
          description: form.description,
          categoryId: form.categoryId,
          isAnonymous: form.isAnonymous,
          uploadFiles: form.uploadFiles,
        }}
        categories={categories}
        categoriesLoading={categoriesLoading}
        fileInputRef={fileInputRef}
        fileValidationMessage={fileValidationMessage}
        onFormChange={handleFormChange}
        onFileChange={onFileChange}
        onCategoryPopupScroll={onCategoryPopupScroll}
        mode="submit"
        submissionName={selectedSubmission.name}
      />

      {/* Submission Details */}
      <SectionCard title="Submission details">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-medium text-slate-900">
            {selectedSubmission.name}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Closure: {formatAppDateTime(selectedSubmission.closureDate)} ·
            Final closure:{" "}
            {formatAppDateTime(selectedSubmission.finalClosureDate)}
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
              You understand that uploaded files may be reviewed by authorised
              staff.
            </li>
            <li>
              You accept that comments may remain open until the final closure
              date.
            </li>
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
            I have read and agree to the Terms and Conditions for idea
            submission.
          </label>
        </div>
      </SectionCard>

      <div className="flex flex-wrap justify-end gap-3">
        <AppButton type="button" variant="ghost" onClick={onBackToDetails}>
          Cancel
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          onClick={onSubmit}
          disabled={isPending}
        >
          <Send className="mr-2 h-4 w-4" />
          {isPending ? "Submitting..." : "Submit idea"}
        </AppButton>
      </div>
    </div>
  )
}
