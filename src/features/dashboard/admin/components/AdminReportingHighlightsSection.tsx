import { AlertCircle } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { SectionCard } from "@/components/shared/SectionCard"

interface AdminReportingHighlightsSectionProps {
  error?: Error | null
  ideasWithoutComments: number
  ideasThisMonth: number
  totalDepartments: number
}

export function AdminReportingHighlightsSection({
  error,
  ideasWithoutComments,
  ideasThisMonth,
  totalDepartments,
}: AdminReportingHighlightsSectionProps) {
  return (
    <SectionCard
      title="Reporting highlights"
      description="High-signal figures from the live stats endpoint that need admin attention."
    >
      {error ? (
        <EmptyState
          icon={AlertCircle}
          title="Stats are unavailable"
          description={error.message}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.92)_0%,rgba(255,255,255,1)_65%)] p-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Ideas without comments
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {ideasWithoutComments}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ideas that may need visibility, outreach, or moderation follow-up.
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.9)_0%,rgba(255,255,255,1)_65%)] p-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Ideas this month
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {ideasThisMonth}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Current-month contribution velocity from the live backend report.
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(245,243,255,0.92)_0%,rgba(255,255,255,1)_65%)] p-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Platform footprint
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {totalDepartments}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Departments represented in the current reporting scope.
            </p>
          </div>
        </div>
      )}
    </SectionCard>
  )
}
