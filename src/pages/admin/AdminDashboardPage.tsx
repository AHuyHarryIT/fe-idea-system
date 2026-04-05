import { useMemo } from 'react'
import {
  AlertCircle,
  Building2,
  CalendarRange,
  FolderKanban,
  ListChecks,
  Tags,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { dashboardService, submissionService } from '@/api'
import { AppButton } from '@/components/app/AppButton'
import { ManageButton } from '@/components/app/ManageButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'
import { SUBMISSION_SELECT_PAGE_SIZE } from '@/constants/submission'
import { useQuery } from '@tanstack/react-query'
import { formatAppDateTime, getDateTimestamp } from '@/utils/date'
import type { Submission } from '@/types'

function isSubmissionOpen(submission: Submission) {
  const finalClosureTimestamp = getDateTimestamp(submission.finalClosureDate)

  return finalClosureTimestamp > Date.now()
}

function getStatValue(value?: number) {
  return typeof value === 'number' ? value : 0
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboardOverview'],
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
            'Unable to load admin dashboard.',
        )
      }

      return {
        stats: statsResponse.data ?? {},
        submissions: submissionsResponse.data?.submissions ?? [],
        submissionTotal:
          submissionsResponse.data?.pagination?.totalCount ??
          (submissionsResponse.data?.submissions?.length ?? 0),
      }
    },
  })

  const stats = data?.stats
  const totalIdeas = getStatValue(stats?.totalIdeas)
  const totalUsers = getStatValue(stats?.totalUsers)
  const totalCategories = getStatValue(stats?.totalCategories)
  const totalDepartments = getStatValue(stats?.totalDepartments)
  const ideasThisMonth = getStatValue(stats?.ideasThisMonth)
  const ideasWithoutComments = getStatValue(stats?.ideasWithoutComments)
  const reviewBacklog = getStatValue(stats?.totalPendingIdeas ?? stats?.pendingReview)

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
      (data?.submissions ?? []).filter((submission) => isSubmissionOpen(submission))
        .length,
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

      <SectionCard>
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(15,23,42,0.98)_0%,rgba(30,41,59,0.96)_52%,rgba(37,99,235,0.88)_100%)] p-7 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-100/80">
              Analytics dashboard
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">
              Monitor platform scale, review pressure, and campaign activity from one admin surface.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              These headline figures now come directly from the live
              {' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px] text-blue-50">
                /api/stats/dashboard
              </code>
              {' '}
              endpoint, so the dashboard matches the backend reporting view.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
                {reviewBacklog} ideas waiting for review
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
                {ideasWithoutComments} ideas without comments
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
                {ideasThisMonth} ideas this month
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
                {openSubmissionCount} open submissions
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Latest submission
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                {latestSubmission?.name || 'No submission yet'}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Final closure{' '}
                {formatAppDateTime(
                  latestSubmission?.finalClosureDate,
                  'Not scheduled',
                )}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Reporting health
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                {totalDepartments} departments · {totalCategories} categories
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Track taxonomy coverage and organisational breadth without leaving the admin home.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          title="Total ideas"
          value={isLoading ? '...' : `${totalIdeas}`}
          description="All ideas currently counted by the live admin stats endpoint."
          accent="blue"
          meta={`${ideasThisMonth} this month`}
        />
        <StatCard
          icon={Users}
          title="Total users"
          value={isLoading ? '...' : `${totalUsers}`}
          description="Accounts available across the platform directory."
          accent="violet"
          meta="Directory"
        />
        <StatCard
          icon={Tags}
          title="Categories"
          value={isLoading ? '...' : `${totalCategories}`}
          description="Configured idea categories for submission classification."
          accent="amber"
          meta={`${totalDepartments} departments`}
        />
        <StatCard
          icon={ListChecks}
          title="Pending review"
          value={isLoading ? '...' : `${reviewBacklog}`}
          description="Ideas still waiting for a review decision."
          accent="emerald"
          meta={`${ideasWithoutComments} no comments`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Management modules"
          description="Jump straight into the core admin screens with counts aligned to the live stats service."
        >
          {error ? (
            <EmptyState
              icon={Users}
              title="Unable to load admin data"
              description={error.message}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <ManageButton
                variant="blue"
                title={`Manage users · ${totalUsers}`}
                description="Open the directory to create, edit, and manage account roles across the platform."
                meta="Accounts"
                onClick={() => navigate({ to: '/manage/users' })}
              />

              <ManageButton
                variant="violet"
                title={`Manage categories · ${totalCategories}`}
                description="Maintain idea themes so submissions remain easy to classify and report on."
                meta="Taxonomy"
                onClick={() => navigate({ to: '/manage/categories' })}
              />

              <ManageButton
                variant="amber"
                title={`Manage submissions · ${data?.submissionTotal ?? 0}`}
                description="Schedule submissions, update closure times, and keep campaigns aligned."
                meta={`${openSubmissionCount} open`}
                onClick={() => navigate({ to: '/manage/submissions' })}
              />
              <ManageButton
                variant="emerald"
                title={`Review ideas · ${reviewBacklog}`}
                description="Go directly to the moderation queue to approve or reject pending ideas."
                meta="Moderation"
                onClick={() => navigate({ to: '/manage/review' })}
              />
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Reporting highlights"
          description="High-signal figures from the live stats endpoint that need admin attention."
        >
          {error ? (
            <EmptyState
              icon={AlertCircle}
              title="Stats are unavailable"
              description={error.message}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.92)_0%,rgba(255,255,255,1)_65%)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Ideas without comments
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {ideasWithoutComments}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ideas that may need visibility, outreach, or moderation follow-up.
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.9)_0%,rgba(255,255,255,1)_65%)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Ideas this month
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {ideasThisMonth}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Current-month contribution velocity from the live backend report.
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(245,243,255,0.92)_0%,rgba(255,255,255,1)_65%)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Platform footprint
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {totalDepartments}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Departments represented in the current reporting scope.
                </p>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Recent submissions"
          description="Latest campaign windows loaded from the submission API."
        >
          {error ? (
            <EmptyState
              icon={CalendarRange}
              title="Submission data unavailable"
              description={error.message}
            />
          ) : recentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] p-5 text-sm text-slate-600"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {submission.name}
                      </p>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                        {submission.description?.trim() ||
                          'No submission description has been entered yet.'}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {isSubmissionOpen(submission) ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Closure
                      </p>
                      <p className="mt-2 font-medium text-slate-900">
                        {formatAppDateTime(submission.closureDate, 'Not scheduled')}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Final closure
                      </p>
                      <p className="mt-2 font-medium text-slate-900">
                        {formatAppDateTime(
                          submission.finalClosureDate,
                          'Not scheduled',
                        )}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Ideas captured
                      </p>
                      <p className="mt-2 font-medium text-slate-900">
                        {submission.ideaCount ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No submissions configured"
              description="Create a submission to start accepting ideas."
            />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
