import type { UpdateUserRequest, User } from "@/types"

export interface CreateUserFormState {
  email: string
  name: string
  password: string
  role: string
  departmentId: string
}

export interface EditUserFormState {
  name: string
  role: string
  departmentId: string
}

export type UserFormValidationErrors = Partial<
  Record<keyof CreateUserFormState | keyof EditUserFormState, string>
>

export const AVAILABLE_USER_ROLES = [
  "Administrator",
  "Staff",
  "QA Manager",
  "QA Coordinator",
]

export const USER_PASSWORD_RULES = [
  "At least 8 characters",
  "At least one uppercase letter",
  "At least one lowercase letter",
  "At least one number",
  "At least one special character",
]

export const userRoleSelectClassName =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"

export const initialCreateUserForm: CreateUserFormState = {
  email: "",
  name: "",
  password: "",
  role: "Staff",
  departmentId: "",
}

export const initialEditUserForm: EditUserFormState = {
  name: "",
  role: "Staff",
  departmentId: "",
}

export const DEFAULT_USER_PAGE_SIZE = 10
export const USER_PAGE_SIZE_OPTIONS = ["10", "20", "50"]

export function normalizeUserRoleKey(value?: string | null) {
  return value?.toLowerCase().replace(/[^a-z]/g, "") ?? ""
}

export function formatUserRoleLabel(value?: string | null) {
  if (!value) {
    return "Unknown"
  }

  const normalized = normalizeUserRoleKey(value)
  const matchingRole = AVAILABLE_USER_ROLES.find(
    (role) => normalizeUserRoleKey(role) === normalized,
  )

  return matchingRole ?? value.replace(/_/g, " ")
}

export function getMatchingUserRole(value?: string | null) {
  const normalized = normalizeUserRoleKey(value)

  return (
    AVAILABLE_USER_ROLES.find(
      (role) => normalizeUserRoleKey(role) === normalized,
    ) ?? "Staff"
  )
}

export function getUserDepartmentValue(user: User) {
  return user.departmentId ?? ""
}

export function isValidUserEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isStrongUserPassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  )
}

export function buildUpdateUserPayload(
  editForm: EditUserFormState,
): UpdateUserRequest {
  return {
    name: editForm.name.trim(),
    role: editForm.role,
    departmentId: editForm.departmentId || null,
  }
}
