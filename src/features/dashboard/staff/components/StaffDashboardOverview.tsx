import { useMemo } from "react"
import type { Idea } from "@/types"
import { EmptyState } from "@/components/shared/EmptyState"
import { SectionCard } from "@/components/shared/SectionCard"
import { Lightbulb } from "lucide-react"
import { getReactionScore } from "@/features/dashboard/staff/helpers/staff-dashboard"
import { StaffOverviewMetrics } from "@/features/dashboard/staff/components/StaffOverviewMetrics"
import { StaffQuickActionsSection } from "@/features/dashboard/staff/components/StaffQuickActionsSection"
import { IdeaHighlightListSection } from "@/features/dashboard/staff/components/IdeaHighlightListSection"

interface StaffDashboardOverviewProps {
  myIdeas: Idea[]
  allIdeas: Idea[]
  isLoading: boolean
  errorMessage?: string
}

export function StaffDashboardOverview({
  myIdeas,
  allIdeas,
  isLoading,
  errorMessage,
}: StaffDashboardOverviewProps) {
  const latestIdeas = useMemo(() => allIdeas.slice(0, 3), [allIdeas])
  const mostPopularIdeas = useMemo(
    () =>
      [...allIdeas]
        .sort((left, right) => {
          const scoreDiff = getReactionScore(right) - getReactionScore(left)

          if (scoreDiff !== 0) {
            return scoreDiff
          }

          return (right.viewCount ?? 0) - (left.viewCount ?? 0)
        })
        .slice(0, 2),
    [allIdeas],
  )
  const mostViewedIdeas = useMemo(
    () =>
      [...allIdeas]
        .sort((left, right) => {
          const viewDiff = (right.viewCount ?? 0) - (left.viewCount ?? 0)

          if (viewDiff !== 0) {
            return viewDiff
          }

          return getReactionScore(right) - getReactionScore(left)
        })
        .slice(0, 2),
    [allIdeas],
  )

  return (
    <div className="space-y-6">
      <StaffOverviewMetrics
        myIdeas={myIdeas}
        allIdeas={allIdeas}
        isLoading={isLoading}
      />
      <StaffQuickActionsSection />

      {errorMessage ? (
        <SectionCard>
          <EmptyState
            icon={Lightbulb}
            title="Unable to load dashboard overview"
            description={errorMessage}
          />
        </SectionCard>
      ) : (
        <>
          <IdeaHighlightListSection
            title="Latest ideas"
            description="Recently submitted ideas across the university feed."
            ideas={latestIdeas}
            emptyTitle="No recent ideas yet"
            emptyDescription="Latest ideas will appear here after new submissions are published."
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <IdeaHighlightListSection
              title="Most popular"
              description="Ideas with the strongest current reaction from the community."
              ideas={mostPopularIdeas}
              emptyTitle="No popular ideas yet"
              emptyDescription="Community reactions will surface the most popular ideas here."
            />
            <IdeaHighlightListSection
              title="Most viewed"
              description="Ideas attracting the highest reading activity right now."
              ideas={mostViewedIdeas}
              emptyTitle="No viewed ideas yet"
              emptyDescription="View trends will appear here once the idea feed has more activity."
            />
          </div>
        </>
      )}
    </div>
  )
}
