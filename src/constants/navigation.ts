import {
  BarChart3,
  Building2,
  CalendarRange,
  FolderKanban,
  LayoutDashboard,
  Lightbulb,
  List,
  PieChart,
  Settings,
  Users,
} from 'lucide-react'
import type { Role } from '@/types/auth'

export interface NavItem {
  path: string
  label: string
  icon: typeof LayoutDashboard
}

export const navigationByRole: Record<Role, Array<NavItem>> = {
  staff: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/submit-idea', label: 'Submit Idea', icon: Lightbulb },
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
  qa_coordinator: [
    { path: '/qa-coordinator', label: 'Dashboard', icon: PieChart },
    { path: '/submit-idea', label: 'Submit Idea', icon: Lightbulb },
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
  qa_manager: [
    { path: '/qa-manager', label: 'Dashboard', icon: BarChart3 },
    {
      path: '/manage/departments',
      label: 'Manage Departments',
      icon: Building2,
    },
    { path: '/manage/submissions', label: 'Manage Submissions', icon: CalendarRange },
    { path: '/submit-idea', label: 'Submit Idea', icon: Lightbulb },
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
  admin: [
    { path: '/admin', label: 'Dashboard', icon: Settings },
    { path: '/manage/users', label: 'Manage Users', icon: Users },
    {
      path: '/manage/categories',
      label: 'Manage Categories',
      icon: FolderKanban,
    },
    {
      path: '/manage/departments',
      label: 'Manage Departments',
      icon: Building2,
    },
    { path: '/manage/submissions', label: 'Manage Submissions', icon: CalendarRange },
    { path: '/submit-idea', label: 'Submit Idea', icon: Lightbulb },
    {path: '/review-ideas', label: 'Review Ideas', icon: List},
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
}
