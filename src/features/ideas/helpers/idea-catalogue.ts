import type { Idea, IdeaCategory, Submission } from '@/types'
import { getDateTimestamp } from '@/utils/date'

export const DEFAULT_IDEA_CATALOGUE_PAGE_SIZE = 10
export const IDEA_CATALOGUE_PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']
export const IDEA_OPTION_SCROLL_THRESHOLD = 16
export type IdeaCatalogueSortOption = 'newest' | 'most-liked' | 'most-viewed'

export const IDEA_CATALOGUE_SORT_OPTIONS: {
  label: string
  value: IdeaCatalogueSortOption
}[] = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Most liked', value: 'most-liked' },
  { label: 'Most viewed', value: 'most-viewed' },
]

export interface SelectOptionItem {
  label: string
  value: string
}

export function appendUniqueCategoryOptions(
  currentOptions: SelectOptionItem[],
  categories: IdeaCategory[],
) {
  const seenValues = new Set(currentOptions.map((option) => option.value))
  const nextOptions = [...currentOptions]

  categories.forEach((categoryOption) => {
    if (!seenValues.has(categoryOption.id)) {
      nextOptions.push({
        value: categoryOption.id,
        label: categoryOption.name,
      })
    }
  })

  return nextOptions
}

export function appendUniqueSubmissionOptions(
  currentOptions: SelectOptionItem[],
  submissions: Submission[],
) {
  const seenValues = new Set(currentOptions.map((option) => option.value))
  const nextOptions = [...currentOptions]

  submissions.forEach((submissionOption) => {
    if (!seenValues.has(submissionOption.id)) {
      nextOptions.push({
        value: submissionOption.id,
        label: submissionOption.name,
      })
    }
  })

  return nextOptions
}

export function sortIdeaCatalogueItems(
  ideas: Idea[],
  sortBy: IdeaCatalogueSortOption,
) {
  const nextIdeas = [...ideas]

  nextIdeas.sort((left, right) => {
    if (sortBy === 'most-liked') {
      const likeDifference = (right.thumbsUpCount ?? 0) - (left.thumbsUpCount ?? 0)
      if (likeDifference !== 0) {
        return likeDifference
      }
    }

    if (sortBy === 'most-viewed') {
      const viewDifference = (right.viewCount ?? 0) - (left.viewCount ?? 0)
      if (viewDifference !== 0) {
        return viewDifference
      }
    }

    return (
      getDateTimestamp(right.createdAt || right.createdDate) -
      getDateTimestamp(left.createdAt || left.createdDate)
    )
  })

  return nextIdeas
}
