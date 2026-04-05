import { getDateTimestamp } from '@/utils/date'

export const DEFAULT_SUBMISSION_PAGE_SIZE = 10
export const SUBMISSION_PAGE_SIZE_OPTIONS = ['10', '20', '50']

export function isSubmissionClosed(closureDate?: string) {
  const closureTimestamp = getDateTimestamp(closureDate)

  return closureTimestamp > 0 && closureTimestamp < Date.now()
}

export function isPdfFile(file: File) {
  const normalizedType = file.type.toLowerCase()
  const normalizedName = file.name.toLowerCase()

  return normalizedType === 'application/pdf' || normalizedName.endsWith('.pdf')
}
