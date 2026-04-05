import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAllIdeasMatching, useMyIdeas } from '@/hooks/useIdeas'
import { getDateTimestamp } from '@/utils/date'
import { normalizeIdeaResponse } from '@/utils/idea-response-mapper'
import {
  DEFAULT_MY_IDEA_PAGE_SIZE,
  getIdeaDateValue,
  type IdeaStatusFilter,
} from '@/features/dashboard/staff/helpers/staff-dashboard'
import { StaffDashboardOverview } from '@/features/dashboard/staff/components/StaffDashboardOverview'
import { StaffMyIdeasTracker } from '@/features/dashboard/staff/components/StaffMyIdeasTracker'

interface StaffDashboardPageProps {
  title?: string
  description?: string
  enablePagination?: boolean
  showSummaryCards?: boolean
}

export default function StaffDashboardPage({
  title = 'Dashboard',
  description = "Welcome back! Here's an overview of your contributions and recent activities.",
  enablePagination = false,
  showSummaryCards = true,
}: StaffDashboardPageProps) {
  const isOverviewMode = showSummaryCards && !enablePagination
  const [statusFilter, setStatusFilter] = useState<IdeaStatusFilter>('all')
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_MY_IDEA_PAGE_SIZE)
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
        <StaffDashboardOverview
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
      <StaffMyIdeasTracker
        title={title}
        description={description}
        currentPage={currentPage}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        setPageSize={setPageSize}
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
