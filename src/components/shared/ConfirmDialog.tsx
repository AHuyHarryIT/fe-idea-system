import { AlertTriangle } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { Modal } from '@/components/shared/Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      titleIcon={
        isDangerous ? <AlertTriangle className="h-5 w-5 text-red-600" /> : null
      }
      onClose={onCancel}
      maxWidthClassName="max-w-md"
      contentClassName="px-6 py-5"
      footerClassName="flex justify-end gap-3 border-t border-slate-200 px-6 py-4"
      footer={
        <>
          <AppButton
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            onClick={onConfirm}
            disabled={isLoading}
            className={isDangerous ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
          >
            {isLoading ? 'Processing...' : confirmText}
          </AppButton>
        </>
      }
    >
      <p className="text-slate-600">{message}</p>
    </Modal>
  )
}
