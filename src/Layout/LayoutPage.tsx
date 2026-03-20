import { useState } from 'react'
import TopNav from './TopNavLayout'
import Sidebar from './Sidebar'
import type { Role } from '@/types/auth'

interface LayoutProps {
  children: React.ReactNode
  userRole: Role
  onLogout: () => void
}

export default function Layout({ children, userRole, onLogout }: LayoutProps) {
  const [academicYear, setAcademicYear] = useState('2025-2026')

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        academicYear={academicYear}
        onAcademicYearChange={setAcademicYear}
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
