import { createFileRoute, redirect } from '@tanstack/react-router'
import LoginPage from '@/pages/auth/LoginPage'
import { auth } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (auth.isAuthed()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})
