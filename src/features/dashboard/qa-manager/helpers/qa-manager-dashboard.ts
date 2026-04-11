import type { Idea } from "@/types"
import { formatAppDateTime, formatMonthLabel } from "@/utils/date"

export interface TrendPoint {
  label: string
  ideas: number
  comments: number
  contributors: number
}

export interface DepartmentSummary {
  name: string
  ideas: number
  comments: number
}

export const QA_MANAGER_TREND_SERIES = [
  { key: "Ideas", color: "#3b82f6" },
  { key: "Comments", color: "#10b981" },
  { key: "Contributors", color: "#8b5cf6" },
] as const

export const QA_MANAGER_DEPARTMENT_SERIES = [
  { key: "Ideas", color: "#3b82f6" },
  { key: "Comments", color: "#10b981" },
] as const

export function isReviewableIdea(status?: string) {
  if (!status) return true

  return [
    "submitted",
    "under_review",
    "pending",
    "pending_review",
    "awaiting_review",
  ].includes(status.toLowerCase().replace(/\s+/g, "_"))
}

export function getCommentCount(idea: Idea) {
  return idea.commentCount ?? idea.comments?.length ?? 0
}

export function getIdeaDateValue(idea: Idea) {
  return idea.createdAt || idea.createdDate
}

export function formatDateLabel(value?: string) {
  return formatAppDateTime(value, "Unknown date")
}

export function getIdeaTitle(idea: Idea) {
  return idea.text?.trim() || idea.title?.trim() || "Untitled idea"
}

export function buildTrendPoints(ideas: Idea[]): TrendPoint[] {
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

export function buildDepartmentSummaries(ideas: Idea[]): DepartmentSummary[] {
  return Array.from(
    ideas.reduce((counts, idea) => {
      const key = idea.departmentName?.trim() || "Unknown"
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
