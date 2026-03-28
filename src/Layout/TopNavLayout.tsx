import { useMemo, useState } from 'react'
import { ChevronDown, GraduationCap, LogOut, UserCircle2 } from 'lucide-react'
import type { Role } from '@/types/auth'

interface TopNavProps {
  onLogout: () => void
  userRole: Role
}

export default function TopNav({ onLogout, userRole }: TopNavProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const roleLabel = useMemo(() => {
    switch (userRole) {
      case 'admin':
        return 'Administrator'
      case 'qa_manager':
        return 'QA Manager'
      case 'qa_coordinator':
        return 'QA Coordinator'
      default:
        return 'Staff'
    }
  }, [userRole])

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">
              University Idea Collection System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className="inline-flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100"
            >
              <UserCircle2 className="h-8 w-8 text-slate-500" />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-slate-800">
                  {roleLabel}
                </p>
                <p className="text-xs text-slate-500">Workspace account</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {showProfileDropdown ? (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
