import type { UIEvent } from "react"
import { ArrowLeft, Send } from "lucide-react"
import type { FormInstance } from "antd"
import { Form } from "antd"
import { AppButton } from "@/components/app/AppButton"
import { SectionCard } from "@/components/shared/SectionCard"
import { formatAppDateTime } from "@/utils/date"
import type { IdeaCategory } from "@/types"
import { IdeaFormFields } from "@/features/ideas/components/IdeaFormFields"
import {
  getIdeaStatusLabel,
  normalizeIdeaStatus,
} from "@/features/ideas/helpers/idea-detail"
import type { EditIdeaFormState } from "@/features/ideas/pages/EditIdeaPage"
import type { Idea } from "@/types/idea"

interface EditIdeaFormSectionProps {
  form: FormInstance
  idea: Idea
  editForm: EditIdeaFormState
  categories: IdeaCategory[]
  categoriesLoading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  fileValidationMessage: string
  agreedToTerms: boolean
  isPending: boolean
  onBackToIdea: () => void
  onCategoryPopupScroll?: (event: UIEvent<HTMLDivElement>) => void
  onFormChange: (nextForm: EditIdeaFormState) => void
  onFileChange: (files: FileList | null) => void
  onAgreedToTermsChange: (value: boolean) => void
  onSave: () => void
}

export function EditIdeaFormSection({
  form,
  idea,
  editForm,
  categories,
  categoriesLoading,
  fileInputRef,
  fileValidationMessage,
  agreedToTerms,
  isPending,
  onBackToIdea,
  onCategoryPopupScroll,
  onFormChange,
  onFileChange,
  onAgreedToTermsChange,
  onSave,
}: EditIdeaFormSectionProps) {
  return (
    <Form form={form} layout="vertical" className="space-y-6">
      <AppButton type="button" variant="ghost" onClick={onBackToIdea}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to idea
      </AppButton>

      <IdeaFormFields
        form={form}
        editForm={editForm}
        categories={categories}
        categoriesLoading={categoriesLoading}
        fileInputRef={fileInputRef}
        fileValidationMessage={fileValidationMessage}
        onFormChange={onFormChange}
        onFileChange={onFileChange}
        onCategoryPopupScroll={onCategoryPopupScroll}
        mode="edit"
      />

      {/* Idea Status Information */}
      <SectionCard title="Idea Status" description="Status cannot be changed here">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Current Status:</span>
            <span className="font-medium text-slate-900">
              {getIdeaStatusLabel(normalizeIdeaStatus(idea.status))}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Created:</span>
            <span>{formatAppDateTime(idea.createdAt)}</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Terms and Conditions"
        description="Confirm acceptance of terms before saving changes."
      >
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              You confirm that the updated idea remains relevant to university
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
            modification.
          </label>
        </div>
      </SectionCard>

      <div className="flex flex-wrap justify-end gap-3">
        <AppButton type="button" variant="ghost" onClick={onBackToIdea} disabled={isPending}>
          Cancel
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          onClick={onSave}
          disabled={isPending || !agreedToTerms}
        >
          <Send className="mr-2 h-4 w-4" />
          {isPending ? "Saving..." : "Save changes"}
        </AppButton>
      </div>
    </Form>
  )
}
