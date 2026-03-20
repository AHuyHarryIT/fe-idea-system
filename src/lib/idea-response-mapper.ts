import type { Idea } from '@/api'

/**
 * Normalize API responses for ideas
 * Handles multiple response formats from the backend:
 * - Direct array: [{id, title, ...}]
 * - Wrapped object: {ideas: [{...}]} or {items: [{...}]}
 * - Paged object: {items: [...], pageNumber: 1, pageSize: 10}
 */
export function normalizeIdeaResponse(data: any): Idea[] {
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
function mapIdeaFields(idea: any): Idea {
  return {
    ...idea,
    // Map title to text if text doesn't exist
    text: idea.text || idea.title,
  }
}
