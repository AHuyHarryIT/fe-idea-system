import { FileUp } from "lucide-react"
import { AppButton } from "@/components/app/AppButton"
import { FormField } from "@/components/forms/FormField"
import { FormInput, FormTextarea } from "@/components/forms/FormInput"
import { Modal } from "@/components/shared/Modal"
import type { IdeaCategory } from "@/types"

export interface EditIdeaFormState {
  title: string
  description: string
  categoryId: string
  isAnonymous: boolean
  uploadFiles: File[]
}

interface EditIdeaModalProps {
  isOpen: boolean
  isUpdatingIdea: boolean
  categoriesLoading: boolean
  categories: IdeaCategory[]
  editForm: EditIdeaFormState
  fileValidationMessage: string
  onClose: () => void
  onSave: () => void
  onFormChange: (form: EditIdeaFormState) => void
  onEditFileChange: (files: FileList | null) => void
}

export function EditIdeaModal({
  isOpen,
  isUpdatingIdea,
  categoriesLoading,
  categories,
  editForm,
  fileValidationMessage,
  onClose,
  onSave,
  onFormChange,
  onEditFileChange,
}: EditIdeaModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Edit idea"
      description="Update your own idea details and upload replacement supporting PDFs if needed."
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
      footer={
        <>
          <AppButton
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isUpdatingIdea}
          >
            Cancel
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            onClick={onSave}
            disabled={isUpdatingIdea}
          >
            {isUpdatingIdea ? "Saving..." : "Save changes"}
          </AppButton>
        </>
      }
    >
      <div className="space-y-5">
        <FormField label="Idea title" htmlFor="edit-idea-title" required>
          <FormInput
            id="edit-idea-title"
            name="edit-idea-title"
            aria-label="Idea title"
            value={editForm.title}
            onChange={(event) =>
              onFormChange({ ...editForm, title: event.target.value })
            }
            placeholder="Enter a concise title"
          />
        </FormField>

        <FormField label="Content" htmlFor="edit-idea-description" required>
          <FormTextarea
            id="edit-idea-description"
            name="edit-idea-description"
            aria-label="Idea content"
            value={editForm.description}
            onChange={(event) =>
              onFormChange({ ...editForm, description: event.target.value })
            }
            placeholder="Describe the idea clearly"
          />
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Category" htmlFor="edit-idea-category" required>
            <select
              id="edit-idea-category"
              name="edit-idea-category"
              aria-label="Idea category"
              value={editForm.categoryId}
              onChange={(event) =>
                onFormChange({ ...editForm, categoryId: event.target.value })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesLoading && (
              <p className="text-xs text-slate-500">Loading categories...</p>
            )}
          </FormField>

          <FormField label="Anonymous submission" htmlFor="edit-idea-anonymous">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                id="edit-idea-anonymous"
                name="edit-idea-anonymous"
                aria-label="Anonymous submission"
                type="checkbox"
                checked={editForm.isAnonymous}
                onChange={(event) =>
                  onFormChange({
                    ...editForm,
                    isAnonymous: event.target.checked,
                  })
                }
              />
              Hide author identity from public idea views.
            </label>
          </FormField>
        </div>

        <FormField label="Supporting files" htmlFor="edit-idea-uploaded-files">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <FileUp className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Upload replacement files
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PDF files only. Leave empty to keep current documents.
                </p>
              </div>
              <input
                id="edit-idea-uploaded-files"
                name="edit-idea-uploaded-files"
                aria-label="Supporting files"
                multiple
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(event) => onEditFileChange(event.target.files)}
              />
            </label>
            <p className="mt-4 text-sm text-slate-600">
              {editForm.uploadFiles.length
                ? editForm.uploadFiles.map((file) => file.name).join(", ")
                : "No new files selected."}
            </p>
            {fileValidationMessage && (
              <p className="mt-3 text-sm text-red-600">
                {fileValidationMessage}
              </p>
            )}
          </div>
        </FormField>
      </div>
    </Modal>
  )
}
