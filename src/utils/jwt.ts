import type { JsonObject, JsonValue } from "@/types"

/**
 * Parses JWT payload without verification
 * Used for extracting claims from tokens stored locally
 * IMPORTANT: This does NOT verify the token signature - use server-side verification for security
 */
export function parseJwtPayload(token: string): JsonObject | null {
  if (!token) {
    return null
  }

  const segments = token.split(".")

  if (segments.length < 2) {
    return null
  }

  try {
    const normalized = segments[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
    const decoded = atob(padded)
    const parsed = JSON.parse(decoded)

    return typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as JsonObject)
      : null
  } catch {
    return null
  }
}

/**
 * Safely extracts string value from claim data
 * Handles various JWT claim formats (string or number)
 */
export function getClaimString(value: JsonValue | undefined): string | null {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number") {
    return String(value)
  }

  return null
}

/**
 * Safely extracts first string from claim data
 * Handles array formats (some systems return claims as arrays)
 */
export function getFirstClaimString(value: JsonValue | undefined): string {
  if (Array.isArray(value)) {
    const firstString = value.find((item) => typeof item === "string")
    return typeof firstString === "string" ? firstString : ""
  }

  return getClaimString(value) ?? ""
}

/**
 * Extracts role claim from JWT payload
 * Checks multiple common role claim keys
 */
export function getRoleFromClaims(claims: JsonObject | null): string {
  if (!claims) {
    return ""
  }

  return getFirstClaimString(
    claims.role ??
      claims.roles ??
      claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
  )
}

/**
 * Extracts user ID from JWT payload
 * Checks multiple common subject/user ID claim keys
 */
export function getUserIdFromClaims(claims: JsonObject | null): string {
  if (!claims) {
    return ""
  }

  return getClaimString(
    claims.sub ?? claims.nameid ?? claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
  ) ?? ""
}

/**
 * Extracts display name from JWT payload
 * Checks multiple common name claim keys
 */
export function getNameFromClaims(claims: JsonObject | null): string {
  if (!claims) {
    return ""
  }

  return getFirstClaimString(
    claims.name ??
      claims.fullName ??
      claims.unique_name ??
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
  )
}

/**
 * Extracts email from JWT payload
 * Checks multiple common email claim keys
 */
export function getEmailFromClaims(claims: JsonObject | null): string {
  if (!claims) {
    return ""
  }

  return getFirstClaimString(
    claims.email ??
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
  )
}
