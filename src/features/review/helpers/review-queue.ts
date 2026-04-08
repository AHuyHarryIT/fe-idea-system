import type { Idea } from '@/types'
import { getDateTimestamp } from '@/utils/date'

export const DEFAULT_REVIEW_PAGE_SIZE = 10

export function getReviewStatusLabel(status?: string) {
  if (!status) return 'Pending review'
  return status.replace(/_/g, ' ')
}

export function getReviewErrorMessage(error?: string) {
  if (error === 'HTTP 404') {
    return 'This idea could not be found in the review queue.'
  }

  return error ?? 'Unable to update the review decision.'
}

export function sortReviewIdeasByNewest(left: Idea, right: Idea) {
  return (
    getDateTimestamp(right.createdAt || right.createdDate) -
    getDateTimestamp(left.createdAt || left.createdDate)
  )
}

export function isReviewableIdea(status?: string) {
  if (!status) return true

  return [
    'submitted',
    'under_review',
    'pending',
    'pending_review',
    'awaiting_review',
  ].includes(status.toLowerCase().replace(/\s+/g, '_'))
}
