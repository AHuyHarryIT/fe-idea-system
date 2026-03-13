import {
  BarChart3,
  LayoutDashboard,
  Lightbulb,
  List,
  PieChart,
  Settings,
} from 'lucide-react'
import type { Role } from '@/types/auth'

export interface NavItem {
  path: string
  label: string
  icon: typeof LayoutDashboard
}

export const navigationByRole: Record<Role, NavItem[]> = {
  staff: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/submit-idea', label: 'Submit Idea', icon: Lightbulb },
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
  qa_coordinator: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/qa-coordinator', label: 'Department Dashboard', icon: PieChart },
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
  qa_manager: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/qa-manager', label: 'Analytics Dashboard', icon: BarChart3 },
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
  admin: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin', label: 'Administration', icon: Settings },
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
}
