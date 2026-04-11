import { apiClient } from "./client"
import type {
  AdminDashboard,
  ApiResponse,
  DashboardIdeaReference,
  DashboardStats,
  DepartmentStat,
  QACoordinatorDashboard,
  QAManagerDashboard,
  StaffDashboard,
} from "@/types"

export const dashboardService = {
  // General stats
  getGeneralDashboard: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>("/stats/dashboard"),

  getDepartmentStats: (): Promise<ApiResponse<DepartmentStat[]>> =>
    apiClient.get<DepartmentStat[]>("/stats/departments"),

  getIdeasWithoutComments: (): Promise<ApiResponse<DashboardIdeaReference[]>> =>
    apiClient.get<DashboardIdeaReference[]>("/stats/ideas-without-comments"),

  // Staff dashboard
  getStaffDashboard: (): Promise<ApiResponse<StaffDashboard>> =>
    apiClient.get<StaffDashboard>("/ideas/my-ideas"),

  // Admin dashboard
  getAdminDashboard: (): Promise<ApiResponse<AdminDashboard>> =>
    apiClient.get<AdminDashboard>("/stats/dashboard"),

  getAdminStatistics: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>("/stats/dashboard"),

  // QA Coordinator dashboard
  getQACoordinatorDashboard: (): Promise<ApiResponse<QACoordinatorDashboard>> =>
    apiClient.get<QACoordinatorDashboard>("/stats/dashboard"),

  getQACoordinatorStatistics: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>("/stats/dashboard"),

  // QA Manager dashboard
  getQAManagerDashboard: (): Promise<ApiResponse<QAManagerDashboard>> =>
    apiClient.get<QAManagerDashboard>("/stats/dashboard"),

  getQAManagerStatistics: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>("/stats/dashboard"),
}
