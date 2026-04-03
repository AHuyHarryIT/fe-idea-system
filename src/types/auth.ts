export type Role = 'staff' | 'qa_coordinator' | 'qa_manager' | 'admin'

export interface LoginFormValues {
  email: string
  password: string
}

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
