import type { Idea } from '@/types'

export type IdeaStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'
export type OverviewMetricAccent = 'blue' | 'emerald' | 'violet'

export const DEFAULT_MY_IDEA_PAGE_SIZE = 10
export const MY_IDEA_PAGE_SIZE_OPTIONS = ['5', '10', '20', '50']

export const overviewMetricAccentClassNames: Record<
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

export function getIdeaStatusValue(idea: Idea): Exclude<IdeaStatusFilter, 'all'> {
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

export function getIdeaStatusMeta(status: Exclude<IdeaStatusFilter, 'all'>) {
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

export function getIdeaTitle(idea: Idea) {
  return idea.text?.trim() || idea.title?.trim() || 'Untitled idea'
}

export function getIdeaDateValue(idea: Idea) {
  return idea.createdAt || idea.createdDate
}

export function getReactionScore(idea: Idea) {
  return (idea.thumbsUpCount ?? 0) - (idea.thumbsDownCount ?? 0)
}
