import { useEffect, useState } from "react"
import type { Role } from "@/types/auth"
import Sidebar from "./Sidebar"
import TopNav from "./TopNavLayout"

interface LayoutProps {
  children: React.ReactNode
  userRole?: Role
  onLogout?: () => void
  showSidebar?: boolean
  contentClassName?: string
}

export default function Layout({
  children,
  userRole,
  onLogout,
  showSidebar = Boolean(userRole),
  contentClassName,
}: LayoutProps) {
  const shouldRenderSidebar = showSidebar && Boolean(userRole)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return shouldRenderSidebar
    }

    return shouldRenderSidebar && window.innerWidth >= 1280
  })

  useEffect(() => {
    if (!shouldRenderSidebar) {
      setIsSidebarOpen(false)
      return
    }

    setIsSidebarOpen((previousState) => {
      if (previousState) {
        return previousState
      }

      if (typeof window !== "undefined" && window.innerWidth >= 1280) {
        return true
      }

      return previousState
    })
  }, [shouldRenderSidebar])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.3),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <TopNav
        onLogout={onLogout}
        userRole={userRole}
        showSidebarToggle={shouldRenderSidebar}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() =>
          setIsSidebarOpen((previousState) => !previousState)
        }
      />
      <div className="flex">
        {shouldRenderSidebar && userRole && (
          <>
            <Sidebar
              userRole={userRole}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            {isSidebarOpen && (
              <div
                aria-hidden="true"
                className="fixed inset-0 top-[72px] z-30 bg-slate-950/30 backdrop-blur-[1px] xl:hidden"
                onMouseDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onTouchStart={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setIsSidebarOpen(false)
                }}
              />
            )}
          </>
        )}
        <main
          className={`min-h-screen flex-1 px-5 pt-26 pb-10 lg:px-8 ${
            shouldRenderSidebar && isSidebarOpen ? "xl:ml-72" : ""
          } ${contentClassName ?? ""}`.trim()}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
