interface FormFieldProps {
  label: string
  htmlFor?: string
  hint?: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

export function FormField({
  label,
  htmlFor,
  hint,
  required,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-medium text-slate-700"
      >
        <span>{label}</span>
        {required &&  <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint &&  <p className="text-xs text-slate-500">{hint}</p>}
      {error &&  <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
