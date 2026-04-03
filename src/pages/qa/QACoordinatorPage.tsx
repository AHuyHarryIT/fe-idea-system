import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  ClipboardCheck,
  Eye,
  FolderKanban,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { Idea } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { useQACoordinatorIdeas } from '@/hooks/useIdeas'
import { auth } from '@/lib/auth'
import { formatAppDateTime, formatMonthLabel, getDateTimestamp } from '@/lib/date'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'

type CoordinatorMetricAccent = 'blue' | 'emerald' | 'violet' | 'amber'

interface MonthlyTrendPoint {
  label: string
  ideas: number
  comments: number
}

interface CategorySlice {
  label: string
  value: number
  percent: number
  colorClassName: string
  textClassName: string
  colorValue: string
}

const metricAccentClassNames: Record<
  CoordinatorMetricAccent,
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
  amber: {
    icon: 'bg-amber-100 text-amber-700',
    badge: 'bg-amber-50 text-amber-700',
  },
}

const categoryPalette = [
  {
    colorClassName: 'bg-blue-500',
    textClassName: 'text-blue-600',
    colorValue: '#3b82f6',
  },
  {
    colorClassName: 'bg-emerald-500',
    textClassName: 'text-emerald-600',
    colorValue: '#10b981',
  },
  {
    colorClassName: 'bg-amber-500',
    textClassName: 'text-amber-600',
    colorValue: '#f59e0b',
  },
  {
    colorClassName: 'bg-violet-500',
    textClassName: 'text-violet-600',
    colorValue: '#8b5cf6',
  },
  {
    colorClassName: 'bg-slate-400',
    textClassName: 'text-slate-500',
    colorValue: '#94a3b8',
  },
]

function normalizeStatus(status?: string) {
  return status?.toLowerCase().replace(/\s+/g, '_')
}

function getCommentCount(idea: Idea) {
  return idea.commentCount ?? idea.comments?.length ?? 0
}

function getIdeaTitle(idea: Idea) {
  return idea.text?.trim() || idea.title?.trim() || 'Untitled idea'
}

function getIdeaDateValue(idea: Idea) {
  return idea.createdAt || idea.createdDate
}

function formatDateLabel(value?: string) {
  return formatAppDateTime(value, 'Unknown date')
}

function getTimestamp(value?: string) {
  if (!value) {
    return 0
  }

  return getDateTimestamp(value)
}

function getStatusMeta(idea: Idea) {
  const normalizedStatus = normalizeStatus(idea.status)

  switch (normalizedStatus) {
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-50 text-emerald-700',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-rose-50 text-rose-700',
      }
    case 'submitted':
    case 'under_review':
    case 'pending':
    case 'pending_review':
    default:
      return {
        label: 'Pending',
        className: 'bg-amber-50 text-amber-700',
      }
  }
}

function buildMonthlyTrend(ideas: Idea[]): MonthlyTrendPoint[] {
  const now = new Date()
  const months = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (4 - index), 1)

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatMonthLabel(date),
      ideas: 0,
      comments: 0,
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
  })

  return months
}

function buildCategoryDistribution(ideas: Idea[]): CategorySlice[] {
  if (ideas.length === 0) {
    return []
  }

  const categoryCounts = Array.from(
    ideas.reduce((counts, idea) => {
      const key = idea.categoryName.trim() || 'Uncategorized'
      counts.set(key, (counts.get(key) ?? 0) + 1)
      return counts
    }, new Map<string, number>()),
  ).sort((left, right) => right[1] - left[1])

  const topCategories = categoryCounts.slice(0, 4)
  const otherTotal = categoryCounts
    .slice(4)
    .reduce((total, [, value]) => total + value, 0)

  const mergedCategories =
    otherTotal > 0 ? [...topCategories, ['Other', otherTotal] as const] : topCategories

  return mergedCategories.map(([label, value], index) => {
    const palette = categoryPalette[index] ?? categoryPalette.at(-1)!

    return {
      label,
      value,
      percent: Math.round((value / ideas.length) * 100),
      colorClassName: palette.colorClassName,
      textClassName: palette.textClassName,
      colorValue: palette.colorValue,
    }
  })
}

function buildPieBackground(slices: CategorySlice[]) {
  if (slices.length === 0) {
    return 'conic-gradient(#e2e8f0 0deg 360deg)'
  }

  let current = 0

  const stops = slices.map((slice) => {
    const start = current
    current += (slice.percent / 100) * 360
    return `${slice.colorValue} ${start}deg ${current}deg`
  })

  return `conic-gradient(${stops.join(', ')})`
}

