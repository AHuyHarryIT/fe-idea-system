import { Building2, CalendarRange } from "lucide-react"
import type { Submission } from "@/types"
import { EmptyState } from "@/components/shared/EmptyState"
import { SectionCard } from "@/components/shared/SectionCard"
import { formatAppDateTime } from "@/utils/date"
import { isAdminSubmissionOpen } from "@/features/dashboard/admin/helpers/admin-dashboard"

interface AdminRecentSubmissionsSectionProps {
  error?: Error | null
  recentSubmissions: Submission[]
}

export function AdminRecentSubmissionsSection({
  error,
  recentSubmissions,
}: AdminRecentSubmissionsSectionProps) {
  return (
    <SectionCard
      title="Recent submissions"
      description="Latest campaign windows loaded from the submission API."
    >
      {error ? (
        <EmptyState
          icon={CalendarRange}
          title="Submission data unavailable"
          description={error.message}
        />
      ) : recentSubmissions.length > 0 ? (
        <div className="space-y-4">
          {recentSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] p-5 text-sm text-slate-600"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">
                    {submission.name}
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    {submission.description?.trim() ||
                      "No submission description has been entered yet."}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {isAdminSubmissionOpen(submission) ? "Open" : "Closed"}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    Closure
                  </p>
                  <p className="mt-2 font-medium text-slate-900">
                    {formatAppDateTime(submission.closureDate, "Not scheduled")}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    Final closure
                  </p>
                  <p className="mt-2 font-medium text-slate-900">
                    {formatAppDateTime(
                      submission.finalClosureDate,
                      "Not scheduled",
                    )}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    Ideas captured
                  </p>
                  <p className="mt-2 font-medium text-slate-900">
                    {submission.ideaCount ?? 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No submissions configured"
          description="Create a submission to start accepting ideas."
        />
      )}
    </SectionCard>
  )
}
