import { useMemo, useState } from 'react'
import { Bar, Line } from '@ant-design/charts'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Archive,
  BarChart3,
  Download,
  FileText,
  MessageSquare,
  UserRound,
  Users,
} from 'lucide-react'
import type { Idea, Submission } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { exportService } from '@/api/export'
import { SUBMISSION_SELECT_PAGE_SIZE } from '@/constants/submission'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { useQAManagerIdeas } from '@/hooks/useIdeas'
import { useSubmissions } from '@/hooks/useSubmissions'
import {
  formatAppDateTime,
  formatMonthLabel,
  getDateTimestamp,
} from '@/lib/date'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'

interface TrendPoint {
  label: string
  ideas: number
  comments: number
  contributors: number
}

interface DepartmentSummary {
  name: string
  ideas: number
  comments: number
}

const TREND_SERIES = [
  { key: 'Ideas', color: '#3b82f6' },
  { key: 'Comments', color: '#10b981' },
  { key: 'Contributors', color: '#8b5cf6' },
] as const

const DEPARTMENT_SERIES = [
  { key: 'Ideas', color: '#3b82f6' },
  { key: 'Comments', color: '#10b981' },
] as const

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

function getCommentCount(idea: Idea) {
  return idea.commentCount ?? idea.comments?.length ?? 0
}

function getIdeaDateValue(idea: Idea) {
  return idea.createdAt || idea.createdDate
}

function formatDateLabel(value?: string) {
  return formatAppDateTime(value, 'Unknown date')
}

function getIdeaTitle(idea: Idea) {
  return idea.text?.trim() || idea.title?.trim() || 'Untitled idea'
}

function buildTrendPoints(ideas: Idea[]): TrendPoint[] {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatMonthLabel(date),
      ideas: 0,
      comments: 0,
      contributors: new Set<string>(),
    }
  })

  const monthMap = new Map(months.map((month) => [month.key, month]))

  ideas.forEach((idea) => {
    const value = getIdeaDateValue(idea)
    if (!value) return

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return

    const key = `${date.getFullYear()}-${date.getMonth()}`
    const entry = monthMap.get(key)

    if (!entry) return

    entry.ideas += 1
    entry.comments += getCommentCount(idea)

    if (idea.authorName?.trim()) {
      entry.contributors.add(idea.authorName.trim())
    }
  })

  return months.map((month) => ({
    label: month.label,
    ideas: month.ideas,
    comments: month.comments,
    contributors: month.contributors.size,
  }))
}

function buildDepartmentSummaries(ideas: Idea[]): DepartmentSummary[] {
  return Array.from(
    ideas.reduce((counts, idea) => {
      const key = idea.departmentName?.trim() || 'Unknown'
      const current = counts.get(key) ?? { ideas: 0, comments: 0 }

      current.ideas += 1
      current.comments += getCommentCount(idea)

      counts.set(key, current)
      return counts
    }, new Map<string, { ideas: number; comments: number }>()),
  )
    .map(([name, values]) => ({
      name,
      ideas: values.ideas,
      comments: values.comments,
    }))
    .sort((left, right) => right.ideas - left.ideas)
}

function isSubmissionExportReady(submission: Submission) {
  const finalClosure = getDateTimestamp(submission.finalClosureDate)
  return finalClosure > 0 && finalClosure <= Date.now()
}

