import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface Submission {
  id: string
  name: string
  academicYear: string
  closureDate: string
  finalClosureDate: string
}

export interface SubmissionCreateRequest {
  name: string
  academicYear: string
  closureDate: string
  finalClosureDate: string
}

export const submissionService = {
  getActiveSubmissions: (): Promise<ApiResponse<Array<Submission>>> =>
    apiClient.get<Array<Submission>>('/Submission'),
  getSubmissions: (): Promise<ApiResponse<Array<Submission>>> =>
    apiClient.get<Array<Submission>>('/Submission'),

  createSubmission: (
    request: SubmissionCreateRequest,
  ): Promise<ApiResponse<Submission>> =>
    apiClient.post<Submission>('/Submission', request),

  updateSubmission: (
    id: string,
    request: SubmissionCreateRequest,
  ): Promise<ApiResponse<Submission>> =>
    apiClient.put<Submission>(`/Submission/${id}`, request),
  deleteSubmission: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete(`/Submission/${id}`),
}
