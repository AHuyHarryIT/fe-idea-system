// Provides the shared authenticated dashboard layout used across protected pages.
// The component combines top navigation, sidebar navigation, and the main content area
// to preserve visual consistency and role-based navigation behaviour throughout the system.
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
  // Stores the currently selected academic year displayed in the top navigation area.
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
        {/* Renders the active page within the shared dashboard shell. */}
        <main className="min-h-screen flex-1 pb-8 pt-22 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
