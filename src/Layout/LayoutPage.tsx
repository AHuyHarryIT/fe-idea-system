import type { Role } from '@/types/auth'
import Sidebar from './Sidebar'
import TopNav from './TopNavLayout'

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
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        onLogout={onLogout}
        userRole={userRole}
      />
      <div className="flex">
        {showSidebar && userRole ? <Sidebar userRole={userRole} /> : null}
        <main
          className={`min-h-screen flex-1 px-4 pb-8 pt-22 ${
            showSidebar && userRole ? 'lg:ml-64' : ''
          } ${contentClassName ?? ''}`.trim()}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
