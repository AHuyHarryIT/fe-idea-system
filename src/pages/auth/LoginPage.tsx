import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { GraduationCap, ShieldCheck } from 'lucide-react'
import type { LoginFormValues, Role } from '@/types/auth'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput } from '@/components/forms/FormInput'
import { auth } from '@/lib/auth'

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: 'staff', label: 'Staff' },
  { value: 'qa_coordinator', label: 'QA Coordinator' },
  { value: 'qa_manager', label: 'QA Manager' },
  { value: 'admin', label: 'Administrator' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  })
  const [role, setRole] = useState<Role>('staff')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    auth.setToken('frontend-skeleton-token')
    auth.setRole(role)
    navigate({ to: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
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
                I'm pregnant with excitement to build out this idea management
                system for
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
                  type="email"
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
                  type="password"
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

              <FormField label="Role preview">
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <AppButton type="submit" className="w-full">
                Continue to workspace
              </AppButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
