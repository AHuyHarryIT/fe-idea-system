import { Link, useLocation } from '@tanstack/react-router'
import { navigationByRole } from '@/constants/navigation'
import type { Role } from '@/types/auth'

interface SidebarProps {
  userRole: Role
}

export default function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation()
  const navItems = navigationByRole[userRole]

  return (
    <aside className="fixed bottom-0 left-0 top-16 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
