import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/api'

export const useGeneralDashboard = () => {
  return useQuery({
    queryKey: ['generalDashboard'],
    queryFn: async () => {
      const response = await dashboardService.getGeneralDashboard()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useDepartmentStats = () => {
  return useQuery({
    queryKey: ['departmentStats'],
    queryFn: async () => {
      const response = await dashboardService.getDepartmentStats()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useIdeasWithoutComments = () => {
  return useQuery({
    queryKey: ['ideasWithoutComments'],
    queryFn: async () => {
      const response = await dashboardService.getIdeasWithoutComments()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await dashboardService.getAdminDashboard()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useAdminStatistics = () => {
  return useQuery({
    queryKey: ['adminStatistics'],
    queryFn: async () => {
      const response = await dashboardService.getAdminStatistics()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useQACoordinatorDashboard = () => {
  return useQuery({
    queryKey: ['qaCoordinatorDashboard'],
    queryFn: async () => {
      const response = await dashboardService.getQACoordinatorDashboard()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useQACoordinatorStatistics = () => {
  return useQuery({
    queryKey: ['qaCoordinatorStatistics'],
    queryFn: async () => {
      const response = await dashboardService.getQACoordinatorStatistics()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useQAManagerDashboard = () => {
  return useQuery({
    queryKey: ['qaManagerDashboard'],
    queryFn: async () => {
      const response = await dashboardService.getQAManagerDashboard()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}

export const useQAManagerStatistics = () => {
  return useQuery({
    queryKey: ['qaManagerStatistics'],
    queryFn: async () => {
      const response = await dashboardService.getQAManagerStatistics()
      if (response.success) return response.data
      throw new Error(response.error)
    },
  })
}
