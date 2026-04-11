import { departmentService } from "@/api/departments"
import type { Role } from "@/types/auth"
import { auth } from "@/utils/auth"
import { Avatar, Dropdown, Space, Tag } from "antd"
import {
  GraduationCap,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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
  const showProfileMenu = Boolean(userRole && onLogout)
  const displayName = useMemo(() => auth.getDisplayName() ?? "User", [])
  const email = useMemo(() => auth.getEmail() ?? "", [])
  const [departmentName, setDepartmentName] = useState(
    () => auth.getDepartmentName() ?? "",
  )

  const roleLabel = useMemo(() => {
    if (!userRole) {
      return ""
    }

    switch (userRole) {
      case "admin":
        return "Administrator"
      case "qa_manager":
        return "QA Manager"
      case "qa_coordinator":
        return "QA Coordinator"
      default:
        return "Staff"
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
      setDepartmentName("")
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
        const nextDepartmentName = matchedDepartment?.name.trim() ?? ""

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
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
      <div className="flex h-18 items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          {showSidebarToggle && onToggleSidebar && (
            <button
              type="button"
              aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
              aria-pressed={isSidebarOpen}
              onClick={onToggleSidebar}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:h-11 sm:w-11 sm:rounded-2xl"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>
          )}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-slate-950 via-blue-700 to-sky-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.25)] sm:h-11 sm:w-11 sm:rounded-2xl">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="max-w-42.5 min-w-0 sm:max-w-none">
            <p className="hidden text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase sm:block">
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
          {showProfileMenu && (
            <div className="relative flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:block">
                <Tag
                  color="blue"
                  className="m-0 rounded-full border-0 px-3 py-1 text-[11px] font-medium"
                >
                  {departmentName.trim() ? departmentName : "No Department"}
                </Tag>
              </div>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "header",
                      type: "group" as const,
                      label: (
                        <div className="px-2">
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
                                : "No Department"}
                            </Tag>
                          </div>
                          {email && (
                            <p className="mt-3 text-sm text-slate-500">
                              {email}
                            </p>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: "signout",
                      label: (
                        <span className="flex items-center gap-2">
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </span>
                      ),
                      onClick: onLogout,
                    },
                  ],
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Space className="cursor-pointer">
                  <div className="hidden min-w-0 text-left lg:block">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                      {roleLabel}
                    </p>
                  </div>
                  <Avatar
                    icon={<UserCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />}
                    size={"large"}
                  />
                </Space>
              </Dropdown>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
