import { authService, extractAuthResponse } from "@/api"
import type { LoginRequest } from "@/types"
import { auth, normalizeRole } from "@/utils/auth"
import { useMutation } from "@tanstack/react-query"

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {
      const session = extractAuthResponse(response.data)
      const role = normalizeRole(session?.role)

      if (response.success && session && role) {
        auth.setToken(session.token)
        if (session.userId) {
          auth.setUserId(session.userId)
        } else {
          auth.clearUserId()
        }
        if (session.name.trim()) {
          auth.setDisplayName(session.name.trim())
        } else {
          auth.clearDisplayName()
        }
        if (session.email.trim()) {
          auth.setEmail(session.email.trim())
        } else {
          auth.clearEmail()
        }
        auth.setRole(role)
      }
    },
  })
}
