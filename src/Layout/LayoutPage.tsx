import type { Role } from '@/types/auth'
import Sidebar from './Sidebar'
import TopNav from './TopNavLayout'

interface LayoutProps {
  children: React.ReactNode
  userRole: Role
  onLogout: () => void
}

export default function Layout({ children, userRole, onLogout }: LayoutProps) {

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        onLogout={onLogout}
        userRole={userRole}
      />
      <div className="flex">
        <Sidebar userRole={userRole} />
        <main className="min-h-screen flex-1 pb-8 pt-22 lg:ml-64 px-4">
          {children}
        </main>
      </div>
    </div>
  )
}
