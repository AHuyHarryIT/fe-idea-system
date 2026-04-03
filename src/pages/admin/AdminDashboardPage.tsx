import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarRange, ListChecks, Tags, Users } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  categoryService,
  ideaService,
  submissionService,
  userService,
} from '@/api'
import { SUBMISSION_SELECT_PAGE_SIZE } from '@/constants/submission'
import type { Idea, IdeaListResponse, Submission } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'
import { ManageButton } from '@/components/app/ManageButton'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'
import { extractCollection } from '@/lib/api-mappers'
import { formatAppDateTime, getDateTimestamp } from '@/lib/date'

function isReviewableIdea(status?: string) {
  if (!status) return true

  return [
    'submitted',
    'under_review',
    'pending',
    'pending_review',
    'awaiting_review',
  ].includes(status.toLowerCase().replace(/\s+/g, '_'))
}

function isSubmissionOpen(submission: Submission) {
  const finalClosureTimestamp = getDateTimestamp(submission.finalClosureDate)

  return finalClosureTimestamp > Date.now()
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: async () => {
      const [
        usersResponse,
        categoriesResponse,
        submissionsResponse,
        ideasResponse,
      ] = await Promise.all([
        userService.getUsers(),
        categoryService.getIdeaCategories(),
        submissionService.getSubmissions({
          pageNumber: 1,
          pageSize: SUBMISSION_SELECT_PAGE_SIZE,
        }),
        ideaService.getAllIdeas(),
      ])

      if (
        !usersResponse.success ||
        !categoriesResponse.success ||
        !submissionsResponse.success ||
        !ideasResponse.success
      ) {
        throw new Error(
          usersResponse.error ??
            categoriesResponse.error ??
            submissionsResponse.error ??
            ideasResponse.error ??
            'Unable to load admin overview.',
        )
      }

      // Handle API response formats
      // API returns direct array: [{id, title, ...}]
      // But code expects: {ideas: [...]} or {items: [...]}
      const mappedIdeas = normalizeIdeaResponse(
        ideasResponse.data as IdeaListResponse | Idea[] | undefined,
      )

      return {
        users: usersResponse.data?.users ?? [],
        userTotal:
          usersResponse.data?.pagination?.totalCount ??
          (usersResponse.data?.users.length ?? 0),
        categories: extractCollection(categoriesResponse.data, ['categories']),
        categoryTotal:
          categoriesResponse.data?.pagination?.totalCount ??
          extractCollection(categoriesResponse.data, ['categories']).length,
        submissions: submissionsResponse.data?.submissions ?? [],
        submissionTotal:
          submissionsResponse.data?.pagination?.totalCount ??
          (submissionsResponse.data?.submissions?.length ?? 0),
        ideas: mappedIdeas,
      }
    },
  })

  const recentSubmissions = useMemo(
    () =>
      [...(data?.submissions ?? [])]
        .sort(
          (left, right) =>
            getDateTimestamp(right.finalClosureDate) -
            getDateTimestamp(left.finalClosureDate),
        )
        .slice(0, 4),
    [data],
  )

  const reviewBacklog = useMemo(
    () => (data?.ideas ?? []).filter((idea) => isReviewableIdea(idea.status)).length,
    [data],
  )

  const openSubmissionCount = useMemo(
    () => (data?.submissions ?? []).filter((submission) => isSubmissionOpen(submission)).length,
    [data],
  )

  const latestSubmission = recentSubmissions.at(0)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Administration"
        description="Live admin control center for users, categories, submissions, and university ideas."
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
              Platform pulse
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">
              Keep the university idea programme healthy from one command surface.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              Review backlog, active campaigns, and core module counts are surfaced here so admin work can start with the highest-impact queue.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
                {reviewBacklog} ideas waiting for review
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
                {openSubmissionCount} active submission windows
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
                {data?.userTotal || 0} active accounts in directory
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Latest campaign
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                {latestSubmission?.name || 'No submission window yet'}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Final closure{' '}
                {formatAppDateTime(latestSubmission?.finalClosureDate, 'Not scheduled')}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Admin focus
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                Directory, review, and campaign governance
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use the module cards below as direct entry points into the main admin workflows.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 mt-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          title="Users"
          value={isLoading ? '...' : `${data?.userTotal ?? 0}`}
          description="Accounts currently available in the central user directory."
          accent="blue"
          meta="Directory"
        />
        <StatCard
          icon={Tags}
          title="Categories"
          value={isLoading ? '...' : `${data?.categoryTotal ?? 0}`}
          description="Currently configured idea categories."
          accent="violet"
          meta="Taxonomy"
        />
        <StatCard
          icon={CalendarRange}
          title="Submission windows"
          value={isLoading ? '...' : `${data?.submissionTotal ?? 0}`}
          description="Open and historical submission periods."
          accent="amber"
          meta={`${openSubmissionCount} open`}
        />
        <StatCard
          icon={ListChecks}
          title="Ideas"
          value={isLoading ? '...' : `${data?.ideas.length ?? 0}`}
          description="University-wide idea count from the admin API."
          accent="emerald"
          meta={`${reviewBacklog} pending`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Management modules"
          description="Live summaries you can use as entry points for dedicated CRUD screens."
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
                title={`Manage users · ${data?.userTotal ?? 0}`}
                description="Open the directory to create, edit, and manage account roles across the platform."
                meta="Accounts"
                onClick={() => navigate({ to: '/manage/users' })}
              />

              <ManageButton
                variant="violet"
                title={`Manage categories · ${data?.categoryTotal ?? 0}`}
                description="Maintain idea themes so submissions remain easy to classify and report on."
                meta="Taxonomy"
                onClick={() => navigate({ to: '/manage/categories' })}
              />

              <ManageButton
                variant="amber"
                title={`Manage submissions · ${data?.submissionTotal ?? 0}`}
                description="Schedule campaign windows, update closure times, and keep submissions aligned."
                meta="Campaigns"
                onClick={() => navigate({ to: '/manage/submissions' })}
              />
              <ManageButton
                variant="emerald"
                title={`Review ideas · ${reviewBacklog}`}
                description="Go directly to the moderation queue to approve or reject new ideas."
                meta="Moderation"
                onClick={() => navigate({ to: '/manage/review' })}
              />
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent submissions"
          description="Most recent campaign windows loaded from the admin submission API."
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
                          'No submission description has been entered for this campaign yet.'}
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
              icon={CalendarRange}
              title="No submissions configured"
              description="Create a submission window to start accepting ideas."
            />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
