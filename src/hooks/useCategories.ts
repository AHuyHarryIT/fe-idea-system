import { useMutation, useQuery } from '@tanstack/react-query'
import type {
  CreateIdeaCategoryRequest,
  IdeaCategoryListQueryParams,
} from '@/types'
import { categoryService } from '@/api/categories'

export const useIdeaCategories = (params?: IdeaCategoryListQueryParams) => {
  return useQuery({
    queryKey: ['ideaCategories', params],
    queryFn: async () => {
      const response = await categoryService.getIdeaCategories(params)
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to load idea categories.')
    },
  })
}

export const useCreateIdeaCategory = () => {
  return useMutation({
    mutationFn: async (request: CreateIdeaCategoryRequest) => {
      const response = await categoryService.createIdeaCategory(request)
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to create idea category.')
    },
  })
}

export const useUpdateIdeaCategory = () => {
  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string
      request: CreateIdeaCategoryRequest
    }) => {
      const response = await categoryService.updateIdeaCategory(id, request)
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to update idea category.')
    },
  })
}

export const useDeleteIdeaCategory = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoryService.deleteIdeaCategory(id)
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to delete idea category.')
    },
  })
}
