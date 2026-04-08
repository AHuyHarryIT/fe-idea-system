import type { LucideIcon } from 'lucide-react'

type StatCardAccent = 'blue' | 'emerald' | 'amber' | 'rose' | 'violet'

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string
  description: string
  accent?: StatCardAccent
  meta?: string
}

const accentClassNames: Record<
  StatCardAccent,
  {
    shell: string
    icon: string
    badge: string
  }
> = {
  blue: {
    shell:
      'border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.9)_0%,rgba(255,255,255,1)_58%)]',
    icon: 'bg-blue-600/10 text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
  emerald: {
    shell:
      'border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.9)_0%,rgba(255,255,255,1)_58%)]',
    icon: 'bg-emerald-600/10 text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  amber: {
    shell:
      'border-amber-100 bg-[linear-gradient(180deg,rgba(255,251,235,0.9)_0%,rgba(255,255,255,1)_58%)]',
    icon: 'bg-amber-500/10 text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
  },
  rose: {
    shell:
      'border-rose-100 bg-[linear-gradient(180deg,rgba(255,241,242,0.92)_0%,rgba(255,255,255,1)_58%)]',
    icon: 'bg-rose-600/10 text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
  },
  violet: {
    shell:
      'border-violet-100 bg-[linear-gradient(180deg,rgba(245,243,255,0.92)_0%,rgba(255,255,255,1)_58%)]',
    icon: 'bg-violet-600/10 text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
  },
}

export function StatCard({
  icon: Icon,
  title,
  value,
  description,
  accent = 'blue',
  meta,
}: StatCardProps) {
  const accentClasses = accentClassNames[accent]

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_18px_48px_rgba(15,23,42,0.06)] ${accentClasses.shell}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {title}
            </p>
            {meta &&  (
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${accentClasses.badge}`}
              >
                {meta}
              </span>
            )}
          </div>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="max-w-xs text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${accentClasses.icon}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
