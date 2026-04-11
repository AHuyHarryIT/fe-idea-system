import { useMemo } from "react"
import { Link } from "@tanstack/react-router"

import { AppButton } from "@/components/app/AppButton"
import { PageHeader } from "@/components/shared/PageHeader"
import { useQAManagerIdeas } from "@/hooks/useIdeas"
import { normalizeIdeaResponse } from "@/utils/idea-response-mapper"
import { QAManagerSummaryCards } from "@/features/dashboard/qa-manager/components/QAManagerSummaryCards"
import { QAManagerChartsSection } from "@/features/dashboard/qa-manager/components/QAManagerChartsSection"
import { QAManagerInsightListsSection } from "@/features/dashboard/qa-manager/components/QAManagerInsightListsSection"
import {
  buildDepartmentSummaries,
  buildTrendPoints,
  getCommentCount,
  isReviewableIdea,
} from "@/features/dashboard/qa-manager/helpers/qa-manager-dashboard"

export default function QAManagerDashboardPage() {
  const { data: ideaData, isLoading, error } = useQAManagerIdeas()

  const ideas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(ideaData)
    return Array.isArray(ideaList) ? ideaList.filter((idea) => idea.id) : []
  }, [ideaData])

  const reviewQueue = useMemo(
    () => ideas.filter((idea) => isReviewableIdea(idea.status)),
    [ideas],
  )

  const totalComments = useMemo(
    () => ideas.reduce((total, idea) => total + getCommentCount(idea), 0),
    [ideas],
  )

  const contributorCount = useMemo(
    () => new Set(ideas.map((idea) => idea.authorName).filter(Boolean)).size,
    [ideas],
  )

  const departmentSummaries = useMemo(
    () => buildDepartmentSummaries(ideas),
    [ideas],
  )

  const ideasWithoutComments = useMemo(
    () => ideas.filter((idea) => getCommentCount(idea) === 0).slice(0, 3),
    [ideas],
  )

  const anonymousIdeas = useMemo(
    () => ideas.filter((idea) => idea.isAnonymous).slice(0, 3),
    [ideas],
  )

  const trendPoints = useMemo(() => buildTrendPoints(ideas), [ideas])
  const trendChartData = useMemo(
    () =>
      trendPoints.flatMap((point) => [
        { month: point.label, series: "Ideas", value: point.ideas },
        { month: point.label, series: "Comments", value: point.comments },
        {
          month: point.label,
          series: "Contributors",
          value: point.contributors,
        },
      ]),
    [trendPoints],
  )

  const departmentMax = Math.max(
    1,
    ...departmentSummaries.flatMap((summary) => [
      summary.ideas,
      summary.comments,
    ]),
  )
  const departmentChartData = useMemo(
    () =>
      departmentSummaries.slice(0, 5).flatMap((summary) => [
        { department: summary.name, series: "Ideas", value: summary.ideas },
        {
          department: summary.name,
          series: "Comments",
          value: summary.comments,
        },
      ]),
    [departmentSummaries],
  )

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Analytics Dashboard"
        description="University-wide analytics and reports."
        actions={
          <>
            <Link to="/ideas">
              <AppButton variant="ghost">Browse ideas</AppButton>
            </Link>
            <Link to="/manage/review">
              <AppButton>Open review queue</AppButton>
            </Link>
          </>
        }
      />

      <QAManagerSummaryCards
        isLoading={isLoading}
        totalIdeas={ideas.length}
        totalComments={totalComments}
        contributorCount={contributorCount}
        reviewQueueCount={reviewQueue.length}
      />

      <QAManagerChartsSection
        error={error}
        ideasCount={ideas.length}
        trendChartData={trendChartData}
        departmentChartData={departmentChartData}
        departmentSummaries={departmentSummaries}
        departmentMax={departmentMax}
      />

      <QAManagerInsightListsSection
        error={error}
        ideasWithoutComments={ideasWithoutComments}
        anonymousIdeas={anonymousIdeas}
      />
    </div>
  )
}
