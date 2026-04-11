import { AppButton } from "@/components/app/AppButton"
import { Modal } from "@/components/shared/Modal"
import type { IdeaCategory } from "@/types"
import { IdeaFormFields  } from "@/features/ideas/components/IdeaFormFields"
import type {IdeaFormData} from "@/features/ideas/components/IdeaFormFields";

export interface EditIdeaFormState extends IdeaFormData {}

interface EditIdeaModalProps {
  isOpen: boolean
  isUpdatingIdea: boolean
  categoriesLoading: boolean
  categories: IdeaCategory[]
  editForm: EditIdeaFormState
  fileValidationMessage: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
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
  fileInputRef,
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
      <IdeaFormFields
        editForm={editForm}
        categories={categories}
        categoriesLoading={categoriesLoading}
        fileInputRef={fileInputRef}
        fileValidationMessage={fileValidationMessage}
        onFormChange={onFormChange}
        onFileChange={onEditFileChange}
        mode="edit"
      />
    </Modal>
  )
}
