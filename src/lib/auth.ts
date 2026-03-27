import type { Role } from '@/types/auth'

const TOKEN_KEY = 'idea_system_access_token'
const USER_ID_KEY = 'idea_system_user_id'
const ROLE_KEY = 'idea_system_role'

export function normalizeRole(role: string | null | undefined): Role | null {
  if (!role) {
    return null
  }

  const normalized = role.toLowerCase().replace(/[^a-z]/g, '')

  switch (normalized) {
    case 'staff':
      return 'staff'
    case 'qacoordinator':
      return 'qa_coordinator'
    case 'qamanager':
      return 'qa_manager'
    case 'admin':
    case 'administrator':
      return 'admin'
    default:
      return null
  }
}

export function getHomeRouteForRole(role: Role) {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'qa_coordinator':
      return '/qa-coordinator'
    case 'qa_manager':
      return '/qa-manager'
    case 'staff':
    default:
      return '/dashboard'
  }
}

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  getUserId: () => localStorage.getItem(USER_ID_KEY),
  setUserId: (userId: string) => localStorage.setItem(USER_ID_KEY, userId),
  clearUserId: () => localStorage.removeItem(USER_ID_KEY),

  getRole: (): Role | null => {
    return normalizeRole(localStorage.getItem(ROLE_KEY))
  },
  setRole: (role: Role) => localStorage.setItem(ROLE_KEY, role),
  clearRole: () => localStorage.removeItem(ROLE_KEY),

  isAuthed: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(ROLE_KEY)
  },
}
