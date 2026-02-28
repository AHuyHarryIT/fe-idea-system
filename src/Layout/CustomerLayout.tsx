import React from 'react'
import Layout from './LayoutPage'

type CustomerRole = 'staff' | 'qa_coordinator' | 'qa_manager'

interface CustomerLayoutProps {
  children: React.ReactNode
  userRole: CustomerRole
  onLogout?: () => void
}

export default function CustomerLayout({
  children,
  userRole,
  onLogout,
}: CustomerLayoutProps) {
  const handleLogout = onLogout ?? (() => console.log('logout'))
  return (
    <Layout userRole={userRole} onLogout={handleLogout}>
      {children}
    </Layout>
  )
}
