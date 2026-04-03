export interface Submission {
  id: string
  name: string
  description?: string | null
  academicYear: string
  closureDate: string
  finalClosureDate: string
  ideaCount?: number
  isActive?: boolean
}

export interface SubmissionCreateRequest {
  name: string
  academicYear: string
  closureDate: string
  finalClosureDate: string
}

export interface SubmissionListResponse {
  submissions?: Submission[]
}
