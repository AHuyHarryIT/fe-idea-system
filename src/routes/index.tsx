import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '@/lib/auth'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const role = auth.getRole()

    if (!auth.isAuthed() || !role) {
      throw redirect({ to: '/login' })
    }

    if (role === 'admin') {
      throw redirect({ to: '/admin' })
    }

    if (role === 'qa_coordinator') {
      throw redirect({ to: '/qa-coordinator' })
    }

    if (role === 'qa_manager') {
      throw redirect({ to: '/qa-manager' })
    }

    throw redirect({ to: '/dashboard' })
  },
})
