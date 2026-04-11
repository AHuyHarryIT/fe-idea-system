import { createCrudServiceWithNormalizer } from "./crud-service-factory"
import type {
  Submission,
  SubmissionCreateRequest,
  SubmissionListQueryParams,
  SubmissionListResponse,
} from "@/types"

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

const baseSubmissionService = createCrudServiceWithNormalizer<
  Submission,
  SubmissionCreateRequest,
  SubmissionCreateRequest,
  SubmissionListResponse,
  SubmissionListQueryParams,
  Submission[] | SubmissionListResponse
>("/submissions", normalizeSubmissionsResponse)

export const submissionService = {
  // Main API methods
  getAll: baseSubmissionService.getAll,
  getById: baseSubmissionService.getById,
  create: baseSubmissionService.create,
  update: baseSubmissionService.update,
  delete: baseSubmissionService.delete,

  // Legacy aliases for backward compatibility
  getActiveSubmissions: baseSubmissionService.getAll,
  getSubmissions: baseSubmissionService.getAll,
  createSubmission: baseSubmissionService.create,
  updateSubmission: baseSubmissionService.update,
  deleteSubmission: baseSubmissionService.delete,
}
