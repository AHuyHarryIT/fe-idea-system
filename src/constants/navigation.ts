// Defines the role-based navigation structure used by the sidebar.
// Each user role is mapped to a tailored set of destinations that reflects
// its responsibilities within the idea collection system.
import {
  BarChart3,
  LayoutDashboard,
  Lightbulb,
  List,
  PieChart,
  Settings,
} from 'lucide-react'
import type { Role } from '@/types/auth'

// Represents a single sidebar navigation item.
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
    { path: '/submit-idea', label: 'Submit Idea', icon: Lightbulb },
    { path: '/ideas', label: 'Browse Ideas', icon: List },
  ],
}