export default function QACoordinatorPage() {
  const { data, isLoading, error } = useQACoordinatorIdeas()

  const ideas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(data)

    return Array.isArray(ideaList)
      ? [...ideaList]
          .filter((idea) => idea.id)
          .sort(
            (left, right) =>
              getTimestamp(getIdeaDateValue(right)) -
              getTimestamp(getIdeaDateValue(left)),
          )
      : []
  }, [data])

  const contributorCount = useMemo(
    () => new Set(ideas.map((idea) => idea.authorName).filter(Boolean)).size,
    [ideas],
  )

  const totalComments = useMemo(
    () => ideas.reduce((total, idea) => total + getCommentCount(idea), 0),
    [ideas],
  )

  const avgEngagement = ideas.length > 0 ? (totalComments / ideas.length).toFixed(1) : '0.0'
  const latestIdea = ideas.at(0)
  const departmentName =
    auth.getDepartmentName() || latestIdea?.departmentName || 'Your department'
  const monthlyTrend = useMemo(() => buildMonthlyTrend(ideas), [ideas])
  const categoryDistribution = useMemo(
    () => buildCategoryDistribution(ideas),
    [ideas],
  )
  const pieBackground = useMemo(
    () => buildPieBackground(categoryDistribution),
    [categoryDistribution],
  )
  const chartMax = Math.max(
    1,
    ...monthlyTrend.flatMap((point) => [point.ideas, point.comments]),
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

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Department ideas',
            value: isLoading ? '...' : `${ideas.length}`,
            description: 'Total submissions',
            icon: FolderKanban,
            accent: 'blue' as const,
          },
          {
            title: 'Comments',
            value: isLoading ? '...' : `${totalComments}`,
            description: 'Total engagement',
            icon: MessageSquare,
            accent: 'emerald' as const,
          },
          {
            title: 'Contributors',
            value: isLoading ? '...' : `${contributorCount}`,
            description: 'Active staff members',
            icon: Users,
            accent: 'violet' as const,
          },
          {
            title: 'Avg. engagement',
            value: isLoading ? '...' : avgEngagement,
            description: 'Comments per idea',
            icon: TrendingUp,
            accent: 'amber' as const,
          },
        ].map((metric) => {
          const Icon = metric.icon
          const accentClasses = metricAccentClassNames[metric.accent]

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

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Ideas & comments trend"
          description="Recent department activity across the last five months."
        >
          {error ? (
            <EmptyState
              icon={BarChart3}
              title="Trend data unavailable"
              description={error.message}
            />
          ) : ideas.length > 0 ? (
            <div>
              <div className="grid h-72 grid-cols-5 items-end gap-5 rounded-[24px] border border-slate-200 bg-slate-50/70 px-5 pb-5 pt-8">
                {monthlyTrend.map((point) => (
                  <div
                    key={point.label}
                    className="flex h-full flex-col justify-end gap-3"
                  >
                    <div className="flex h-full items-end justify-center gap-2">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="w-5 rounded-t-xl bg-blue-500"
                          style={{
                            height: `${Math.max(
                              10,
                              (point.ideas / chartMax) * 180,
                            )}px`,
                          }}
                        />
                        <span className="text-[11px] font-medium text-slate-400">
                          {point.ideas}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="w-5 rounded-t-xl bg-emerald-500"
                          style={{
                            height: `${Math.max(
                              10,
                              (point.comments / chartMax) * 180,
                            )}px`,
                          }}
                        />
                        <span className="text-[11px] font-medium text-slate-400">
                          {point.comments}
                        </span>
                      </div>
                    </div>
                    <p className="text-center text-xs font-medium text-slate-500">
                      {point.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  Ideas
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Comments
                </span>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No trend data yet"
              description="Activity charts will appear as soon as your department receives ideas."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Ideas by category"
          description="Distribution of department ideas across the most active themes."
        >
          {error ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Category breakdown unavailable"
              description={error.message}
            />
          ) : categoryDistribution.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="flex items-center justify-center">
                <div
                  className="relative h-56 w-56 rounded-full"
                  style={{ background: pieBackground }}
                >
                  <div className="absolute inset-[22%] rounded-full bg-white shadow-inner" />
                </div>
              </div>

              <div className="space-y-3">
                {categoryDistribution.map((slice) => (
                  <div
                    key={slice.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-3 w-3 rounded-full ${slice.colorClassName}`}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {slice.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${slice.textClassName}`}>
                        {slice.percent}%
                      </p>
                      <p className="text-xs text-slate-500">{slice.value} ideas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No category data yet"
              description="Category breakdown will appear after your department receives submissions."
            />
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Recent department ideas"
          description="Newest submissions in your department, with quick access to full review details."
        >
          {error ? (
            <EmptyState
              icon={FolderKanban}
              title="Department ideas unavailable"
              description={error.message}
            />
          ) : ideas.length > 0 ? (
            <div className="space-y-4">
              {ideas.slice(0, 5).map((idea) => {
                const statusMeta = getStatusMeta(idea)

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
                          <span>{formatDateLabel(getIdeaDateValue(idea))}</span>
                          <span>{departmentName}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                        <div className="flex items-center gap-4 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <MessageSquare className="h-4 w-4" />
                            {getCommentCount(idea)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            {idea.viewCount ?? 0}
                          </span>
                        </div>

                        <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
                          <AppButton type="button" variant="ghost">
                            Review details
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
              icon={FolderKanban}
              title="No department ideas yet"
              description="Ideas from your department will appear here as soon as staff submit them."
            />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
