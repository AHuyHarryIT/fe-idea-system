import { useMutation, useQuery } from '@tanstack/react-query'
import type { SubmissionCreateRequest } from '@/api/submissions'
import { submissionService } from '@/api/submissions'

export const useSubmissions = () => {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const response = await submissionService.getSubmissions()
      if (response.success) return response.data ?? []
      throw new Error(response.error ?? 'Unable to load submissions.')
    },
  })
}

export const useCreateSubmission = () => {
  return useMutation({
    mutationFn: async (request: SubmissionCreateRequest) => {
      const response = await submissionService.createAdminSubmission(request)
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to create submission.')
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
      const response = await submissionService.updateAdminSubmission(id, request)
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to update submission.')
    },
  })
}

export const useDeleteSubmission = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await submissionService.deleteAdminSubmission(id)
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to delete submission.')
    },
  })
}
