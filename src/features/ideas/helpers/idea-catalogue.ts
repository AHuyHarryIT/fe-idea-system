import type { IdeaCategory, Submission } from '@/types'

export const DEFAULT_IDEA_CATALOGUE_PAGE_SIZE = 5
export const IDEA_CATALOGUE_PAGE_SIZE_OPTIONS = ['5', '10', '20', '50']
export const IDEA_OPTION_SCROLL_THRESHOLD = 16

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
