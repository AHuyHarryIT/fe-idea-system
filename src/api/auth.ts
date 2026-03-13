import { apiClient } from './client'
import type { ApiResponse } from './client'

type UnknownRecord = Record<string, unknown>

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  token: string
  role: string
  userId: string
  email: string
  name: string
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return ''
}

function getFirstString(value: unknown) {
  if (Array.isArray(value)) {
    const firstString = value.find((item) => typeof item === 'string')

    return typeof firstString === 'string' ? firstString : ''
  }

  return getString(value)
}

function parseJwtPayload(token: string): UnknownRecord | null {
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

    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function getRoleFromClaims(claims: UnknownRecord | null) {
  if (!claims) {
    return ''
  }

  return getFirstString(
    claims.role ??
      claims.roles ??
      claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
  )
}

export function extractAuthResponse(payload: unknown): AuthResponse | null {
  const record = isRecord(payload)
    ? payload
    : isRecord((payload as UnknownRecord | null)?.data)
      ? ((payload as UnknownRecord).data as UnknownRecord)
      : null

  if (!record) {
    return null
  }

  const token = getString(
    record.token ?? record.accessToken ?? record.access_token ?? record.jwt,
  )
  const userRecord = isRecord(record.user) ? record.user : null
  const claims = parseJwtPayload(token)
  const role = getFirstString(
    record.role ??
      record.userRole ??
      record.roleName ??
      userRecord?.roles ??
      userRecord?.role ??
      getRoleFromClaims(claims),
  )

  if (!token || !role) {
    return null
  }

  return {
    token,
    role,
    userId: getString(record.userId ?? record.id ?? userRecord?.id),
    email: getString(record.email ?? userRecord?.email),
    name: getString(record.name ?? record.fullName ?? userRecord?.name),
  }
}

export const authService = {
  login: (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<AuthResponse>('/Auth/login', credentials),

  register: (
    data: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<AuthResponse>('/Auth/register', data),
}
