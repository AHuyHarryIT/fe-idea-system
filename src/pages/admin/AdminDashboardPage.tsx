import { CalendarRange, ListChecks, Tags, Users } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Administration"
        description="Admin control center shell for academic years, categories, campaign windows, and user management."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          title="Users"
          value="--"
          description="Bind to total active users."
        />
        <StatCard
          icon={Tags}
          title="Categories"
          value="--"
          description="Bind to category count."
        />
        <StatCard
          icon={CalendarRange}
          title="Academic years"
          value="--"
          description="Bind to campaign period configuration."
        />
        <StatCard
          icon={ListChecks}
          title="System rules"
          value="--"
          description="Optional summary for permissions or settings."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Management modules"
          description="Suggested entry points for admin CRUD screens."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Manage users
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Manage categories
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Manage academic years
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Manage system settings
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
