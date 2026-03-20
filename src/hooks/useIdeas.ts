import { useMutation, useQuery } from '@tanstack/react-query'
import type { CommentCreateRequest, VoteRequest } from '@/api'
import { ideaService } from '@/api'

export const useMyIdeas = () => {
  return useQuery({
    queryKey: ['myIdeas'],
    queryFn: async () => {
      const response = await ideaService.getMyIdeas()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useAllIdeas = () => {
  return useQuery({
    queryKey: ['allIdeas'],
    queryFn: async () => {
      const response = await ideaService.getAllIdeas()
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

export const useQACoordinatorIdeas = () => {
  return useQuery({
    queryKey: ['qaCoordinatorIdeas'],
    queryFn: async () => {
      const response = await ideaService.getQACoordinatorIdeas()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useAdminIdeas = () => {
  return useQuery({
    queryKey: ['adminIdeas'],
    queryFn: async () => {
      const response = await ideaService.getAllIdeasAsAdmin()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useQAManagerIdeas = () => {
  return useQuery({
    queryKey: ['qaManagerIdeas'],
    queryFn: async () => {
      const response = await ideaService.getQAManagerIdeas()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}
