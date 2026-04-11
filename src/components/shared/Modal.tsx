import { useEffect } from "react"
import type { ReactNode } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  maxWidthClassName?: string
  titleIcon?: ReactNode
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  contentClassName?: string
  footerClassName?: string
}

export function Modal({
  isOpen,
  title,
  description,
  children,
  onClose,
  footer,
  maxWidthClassName = "max-w-2xl",
  titleIcon,
  showCloseButton = true,
  closeOnBackdrop = true,
  contentClassName = "max-h-[70vh] overflow-y-auto px-6 py-5",
  footerClassName = "flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/45"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`w-full ${maxWidthClassName} overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                {titleIcon && (
                  <span className="shrink-0 text-slate-500">{titleIcon}</span>
                )}
                <h2 className="text-xl font-semibold text-slate-900">
                  {title}
                </h2>
              </div>
              {description && (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className={contentClassName}>{children}</div>
          {footer && <div className={footerClassName}>{footer}</div>}
        </div>
      </div>
    </>
  )
}
