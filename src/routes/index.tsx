import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth, getHomeRouteForRole } from '@/utils/auth'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const role = auth.getRole()

    if (!auth.isAuthed() || !role) {
      throw redirect({ to: '/login' })
    }

    throw redirect({ to: getHomeRouteForRole(role) })
  },
})
