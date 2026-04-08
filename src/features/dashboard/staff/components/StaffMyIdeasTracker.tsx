import { useNavigate, Link } from '@tanstack/react-router'
import { Input } from 'antd'
import { Lightbulb, Search } from 'lucide-react'
import type { Idea } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { formatAppDateTime } from '@/utils/date'
import {
  getIdeaDateValue,
  getIdeaStatusMeta,
  getIdeaStatusValue,
  getIdeaTitle,
  MY_IDEA_PAGE_SIZE_OPTIONS
  
} from '@/features/dashboard/staff/helpers/staff-dashboard'
import type {IdeaStatusFilter} from '@/features/dashboard/staff/helpers/staff-dashboard';

interface StaffMyIdeasTrackerProps {
  title: string
  description: string
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  searchValue: string
  setSearchValue: (value: string) => void
  statusFilter: IdeaStatusFilter
  setStatusFilter: (status: IdeaStatusFilter) => void
  data?: {
    pagination?: {
      totalCount: number
    }
    totalCount?: number
    total?: number
  }
  filteredIdeas: Idea[]
  sortedIdeas: Idea[]
  isLoading: boolean
  error: Error | null
}

export function StaffMyIdeasTracker({
  title,
  description,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
  searchValue,
  setSearchValue,
  statusFilter,
  setStatusFilter,
  data,
  filteredIdeas,
  sortedIdeas,
  isLoading,
  error,
}: StaffMyIdeasTrackerProps) {
  const navigate = useNavigate()
  const totalIdeas =
    data?.pagination?.totalCount ??
    data?.totalCount ??
    data?.total ??
    filteredIdeas.length
  const rangeStart = totalIdeas === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = totalIdeas === 0 ? 0 : rangeStart + filteredIdeas.length - 1

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Link to="/submit-idea">
              <AppButton>Submit Idea</AppButton>
            </Link>
            <Link to="/ideas">
              <AppButton variant="ghost">Browse Ideas</AppButton>
            </Link>
          </>
        }
      />

      <SectionCard
        title="My idea tracker"
        description="Filter your ideas by pending, approved, or rejected status. Open details to inspect the full record and rejection note."
      >
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="block w-full lg:max-w-md">
            <Input
              id="my-idea-search"
              name="my-idea-search"
              aria-label="Search my ideas"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by title, description, category, or submission"
              allowClear
              size="large"
              prefix={<Search className="h-4 w-4 text-slate-400" />}
              className="rounded-xl"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'All ideas'],
                ['pending', 'Pending'],
                ['approved', 'Approved'],
                ['rejected', 'Rejected'],
              ] as [IdeaStatusFilter, string][]
            ).map(([value, label]) => (
              <AppButton
                key={value}
                type="button"
                variant={statusFilter === value ? 'secondary' : 'ghost'}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </AppButton>
            ))}
          </div>
        </div>

        <p className="mb-5 text-sm text-slate-500">
          {`Showing ${rangeStart}-${rangeEnd} of ${totalIdeas} ideas.`}
        </p>

        {error ? (
          <EmptyState
            icon={Lightbulb}
            title="Unable to load your ideas"
            description={error.message}
          />
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Loading your idea tracker...
          </div>
        ) : filteredIdeas.length > 0 ? (
          <>
            <div className="space-y-4">
              {filteredIdeas.map((idea) => {
                const status = getIdeaStatusValue(idea)
                const statusMeta = getIdeaStatusMeta(status)

                return (
                  <div
                    key={idea.id}
                    role="link"
                    tabIndex={0}
                    onClick={() =>
                      void navigate({ to: '/ideas/$ideaId', params: { ideaId: idea.id } })
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        void navigate({ to: '/ideas/$ideaId', params: { ideaId: idea.id } })
                      }
                    }}
                    className="cursor-pointer rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-slate-900">
                            {getIdeaTitle(idea)}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {idea.categoryName}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {idea.description?.trim() || 'No description provided.'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>Submitted: {formatAppDateTime(getIdeaDateValue(idea))}</span>
                          <span>Department: {idea.departmentName || 'Unassigned'}</span>
                          <span>Submission: {idea.submissionName || 'Not provided'}</span>
                        </div>
                        {status === 'rejected' &&  (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            Rejected idea. Open details to review the rejection note.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <AppPagination
              containerClassName="mt-6"
              current={currentPage}
              total={totalIdeas}
              pageSize={pageSize}
              pageSizeOptions={MY_IDEA_PAGE_SIZE_OPTIONS}
              onChange={(page, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize)
                  setCurrentPage(1)
                  return
                }

                setCurrentPage(page)
              }}
              showTotal={(total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} ideas`
              }
            />
          </>
        ) : (
          <EmptyState
            icon={Lightbulb}
            title="No ideas match this filter"
            description={`Try another status tab or adjust the search terms. You currently have ${sortedIdeas.length} total ideas.`}
          />
        )}
      </SectionCard>
    </>
  )
}
