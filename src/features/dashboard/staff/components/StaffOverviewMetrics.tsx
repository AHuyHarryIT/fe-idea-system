import { CheckCircle2, Lightbulb, TrendingUp } from "lucide-react"
import type { Idea } from "@/types"
import { overviewMetricAccentClassNames } from "@/features/dashboard/staff/helpers/staff-dashboard"
import type { OverviewMetricAccent } from "@/features/dashboard/staff/helpers/staff-dashboard"

interface StaffOverviewMetricCardProps {
  title: string
  value: string
  description: string
  accent: OverviewMetricAccent
  icon: typeof Lightbulb
}

function StaffOverviewMetricCard({
  title,
  value,
  description,
  accent,
  icon: Icon,
}: StaffOverviewMetricCardProps) {
  const accentClasses = overviewMetricAccentClassNames[accent]

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${accentClasses.badge}`}
          >
            {description}
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
}

interface StaffOverviewMetricsProps {
  myIdeas: Idea[]
  allIdeas: Idea[]
  isLoading: boolean
}

export function StaffOverviewMetrics({
  myIdeas,
  allIdeas,
  isLoading,
}: StaffOverviewMetricsProps) {
  const totalLikesOnMyIdeas = myIdeas.reduce(
    (total, idea) => total + (idea.thumbsUpCount ?? 0),
    0,
  )

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <StaffOverviewMetricCard
        title="Total ideas"
        value={isLoading ? "..." : `${allIdeas.length}`}
        description="Across all categories"
        accent="blue"
        icon={Lightbulb}
      />
      <StaffOverviewMetricCard
        title="My ideas"
        value={isLoading ? "..." : `${myIdeas.length}`}
        description="Ideas you've submitted"
        accent="emerald"
        icon={CheckCircle2}
      />
      <StaffOverviewMetricCard
        title="Engagement"
        value={isLoading ? "..." : `${totalLikesOnMyIdeas}`}
        description="Total likes on your ideas"
        accent="violet"
        icon={TrendingUp}
      />
    </div>
  )
}
