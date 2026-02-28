import { Link, useLocation } from '@tanstack/react-router'
// import {
//   LayoutDashboard,
//   Lightbulb,
//   List,
//   PieChart,
//   //   BarChart3,
//   Settings,
// } from 'lucide-react'
import { GiPieChart } from 'react-icons/gi'
import {
  MdFormatListBulleted,
  MdLightbulbCircle,
  MdOutlineSettings,
  MdSpaceDashboard,
} from 'react-icons/md'
import { TfiBarChart } from 'react-icons/tfi'

interface SidebarProps {
  userRole: 'staff' | 'qa_coordinator' | 'qa_manager' | 'admin'
}
export default function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const getNavItems = () => {
    switch (userRole) {
      case 'staff':
        return [
          {
            path: '/dashboard',
            icon: <MdSpaceDashboard />,
            label: 'Dashboard',
          },
          {
            path: '/submit-idea',
            icon: <MdLightbulbCircle />,
            label: 'Submit Idea',
          },
          {
            path: '/ideas',
            icon: <MdFormatListBulleted />,
            label: 'Browse Ideas',
          },
        ]
      case 'qa_coordinator':
        return [
          {
            path: '/qa-coordinator',
            icon: <GiPieChart />,
            label: 'Department Dashboard',
          },
          {
            path: '/ideas',
            icon: <MdFormatListBulleted />,
            label: 'Browse Ideas',
          },
        ]
      case 'qa_manager':
        return [
          {
            path: '/qa-manager',
            icon: <TfiBarChart />,
            label: 'Analytics Dashboard',
          },
          {
            path: '/ideas',
            icon: <MdFormatListBulleted />,
            label: 'Browse Ideas',
          },
        ]
      case 'admin':
        return [
          {
            path: '/admin',
            icon: <MdOutlineSettings />,
            label: 'Admin Dashboard',
          },
          {
            path: '/ideas',
            icon: <MdFormatListBulleted />,
            label: 'Browse Ideas',
          },
        ]
      default:
        return []
    }
  }
  const navItems = getNavItems()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
