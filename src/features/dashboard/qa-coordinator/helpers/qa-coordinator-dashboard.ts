import type { Idea } from '@/types'
import { formatAppDateTime, formatMonthLabel, getDateTimestamp } from '@/utils/date'

export type CoordinatorMetricAccent = 'blue' | 'emerald' | 'violet' | 'amber'

export interface MonthlyTrendPoint {
  label: string
  ideas: number
  comments: number
}

export interface CategorySlice {
  label: string
  value: number
  percent: number
  colorValue: string
}

export interface CoordinatorChartPoint {
  month: string
  series: 'Ideas' | 'Comments'
  value: number
}

export const coordinatorMetricAccentClassNames: Record<
  CoordinatorMetricAccent,
  { icon: string; badge: string }
> = {
  blue: { icon: 'bg-blue-100 text-blue-700', badge: 'bg-blue-50 text-blue-700' },
  emerald: { icon: 'bg-emerald-100 text-emerald-700', badge: 'bg-emerald-50 text-emerald-700' },
  violet: { icon: 'bg-violet-100 text-violet-700', badge: 'bg-violet-50 text-violet-700' },
  amber: { icon: 'bg-amber-100 text-amber-700', badge: 'bg-amber-50 text-amber-700' },
}

export const coordinatorCategoryPalette = [
  { colorValue: '#3b82f6' },
  { colorValue: '#10b981' },
  { colorValue: '#f59e0b' },
  { colorValue: '#8b5cf6' },
  { colorValue: '#94a3b8' },
]

export const coordinatorTrendSeriesColors = {
  Ideas: '#3b82f6',
  Comments: '#10b981',
} as const

export function normalizeCoordinatorStatus(status?: string) {
  return status?.toLowerCase().replace(/\s+/g, '_')
}

export function getCoordinatorCommentCount(idea: Idea) {
  return idea.commentCount ?? idea.comments?.length ?? 0
}

export function getCoordinatorIdeaTitle(idea: Idea) {
  return idea.text?.trim() || idea.title?.trim() || 'Untitled idea'
}

export function getCoordinatorIdeaDateValue(idea: Idea) {
  return idea.createdAt || idea.createdDate
}

export function formatCoordinatorDateLabel(value?: string) {
  return formatAppDateTime(value, 'Unknown date')
}

export function getCoordinatorTimestamp(value?: string) {
  if (!value) return 0
  return getDateTimestamp(value)
}

export function getCoordinatorStatusMeta(idea: Idea) {
  const normalizedStatus = normalizeCoordinatorStatus(idea.status)
  switch (normalizedStatus) {
    case 'approved':
      return { label: 'Approved', className: 'bg-emerald-50 text-emerald-700' }
    case 'rejected':
      return { label: 'Rejected', className: 'bg-rose-50 text-rose-700' }
    default:
      return { label: 'Pending', className: 'bg-amber-50 text-amber-700' }
  }
}

export function buildCoordinatorMonthlyTrend(ideas: Idea[]): MonthlyTrendPoint[] {
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
    const value = getCoordinatorIdeaDateValue(idea)
    if (!value) return
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return
    const entry = monthMap.get(`${date.getFullYear()}-${date.getMonth()}`)
    if (!entry) return
    entry.ideas += 1
    entry.comments += getCoordinatorCommentCount(idea)
  })
  return months
}

export function buildCoordinatorCategoryDistribution(ideas: Idea[]): CategorySlice[] {
  if (ideas.length === 0) return []
  const categoryCounts = Array.from(
    ideas.reduce((counts, idea) => {
      const key = idea.categoryName.trim() || 'Uncategorized'
      counts.set(key, (counts.get(key) ?? 0) + 1)
      return counts
    }, new Map<string, number>()),
  ).sort((left, right) => right[1] - left[1])
  const topCategories = categoryCounts.slice(0, 4)
  const otherTotal = categoryCounts.slice(4).reduce((total, [, value]) => total + value, 0)
  const mergedCategories = otherTotal > 0 ? [...topCategories, ['Other', otherTotal] as const] : topCategories
  return mergedCategories.map(([label, value], index) => {
    const palette = coordinatorCategoryPalette[index] ?? coordinatorCategoryPalette.at(-1)!
    return { label, value, percent: Math.round((value / ideas.length) * 100), colorValue: palette.colorValue }
  })
}
