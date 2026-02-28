import React, { useState } from 'react'
import TopNav from './TopNavLayout'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
  userRole: 'staff' | 'qa_coordinator' | 'qa_manager' | 'admin'
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
        <main className="flex-1 p-6 ml-64">{children}</main>
      </div>
    </div>
  )
}
