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
} from "lucide-react"
import type { Role } from "@/types/auth"
import type { NavItem } from "@/types"

export const navigationByRole: Record<Role, NavItem[]> = {
  staff: [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/my-ideas", label: "My Ideas", icon: Lightbulb },
    { path: "/submit-idea", label: "Submit Idea", icon: Lightbulb },
    { path: "/ideas", label: "Browse Ideas", icon: List },
  ],
  qa_coordinator: [
    { path: "/qa-coordinator", label: "Dashboard", icon: PieChart },
    { path: "/my-ideas", label: "My Ideas", icon: Lightbulb },
    { path: "/manage/review", label: "Review Ideas", icon: List },
    { path: "/submit-idea", label: "Submit Idea", icon: Lightbulb },
    { path: "/ideas", label: "Browse Ideas", icon: List },
  ],
  qa_manager: [
    { path: "/qa-manager", label: "Dashboard", icon: BarChart3 },
    { path: "/my-ideas", label: "My Ideas", icon: Lightbulb },
    {
      path: "/manage/submissions",
      label: "Manage Submissions",
      icon: CalendarRange,
    },
    {
      path: "/manage/categories",
      label: "Manage Categories",
      icon: FolderKanban,
    },
    { path: "/manage/review", label: "Review Ideas", icon: List },
    { path: "/submit-idea", label: "Submit Idea", icon: Lightbulb },
    { path: "/ideas", label: "Browse Ideas", icon: List },
  ],
  admin: [
    { path: "/admin", label: "Dashboard", icon: Settings },
    { path: "/my-ideas", label: "My Ideas", icon: Lightbulb },
    { path: "/manage/users", label: "Manage Users", icon: Users },
    {
      path: "/manage/categories",
      label: "Manage Categories",
      icon: FolderKanban,
    },
    {
      path: "/manage/departments",
      label: "Manage Departments",
      icon: Building2,
    },
    {
      path: "/manage/submissions",
      label: "Manage Submissions",
      icon: CalendarRange,
    },
    { path: "/submit-idea", label: "Submit Idea", icon: Lightbulb },
    { path: "/manage/review", label: "Review Ideas", icon: List },
    { path: "/ideas", label: "Browse Ideas", icon: List },
  ],
}
