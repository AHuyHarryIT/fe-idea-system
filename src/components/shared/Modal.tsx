import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  maxWidthClassName?: string
}

export function Modal({
  isOpen,
  title,
  description,
  children,
  onClose,
  footer,
  maxWidthClassName = 'max-w-2xl',
}: ModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/45" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`w-full ${maxWidthClassName} overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl`}>
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
          {footer ? (
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
