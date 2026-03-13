import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseClassName =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

export function FormInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseClassName} ${props.className ?? ''}`.trim()} />
}

export function FormTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${baseClassName} min-h-32 resize-y ${props.className ?? ''}`.trim()}
    />
  )
}
