import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  Lightbulb,
  List,
  PieChart,
  Settings,
  Tags,
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
    { path: '/submit-idea', label: 'Submit Idea', icon: Lightbulb },
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
}
