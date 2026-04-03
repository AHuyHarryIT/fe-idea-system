import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Clock3,
  Lightbulb,
  Search,
  XCircle,
} from 'lucide-react'
import type { Idea } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal } from '@/components/shared/Modal'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'
import { useMyIdeas } from '@/hooks/useIdeas'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'

type IdeaStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

function getTimestamp(value?: string) {
  if (!value) {
    return 0
  }

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function getIdeaStatusValue(idea: Idea): Exclude<IdeaStatusFilter, 'all'> {
  const normalizedStatus = idea.status?.toLowerCase()

  switch (normalizedStatus) {
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    case 'pending':
    case 'pending_review':
    default:
      return 'pending'
  }
}

function getIdeaStatusMeta(status: Exclude<IdeaStatusFilter, 'all'>) {
  switch (status) {
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-100 text-emerald-700',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-rose-100 text-rose-700',
      }
    case 'pending':
    default:
      return {
        label: 'Pending',
        className: 'bg-amber-100 text-amber-800',
      }
  }
}

function getIdeaTitle(idea: Idea) {
  return idea.text?.trim() || idea.title?.trim() || 'Untitled idea'
}

function formatDateLabel(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getRejectionReason(idea?: Idea | null) {
  const rejectionReason = idea?.rejectionReason?.trim()

  if (rejectionReason) {
    return rejectionReason
  }

  return 'No rejection reason was returned by the backend for this idea.'
}

interface DashboardPageProps {
  title?: string
  description?: string
}

export default function DashboardPage({
  title = 'Dashboard',
  description = 'Track your pending ideas, review outcomes, and open detailed status notes from one place.',
}: DashboardPageProps) {
  const { data, isLoading, error } = useMyIdeas()
  const [statusFilter, setStatusFilter] = useState<IdeaStatusFilter>('all')
  const [searchValue, setSearchValue] = useState('')
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)

  const ideas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(data)
    return Array.isArray(ideaList) ? ideaList.filter((idea) => idea.id) : []
  }, [data])

  const sortedIdeas = useMemo(
    () =>
      [...ideas].sort(
        (left, right) =>
          getTimestamp(right.createdAt || right.createdDate) -
          getTimestamp(left.createdAt || left.createdDate),
      ),
    [ideas],
  )

  const pendingCount = sortedIdeas.filter(
    (idea) => getIdeaStatusValue(idea) === 'pending',
  ).length
  const approvedCount = sortedIdeas.filter(
    (idea) => getIdeaStatusValue(idea) === 'approved',
  ).length
  const rejectedCount = sortedIdeas.filter(
    (idea) => getIdeaStatusValue(idea) === 'rejected',
  ).length

  const filteredIdeas = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return sortedIdeas.filter((idea) => {
      const status = getIdeaStatusValue(idea)
      const matchesStatus = statusFilter === 'all' || statusFilter === status
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          getIdeaTitle(idea),
          idea.description,
          idea.categoryName,
          idea.departmentName,
          idea.submissionName,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch))

      return matchesStatus && matchesSearch
    })
  }, [searchValue, sortedIdeas, statusFilter])

  const selectedIdeaStatus = selectedIdea
    ? getIdeaStatusValue(selectedIdea)
    : 'pending'
  const selectedIdeaStatusMeta = getIdeaStatusMeta(selectedIdeaStatus)

  return (
    <div className="mx-auto w-full max-w-7xl">
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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Lightbulb}
          title="Ideas submitted"
          value={isLoading ? '...' : `${sortedIdeas.length}`}
          description="All ideas loaded from your personal staff workspace."
        />
        <StatCard
          icon={Clock3}
          title="Pending review"
          value={isLoading ? '...' : `${pendingCount}`}
          description="Ideas that are still waiting for an approval decision."
        />
        <StatCard
          icon={CheckCircle2}
          title="Approved"
          value={isLoading ? '...' : `${approvedCount}`}
          description="Ideas that have already been accepted."
        />
        <StatCard
          icon={XCircle}
          title="Rejected"
          value={isLoading ? '...' : `${rejectedCount}`}
          description="Ideas that were rejected and may need revisions."
        />
      </div>

      <div className="mt-6">
        <SectionCard
          title="My idea tracker"
          description="Filter your ideas by pending, approved, or rejected status. Open details to inspect the full record and rejection note."
        >
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="my-idea-search"
                name="my-idea-search"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by title, description, category, or submission"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
            Showing {filteredIdeas.length} of {sortedIdeas.length} ideas, sorted
            by newest submission date.
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
            <div className="space-y-4">
              {filteredIdeas.map((idea) => {
                const status = getIdeaStatusValue(idea)
                const statusMeta = getIdeaStatusMeta(status)

                return (
                  <div
                    key={idea.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                          <span>
                            Submitted:{' '}
                            {formatDateLabel(idea.createdAt || idea.createdDate)}
                          </span>
                          <span>
                            Department: {idea.departmentName || 'Unassigned'}
                          </span>
                          <span>
                            Submission: {idea.submissionName || 'Not provided'}
                          </span>
                        </div>
                        {status === 'rejected' ? (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            Rejected idea. Open details to review the rejection
                            note.
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <AppButton
                          type="button"
                          variant="ghost"
                          onClick={() => setSelectedIdea(idea)}
                        >
                          Show details
                        </AppButton>
                        <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
                          <AppButton type="button" variant="ghost">
                            Open idea
                          </AppButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Lightbulb}
              title="No ideas match this filter"
              description="Try another status tab or adjust the search terms."
            />
          )}
        </SectionCard>
      </div>

      <Modal
        isOpen={!!selectedIdea}
        title={selectedIdea ? getIdeaTitle(selectedIdea) : 'Idea details'}
        description="Review the submission status and detail summary for this idea."
        onClose={() => setSelectedIdea(null)}
        maxWidthClassName="max-w-3xl"
        footer={
          selectedIdea ? (
            <>
              <AppButton
                type="button"
                variant="ghost"
                onClick={() => setSelectedIdea(null)}
              >
                Close
              </AppButton>
              <Link
                to="/ideas/$ideaId"
                params={{ ideaId: selectedIdea.id }}
                onClick={() => setSelectedIdea(null)}
              >
                <AppButton type="button">Open idea</AppButton>
              </Link>
            </>
          ) : null
        }
      >
        {selectedIdea ? (
          <div className="space-y-4">
            <div
              className={`rounded-2xl px-4 py-4 ${selectedIdeaStatusMeta.className}`}
            >
              <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                Current status
              </p>
              <p className="mt-1 text-base font-semibold">
                {selectedIdeaStatusMeta.label}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Category
                </p>
                <p className="mt-2">{selectedIdea.categoryName}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Submitted on
                </p>
                <p className="mt-2">
                  {formatDateLabel(
                    selectedIdea.createdAt || selectedIdea.createdDate,
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Department
                </p>
                <p className="mt-2">
                  {selectedIdea.departmentName || 'Unassigned'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Submission window
                </p>
                <p className="mt-2">
                  {selectedIdea.submissionName || 'Not provided by backend'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap">
                {selectedIdea.description?.trim() || 'No description provided.'}
              </p>
            </div>

            {selectedIdeaStatus === 'rejected' ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                  Rejection reason
                </p>
                <p className="mt-2 whitespace-pre-wrap">
                  {getRejectionReason(selectedIdea)}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
