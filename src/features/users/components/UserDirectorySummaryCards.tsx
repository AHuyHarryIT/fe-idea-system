import { BadgeCheck, Building2, ShieldCheck, Users } from "lucide-react"

interface UserDirectorySummary {
  total: number
  admins: number
  qaMembers: number
  noDepartment: number
}

interface UserDirectorySummaryCardsProps {
  summary: UserDirectorySummary
}

export function UserDirectorySummaryCards({
  summary,
}: UserDirectorySummaryCardsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        {
          label: "Total accounts",
          value: summary.total,
          icon: Users,
          tone: "bg-slate-900 text-white",
        },
        {
          label: "Administrators on page",
          value: summary.admins,
          icon: ShieldCheck,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "QA members on page",
          value: summary.qaMembers,
          icon: BadgeCheck,
          tone: "bg-amber-50 text-amber-700",
        },
        {
          label: "No department on page",
          value: summary.noDepartment,
          icon: Building2,
          tone: "bg-emerald-50 text-emerald-700",
        },
      ].map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
              <div className={`rounded-2xl p-3 ${item.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
