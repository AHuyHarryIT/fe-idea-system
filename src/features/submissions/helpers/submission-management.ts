import type { Submission } from "@/types"
import { getDateTimestamp, getDateYear } from "@/utils/date"

export interface SubmissionManagementFormState {
  name: string
  description: string
  closureDate: string
  finalClosureDate: string
}

export const initialSubmissionManagementForm: SubmissionManagementFormState = {
  name: "",
  description: "",
  closureDate: "",
  finalClosureDate: "",
}

export const DEFAULT_SUBMISSION_MANAGEMENT_PAGE_SIZE = 10
export const SUBMISSION_MANAGEMENT_PAGE_SIZE_OPTIONS = ["10", "20", "50"]

export function getSubmissionAcademicYearFallback(closureDate: string) {
  return getDateYear(closureDate)
}

export type SubmissionLifecycle = "open" | "closed" | "archived"

export function getSubmissionLifecycle(submission: {
  closureDate: string
  finalClosureDate: string
}): SubmissionLifecycle {
  const now = Date.now()
  const closureDate = getDateTimestamp(submission.closureDate)
  const finalClosureDate = getDateTimestamp(submission.finalClosureDate)

  if (finalClosureDate && now > finalClosureDate) {
    return "archived"
  }

  if (closureDate && now > closureDate) {
    return "closed"
  }

  return "open"
}

export function getSubmissionLifecycleMeta(lifecycle: SubmissionLifecycle) {
  switch (lifecycle) {
    case "archived":
      return {
        label: "Archived",
        className: "bg-slate-200 text-slate-700",
      }
    case "closed":
      return {
        label: "Closed",
        className: "bg-amber-100 text-amber-800",
      }
    case "open":
    default:
      return {
        label: "Open",
        className: "bg-emerald-100 text-emerald-700",
      }
  }
}

export function validateSubmissionManagementForm(
  form: SubmissionManagementFormState,
) {
  if (!form.name.trim() || !form.closureDate || !form.finalClosureDate) {
    return "Please complete all submission fields."
  }

  if (new Date(form.finalClosureDate) < new Date(form.closureDate)) {
    return "Final closure date must be later than or equal to closure date."
  }

  return null
}

export function buildSubmissionManagementPayload(
  form: SubmissionManagementFormState,
) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    academicYear: getSubmissionAcademicYearFallback(form.closureDate),
    closureDate: form.closureDate,
    finalClosureDate: form.finalClosureDate,
  }
}

export function buildSubmissionEditForm(
  submission: Submission,
  formatDateTimeInputValue: (value: string) => string,
): SubmissionManagementFormState {
  return {
    name: submission.name,
    description: submission.description || "",
    closureDate: formatDateTimeInputValue(submission.closureDate),
    finalClosureDate: formatDateTimeInputValue(submission.finalClosureDate),
  }
}
