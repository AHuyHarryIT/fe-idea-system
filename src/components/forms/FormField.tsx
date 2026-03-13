interface FormFieldProps {
  label: string
  hint?: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

export function FormField({ label, hint, required, error, children }: FormFieldProps) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {required ? <span className="text-rose-500">*</span> : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </label>
  )
}
