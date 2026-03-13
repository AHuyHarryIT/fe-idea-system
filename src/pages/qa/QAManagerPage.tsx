import { BarChart3, Building2, TrendingUp } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'

export default function QAManagerPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="QA Manager Dashboard"
        description="Analytics-oriented screen for university-wide monitoring and reporting across departments."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          icon={BarChart3}
          title="Total published ideas"
          value="--"
          description="University-wide count from analytics endpoint."
        />
        <StatCard
          icon={TrendingUp}
          title="Engagement rate"
          value="--"
          description="Replace with formula-based"
        />
        <StatCard
          icon={Building2}
          title="Departments contributing"
          value="--"
          description="Distinct departments participating in campaign."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Reporting widgets"
          description="Charts, rankings, and summary cards can be mounted here later."
        >
          <EmptyState
            icon={BarChart3}
            title="Analytics widgets pending"
            description="This area is intentionally left clean so you can later add charts, tables, or exports without refactoring the layout shell."
          />
        </SectionCard>
        <SectionCard
          title="Manager notes"
          description="Quick summary or alerts area."
        >
          <div className="space-y-4 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-4">
              Top ideas by engagement
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              Department comparison summary
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              Export and reporting actions
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
