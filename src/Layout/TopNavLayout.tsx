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
  const email = useMemo(() => auth.getEmail() ?? '', [])
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
      <div className="flex h-[72px] items-center justify-between gap-4 px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-blue-700 to-sky-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.25)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              University Management Portal
            </p>
            <p className="truncate text-base font-semibold tracking-tight text-slate-950">
              University Idea Collection System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showProfileMenu ? (
            <div className="relative flex items-center gap-3">
              <Tag
                color="blue"
                className="m-0 hidden rounded-full border-0 px-3 py-1 text-[11px] font-medium sm:inline-flex"
              >
                {departmentName.trim() ? departmentName : 'No Department'}
              </Tag>
              <button
                type="button"
                onClick={() => setShowProfileDropdown((prev) => !prev)}
                className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <UserCircle2 className="h-6 w-6" />
                </div>
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {showProfileDropdown ? (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
                  <div className="border-b border-slate-200 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Signed in as
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {displayName}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Tag className="m-0 rounded-full border-0 px-3 py-1 text-xs font-medium">
                        {roleLabel}
                      </Tag>
                      <Tag
                        color="blue"
                        className="m-0 rounded-full border-0 px-3 py-1 text-xs font-medium"
                      >
                        {departmentName.trim()
                          ? departmentName
                          : 'No Department'}
                      </Tag>
                    </div>
                    {email ? (
                      <p className="mt-3 text-sm text-slate-500">{email}</p>
                    ) : null}
                  </div>
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
