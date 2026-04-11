import { useMutation, useQuery } from "@tanstack/react-query"
import type {
  SubmissionCreateRequest,
  SubmissionListQueryParams,
} from "@/types"
import { submissionService } from "@/api/submissions"

export const useSubmissions = (
  params?: SubmissionListQueryParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["submissions", params],
    queryFn: async () => {
      const response = await submissionService.getSubmissions(params)
      if (response.success) return response.data
      throw new Error(response.error ?? "Unable to load submissions.")
    },
    enabled: options?.enabled ?? true,
  })
}

export const useSubmission = (submissionId: string) => {
  return useQuery({
    queryKey: ["submission", submissionId],
    queryFn: async () => {
      const response = await submissionService.getSubmissionById(submissionId)
      if (response.success) return response.data
      throw new Error(response.error ?? "Unable to load submission.")
    },
    enabled: !!submissionId,
  })
}

export const useCreateSubmission = () => {
  return useMutation({
    mutationFn: async (request: SubmissionCreateRequest) => {
      const response = await submissionService.createSubmission(request)
      if (response.success) return response.data
      throw new Error(response.error ?? "Unable to create submission.")
    },
  })
}

export const useUpdateSubmission = () => {
  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string
      request: SubmissionCreateRequest
    }) => {
      const response = await submissionService.updateSubmission(id, request)
      if (response.success) return response.data
      throw new Error(response.error ?? "Unable to update submission.")
    },
  })
}

export const useDeleteSubmission = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await submissionService.deleteSubmission(id)
      if (response.success) return response.data
      throw new Error(response.error ?? "Unable to delete submission.")
    },
  })
}
