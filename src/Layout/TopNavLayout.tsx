import { useEffect, useMemo, useState } from 'react'
import { Tag } from 'antd'
import { ChevronDown, GraduationCap, LogOut, UserCircle2 } from 'lucide-react'
import type { Role } from '@/types/auth'
import { departmentService } from '@/api/departments'
import { auth } from '@/lib/auth'

interface TopNavProps {
  onLogout?: () => void
  userRole?: Role
}

export default function TopNav({ onLogout, userRole }: TopNavProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const showProfileMenu = Boolean(userRole && onLogout)
  const displayName = useMemo(() => auth.getDisplayName() ?? 'User', [])
  const [departmentName, setDepartmentName] = useState(
    () => auth.getDepartmentName() ?? '',
  )

  const roleLabel = useMemo(() => {
    if (!userRole) {
      return ''
    }

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

  useEffect(() => {
    const departmentId = auth.getDepartmentId()
    const cachedDepartmentName = auth.getDepartmentName()

    if (cachedDepartmentName?.trim()) {
      setDepartmentName(cachedDepartmentName)
      return
    }

    if (!departmentId) {
      setDepartmentName('')
      auth.clearDepartmentName()
      return
    }

    let isActive = true

    void departmentService
      .getDepartments({
        pageNumber: 1,
        pageSize: 100,
      })
      .then((response) => {
        if (!isActive || !response.success) {
          return
        }

        const matchedDepartment = response.data?.departments?.find(
          (department) => department.id === departmentId,
        )
        const nextDepartmentName = matchedDepartment?.name.trim() ?? ''

        if (!nextDepartmentName) {
          return
        }

        auth.setDepartmentName(nextDepartmentName)
        setDepartmentName(nextDepartmentName)
      })

    return () => {
      isActive = false
    }
  }, [])

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
          {showProfileMenu ? (
            <div className="relative flex items-center gap-3">
              <Tag
                color="blue"
                className="m-0 hidden text-[10px] font-medium sm:inline-flex"
              >
                {departmentName.trim() ? departmentName : 'No Department'}
              </Tag>
              <button
                type="button"
                onClick={() => setShowProfileDropdown((prev) => !prev)}
                className="inline-flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100"
              >
                <UserCircle2 className="h-8 w-8 text-slate-500" />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-slate-800">
                    {displayName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-xs text-slate-500">{roleLabel}</p>
                  </div>
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
          ) : (
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              Guest Access
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
