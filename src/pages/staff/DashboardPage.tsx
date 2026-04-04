import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Input } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  Eye,
  Lightbulb,
  PlusCircle,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import type { Idea } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput, FormTextarea } from '@/components/forms/FormInput'
import { AppPagination } from '@/components/shared/AppPagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal } from '@/components/shared/Modal'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { CATEGORY_SELECT_PAGE_SIZE } from '@/constants/category'
import { SUBMISSION_SELECT_PAGE_SIZE } from '@/constants/submission'
import { useIdeaCategories } from '@/hooks/useCategories'
import {
  useAllIdeasMatching,
  useDeleteIdea,
  useMyIdeas,
  useUpdateIdea,
} from '@/hooks/useIdeas'
import { useSubmissions } from '@/hooks/useSubmissions'
import { formatAppDateTime, getDateTimestamp } from '@/lib/date'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'
import { appNotification } from '@/lib/notifications'

type IdeaStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'
type OverviewMetricAccent = 'blue' | 'emerald' | 'violet'

interface DashboardPageProps {
  title?: string
  description?: string
  enablePagination?: boolean
  showSummaryCards?: boolean
}

interface EditIdeaFormState {
  title: string
  description: string
  categoryId: string
  isAnonymous: boolean
  uploadFiles: File[]
}

interface IdeaListSectionProps {
  title: string
  description: string
  ideas: Idea[]
  emptyTitle: string
  emptyDescription: string
}

interface OverviewMetricCardProps {
  title: string
  value: string
  description: string
  accent: OverviewMetricAccent
  icon: typeof Lightbulb
}

const DEFAULT_MY_IDEA_PAGE_SIZE = 10
const MY_IDEA_PAGE_SIZE_OPTIONS = ['5', '10', '20', '50']
const initialEditIdeaForm: EditIdeaFormState = {
  title: '',
  description: '',
  categoryId: '',
  isAnonymous: false,
  uploadFiles: [],
}

const overviewMetricAccentClassNames: Record<
  OverviewMetricAccent,
  {
    icon: string
    badge: string
  }
