export interface User {
  id: string
  email: string
  name: string
  role: string
  departmentId?: string | null
  departmentName?: string
  avatar?: string
  createdAt?: string
}

export interface UserListResponse {
  users: User[]
  availableRoles?: string[]
}

export interface CreateUserRequest {
  email: string
  name: string
  password?: string
  role: string
  departmentId?: string | null
}

export interface UpdateUserRequest {
  name?: string
  departmentId?: string | null
  role?: string
}
