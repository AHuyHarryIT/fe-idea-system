import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface DashboardStats {
  totalIdeas?: number
  totalVotes?: number
  totalComments?: number
  departmentIdeas?: number
  pendingReview?: number
}

export interface DepartmentStat {
  departmentName: string
  ideaCount: number
  percentage: number
  contributorCount?: number
}

export interface StaffDashboard {
  stats: DashboardStats
  recentIdeas: Array<{ id: string; text: string; createdAt: string }>
}

export interface AdminDashboard {
  stats: DashboardStats
  recentSubmissions: Array<{ id: string; name: string; closureDate: string }>
  userCount: number
}

export interface QACoordinatorDashboard {
  stats: DashboardStats
  departmentStats: Array<{ department: string; count: number }>
}

export interface QAManagerDashboard {
  stats: DashboardStats
  pendingIdeas?: number
  ideasWithoutComments?: number
}

export const dashboardService = {
  // General stats
  getGeneralDashboard: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>('/Stats/dashboard'),

  getDepartmentStats: (): Promise<ApiResponse<Array<DepartmentStat>>> =>
    apiClient.get<Array<DepartmentStat>>('/Stats/departments'),

  getIdeasWithoutComments: (): Promise<ApiResponse<Array<{ id: string; text: string }>>> =>
    apiClient.get<Array<{ id: string; text: string }>>('/Stats/ideas-without-comments'),

  // Staff dashboard
  getStaffDashboard: (): Promise<ApiResponse<StaffDashboard>> =>
    apiClient.get<StaffDashboard>('/Idea/my-ideas'),

  // Admin dashboard
  getAdminDashboard: (): Promise<ApiResponse<AdminDashboard>> =>
    apiClient.get<AdminDashboard>('/Stats/dashboard'),

  getAdminStatistics: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>('/Stats/dashboard'),

  // QA Coordinator dashboard
  getQACoordinatorDashboard: (): Promise<ApiResponse<QACoordinatorDashboard>> =>
    apiClient.get<QACoordinatorDashboard>('/Stats/dashboard'),

  getQACoordinatorStatistics: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>('/Stats/dashboard'),

  // QA Manager dashboard
  getQAManagerDashboard: (): Promise<ApiResponse<QAManagerDashboard>> =>
    apiClient.get<QAManagerDashboard>('/Stats/dashboard'),

  getQAManagerStatistics: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>('/Stats/dashboard'),
}
