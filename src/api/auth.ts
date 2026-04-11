import { apiClient } from "./client"
import type {
  ApiResponse,
  AuthResponse,
  JsonObject,
  JsonValue,
  LoginRequest,
} from "@/types"
import {
  parseJwtPayload,
  getFirstClaimString,
  getRoleFromClaims,
  getUserIdFromClaims,
  getNameFromClaims,
  getEmailFromClaims,
} from "@/utils/jwt"

function isRecord(
  value: object | JsonValue | null | undefined,
): value is JsonObject {
  return typeof value === "object" && value !== null
}

function getString(value: JsonValue | undefined) {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number") {
    return String(value)
  }

  return ""
}

function inferRoleFromIdentity(email: string, name: string) {
  const normalizedEmail = email.toLowerCase().replace(/[^a-z]/g, "")
  const normalizedName = name.toLowerCase().replace(/[^a-z]/g, "")
  const identity = `${normalizedEmail} ${normalizedName}`

  if (identity.includes("qamanager")) {
    return "qa_manager"
  }

  if (identity.includes("qacoordinator")) {
    return "qa_coordinator"
  }

  if (identity.includes("administrator") || identity.includes("admin")) {
    return "admin"
  }

  if (identity.includes("staff")) {
    return "staff"
  }

  return ""
}

export function extractAuthResponse(
  payload: object | JsonValue | null | undefined,
): AuthResponse | null {
  const directRecord = isRecord(payload) ? payload : null
  const nestedRecord =
    directRecord && isRecord(directRecord.data) ? directRecord.data : null
  const record = nestedRecord ?? directRecord

  if (!record) {
    return null
  }

  const token = getString(
    record.token ?? record.accessToken ?? record.access_token ?? record.jwt,
  )
  const userRecord = isRecord(record.user) ? record.user : null
  const claims = parseJwtPayload(token)
  const email = getString(record.email ?? userRecord?.email ?? getEmailFromClaims(claims))
  const name = getString(
    record.name ??
      record.fullName ??
      userRecord?.name ??
      userRecord?.fullName ??
      getNameFromClaims(claims),
  )
  const role =
    getFirstClaimString(
      record.role ??
        record.userRole ??
        record.roleName ??
        userRecord?.roles ??
        userRecord?.role ??
        getRoleFromClaims(claims),
    ) || inferRoleFromIdentity(email, name)

  if (!token || !role) {
    return null
  }

  return {
    token,
    role,
    userId: getString(
      record.userId ??
        record.id ??
        userRecord?.id ??
        getUserIdFromClaims(claims),
    ),
    email,
    name,
  }
}

export const authService = {
  login: (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<AuthResponse>("/Auth/login", credentials),
}
