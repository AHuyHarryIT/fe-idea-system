import type { Submission } from "@/types"
import { formatAppDateTime } from "@/utils/date"
import { SectionCard } from "@/components/shared/SectionCard"

interface AdminHeroSectionProps {
  reviewBacklog: number
  ideasWithoutComments: number
  ideasThisMonth: number
  openSubmissionCount: number
  latestSubmission?: Submission
  totalDepartments: number
  totalCategories: number
}

export function AdminHeroSection({
  reviewBacklog,
  ideasWithoutComments,
  ideasThisMonth,
  openSubmissionCount,
  latestSubmission,
  totalDepartments,
  totalCategories,
}: AdminHeroSectionProps) {
  return (
    <SectionCard>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(15,23,42,0.98)_0%,rgba(30,41,59,0.96)_52%,rgba(37,99,235,0.88)_100%)] p-7 text-white">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-blue-100/80 uppercase">
            Analytics dashboard
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">
            Monitor platform scale, review pressure, and campaign activity from
            one admin surface.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
            These headline figures now come directly from the live{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px] text-blue-50">
              /api/stats/dashboard
            </code>{" "}
            endpoint, so the dashboard matches the backend reporting view.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
              {reviewBacklog} ideas waiting for review
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
              {ideasWithoutComments} ideas without comments
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
              {ideasThisMonth} ideas this month
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100">
              {openSubmissionCount} open submissions
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Latest submission
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {latestSubmission?.name || "No submission yet"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Final closure{" "}
              {formatAppDateTime(
                latestSubmission?.finalClosureDate,
                "Not scheduled",
              )}
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Reporting health
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {totalDepartments} departments · {totalCategories} categories
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track taxonomy coverage and organisational breadth without leaving
              the admin home.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
