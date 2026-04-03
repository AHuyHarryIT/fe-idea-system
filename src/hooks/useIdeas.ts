import { useMutation, useQuery } from '@tanstack/react-query'
import type {
  CommentCreateRequest,
  IdeaListQueryParams,
  ReviewIdeaRequest,
  VoteRequest,
} from '@/types'
import { ideaService } from '@/api'

export const useMyIdeas = (params?: IdeaListQueryParams) => {
  return useQuery({
    queryKey: ['myIdeas', params],
    queryFn: async () => {
      const response = await ideaService.getMyIdeas(params)
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useAllIdeas = (
  params?: IdeaListQueryParams,
) => {
  return useQuery({
    queryKey: ['allIdeas', params],
    queryFn: async () => {
      const response = await ideaService.getAllIdeas(params)
      if (response.success) return response.data
      throw new Error(response.error)
    },
    placeholderData: (previousData) => previousData,
  })
}

export const useAllIdeasMatching = (params?: IdeaListQueryParams) => {
  return useQuery({
    queryKey: ['allIdeasMatching', params],
    queryFn: async () => {
      const response = await ideaService.getAllIdeasMatching(params)
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useIdeaById = (id: string) => {
  return useQuery({
    queryKey: ['idea', id],
    queryFn: async () => {
      const response = await ideaService.getIdeaById(id)
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useCreateIdea = () => {
  return useMutation({
    mutationFn: (data: Parameters<typeof ideaService.createIdea>[0]) =>
      ideaService.createIdea(data),
  })
}

export const useSubmitIdea = () => {
  return useMutation({
    mutationFn: (formData: FormData) => ideaService.submitIdea(formData),
    onSuccess: () => {
      // Invalidate the queries
    },
  })
}

export const useVoteOnIdea = () => {
  return useMutation({
    mutationFn: ({
      ideaId,
      request,
    }: {
      ideaId: string
      request: VoteRequest
    }) => ideaService.voteOnIdea(ideaId, request),
  })
}

export const useAddComment = () => {
  return useMutation({
    mutationFn: ({
      ideaId,
      request,
    }: {
      ideaId: string
      request: CommentCreateRequest
    }) => ideaService.addComment(ideaId, request),
  })
}

export const useReviewIdea = () => {
  return useMutation({
    mutationFn: ({
      ideaId,
      request,
    }: {
      ideaId: string
      request: ReviewIdeaRequest
    }) => ideaService.reviewIdea(ideaId, request),
  })
}

// Unified methods (no role-specific variants needed)
export const useQACoordinatorIdeas = () => {
  return useQuery({
    queryKey: ['qaCoordinatorIdeas'],
    queryFn: async () => {
      const response = await ideaService.getAllIdeasMatching()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useAdminIdeas = () => {
  return useQuery({
    queryKey: ['adminIdeas'],
    queryFn: async () => {
      const response = await ideaService.getAllIdeasMatching()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useQAManagerIdeas = () => {
  return useQuery({
    queryKey: ['qaManagerIdeas'],
    queryFn: async () => {
      const response = await ideaService.getAllIdeasMatching()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}
