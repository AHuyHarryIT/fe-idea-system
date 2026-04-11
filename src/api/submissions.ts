import { apiClient } from './client'
import type {
  ApiResponse,
  Submission,
  SubmissionCreateRequest,
  SubmissionListQueryParams,
  SubmissionListResponse,
} from '@/types'

function normalizeSubmissionsResponse(
  data?: Submission[] | SubmissionListResponse,
): SubmissionListResponse {
  if (Array.isArray(data)) {
    return { submissions: data }
  }

  if (data) {
    return {
      submissions: Array.isArray(data.submissions) ? data.submissions : [],
      pagination: data.pagination,
    }
  }

  return { submissions: [] }
}

export const submissionService = {
  getActiveSubmissions: async (
    params?: SubmissionListQueryParams,
  ): Promise<ApiResponse<SubmissionListResponse>> => {
    const response = await apiClient.get<
      Submission[] | SubmissionListResponse,
      SubmissionListQueryParams
    >('/submissions', { params })

    if (!response.success) {
      return response as ApiResponse<SubmissionListResponse>
    }

    return {
      ...response,
      data: normalizeSubmissionsResponse(response.data),
    }
  },

  getSubmissions: async (
    params?: SubmissionListQueryParams,
  ): Promise<ApiResponse<SubmissionListResponse>> => {
    const response = await apiClient.get<
      Submission[] | SubmissionListResponse,
      SubmissionListQueryParams
    >('/submissions', { params })

    if (!response.success) {
      return response as ApiResponse<SubmissionListResponse>
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

  getSubmissionById: async (
    id: string,
  ): Promise<ApiResponse<Submission>> => {
    const response = await apiClient.get<
      Submission[] | SubmissionListResponse,
      SubmissionListQueryParams
    >('/submissions', { params: { fetchAll: true } })

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      }
    }

    const submissions = Array.isArray(response.data)
      ? response.data
      : response.data?.submissions ?? []
    const submission = submissions.find((s) => s.id === id)

    if (!submission) {
      return {
        success: false,
        error: 'Submission not found',
      }
    }

    return {
      success: true,
      data: submission,
    }
  },
}
