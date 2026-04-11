import { AlertCircle, FileText, MessageSquare, Users } from "lucide-react"

interface QAManagerSummaryCardsProps {
  isLoading: boolean
  totalIdeas: number
  totalComments: number
  contributorCount: number
  reviewQueueCount: number
}

export function QAManagerSummaryCards({
  isLoading,
  totalIdeas,
  totalComments,
  contributorCount,
  reviewQueueCount,
}: QAManagerSummaryCardsProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
      {[
        {
          title: "Total ideas",
          value: isLoading ? "..." : `${totalIdeas}`,
          description: "Across all departments",
          icon: FileText,
          iconClassName: "bg-blue-100 text-blue-700",
          badgeClassName: "bg-blue-50 text-blue-700",
        },
        {
          title: "Total comments",
          value: isLoading ? "..." : `${totalComments}`,
          description: "Community engagement",
          icon: MessageSquare,
          iconClassName: "bg-emerald-100 text-emerald-700",
          badgeClassName: "bg-emerald-50 text-emerald-700",
        },
        {
          title: "Active contributors",
          value: isLoading ? "..." : `${contributorCount}`,
          description: "Staff participation",
          icon: Users,
          iconClassName: "bg-violet-100 text-violet-700",
          badgeClassName: "bg-violet-50 text-violet-700",
        },
        {
          title: "Pending review",
          value: isLoading ? "..." : `${reviewQueueCount}`,
          description: "Needs attention",
          icon: AlertCircle,
          iconClassName: "bg-amber-100 text-amber-700",
          badgeClassName: "bg-amber-50 text-amber-700",
        },
      ].map((metric) => {
        const Icon = metric.icon

        return (
          <div
            key={metric.title}
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {metric.title}
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                  {metric.value}
                </p>
                <p
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${metric.badgeClassName}`}
                >
                  {metric.description}
                </p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.iconClassName}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
