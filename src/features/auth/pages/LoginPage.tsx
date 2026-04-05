import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import type { LoginFormValues } from '@/types/auth'
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
    return 'Incorrect email or password.'
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
    <div className="mx-auto grid min-h-[calc(100dvh-7rem)] max-w-6xl items-center gap-8 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:py-10">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-border)] bg-[radial-gradient(circle_at_top,_rgba(79,110,247,0.24),_transparent_32%),linear-gradient(160deg,_#0a0f1e_0%,_#111827_56%,_#172033_100%)] p-8 text-[var(--app-text)] shadow-[var(--app-shadow-panel)] lg:p-12">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
        <div className="relative flex h-full flex-col justify-between gap-12">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-[var(--app-text-secondary)] backdrop-blur">
              <GraduationCap className="h-4 w-4 text-[var(--app-text)]" />
              University Idea Collection System
            </div>

            <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--app-text)] lg:text-5xl">
              Sign in to your university workspace.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--app-text-secondary)]">
              Access role-based tools for idea submission, moderation, analytics, and campaign management from one secure portal.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Role-based access',
                description: 'Staff, QA, and admins see the workflows that matter to them.',
                icon: ShieldCheck,
              },
              {
                title: 'Secure workspace',
                description: 'Use your university credentials to enter a protected environment.',
                icon: KeyRound,
              },
              {
                title: 'Reviewed submissions',
                description: 'Move from submission to review and reporting in one system.',
                icon: Sparkles,
              },
            ].map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-text)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-[var(--app-text)]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="flex items-center">
        <div className="w-full rounded-[28px] border border-slate-200 bg-white p-8 shadow-[var(--app-shadow-soft)] lg:p-10">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-[18px] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
                Secure access
              </p>
              <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-slate-950">
                Sign in
              </h2>
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-slate-600">
            Use your university account to access idea submission, moderation, analytics, and management tools.
          </p>

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

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <span className="text-sm text-slate-500">
                  Contact your system administrator for password support
                </span>
              </div>
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
            </div>

            {errorMessage ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--app-primary)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--app-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? 'Signing in...' : 'Sign in'}
              {isPending ? null : <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-sm text-slate-500">
            Guest access is available from the header navigation if your workflow allows browsing without signing in.
          </div>
        </div>
      </section>
    </div>
  )
}
