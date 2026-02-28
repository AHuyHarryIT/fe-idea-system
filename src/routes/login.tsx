import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import Login from '@/pages/auth/login'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<
    'staff' | 'qa_coordinator' | 'qa_manager' | 'admin'
  >('staff')

  const navigator = useNavigate()

  const handleLogin = (
    role: 'staff' | 'qa_coordinator' | 'qa_manager' | 'admin',
  ) => {
    setIsAuthenticated(true)
    setUserRole(role)
    navigator({ to: '/dashboard' })
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole('staff')
  }

  return <Login onLogin={handleLogin} />
}
