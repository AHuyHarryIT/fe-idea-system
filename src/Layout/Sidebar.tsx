import { Link, useLocation } from "@tanstack/react-router"
import { navigationByRole } from "@/constants/navigation"
import type { Role } from "@/types/auth"

interface SidebarProps {
  userRole: Role
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navItems = navigationByRole[userRole]

  const handleNavItemClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      onClose()
    }
  }

  return (
    <aside
      className={`fixed top-18.25 bottom-0 left-0 z-40 w-72 border-r border-slate-200/70 bg-white/90 backdrop-blur-xl transition-transform duration-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-hidden={!isOpen}
    >
      <nav className="p-5">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleNavItemClick}
                  className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                    isActive
                      ? "border-blue-200 bg-white font-medium text-slate-950 shadow-sm"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
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
