import { useMemo } from 'react'
import { Navigate } from '@tanstack/react-router'
import type { Role } from '@/types/auth'
import Layout from '@/Layout/LayoutPage'
import { auth } from '@/lib/auth'

interface ProtectedPageProps {
  children: React.ReactNode
  allowedRoles?: Array<Role>
}

export function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  const role = useMemo(() => auth.getRole(), [])

  if (!auth.isAuthed() || !role) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />
  }

  return (
    <Layout
      userRole={role}
      onLogout={() => {
        auth.logout()
        window.location.href = '/login'
      }}
    >
      {children}
    </Layout>
  )
}
