import { useMutation } from '@tanstack/react-query'
import type { LoginRequest, RegisterRequest } from '@/api/auth'
import { authService, extractAuthResponse } from '@/api'
import { auth, normalizeRole } from '@/lib/auth'

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {
      const session = extractAuthResponse(response.data)
      const role = normalizeRole(session?.role)

      if (response.success && session && role) {
        auth.setToken(session.token)
        auth.setRole(role)
      }
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      const session = extractAuthResponse(response.data)
      const role = normalizeRole(session?.role)

      if (response.success && session && role) {
        auth.setToken(session.token)
        auth.setRole(role)
      }
    },
  })
}
