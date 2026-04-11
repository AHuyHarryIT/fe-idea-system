import { useMemo } from "react"
import { FolderKanban, ListChecks, Tags, Users } from "lucide-react"
import { Link, useNavigate } from "@tanstack/react-router"
import { dashboardService, submissionService } from "@/api"
import { AppButton } from "@/components/app/AppButton"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { SUBMISSION_SELECT_PAGE_SIZE } from "@/constants/submission"
import { useQuery } from "@tanstack/react-query"
import type { Submission } from "@/types"
import { getDateTimestamp } from "@/utils/date"
import { AdminHeroSection } from "@/features/dashboard/admin/components/AdminHeroSection"
import { AdminManagementModulesSection } from "@/features/dashboard/admin/components/AdminManagementModulesSection"
import { AdminReportingHighlightsSection } from "@/features/dashboard/admin/components/AdminReportingHighlightsSection"
import { AdminRecentSubmissionsSection } from "@/features/dashboard/admin/components/AdminRecentSubmissionsSection"
import {
  getAdminStatValue,
  isAdminSubmissionOpen,
} from "@/features/dashboard/admin/helpers/admin-dashboard"

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminDashboardOverview"],
    queryFn: async () => {
      const [statsResponse, submissionsResponse] = await Promise.all([
        dashboardService.getAdminStatistics(),
        submissionService.getSubmissions({
          pageNumber: 1,
          pageSize: SUBMISSION_SELECT_PAGE_SIZE,
        }),
      ])

      if (!statsResponse.success || !submissionsResponse.success) {
        throw new Error(
          statsResponse.error ??
            submissionsResponse.error ??
            "Unable to load admin dashboard.",
        )
      }

      return {
        stats: statsResponse.data ?? {},
        submissions: submissionsResponse.data?.submissions ?? [],
        submissionTotal:
          submissionsResponse.data?.pagination?.totalCount ??
          submissionsResponse.data?.submissions?.length ??
          0,
      }
    },
  })

  const stats = data?.stats
  const totalIdeas = getAdminStatValue(stats?.totalIdeas)
  const totalUsers = getAdminStatValue(stats?.totalUsers)
  const totalCategories = getAdminStatValue(stats?.totalCategories)
  const totalDepartments = getAdminStatValue(stats?.totalDepartments)
  const ideasThisMonth = getAdminStatValue(stats?.ideasThisMonth)
  const ideasWithoutComments = getAdminStatValue(stats?.ideasWithoutComments)
  const reviewBacklog = getAdminStatValue(
    stats?.totalPendingIdeas ?? stats?.pendingReview,
  )

  const recentSubmissions = useMemo(
    () =>
      [...(data?.submissions ?? [])]
        .sort(
          (left, right) =>
            getDateTimestamp(right.finalClosureDate) -
            getDateTimestamp(left.finalClosureDate),
        )
        .slice(0, 4),
    [data?.submissions],
  )

  const openSubmissionCount = useMemo(
    () =>
      (data?.submissions ?? []).filter((submission: Submission) =>
        isAdminSubmissionOpen(submission),
      ).length,
    [data?.submissions],
  )

  const latestSubmission = recentSubmissions.at(0)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Administration"
        description="University-wide analytics and management shortcuts powered by the live dashboard API."
        actions={
          <>
            <Link to="/manage/users">
              <AppButton variant="ghost">User directory</AppButton>
            </Link>
            <Link to="/manage/review">
              <AppButton>Review queue</AppButton>
            </Link>
          </>
        }
      />

      <AdminHeroSection
        reviewBacklog={reviewBacklog}
        ideasWithoutComments={ideasWithoutComments}
        ideasThisMonth={ideasThisMonth}
        openSubmissionCount={openSubmissionCount}
        latestSubmission={latestSubmission}
        totalDepartments={totalDepartments}
        totalCategories={totalCategories}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          title="Total ideas"
          value={isLoading ? "..." : `${totalIdeas}`}
          description="All ideas currently counted by the live admin stats endpoint."
          accent="blue"
          meta={`${ideasThisMonth} this month`}
        />
        <StatCard
          icon={Users}
          title="Total users"
          value={isLoading ? "..." : `${totalUsers}`}
          description="Accounts available across the platform directory."
          accent="violet"
          meta="Directory"
        />
        <StatCard
          icon={Tags}
          title="Categories"
          value={isLoading ? "..." : `${totalCategories}`}
          description="Configured idea categories for submission classification."
          accent="amber"
          meta={`${totalDepartments} departments`}
        />
        <StatCard
          icon={ListChecks}
          title="Pending review"
          value={isLoading ? "..." : `${reviewBacklog}`}
          description="Ideas still waiting for a review decision."
          accent="emerald"
          meta={`${ideasWithoutComments} no comments`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminManagementModulesSection
          error={error}
          totalUsers={totalUsers}
          totalCategories={totalCategories}
          submissionTotal={data?.submissionTotal ?? 0}
          openSubmissionCount={openSubmissionCount}
          reviewBacklog={reviewBacklog}
          onOpenUsers={() => navigate({ to: "/manage/users" })}
          onOpenCategories={() => navigate({ to: "/manage/categories" })}
          onOpenSubmissions={() => navigate({ to: "/manage/submissions" })}
          onOpenReview={() => navigate({ to: "/manage/review" })}
        />

        <AdminReportingHighlightsSection
          error={error}
          ideasWithoutComments={ideasWithoutComments}
          ideasThisMonth={ideasThisMonth}
          totalDepartments={totalDepartments}
        />
      </div>

      <div className="mt-6">
        <AdminRecentSubmissionsSection
          error={error}
          recentSubmissions={recentSubmissions}
        />
      </div>
    </div>
  )
}
