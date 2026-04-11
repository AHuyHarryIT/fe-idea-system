import type { ButtonHTMLAttributes } from "react"
import { ArrowRight } from "lucide-react"

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "blue" | "amber" | "emerald" | "violet"
  title: string
  description: string
  meta?: string
}

const variantClassNames: Record<
  NonNullable<AppButtonProps["variant"]>,
  string
> = {
  blue: "border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.9)_0%,rgba(255,255,255,1)_65%)] hover:border-blue-200 hover:bg-blue-50/80",
  amber:
    "border-amber-100 bg-[linear-gradient(180deg,rgba(255,251,235,0.92)_0%,rgba(255,255,255,1)_65%)] hover:border-amber-200 hover:bg-amber-50/80",
  emerald:
    "border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.92)_0%,rgba(255,255,255,1)_65%)] hover:border-emerald-200 hover:bg-emerald-50/80",
  violet:
    "border-violet-100 bg-[linear-gradient(180deg,rgba(245,243,255,0.92)_0%,rgba(255,255,255,1)_65%)] hover:border-violet-200 hover:bg-violet-50/80",
}

export function ManageButton({
  variant = "blue",
  className,
  title,
  description,
  meta,
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      className={`group rounded-[24px] border p-5 text-left transition ${variantClassNames[variant]} ${className ?? ""}`.trim()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          {meta && (
            <span className="inline-flex rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
              {meta}
            </span>
          )}
          <div>
            <p className="text-base font-semibold text-slate-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm transition group-hover:translate-x-0.5 group-hover:text-slate-900">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  )
}
