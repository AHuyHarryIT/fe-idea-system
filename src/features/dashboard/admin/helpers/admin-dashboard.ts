import type { Submission } from "@/types"
import { getDateTimestamp } from "@/utils/date"

export function isAdminSubmissionOpen(submission: Submission) {
  const finalClosureTimestamp = getDateTimestamp(submission.finalClosureDate)
  return finalClosureTimestamp > Date.now()
}

export function getAdminStatValue(value?: number) {
  return typeof value === "number" ? value : 0
}
