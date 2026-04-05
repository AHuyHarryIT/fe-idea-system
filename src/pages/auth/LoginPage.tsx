import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { GraduationCap, ShieldCheck } from 'lucide-react'
import type { LoginFormValues } from '@/types/auth'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput } from '@/components/forms/FormInput'
import { useLogin } from '@/hooks/useAuth'
import { auth, getHomeRouteForRole } from '@/utils/auth'

function getLoginErrorMessage(error?: string) {
  const normalizedError = error?.trim().toLowerCase() ?? ''

  if (
    normalizedError === 'unauthorized' ||
    normalizedError.includes('invalid email') ||
    normalizedError.includes('invalid password') ||
    normalizedError.includes('invalid credentials') ||
    normalizedError.includes('email or password')
  ) {
    return 'Email or password not match'
  }

  return error ?? 'Unable to sign in.'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { mutateAsync: login, isPending } = useLogin()
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setErrorMessage('')

    const response = await login(formValues)

    if (!response.success) {
      setErrorMessage(getLoginErrorMessage(response.error))
      return
    }

    const role = auth.getRole()

    if (!role) {
      auth.logout()
      setErrorMessage('Login succeeded but no valid role was returned.')
      return
    }

    navigate({ to: getHomeRouteForRole(role) })
  }

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl gap-8 py-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-10">
        <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl lg:p-12">
          <div className="flex h-full flex-col justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm">
                <GraduationCap className="h-4 w-4" />
                University Idea Collection System
              </div>
              <h1 className="mt-8 text-4xl font-semibold leading-tight lg:text-5xl">
                Collect, review, and manage university ideas in one workspace.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Sign in with your university account to submit ideas, review
                contributions, and manage campaigns from one place.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl lg:p-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <ShieldCheck className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Sign in
                </h2>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <FormField label="University email" required>
                <FormInput
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@university.edu"
                  value={formValues.email}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
              </FormField>

              <FormField label="Password" required>
                <FormInput
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={formValues.password}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                />
              </FormField>

              {errorMessage ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </p>
              ) : null}

              <AppButton type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Signing in...' : 'Continue to workspace'}
              </AppButton>
            </form>
          </div>
        </div>
      </div>
  )
}
