import { useEffect, useMemo, useState } from 'react'
import { Tag } from 'antd'
import {
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  PanelLeftClose,
  UserCircle2,
} from 'lucide-react'
import type { Role } from '@/types/auth'
import { departmentService } from '@/api/departments'
import { auth } from '@/lib/auth'

interface TopNavProps {
  onLogout?: () => void
  userRole?: Role
  showSidebarToggle?: boolean
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
}

export default function TopNav({
  onLogout,
  userRole,
  showSidebarToggle = false,
  isSidebarOpen = false,
  onToggleSidebar,
}: TopNavProps) {
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
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          {showSidebarToggle && onToggleSidebar && (
            <button
              type="button"
              aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              aria-pressed={isSidebarOpen}
              onClick={onToggleSidebar}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:h-11 sm:w-11 sm:rounded-2xl"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 via-blue-700 to-sky-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.25)] sm:h-11 sm:w-11 sm:rounded-2xl">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0 max-w-[170px] sm:max-w-none">
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 sm:block">
              University Management Portal
            </p>
            <p className="truncate text-sm font-semibold tracking-tight text-slate-950 sm:hidden">
              Idea Collection
            </p>
            <p className="hidden truncate text-base font-semibold tracking-tight text-slate-950 sm:block">
              University Idea Collection System
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showProfileMenu ? (
            <div className="relative flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:block">
                <Tag
                  color="blue"
                  className="m-0 rounded-full border-0 px-3 py-1 text-[11px] font-medium"
                >
                  {departmentName.trim() ? departmentName : 'No Department'}
                </Tag>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileDropdown((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:gap-3 sm:px-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 sm:h-10 sm:w-10">
                  <UserCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="hidden min-w-0 text-left lg:block">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
              </button>

              {showProfileDropdown && (
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
              )}
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