> = {
  blue: {
    icon: 'bg-blue-100 text-blue-700',
    badge: 'bg-blue-50 text-blue-700',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-700',
    badge: 'bg-violet-50 text-violet-700',
  },
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

function getIdeaDateValue(idea: Idea) {
  return idea.createdAt || idea.createdDate
}

function getReactionScore(idea: Idea) {
  return (idea.thumbsUpCount ?? 0) - (idea.thumbsDownCount ?? 0)
}

function getRejectionReason(idea?: Idea | null) {
  const rejectionReason = idea?.rejectionReason?.trim()

  if (rejectionReason) {
    return rejectionReason
  }

  return 'No rejection reason was returned by the backend for this idea.'
}

function isPdfFile(file: File) {
  const normalizedType = file.type.toLowerCase()
  const normalizedName = file.name.toLowerCase()

  return normalizedType === 'application/pdf' || normalizedName.endsWith('.pdf')
}

function isIdeaPastSubmissionClosure(
  idea: Idea,
  closedSubmissionIds: Set<string>,
  closedSubmissionNames: Set<string>,
) {
  return Boolean(
    (idea.submissionId && closedSubmissionIds.has(idea.submissionId)) ||
      (idea.submissionName && closedSubmissionNames.has(idea.submissionName)),
  )
}

function OverviewMetricCard({
  title,
  value,
  description,
  accent,
  icon: Icon,
}: OverviewMetricCardProps) {
  const accentClasses = overviewMetricAccentClassNames[accent]

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${accentClasses.badge}`}
          >
            {description}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentClasses.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function IdeaListSection({
  title,
  description,
  ideas,
  emptyTitle,
  emptyDescription,
}: IdeaListSectionProps) {
  return (
    <SectionCard title={title} description={description}>
      {ideas.length > 0 ? (
        <div className="space-y-4">
          {ideas.map((idea) => {
            const statusMeta = getIdeaStatusMeta(getIdeaStatusValue(idea))

            return (
              <div
                key={idea.id}
                className="rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] px-5 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-slate-950">
                        {getIdeaTitle(idea)}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {idea.categoryName || 'Uncategorized'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span>{idea.authorName || 'Anonymous contributor'}</span>
                      <span>{formatAppDateTime(getIdeaDateValue(idea))}</span>
                      <span>{idea.departmentName || 'University wide'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <div className="flex items-center gap-4 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {idea.viewCount ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        {idea.thumbsUpCount ?? 0}
                      </span>
                    </div>

                    <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
                      <AppButton type="button" variant="ghost">
                        View details
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
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </SectionCard>
  )
}

function DashboardOverview({
  myIdeas,
  allIdeas,
  isLoading,
  errorMessage,
}: {
  myIdeas: Idea[]
  allIdeas: Idea[]
  isLoading: boolean
  errorMessage?: string
}) {
  const latestIdeas = useMemo(() => allIdeas.slice(0, 3), [allIdeas])
  const mostPopularIdeas = useMemo(
    () =>
      [...allIdeas]
        .sort((left, right) => {
          const scoreDiff = getReactionScore(right) - getReactionScore(left)

          if (scoreDiff !== 0) {
            return scoreDiff
          }

          return (right.viewCount ?? 0) - (left.viewCount ?? 0)
        })
        .slice(0, 2),
    [allIdeas],
  )
  const mostViewedIdeas = useMemo(
    () =>
      [...allIdeas]
        .sort((left, right) => {
          const viewDiff = (right.viewCount ?? 0) - (left.viewCount ?? 0)

          if (viewDiff !== 0) {
            return viewDiff
          }

          return getReactionScore(right) - getReactionScore(left)
        })
        .slice(0, 2),
    [allIdeas],
  )

  const totalLikesOnMyIdeas = useMemo(
    () => myIdeas.reduce((total, idea) => total + (idea.thumbsUpCount ?? 0), 0),
    [myIdeas],
  )

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-blue-100 bg-[radial-gradient(circle_at_top,rgba(219,234,254,0.95)_0%,rgba(255,255,255,1)_56%)] p-6">
        <p className="text-sm leading-6 text-slate-600">
          Welcome back! Here&apos;s an overview of your contributions and recent activities.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <OverviewMetricCard
          title="Total ideas"
          value={isLoading ? '...' : `${allIdeas.length}`}
          description="Across all categories"
          accent="blue"
          icon={Lightbulb}
        />
        <OverviewMetricCard
          title="My ideas"
          value={isLoading ? '...' : `${myIdeas.length}`}
          description="Ideas you've submitted"
          accent="emerald"
          icon={CheckCircle2}
        />
        <OverviewMetricCard
          title="Engagement"
          value={isLoading ? '...' : `${totalLikesOnMyIdeas}`}
          description="Total likes on your ideas"
          accent="violet"
          icon={TrendingUp}
        />
      </div>

      <SectionCard title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <Link to="/submit-idea">
            <AppButton>
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit New Idea
            </AppButton>
          </Link>
          <Link to="/ideas">
            <AppButton variant="ghost">
              <Sparkles className="mr-2 h-4 w-4" />
              View All Ideas
            </AppButton>
          </Link>
          <Link to="/my-ideas">
            <AppButton variant="ghost">
              <ArrowRight className="mr-2 h-4 w-4" />
              Open My Ideas
            </AppButton>
          </Link>
        </div>
      </SectionCard>

      {errorMessage ? (
        <SectionCard>
          <EmptyState
            icon={Lightbulb}
            title="Unable to load dashboard overview"
            description={errorMessage}
          />
        </SectionCard>
      ) : (
        <>
          <IdeaListSection
            title="Latest ideas"
            description="Recently submitted ideas across the university feed."
            ideas={latestIdeas}
            emptyTitle="No recent ideas yet"
            emptyDescription="Latest ideas will appear here after new submissions are published."
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <IdeaListSection
              title="Most popular"
              description="Ideas with the strongest current reaction from the community."
              ideas={mostPopularIdeas}
              emptyTitle="No popular ideas yet"
              emptyDescription="Community reactions will surface the most popular ideas here."
            />
            <IdeaListSection
              title="Most viewed"
              description="Ideas attracting the highest reading activity right now."
              ideas={mostViewedIdeas}
              emptyTitle="No viewed ideas yet"
              emptyDescription="View trends will appear here once the idea feed has more activity."
            />
          </div>
        </>
      )}
    </div>
  )
}

function MyIdeaTracker({
  title,
  description,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
  selectedIdea,
  setSelectedIdea,
  searchValue,
  setSearchValue,
  statusFilter,
  setStatusFilter,
  data,
  filteredIdeas,
  sortedIdeas,
  isLoading,
  error,
}: {
  title: string
  description: string
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  selectedIdea: Idea | null
  setSelectedIdea: (idea: Idea | null) => void
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
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [editForm, setEditForm] = useState<EditIdeaFormState>(initialEditIdeaForm)
  const [fileValidationMessage, setFileValidationMessage] = useState('')
  const [deleteIdeaTarget, setDeleteIdeaTarget] = useState<Idea | null>(null)
  const { data: categoryData, isLoading: categoriesLoading } = useIdeaCategories({
    pageNumber: 1,
    pageSize: CATEGORY_SELECT_PAGE_SIZE,
  })
  const { data: submissionData } = useSubmissions({
    pageNumber: 1,
    pageSize: SUBMISSION_SELECT_PAGE_SIZE,
  })
  const { mutateAsync: updateIdea, isPending: isUpdatingIdea } = useUpdateIdea()
  const { mutateAsync: deleteIdea, isPending: isDeletingIdea } = useDeleteIdea()
  const categories = useMemo(
    () =>
      Array.isArray(categoryData?.categories)
        ? categoryData.categories.filter((category) => category.id)
        : [],
    [categoryData],
  )
  const closedSubmissionIds = useMemo(() => {
    const currentTimestamp = Date.now()

    return new Set(
      (submissionData?.submissions ?? [])
        .filter((submission) => getDateTimestamp(submission.closureDate) < currentTimestamp)
        .map((submission) => submission.id),
    )
  }, [submissionData?.submissions])
  const closedSubmissionNames = useMemo(() => {
    const currentTimestamp = Date.now()

    return new Set(
      (submissionData?.submissions ?? [])
        .filter((submission) => getDateTimestamp(submission.closureDate) < currentTimestamp)
        .map((submission) => submission.name),
    )
  }, [submissionData?.submissions])
  const totalIdeas =
    data?.pagination?.totalCount ??
    data?.totalCount ??
    data?.total ??
    filteredIdeas.length
  const rangeStart = totalIdeas === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = totalIdeas === 0 ? 0 : rangeStart + filteredIdeas.length - 1
  const selectedIdeaStatus = selectedIdea
    ? getIdeaStatusValue(selectedIdea)
    : 'pending'
  const selectedIdeaStatusMeta = getIdeaStatusMeta(selectedIdeaStatus)
  const refreshIdeaQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['allIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['allIdeasMatching'] }),
      queryClient.invalidateQueries({ queryKey: ['qaManagerIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['qaCoordinatorIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['adminIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['idea'] }),
    ])
  }

  useEffect(() => {
    if (!editingIdea) {
      return
    }

    setEditForm((previousForm) => {
      if (previousForm.categoryId) {
        return previousForm
      }

      const matchingCategory = categories.find(
        (category) => category.name === editingIdea.categoryName,
      )

      if (!matchingCategory) {
        return previousForm
      }

      return {
        ...previousForm,
        categoryId: matchingCategory.id,
      }
    })
  }, [categories, editingIdea])

  const openEditIdeaModal = (idea: Idea) => {
    const matchingCategory = categories.find(
      (category) => category.name === idea.categoryName,
    )

    setEditingIdea(idea)
    setFileValidationMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setEditForm({
      title: getIdeaTitle(idea),
      description: idea.description?.trim() ?? '',
      categoryId: idea.categoryId ?? matchingCategory?.id ?? '',
      isAnonymous: idea.isAnonymous,
      uploadFiles: [],
    })
  }

  const closeEditIdeaModal = () => {
    setEditingIdea(null)
    setEditForm(initialEditIdeaForm)
    setFileValidationMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleEditFileChange = (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? [])

    if (!selectedFiles.length) {
      setEditForm((previousForm) => ({ ...previousForm, uploadFiles: [] }))
      setFileValidationMessage('')
      return
    }

    const invalidFile = selectedFiles.find((file) => !isPdfFile(file))

    if (invalidFile) {
      setEditForm((previousForm) => ({ ...previousForm, uploadFiles: [] }))
      setFileValidationMessage(
        `File '${invalidFile.name}' is invalid. Only PDF files are allowed.`,
      )

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      return
    }

    setEditForm((previousForm) => ({
      ...previousForm,
      uploadFiles: selectedFiles,
    }))
    setFileValidationMessage('')
  }

  const handleUpdateIdea = async () => {
    if (!editingIdea) {
      return
    }

    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.categoryId) {
      appNotification.warning('Please complete all required fields before saving.')
      return
    }

    if (fileValidationMessage) {
      appNotification.warning(fileValidationMessage)
      return
    }

    const formData = new FormData()
    formData.append('Title', editForm.title.trim())
    formData.append('Description', editForm.description.trim())
    formData.append('CategoryId', editForm.categoryId)
    formData.append('IsAnonymous', String(editForm.isAnonymous))
    editForm.uploadFiles.forEach((file) => {
      formData.append('UploadedFiles', file)
    })

    const response = await updateIdea({ ideaId: editingIdea.id, formData })

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to update this idea.')
      return
    }

    await refreshIdeaQueries()
    appNotification.success('Idea updated successfully.')
    closeEditIdeaModal()
  }

  const handleDeleteIdea = async () => {
    if (!deleteIdeaTarget) {
      return
    }

    const response = await deleteIdea(deleteIdeaTarget.id)

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to delete this idea.')
      return
    }

    await refreshIdeaQueries()
    if (selectedIdea?.id === deleteIdeaTarget.id) {
      setSelectedIdea(null)
    }
    if (editingIdea?.id === deleteIdeaTarget.id) {
      closeEditIdeaModal()
    }
    appNotification.success('Idea deleted successfully.')
    setDeleteIdeaTarget(null)
  }

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
                const isPastClosure = isIdeaPastSubmissionClosure(
                  idea,
                  closedSubmissionIds,
                  closedSubmissionNames,
                )

                return (
                  <div
                    key={idea.id}
                    className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] p-5 shadow-sm"
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
                            Submitted: {formatAppDateTime(getIdeaDateValue(idea))}
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
                            Rejected idea. Open details to review the rejection note.
                          </div>
                        ) : null}
                      </div>

                      <div className="flex min-w-[220px] flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Quick actions
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Inspect the summary first or move into the full idea page.
                          </p>
                        </div>
                        <AppButton
                          type="button"
                          variant="secondary"
                          onClick={() => setSelectedIdea(idea)}
                        >
                          Show details
                        </AppButton>
                        {!isPastClosure ? (
                          <>
                            <AppButton
                              type="button"
                              variant="ghost"
                              onClick={() => openEditIdeaModal(idea)}
                            >
                              Edit idea
                            </AppButton>
                            <AppButton
                              type="button"
                              variant="red"
                              onClick={() => setDeleteIdeaTarget(idea)}
                            >
                              Delete idea
                            </AppButton>
                          </>
                        ) : (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                            Edit and delete are unavailable after the submission closure date.
                          </div>
                        )}
                        <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
                          <AppButton type="button" variant="ghost">
                            Open idea
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </AppButton>
                        </Link>
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

      <Modal
        isOpen={!!selectedIdea}
        title={selectedIdea ? getIdeaTitle(selectedIdea) : 'Idea details'}
        description="Review the submission status and detail summary for this idea."
        onClose={() => setSelectedIdea(null)}
        maxWidthClassName="max-w-3xl"
        footer={
          selectedIdea ? (
            <>
              {!isIdeaPastSubmissionClosure(
                selectedIdea,
                closedSubmissionIds,
                closedSubmissionNames,
              ) ? (
                <AppButton
                  type="button"
                  variant="red"
                  onClick={() => setDeleteIdeaTarget(selectedIdea)}
                >
                  Delete idea
                </AppButton>
              ) : null}
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
                  {formatAppDateTime(getIdeaDateValue(selectedIdea))}
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

            {isIdeaPastSubmissionClosure(
              selectedIdea,
              closedSubmissionIds,
              closedSubmissionNames,
            ) ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                Edit and delete are unavailable after the submission closure date.
              </div>
            ) : null}

            {selectedIdeaStatus === 'rejected' ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                  Rejection note
                </p>
                <p className="mt-2 whitespace-pre-wrap">
                  {getRejectionReason(selectedIdea)}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={!!editingIdea}
        title={editingIdea ? 'Edit idea' : 'Edit idea'}
        description="Update your own idea details and upload replacement supporting PDFs if needed."
        onClose={closeEditIdeaModal}
        maxWidthClassName="max-w-3xl"
        footer={
          <>
            <AppButton
              type="button"
              variant="ghost"
              onClick={closeEditIdeaModal}
              disabled={isUpdatingIdea}
            >
              Cancel
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => void handleUpdateIdea()}
              disabled={isUpdatingIdea}
            >
              {isUpdatingIdea ? 'Saving...' : 'Save changes'}
            </AppButton>
          </>
        }
      >
        <div className="space-y-5">
          <FormField label="Idea title" required>
            <FormInput
              id="edit-idea-title"
              name="edit-idea-title"
              value={editForm.title}
              onChange={(event) =>
                setEditForm((previousForm) => ({
                  ...previousForm,
                  title: event.target.value,
                }))
              }
              placeholder="Enter a concise title"
            />
          </FormField>

          <FormField label="Content" required>
            <FormTextarea
              id="edit-idea-description"
              name="edit-idea-description"
              value={editForm.description}
              onChange={(event) =>
                setEditForm((previousForm) => ({
                  ...previousForm,
                  description: event.target.value,
                }))
              }
              placeholder="Describe the idea clearly"
            />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Category" required>
              <select
                id="edit-idea-category"
                name="edit-idea-category"
                value={editForm.categoryId}
                onChange={(event) =>
                  setEditForm((previousForm) => ({
                    ...previousForm,
                    categoryId: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categoriesLoading ? (
                <p className="text-xs text-slate-500">Loading categories...</p>
              ) : null}
            </FormField>

            <FormField label="Anonymous submission">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  id="edit-idea-anonymous"
                  name="edit-idea-anonymous"
                  type="checkbox"
                  checked={editForm.isAnonymous}
                  onChange={(event) =>
                    setEditForm((previousForm) => ({
                      ...previousForm,
                      isAnonymous: event.target.checked,
                    }))
                  }
                />
                Hide author identity from public idea views.
              </label>
            </FormField>
          </div>

          <FormField label="Supporting files">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <FileUp className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Upload replacement files
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PDF files only. Leave empty to keep current documents.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  id="edit-idea-uploaded-files"
                  name="edit-idea-uploaded-files"
                  multiple
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(event) => handleEditFileChange(event.target.files)}
                />
              </label>
              <p className="mt-4 text-sm text-slate-600">
                {editForm.uploadFiles.length
                  ? editForm.uploadFiles.map((file) => file.name).join(', ')
                  : 'No new files selected.'}
              </p>
              {fileValidationMessage ? (
                <p className="mt-3 text-sm text-red-600">
                  {fileValidationMessage}
                </p>
              ) : null}
            </div>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteIdeaTarget}
        title="Delete idea"
        message={
          deleteIdeaTarget
            ? `Delete "${getIdeaTitle(deleteIdeaTarget)}"? This cannot be undone.`
            : ''
        }
        confirmText="Delete idea"
        isDangerous
        isLoading={isDeletingIdea}
        onConfirm={() => void handleDeleteIdea()}
        onCancel={() => setDeleteIdeaTarget(null)}
      />
    </>
  )
}

export default function DashboardPage({
  title = 'Dashboard',
  description = 'Welcome back! Here\'s an overview of your contributions and recent activities.',
  enablePagination = false,
  showSummaryCards = true,
}: DashboardPageProps) {
  const isOverviewMode = showSummaryCards && !enablePagination
  const [statusFilter, setStatusFilter] = useState<IdeaStatusFilter>('all')
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_MY_IDEA_PAGE_SIZE)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const deferredSearch = useDeferredValue(searchValue.trim())

  const reviewStatus =
    statusFilter === 'all'
      ? undefined
      : statusFilter === 'approved'
        ? 1
        : statusFilter === 'rejected'
          ? 2
          : 0

  const {
    data: myOverviewData,
    isLoading: isOverviewLoading,
    error: overviewError,
  } = useMyIdeas(undefined, {
    fetchAll: true,
    enabled: isOverviewMode,
  })
  const { data: allIdeasData } = useAllIdeasMatching(undefined, {
    enabled: isOverviewMode,
  })

  const {
    data: trackerData,
    isLoading: isTrackerLoading,
    error: trackerError,
  } = useMyIdeas(
    {
      searchTerm: deferredSearch || undefined,
      pageNumber: currentPage,
      pageSize,
      reviewStatus,
    },
    {
      fetchAll: false,
      enabled: !isOverviewMode,
    },
  )

  const myOverviewIdeas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(myOverviewData)

    return Array.isArray(ideaList)
      ? [...ideaList]
          .filter((idea) => idea.id)
          .sort(
            (left, right) =>
              getDateTimestamp(getIdeaDateValue(right)) -
              getDateTimestamp(getIdeaDateValue(left)),
          )
      : []
  }, [myOverviewData])

  const allIdeas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(allIdeasData)

    return Array.isArray(ideaList)
      ? [...ideaList]
          .filter((idea) => idea.id)
          .sort(
            (left, right) =>
              getDateTimestamp(getIdeaDateValue(right)) -
              getDateTimestamp(getIdeaDateValue(left)),
          )
      : []
  }, [allIdeasData])

  const trackerIdeas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(trackerData)
    return Array.isArray(ideaList) ? ideaList.filter((idea) => idea.id) : []
  }, [trackerData])

  const sortedTrackerIdeas = useMemo(
    () =>
      [...trackerIdeas].sort(
        (left, right) =>
          getDateTimestamp(getIdeaDateValue(right)) -
          getDateTimestamp(getIdeaDateValue(left)),
      ),
    [trackerIdeas],
  )

  const filteredTrackerIdeas = useMemo(() => sortedTrackerIdeas, [sortedTrackerIdeas])

  useEffect(() => {
    if (isOverviewMode) {
      return
    }

    setCurrentPage(1)
  }, [deferredSearch, isOverviewMode, statusFilter])

  const trackerTotalPages = Math.max(
    1,
    Math.ceil(
      ((trackerData?.pagination?.totalCount ??
        trackerData?.totalCount ??
        trackerData?.total ??
        filteredTrackerIdeas.length) || 0) / pageSize,
    ),
  )

  useEffect(() => {
    if (isOverviewMode || currentPage <= trackerTotalPages) {
      return
    }

    setCurrentPage(trackerTotalPages)
  }, [currentPage, isOverviewMode, trackerTotalPages])

  if (isOverviewMode) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <PageHeader title={title} description={description} />
        <DashboardOverview
          myIdeas={myOverviewIdeas}
          allIdeas={allIdeas}
          isLoading={isOverviewLoading}
          errorMessage={overviewError?.message}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <MyIdeaTracker
        title={title}
        description={description}
        currentPage={currentPage}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        setPageSize={setPageSize}
        selectedIdea={selectedIdea}
        setSelectedIdea={setSelectedIdea}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        data={trackerData}
        filteredIdeas={filteredTrackerIdeas}
        sortedIdeas={sortedTrackerIdeas}
        isLoading={isTrackerLoading}
        error={trackerError}
      />
    </div>
  )
}
