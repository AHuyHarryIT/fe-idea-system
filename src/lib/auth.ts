import type { Role } from '@/types/auth'

const TOKEN_KEY = 'idea_system_access_token'
const USER_ID_KEY = 'idea_system_user_id'
const ROLE_KEY = 'idea_system_role'
const DISPLAY_NAME_KEY = 'idea_system_display_name'

function parseJwtPayload(token: string): Record<string, unknown> | null {
  if (!token) {
    return null
  }

  const segments = token.split('.')

  if (segments.length < 2) {
    return null
  }

  try {
    const normalized = segments[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = atob(padded)
    const parsed = JSON.parse(decoded)

    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

function getClaimString(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return null
}

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
  getDisplayName: () => {
    const storedDisplayName = localStorage.getItem(DISPLAY_NAME_KEY)

    if (storedDisplayName?.trim()) {
      return storedDisplayName
    }

    const claims = parseJwtPayload(localStorage.getItem(TOKEN_KEY) ?? '')
    const claimedName = getClaimString(
      claims?.name ??
        claims?.fullName ??
        claims?.unique_name ??
        claims?.[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
        ],
    )

    if (claimedName?.trim()) {
      return claimedName
    }

    const claimedEmail = getClaimString(
      claims?.email ??
        claims?.[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ],
    )

    if (claimedEmail?.trim()) {
      return claimedEmail
    }

    return null
  },
  setDisplayName: (displayName: string) =>
    localStorage.setItem(DISPLAY_NAME_KEY, displayName),
  clearDisplayName: () => localStorage.removeItem(DISPLAY_NAME_KEY),
  getDepartmentId: () => {
    const claims = parseJwtPayload(localStorage.getItem(TOKEN_KEY) ?? '')

    return getClaimString(
      claims?.DepartmentId ??
        claims?.departmentId ??
        claims?.[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/groupsid'
        ],
    )
  },

  isAuthed: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(DISPLAY_NAME_KEY)
  },
}
