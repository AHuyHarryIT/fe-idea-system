import { FolderKanban, MessageSquare, TrendingUp, Users } from "lucide-react"
import { coordinatorMetricAccentClassNames } from "@/features/dashboard/qa-coordinator/helpers/qa-coordinator-dashboard"

interface QACoordinatorSummaryCardsProps {
  isLoading: boolean
  ideasCount: number
  totalComments: number
  contributorCount: number
  avgEngagement: string
}

export function QACoordinatorSummaryCards({
  isLoading,
  ideasCount,
  totalComments,
  contributorCount,
  avgEngagement,
}: QACoordinatorSummaryCardsProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
      {[
        {
          title: "Department ideas",
          value: isLoading ? "..." : `${ideasCount}`,
          description: "Total submissions",
          icon: FolderKanban,
          accent: "blue" as const,
        },
        {
          title: "Comments",
          value: isLoading ? "..." : `${totalComments}`,
          description: "Total engagement",
          icon: MessageSquare,
          accent: "emerald" as const,
        },
        {
          title: "Contributors",
          value: isLoading ? "..." : `${contributorCount}`,
          description: "Active staff members",
          icon: Users,
          accent: "violet" as const,
        },
        {
          title: "Avg. engagement",
          value: isLoading ? "..." : avgEngagement,
          description: "Comments per idea",
          icon: TrendingUp,
          accent: "amber" as const,
        },
      ].map((metric) => {
        const Icon = metric.icon
        const accentClasses = coordinatorMetricAccentClassNames[metric.accent]
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
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${accentClasses.badge}`}
                >
                  {metric.description}
                </p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentClasses.icon}`}
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
