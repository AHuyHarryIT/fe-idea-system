import React from 'react'
import Layout from './LayoutPage'

interface AdminLayoutProps {
  children: React.ReactNode
  onLogout?: () => void
}

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const handleLogout = onLogout ?? (() => console.log('logout'))
  return (
    <Layout userRole="admin" onLogout={handleLogout}>
      {children}
    </Layout>
  )
}
