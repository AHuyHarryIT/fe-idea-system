import { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { AppButton } from "@/components/app/AppButton"
import { PageHeader } from "@/components/shared/PageHeader"
import { useQACoordinatorIdeas } from "@/hooks/useIdeas"
import { auth } from "@/utils/auth"
import { normalizeIdeaResponse } from "@/utils/idea-response-mapper"
import { QACoordinatorSummaryCards } from "@/features/dashboard/qa-coordinator/components/QACoordinatorSummaryCards"
import { QACoordinatorChartsSection } from "@/features/dashboard/qa-coordinator/components/QACoordinatorChartsSection"
import { QACoordinatorRecentIdeasSection } from "@/features/dashboard/qa-coordinator/components/QACoordinatorRecentIdeasSection"
import {
  buildCoordinatorCategoryDistribution,
  buildCoordinatorMonthlyTrend,
  getCoordinatorCommentCount,
  getCoordinatorIdeaDateValue,
  getCoordinatorTimestamp,
} from "@/features/dashboard/qa-coordinator/helpers/qa-coordinator-dashboard"
import type { CoordinatorChartPoint } from "@/features/dashboard/qa-coordinator/helpers/qa-coordinator-dashboard"

export default function QACoordinatorDashboardPage() {
  const { data, isLoading, error } = useQACoordinatorIdeas()

  const ideas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(data)
    return Array.isArray(ideaList)
      ? [...ideaList]
          .filter((idea) => idea.id)
          .sort(
            (left, right) =>
              getCoordinatorTimestamp(getCoordinatorIdeaDateValue(right)) -
              getCoordinatorTimestamp(getCoordinatorIdeaDateValue(left)),
          )
      : []
  }, [data])

  const contributorCount = useMemo(
    () => new Set(ideas.map((idea) => idea.authorName).filter(Boolean)).size,
    [ideas],
  )
  const totalComments = useMemo(
    () =>
      ideas.reduce(
        (total, idea) => total + getCoordinatorCommentCount(idea),
        0,
      ),
    [ideas],
  )
  const avgEngagement =
    ideas.length > 0 ? (totalComments / ideas.length).toFixed(1) : "0.0"
  const latestIdea = ideas.at(0)
  const departmentName =
    auth.getDepartmentName() || latestIdea?.departmentName || "Your department"
  const monthlyTrend = useMemo(
    () => buildCoordinatorMonthlyTrend(ideas),
    [ideas],
  )
  const trendChartData = useMemo<CoordinatorChartPoint[]>(
    () =>
      monthlyTrend.flatMap((point) => [
        { month: point.label, series: "Ideas", value: point.ideas },
        { month: point.label, series: "Comments", value: point.comments },
      ]),
    [monthlyTrend],
  )
  const categoryDistribution = useMemo(
    () => buildCoordinatorCategoryDistribution(ideas),
    [ideas],
  )
  const categoryChartData = useMemo(
    () =>
      categoryDistribution.map((slice) => ({
        type: slice.label,
        value: slice.value,
        color: slice.colorValue,
      })),
    [categoryDistribution],
  )

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Department Dashboard"
        description={`${departmentName} department overview and analytics.`}
        actions={
          <>
            <Link to="/ideas">
              <AppButton variant="ghost">Browse all ideas</AppButton>
            </Link>
            <Link to="/manage/review">
              <AppButton>Open review queue</AppButton>
            </Link>
          </>
        }
      />

      <QACoordinatorSummaryCards
        isLoading={isLoading}
        ideasCount={ideas.length}
        totalComments={totalComments}
        contributorCount={contributorCount}
        avgEngagement={avgEngagement}
      />

      <QACoordinatorChartsSection
        error={error}
        ideasCount={ideas.length}
        trendChartData={trendChartData}
        categoryDistribution={categoryDistribution}
        categoryChartData={categoryChartData}
      />

      <QACoordinatorRecentIdeasSection
        error={error}
        ideas={ideas}
        departmentName={departmentName}
      />
    </div>
  )
}
