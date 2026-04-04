import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Input } from 'antd'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  CheckCircle2,
  ArrowRight,
  Eye,
  Lightbulb,
  PlusCircle,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import type { Idea } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { useAllIdeasMatching, useMyIdeas } from '@/hooks/useIdeas'
import { formatAppDateTime, getDateTimestamp } from '@/lib/date'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'

type IdeaStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'
type OverviewMetricAccent = 'blue' | 'emerald' | 'violet'

interface DashboardPageProps {
  title?: string
  description?: string
  enablePagination?: boolean
  showSummaryCards?: boolean
}

interface IdeaListSectionProps {
  title: string
  description: string
  ideas: Idea[]
  emptyTitle: string
  emptyDescription: string
}

interface OverviewMetricCardProps {
  title: string
  value: string
  description: string
  accent: OverviewMetricAccent
  icon: typeof Lightbulb
}

const DEFAULT_MY_IDEA_PAGE_SIZE = 10
const MY_IDEA_PAGE_SIZE_OPTIONS = ['5', '10', '20', '50']

const overviewMetricAccentClassNames: Record<
  OverviewMetricAccent,
  {
    icon: string
    badge: string
  }
> = {
  blue: {
    icon: 'bg-blue-100 text-blue-700',
    badge: 'bg-blue-50 text-blue-700',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-700',
    badge: 'bg-violet-50 text-violet-700',
  },
}

function getIdeaStatusValue(idea: Idea): Exclude<IdeaStatusFilter, 'all'> {
  const normalizedStatus = idea.status?.toLowerCase()

  switch (normalizedStatus) {
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    case 'pending':
    case 'pending_review':
    default:
      return 'pending'
  }
}

function getIdeaStatusMeta(status: Exclude<IdeaStatusFilter, 'all'>) {
  switch (status) {
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-100 text-emerald-700',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-rose-100 text-rose-700',
      }
    case 'pending':
    default:
      return {
        label: 'Pending',
        className: 'bg-amber-100 text-amber-800',
      }
  }
}

function getIdeaTitle(idea: Idea) {
  return idea.text?.trim() || idea.title?.trim() || 'Untitled idea'
}

function getIdeaDateValue(idea: Idea) {
  return idea.createdAt || idea.createdDate
}

function getReactionScore(idea: Idea) {
  return (idea.thumbsUpCount ?? 0) - (idea.thumbsDownCount ?? 0)
}

