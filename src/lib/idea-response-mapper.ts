import type { Idea } from '@/types'

type IdeaResponseData =
  | Idea[]
  | {
      ideas?: Idea[]
      items?: Idea[]
    }
  | null
  | undefined

function mapReviewStatusToStatus(value: number | string | null | undefined): Idea['status'] {
  if (typeof value === 'number') {
    switch (value) {
      case 0:
        return 'pending_review'
      case 1:
        return 'approved'
      case 2:
        return 'rejected'
      default:
        return undefined
    }
  }

  if (typeof value === 'string' && value.trim()) {
    const numericValue = Number(value)

    if (Number.isFinite(numericValue)) {
      return mapReviewStatusToStatus(numericValue)
    }
  }

  return undefined
}

/**
 * Normalize API responses for ideas
 * Handles multiple response formats from the backend:
 * - Direct array: [{id, title, ...}]
 * - Wrapped object: {ideas: [{...}]} or {items: [{...}]}
 * - Paged object: {items: [...], pageNumber: 1, pageSize: 10}
 */
export function normalizeIdeaResponse(data: IdeaResponseData): Idea[] {
  if (!data) return []

  // If it's already an array of ideas, use it directly
  if (Array.isArray(data)) {
    return data.map(mapIdeaFields)
  }

  // If it's an object with ideas or items property
  const ideaArray = data.ideas || data.items || []
  if (!Array.isArray(ideaArray)) return []

  return ideaArray.map(mapIdeaFields)
}

/**
 * Map API idea fields to frontend format
 * Handles field name mismatches between API and frontend
 */
function mapIdeaFields(idea: Idea): Idea {
  return {
    ...idea,
    // Map title to text if text doesn't exist
    text: idea.text || idea.title,
    status: idea.status || mapReviewStatusToStatus(idea.reviewStatus),
    commentCount:
      idea.commentCount ?? idea.commentsCount ?? idea.comments?.length ?? 0,
  }
}