export default function QAManagerPage() {
  const { data: ideaData, isLoading, error } = useQAManagerIdeas()
  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useSubmissions({ pageNumber: 1, pageSize: SUBMISSION_SELECT_PAGE_SIZE })
  const [activeExportKey, setActiveExportKey] = useState<string | null>(null)
  const [exportFeedback, setExportFeedback] = useState('')

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
        { month: point.label, series: 'Ideas', value: point.ideas },
        { month: point.label, series: 'Comments', value: point.comments },
        {
          month: point.label,
          series: 'Contributors',
          value: point.contributors,
        },
      ]),
    [trendPoints],
  )

  const departmentMax = Math.max(
    1,
    ...departmentSummaries.flatMap((summary) => [summary.ideas, summary.comments]),
  )
  const departmentChartData = useMemo(
    () =>
      departmentSummaries.slice(0, 5).flatMap((summary) => [
        {
          department: summary.name,
          series: 'Ideas',
          value: summary.ideas,
        },
        {
          department: summary.name,
          series: 'Comments',
          value: summary.comments,
        },
      ]),
    [departmentSummaries],
  )

  const exportableSubmissions = useMemo(() => {
    const submissions = submissionsData?.submissions ?? []

    return submissions
      .filter((submission) => isSubmissionExportReady(submission))
        .sort(
          (left, right) =>
            getDateTimestamp(right.finalClosureDate) -
            getDateTimestamp(left.finalClosureDate),
        )
  }, [submissionsData])

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

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Total ideas',
            value: isLoading ? '...' : `${ideas.length}`,
            description: 'Across all departments',
            icon: FileText,
            iconClassName: 'bg-blue-100 text-blue-700',
            badgeClassName: 'bg-blue-50 text-blue-700',
          },
          {
            title: 'Total comments',
            value: isLoading ? '...' : `${totalComments}`,
            description: 'Community engagement',
            icon: MessageSquare,
            iconClassName: 'bg-emerald-100 text-emerald-700',
            badgeClassName: 'bg-emerald-50 text-emerald-700',
          },
          {
            title: 'Active contributors',
            value: isLoading ? '...' : `${contributorCount}`,
            description: 'Staff participation',
            icon: Users,
            iconClassName: 'bg-violet-100 text-violet-700',
            badgeClassName: 'bg-violet-50 text-violet-700',
          },
          {
            title: 'Pending review',
            value: isLoading ? '...' : `${reviewQueue.length}`,
            description: 'Needs attention',
            icon: AlertCircle,
            iconClassName: 'bg-amber-100 text-amber-700',
            badgeClassName: 'bg-amber-50 text-amber-700',
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

      <div className="mt-6">
        <SectionCard
          title="Export Data"
          description="Download comprehensive reports after final closure date."
        >
          {submissionsError ? (
            <EmptyState
              icon={Archive}
              title="Export data unavailable"
              description={submissionsError.message}
            />
          ) : submissionsLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Loading export options...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <AppButton
                  type="button"
                  disabled={activeExportKey !== null}
                  onClick={async () => {
                    setActiveExportKey('all-csv')
                    setExportFeedback('')

                    try {
                      await exportService.exportQAManagerIdeasAsCSV()
                      setExportFeedback('Downloaded university-wide CSV export.')
                    } catch (downloadError) {
                      setExportFeedback(
                        downloadError instanceof Error
                          ? downloadError.message
                          : 'Unable to download CSV export.',
                      )
                    } finally {
                      setActiveExportKey(null)
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {activeExportKey === 'all-csv'
                    ? 'Downloading...'
                    : 'Export as CSV'}
                </AppButton>

                <AppButton
                  type="button"
                  variant="secondary"
                  disabled={activeExportKey !== null}
                  onClick={async () => {
                    setActiveExportKey('all-zip')
                    setExportFeedback('')

                    try {
                      await exportService.exportQAManagerIdeasAsZip()
                      setExportFeedback('Downloaded all documents ZIP export.')
                    } catch (downloadError) {
                      setExportFeedback(
                        downloadError instanceof Error
                          ? downloadError.message
                          : 'Unable to download ZIP export.',
                      )
                    } finally {
                      setActiveExportKey(null)
                    }
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {activeExportKey === 'all-zip'
                    ? 'Downloading...'
                    : 'Download All Documents (ZIP)'}
                </AppButton>
              </div>

              {exportableSubmissions.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {exportableSubmissions.slice(0, 3).map((submission) => (
                    <div
                      key={submission.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {submission.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Final closure {formatDateLabel(submission.finalClosureDate)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {submission.ideaCount ?? 0} ideas captured
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {exportFeedback ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {exportFeedback}
                </p>
              ) : null}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="University-wide trends"
          description="Recent movement across ideas, comments, and contributors."
        >
          {error ? (
            <EmptyState
              icon={BarChart3}
              title="Trend data unavailable"
              description={error.message}
            />
          ) : ideas.length > 0 ? (
            <div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                <Line
                  data={trendChartData}
                  xField="month"
                  yField="value"
                  seriesField="series"
                  height={288}
                  colorField="series"
                  scale={{
                    color: {
                      domain: TREND_SERIES.map((series) => series.key),
                      range: TREND_SERIES.map((series) => series.color),
                    },
                  }}
                  smooth
                  style={{ lineWidth: 3 }}
                  point={{
                    size: 4,
                    shape: 'circle',
                    style: {
                      fill: '#ffffff',
                      lineWidth: 2,
                    },
                  }}
                  legend={false}
                  tooltip={{ title: 'month' }}
                  axis={{
                    x: {
                      title: false,
                      line: true,
                      tick: false,
                    },
                    y: {
                      title: false,
                      grid: true,
                    },
                  }}
                />

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                  {TREND_SERIES.map((series) => (
                    <span
                      key={series.key}
                      className="inline-flex items-center gap-2"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: series.color }}
                      />
                      {series.key}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No trend data yet"
              description="Trend lines will appear after the idea feed has more activity."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Department comparison"
          description="Compare idea volume and comment activity between departments."
        >
          {error ? (
            <EmptyState
              icon={Users}
              title="Department data unavailable"
              description={error.message}
            />
          ) : departmentSummaries.length > 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <Bar
                data={departmentChartData}
                xField="department"
                yField="value"
                seriesField="series"
                colorField="series"
                height={320}
                group
                scale={{
                  color: {
                    domain: DEPARTMENT_SERIES.map((series) => series.key),
                    range: DEPARTMENT_SERIES.map((series) => series.color),
                  },
                  y: {
                    domainMax: departmentMax,
                  },
                }}
                legend={false}
                tooltip={{ title: 'department' }}
                axis={{
                  x: {
                    title: false,
                  },
                  y: {
                    title: false,
                    grid: true,
                  },
                }}
                label={{
                  text: 'value',
                  position: 'inside',
                  style: {
                    fill: '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    stroke: 'rgba(15, 23, 42, 0.15)',
                    lineWidth: 2,
                  },
                }}
              />

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                {DEPARTMENT_SERIES.map((series) => (
                  <span
                    key={series.key}
                    className="inline-flex items-center gap-2"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: series.color }}
                    />
                    {series.key}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No department data yet"
              description="Department comparisons will appear after idea activity is recorded."
            />
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Ideas without comments"
          description="Follow-up ideas that still need coordinator outreach."
        >
          {error ? (
            <EmptyState
              icon={AlertCircle}
              title="Follow-up queue unavailable"
              description={error.message}
            />
          ) : ideasWithoutComments.length > 0 ? (
            <div className="space-y-4">
              {ideasWithoutComments.map((idea) => (
                <div
                  key={idea.id}
                  className="rounded-[22px] border border-amber-200 bg-amber-50/60 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {getIdeaTitle(idea)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {idea.categoryName || 'Uncategorized'}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDateLabel(getIdeaDateValue(idea))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={AlertCircle}
              title="No ideas without comments"
              description="Ideas without comments will appear here for follow-up."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Anonymous submissions"
          description="Anonymous ideas currently visible in the analytics feed."
        >
          {error ? (
            <EmptyState
              icon={UserRound}
              title="Anonymous idea data unavailable"
              description={error.message}
            />
          ) : anonymousIdeas.length > 0 ? (
            <div className="space-y-4">
              {anonymousIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="rounded-[22px] border border-violet-200 bg-violet-50/60 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {getIdeaTitle(idea)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {idea.categoryName || 'Uncategorized'}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {getCommentCount(idea)} comments
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={UserRound}
              title="No anonymous ideas in the feed"
              description="Anonymous submissions will appear here when the feed contains them."
            />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