function OverviewMetricCard({
  title,
  value,
  description,
  accent,
  icon: Icon,
}: OverviewMetricCardProps) {
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

function IdeaListSection({
  title,
  description,
  ideas,
  emptyTitle,
  emptyDescription,
}: IdeaListSectionProps) {
  return (
    <SectionCard title={title} description={description}>
      {ideas.length > 0 ? (
        <div className="space-y-4">
          {ideas.map((idea) => {
            const statusMeta = getIdeaStatusMeta(getIdeaStatusValue(idea))

            return (
              <div
                key={idea.id}
                className="rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] px-5 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-slate-950">
                        {getIdeaTitle(idea)}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {idea.categoryName || 'Uncategorized'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span>{idea.authorName || 'Anonymous contributor'}</span>
                      <span>{formatAppDateTime(getIdeaDateValue(idea))}</span>
                      <span>{idea.departmentName || 'University wide'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <div className="flex items-center gap-4 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {idea.viewCount ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        {idea.thumbsUpCount ?? 0}
                      </span>
                    </div>

                    <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
                      <AppButton type="button" variant="ghost">
                        View details
                      </AppButton>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </SectionCard>
  )
}

function DashboardOverview({
  myIdeas,
  allIdeas,
  isLoading,
  errorMessage,
}: {
  myIdeas: Idea[]
  allIdeas: Idea[]
  isLoading: boolean
  errorMessage?: string
}) {
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

  const totalLikesOnMyIdeas = useMemo(
    () => myIdeas.reduce((total, idea) => total + (idea.thumbsUpCount ?? 0), 0),
    [myIdeas],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-3">
        <OverviewMetricCard
          title="Total ideas"
          value={isLoading ? '...' : `${allIdeas.length}`}
          description="Across all categories"
          accent="blue"
          icon={Lightbulb}
        />
        <OverviewMetricCard
          title="My ideas"
          value={isLoading ? '...' : `${myIdeas.length}`}
          description="Ideas you've submitted"
          accent="emerald"
          icon={CheckCircle2}
        />
        <OverviewMetricCard
          title="Engagement"
          value={isLoading ? '...' : `${totalLikesOnMyIdeas}`}
          description="Total likes on your ideas"
          accent="violet"
          icon={TrendingUp}
        />
      </div>

      <SectionCard title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <Link to="/submit-idea">
            <AppButton>
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit New Idea
            </AppButton>
          </Link>
          <Link to="/ideas">
            <AppButton variant="ghost">
              <Sparkles className="mr-2 h-4 w-4" />
              View All Ideas
            </AppButton>
          </Link>
          <Link to="/my-ideas">
            <AppButton variant="ghost">
              <ArrowRight className="mr-2 h-4 w-4" />
              Open My Ideas
            </AppButton>
          </Link>
        </div>
      </SectionCard>

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
          <IdeaListSection
            title="Latest ideas"
            description="Recently submitted ideas across the university feed."
            ideas={latestIdeas}
            emptyTitle="No recent ideas yet"
            emptyDescription="Latest ideas will appear here after new submissions are published."
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <IdeaListSection
              title="Most popular"
              description="Ideas with the strongest current reaction from the community."
              ideas={mostPopularIdeas}
              emptyTitle="No popular ideas yet"
              emptyDescription="Community reactions will surface the most popular ideas here."
            />
            <IdeaListSection
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

function MyIdeaTracker({
  title,
  description,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
  searchValue,
  setSearchValue,
  statusFilter,
  setStatusFilter,
  data,
  filteredIdeas,
  sortedIdeas,
  isLoading,
  error,
}: {
  title: string
  description: string
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  searchValue: string
  setSearchValue: (value: string) => void
  statusFilter: IdeaStatusFilter
  setStatusFilter: (status: IdeaStatusFilter) => void
  data?: {
    pagination?: {
      totalCount: number
    }
    totalCount?: number
    total?: number
  }
  filteredIdeas: Idea[]
  sortedIdeas: Idea[]
  isLoading: boolean
  error: Error | null
}) {
  const navigate = useNavigate()
  const totalIdeas =
    data?.pagination?.totalCount ??
    data?.totalCount ??
    data?.total ??
    filteredIdeas.length
  const rangeStart = totalIdeas === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = totalIdeas === 0 ? 0 : rangeStart + filteredIdeas.length - 1

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Link to="/submit-idea">
              <AppButton>Submit Idea</AppButton>
            </Link>
            <Link to="/ideas">
              <AppButton variant="ghost">Browse Ideas</AppButton>
            </Link>
          </>
        }
      />

      <SectionCard
        title="My idea tracker"
        description="Filter your ideas by pending, approved, or rejected status. Open details to inspect the full record and rejection note."
      >
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="block w-full lg:max-w-md">
            <Input
              id="my-idea-search"
              name="my-idea-search"
              aria-label="Search my ideas"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by title, description, category, or submission"
              allowClear
              size="large"
              prefix={<Search className="h-4 w-4 text-slate-400" />}
              className="rounded-xl"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'All ideas'],
                ['pending', 'Pending'],
                ['approved', 'Approved'],
                ['rejected', 'Rejected'],
              ] as [IdeaStatusFilter, string][]
            ).map(([value, label]) => (
              <AppButton
                key={value}
                type="button"
                variant={statusFilter === value ? 'secondary' : 'ghost'}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </AppButton>
            ))}
          </div>
        </div>

        <p className="mb-5 text-sm text-slate-500">
          {`Showing ${rangeStart}-${rangeEnd} of ${totalIdeas} ideas.`}
        </p>

        {error ? (
          <EmptyState
            icon={Lightbulb}
            title="Unable to load your ideas"
            description={error.message}
          />
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Loading your idea tracker...
          </div>
        ) : filteredIdeas.length > 0 ? (
          <>
            <div className="space-y-4">
              {filteredIdeas.map((idea) => {
                const status = getIdeaStatusValue(idea)
                const statusMeta = getIdeaStatusMeta(status)

                return (
                  <div
                    key={idea.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => void navigate({ to: '/ideas/$ideaId', params: { ideaId: idea.id } })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        void navigate({ to: '/ideas/$ideaId', params: { ideaId: idea.id } })
                      }
                    }}
                    className="cursor-pointer rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-slate-900">
                            {getIdeaTitle(idea)}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {idea.categoryName}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {idea.description?.trim() || 'No description provided.'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>
                            Submitted: {formatAppDateTime(getIdeaDateValue(idea))}
                          </span>
                          <span>
                            Department: {idea.departmentName || 'Unassigned'}
                          </span>
                          <span>
                            Submission: {idea.submissionName || 'Not provided'}
                          </span>
                        </div>
                        {status === 'rejected' ? (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            Rejected idea. Open details to review the rejection note.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <AppPagination
              containerClassName="mt-6"
              current={currentPage}
              total={totalIdeas}
              pageSize={pageSize}
              pageSizeOptions={MY_IDEA_PAGE_SIZE_OPTIONS}
              onChange={(page, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize)
                  setCurrentPage(1)
                  return
                }

                setCurrentPage(page)
              }}
              showTotal={(total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} ideas`
              }
            />
          </>
        ) : (
          <EmptyState
            icon={Lightbulb}
            title="No ideas match this filter"
            description={`Try another status tab or adjust the search terms. You currently have ${sortedIdeas.length} total ideas.`}
          />
        )}
      </SectionCard>
    </>
  )
}

export default function DashboardPage({
  title = 'Dashboard',
  description = 'Welcome back! Here\'s an overview of your contributions and recent activities.',
  enablePagination = false,
  showSummaryCards = true,
}: DashboardPageProps) {
  const isOverviewMode = showSummaryCards && !enablePagination
  const [statusFilter, setStatusFilter] = useState<IdeaStatusFilter>('all')
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_MY_IDEA_PAGE_SIZE)
  const deferredSearch = useDeferredValue(searchValue.trim())

  const reviewStatus =
    statusFilter === 'all'
      ? undefined
      : statusFilter === 'approved'
        ? 1
        : statusFilter === 'rejected'
          ? 2
          : 0

  const {
    data: myOverviewData,
    isLoading: isOverviewLoading,
    error: overviewError,
  } = useMyIdeas(undefined, {
    fetchAll: true,
    enabled: isOverviewMode,
  })
  const { data: allIdeasData } = useAllIdeasMatching(undefined, {
    enabled: isOverviewMode,
  })

  const {
    data: trackerData,
    isLoading: isTrackerLoading,
    error: trackerError,
  } = useMyIdeas(
    {
      searchTerm: deferredSearch || undefined,
      pageNumber: currentPage,
      pageSize,
      reviewStatus,
    },
    {
      fetchAll: false,
      enabled: !isOverviewMode,
    },
  )

  const myOverviewIdeas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(myOverviewData)

    return Array.isArray(ideaList)
      ? [...ideaList]
          .filter((idea) => idea.id)
          .sort(
            (left, right) =>
              getDateTimestamp(getIdeaDateValue(right)) -
              getDateTimestamp(getIdeaDateValue(left)),
          )
      : []
  }, [myOverviewData])

  const allIdeas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(allIdeasData)

    return Array.isArray(ideaList)
      ? [...ideaList]
          .filter((idea) => idea.id)
          .sort(
            (left, right) =>
              getDateTimestamp(getIdeaDateValue(right)) -
              getDateTimestamp(getIdeaDateValue(left)),
          )
      : []
  }, [allIdeasData])

  const trackerIdeas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(trackerData)
    return Array.isArray(ideaList) ? ideaList.filter((idea) => idea.id) : []
  }, [trackerData])

  const sortedTrackerIdeas = useMemo(
    () =>
      [...trackerIdeas].sort(
        (left, right) =>
          getDateTimestamp(getIdeaDateValue(right)) -
          getDateTimestamp(getIdeaDateValue(left)),
      ),
    [trackerIdeas],
  )

  const filteredTrackerIdeas = useMemo(() => sortedTrackerIdeas, [sortedTrackerIdeas])

  useEffect(() => {
    if (isOverviewMode) {
      return
    }

    setCurrentPage(1)
  }, [deferredSearch, isOverviewMode, statusFilter])

  const trackerTotalPages = Math.max(
    1,
    Math.ceil(
      ((trackerData?.pagination?.totalCount ??
        trackerData?.totalCount ??
        trackerData?.total ??
        filteredTrackerIdeas.length) || 0) / pageSize,
    ),
  )

  useEffect(() => {
    if (isOverviewMode || currentPage <= trackerTotalPages) {
      return
    }

    setCurrentPage(trackerTotalPages)
  }, [currentPage, isOverviewMode, trackerTotalPages])

  if (isOverviewMode) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <PageHeader title={title} description={description} />
        <DashboardOverview
          myIdeas={myOverviewIdeas}
          allIdeas={allIdeas}
          isLoading={isOverviewLoading}
          errorMessage={overviewError?.message}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <MyIdeaTracker
        title={title}
        description={description}
        currentPage={currentPage}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        setPageSize={setPageSize}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        data={trackerData}
        filteredIdeas={filteredTrackerIdeas}
        sortedIdeas={sortedTrackerIdeas}
        isLoading={isTrackerLoading}
        error={trackerError}
      />
    </div>
  )
}
