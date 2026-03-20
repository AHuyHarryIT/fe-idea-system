import { useMutation, useQuery } from '@tanstack/react-query'
import type { CreateCategoryRequest } from '@/api'
import { categoryService } from '@/api'

export const useStaffCategories = () => {
  return useQuery({
    queryKey: ['staffCategories'],
    queryFn: async () => {
      const response = await categoryService.getStaffCategories()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const response = await categoryService.getAdminCategories()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useCreateAdminCategory = () => {
  return useMutation({
    mutationFn: (request: CreateCategoryRequest) =>
      categoryService.createAdminCategory(request),
  })
}

export const useDeleteAdminCategory = () => {
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteAdminCategory(id),
  })
}

export const useQAManagerCategories = () => {
  return useQuery({
    queryKey: ['qaManagerCategories'],
    queryFn: async () => {
      const response = await categoryService.getQAManagerCategories()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useCreateQAManagerCategory = () => {
  return useMutation({
    mutationFn: (request: CreateCategoryRequest) =>
      categoryService.createQAManagerCategory(request),
  })
}

export const useDeleteQAManagerCategory = () => {
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteQAManagerCategory(id),
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryService.getCategories()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}
