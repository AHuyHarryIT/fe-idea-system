import { useMutation, useQuery } from '@tanstack/react-query'
import type { CreateIdeaCategoryRequest } from '@/api/categories'
import { categoryService } from '@/api/categories'

// Retrieves the list of idea categories used across the system.
export const useIdeaCategories = () => {
  return useQuery({
    queryKey: ['ideaCategories'],
    queryFn: async () => {
      const response = await categoryService.getIdeaCategories()
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to load idea categories.')
    },
  })
}

// Creates a new idea category.
export const useCreateIdeaCategory = () => {
  return useMutation({
    mutationFn: async (request: CreateIdeaCategoryRequest) => {
      const response = await categoryService.createIdeaCategory(request)
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to create idea category.')
    },
  })
}

// Deletes an existing idea category.
export const useDeleteIdeaCategory = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoryService.deleteIdeaCategory(id)
      if (response.success) return response.data
      throw new Error(response.error ?? 'Unable to delete idea category.')
    },
  })
}
