import { Input } from "antd"
import { CalendarRange, Search } from "lucide-react"
import { AppButton } from "@/components/app/AppButton"
import { AppPagination } from "@/components/shared/AppPagination"
import { EmptyState } from "@/components/shared/EmptyState"
import { SectionCard } from "@/components/shared/SectionCard"
import { formatAppDateTime } from "@/utils/date"
import type { Submission } from "@/types"
import {
  isSubmissionClosed,
  SUBMISSION_PAGE_SIZE_OPTIONS,
} from "@/features/ideas/helpers/submit-idea"

interface SubmissionListSectionProps {
  error?: Error | null
  submissionsLoading: boolean
  submissions: Submission[]
  deferredSearch: string
  searchValue: string
  currentPage: number
  totalSubmissions: number
  pageSize: number
  onSearchChange: (value: string) => void
  onResetSearch: () => void
  onOpenSubmissionDetails: (submissionId: string) => void
  onPageChange: (page: number, nextPageSize: number) => void
}

export function SubmissionListSection({
  error,
  submissionsLoading,
  submissions,
  deferredSearch,
  searchValue,
  currentPage,
  totalSubmissions,
  pageSize,
  onSearchChange,
  onResetSearch,
  onOpenSubmissionDetails,
  onPageChange,
}: SubmissionListSectionProps) {
  return (
    <SectionCard
      title="Available submissions"
      description="Choose one submission campaign to review its description and dates before you continue."
    >
      {error ? (
        <EmptyState
          icon={CalendarRange}
          title="Unable to load submissions"
          description={error.message}
        />
      ) : submissionsLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          Loading submissions...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="block flex-1">
              <Input
                id="submit-idea-search"
                name="submit-idea-search"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by submission name or description"
                allowClear
                size="large"
                prefix={<Search className="h-4 w-4 text-slate-400" />}
                className="rounded-xl"
              />
            </label>
            <AppButton
              type="button"
              variant="ghost"
              className="sm:min-w-36"
              onClick={onResetSearch}
            >
              Reset
            </AppButton>
          </div>

          {submissions.length ? (
            submissions.map((submission) => {
              const closed = isSubmissionClosed(submission.closureDate)

              return (
                <div
                  key={submission.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-900">
                        {submission.name}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${closed ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {closed ? "Closed" : "Open"}
                      </span>
                    </div>
                    <p className="max-w-3xl text-sm text-slate-600">
                      {submission.description?.trim() ||
                        "No description has been added for this submission yet."}
                    </p>
                    <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p>
                        <span className="font-medium text-slate-800">
                          Closure date:
                        </span>{" "}
                        {formatAppDateTime(submission.closureDate)}
                      </p>
                      <p>
                        <span className="font-medium text-slate-800">
                          Final closure date:
                        </span>{" "}
                        {formatAppDateTime(submission.finalClosureDate)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <AppButton
                      type="button"
                      variant="secondary"
                      onClick={() => onOpenSubmissionDetails(submission.id)}
                    >
                      View details
                    </AppButton>
                  </div>
                </div>
              )
            })
          ) : deferredSearch ? (
            <EmptyState
              icon={CalendarRange}
              title="No submissions match this search"
              description="Try another keyword or clear the search."
            />
          ) : (
            <EmptyState
              icon={CalendarRange}
              title="No submissions available"
              description="Please wait for an administrator or QA manager to create a submission."
            />
          )}

          {submissions.length && (
            <AppPagination
              current={currentPage}
              total={totalSubmissions}
              pageSize={pageSize}
              pageSizeOptions={SUBMISSION_PAGE_SIZE_OPTIONS}
              onChange={onPageChange}
              showTotal={(total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} submissions`
              }
            />
          )}
        </div>
      )}
    </SectionCard>
  )
}
