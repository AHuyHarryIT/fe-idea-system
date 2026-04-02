import { apiClient } from './client'
import type { ApiResponse } from './client'

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

export const submissionService = {
  getActiveSubmissions: (): Promise<ApiResponse<Submission[]>> =>
    apiClient.get<Submission[]>('/submissions'),
  getSubmissions: (): Promise<ApiResponse<Submission[]>> =>
    apiClient.get<Submission[]>('/submissions'),

  createSubmission: (
    request: SubmissionCreateRequest,
  ): Promise<ApiResponse<Submission>> =>
    apiClient.post<Submission>('/submissions', request),

  updateSubmission: (
    id: string,
    request: SubmissionCreateRequest,
  ): Promise<ApiResponse<Submission>> =>
    apiClient.put<Submission>(`/submissions/${id}`, request),
  deleteSubmission: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete(`/submissions/${id}`),
}
