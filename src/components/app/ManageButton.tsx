import type { ButtonHTMLAttributes } from 'react'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue'
}

const variantClassNames: Record<
  NonNullable<AppButtonProps['variant']>,
  string
> = {
  blue: 'bg-slate-50 p-5 text-sm text-slate-600 hover:bg-blue-400',
}

export function AppButton({
  variant = 'blue',
  className,
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-2xl border border-slate-200  text-left hover:text-amber-50 ${variantClassNames[variant]} ${className ?? ''}`.trim()}
    />
  )
}
