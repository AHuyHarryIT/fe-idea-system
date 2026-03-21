import { AlertTriangle } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'

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
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              {isDangerous && (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <h2 className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-slate-600">{message}</p>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 flex justify-end gap-3 px-6 py-4">
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
              variant={isDangerous ? 'secondary' : 'secondary'}
              onClick={onConfirm}
              disabled={isLoading}
              className={isDangerous ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
            >
              {isLoading ? 'Processing...' : confirmText}
            </AppButton>
          </div>
        </div>
      </div>
    </>
  )
}
