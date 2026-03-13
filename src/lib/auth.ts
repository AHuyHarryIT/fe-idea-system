import type { Role } from '@/types/auth'

const TOKEN_KEY = 'idea_system_access_token'
const ROLE_KEY = 'idea_system_role'

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  getRole: (): Role | null => {
    const role = localStorage.getItem(ROLE_KEY)
    return role as Role | null
  },
  setRole: (role: Role) => localStorage.setItem(ROLE_KEY, role),
  clearRole: () => localStorage.removeItem(ROLE_KEY),

  isAuthed: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
  },
}
