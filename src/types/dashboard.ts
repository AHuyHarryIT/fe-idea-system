export interface DashboardStats {
  totalIdeas?: number
  totalVotes?: number
  totalComments?: number
  departmentIdeas?: number
  pendingReview?: number
  totalCategories?: number
  totalDepartments?: number
  totalUsers?: number
  ideasWithoutComments?: number
  ideasThisMonth?: number
  totalPendingIdeas?: number
}

export interface DepartmentStat {
  departmentName: string
  ideaCount: number
  percentage: number
  contributorCount?: number
}

export interface DashboardIdeaReference {
  id: string
  text: string
  createdAt?: string
}

export interface DashboardSubmissionReference {
  id: string
  name: string
  closureDate: string
}

export interface DashboardDepartmentCount {
  department: string
  count: number
}

export interface StaffDashboard {
  stats: DashboardStats
  recentIdeas: DashboardIdeaReference[]
}

export interface AdminDashboard {
  stats: DashboardStats
  recentSubmissions: DashboardSubmissionReference[]
  userCount: number
}

export interface QACoordinatorDashboard {
  stats: DashboardStats
  departmentStats: DashboardDepartmentCount[]
}

export interface QAManagerDashboard {
  stats: DashboardStats
  pendingIdeas?: number
  ideasWithoutComments?: number
}
