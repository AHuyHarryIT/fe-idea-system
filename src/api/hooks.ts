import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from './client'
import type { AxiosError } from 'axios'

// Generic GET hook
export function useApiQuery<TData = unknown, TError = AxiosError>(
  key: string | Array<string>,
  url: string,
  options?: any,
) {
  return useQuery<TData, TError>({
    queryKey: typeof key === 'string' ? [key] : key,
    queryFn: async () => {
      const { data } = await axiosInstance.get<TData>(url)
      return data
    },
    ...options,
  })
}

// Generic POST hook
export function useApiMutation<
  TData = unknown,
  TError = AxiosError,
  TVariables = unknown,
>(options?: any) {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const { data } = await axiosInstance.post<TData>('', variables)
      return data
    },
    ...options,
  })
}

// Generic PUT hook
export function useApiUpdateMutation<
  TData = unknown,
  TError = AxiosError,
  TVariables = unknown,
>(options?: any) {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables & { id: string | number }) => {
      const { id, ...data } = variables as any
      const { data: response } = await axiosInstance.put<TData>(`/${id}`, data)
      return response
    },
    ...options,
  })
}

// Generic DELETE hook
export function useApiDeleteMutation<
  TData = unknown,
  TError = AxiosError,
  TVariables = unknown,
>(options?: any) {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (id: TVariables) => {
      const { data } = await axiosInstance.delete<TData>(`/${id}`)
      return data
    },
    ...options,
  })
}

// Utility hook to get query client
export function useQueryClientInstance() {
  return useQueryClient()
}
