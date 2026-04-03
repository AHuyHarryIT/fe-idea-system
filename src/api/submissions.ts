import { apiClient } from './client'
import type {
  ApiResponse,
  Submission,
  SubmissionCreateRequest,
  SubmissionListResponse,
} from '@/types'

function normalizeSubmissionsResponse(
  data?: Submission[] | SubmissionListResponse,
): Submission[] {
  if (Array.isArray(data)) {
    return data
  }

  if (data && Array.isArray(data.submissions)) {
    return data.submissions
  }

  return []
}

export const submissionService = {
  getActiveSubmissions: async (): Promise<ApiResponse<Submission[]>> => {
    const response = await apiClient.get<Submission[] | SubmissionListResponse>(
      '/submissions',
    )

    if (!response.success) {
      return response as ApiResponse<Submission[]>
    }

    return {
      ...response,
      data: normalizeSubmissionsResponse(response.data),
    }
  },

  getSubmissions: async (): Promise<ApiResponse<Submission[]>> => {
    const response = await apiClient.get<Submission[] | SubmissionListResponse>(
      '/submissions',
    )

    if (!response.success) {
      return response as ApiResponse<Submission[]>
    }

    return {
      ...response,
      data: normalizeSubmissionsResponse(response.data),
    }
  },

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
