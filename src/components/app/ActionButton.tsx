import { Edit2, Ghost, Plus, Trash2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  action?: 'edit' | 'delete' | 'add' | 'ghost'
}

const variant: Record<NonNullable<AppButtonProps['action']>, string> = {
  edit: 'bg-blue-600 text-white hover:bg-blue-700',
  ghost: 'bg-slate-50 text-black hover:bg-slate-100',
  delete: 'bg-red-600 text-black hover:bg-red-800',
  add: 'bg-slate-50 text-slate-700 hover:bg-slate-100',
}
const icon: Record<NonNullable<AppButtonProps['action']>, React.ReactNode> = {
  edit: <Edit2 className="h-4 w-4" />,
  ghost: <Ghost className="h-4 w-4" />,
  add: <Plus className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
}
const content: Record<NonNullable<AppButtonProps['action']>, string> = {
  edit: 'Edit',
  ghost: 'Reset',
  add: 'Add',
  delete: 'Delete',
}

export function ActionButton({
  action = 'ghost',
  className,
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variant[action]}`}
    >
      {icon[action]}
      {content[action]}
    </button>
  )
}
