import type { ButtonHTMLAttributes } from 'react'

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'red'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant
}

const variantClassNames: Record<
  NonNullable<AppButtonProps['variant']>,
  string
> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800',
  ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  red: 'bg-red-600 text-white hover:bg-red-700',
}

export function AppButton({
  variant = 'primary',
  className,
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClassNames[variant]} ${className ?? ''}`.trim()}
    />
  )
}
