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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.3),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <TopNav onLogout={onLogout} userRole={userRole} />
      <div className="flex">
        {showSidebar && userRole ? <Sidebar userRole={userRole} /> : null}
        <main
          className={`min-h-screen flex-1 px-5 pb-10 pt-26 lg:px-8 ${
            showSidebar && userRole ? 'lg:ml-72' : ''
          } ${contentClassName ?? ''}`.trim()}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
