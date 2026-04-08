import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { UIEvent } from 'react'
import { useIdeaFilters } from '@/hooks/useIdeaFilters'
import { useAllIdeas } from '@/hooks/useIdeas'
import { useSubmissions } from '@/hooks/useSubmissions'
import { useIdeaCategories } from '@/hooks/useCategories'
import { normalizeIdeaResponse } from '@/utils/idea-response-mapper'
import { CATEGORY_SELECT_PAGE_SIZE } from '@/constants/category'
import { SUBMISSION_SELECT_PAGE_SIZE } from '@/constants/submission'
import { IdeaCatalogueFiltersSection } from '@/features/ideas/components/IdeaCatalogueFiltersSection'
import { IdeaCatalogueResultsSection } from '@/features/ideas/components/IdeaCatalogueResultsSection'
import {
  appendUniqueCategoryOptions,
  appendUniqueSubmissionOptions,
  DEFAULT_IDEA_CATALOGUE_PAGE_SIZE,
  IDEA_OPTION_SCROLL_THRESHOLD,
} from '@/features/ideas/helpers/idea-catalogue'
import type { SelectOptionItem } from '@/features/ideas/helpers/idea-catalogue'

export default function IdeaCataloguePage() {
  const {
    search,
    setSearch,
    categoryId,
    setCategoryId,
    submissionId,
    setSubmissionId,
  } = useIdeaFilters()
  const [pageSize, setPageSize] = useState<number>(DEFAULT_IDEA_CATALOGUE_PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(1)
  const [shouldLoadCategories, setShouldLoadCategories] = useState(false)
  const [shouldLoadSubmissions, setShouldLoadSubmissions] = useState(false)
  const [categoryOptionPage, setCategoryOptionPage] = useState(1)
  const [submissionOptionPage, setSubmissionOptionPage] = useState(1)
  const [categoryOptions, setCategoryOptions] = useState<SelectOptionItem[]>([])
  const [submissionOptions, setSubmissionOptions] = useState<SelectOptionItem[]>([])
  const categoryLoadLockRef = useRef(false)
  const submissionLoadLockRef = useRef(false)
  const deferredSearch = useDeferredValue(search.trim())
  const { data, isLoading, error } = useAllIdeas({
    pageNumber: currentPage,
    pageSize,
    searchTerm: deferredSearch || undefined,
    submissionId: submissionId || undefined,
    categoryId: categoryId || undefined,
  })
  const { data: categoryData, isFetching: isFetchingCategories } = useIdeaCategories(
    {
      pageNumber: categoryOptionPage,
      pageSize: CATEGORY_SELECT_PAGE_SIZE,
    },
    { enabled: shouldLoadCategories },
  )
  const { data: submissionData, isFetching: isFetchingSubmissions } = useSubmissions(
    {
      pageNumber: submissionOptionPage,
      pageSize: SUBMISSION_SELECT_PAGE_SIZE,
    },
    { enabled: shouldLoadSubmissions },
  )

  const ideas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(data)
    return Array.isArray(ideaList) ? ideaList.filter((idea) => idea.id) : []
  }, [data])

  const categories = useMemo(() => {
    const categoryList = categoryData?.categories ?? []
    return Array.isArray(categoryList) ? categoryList.filter((item) => item.id) : []
  }, [categoryData])
  const submissions = useMemo(() => {
    const submissionList = submissionData?.submissions ?? []
    return Array.isArray(submissionList)
      ? submissionList.filter((item) => item.id)
      : []
  }, [submissionData])
  const selectedSubmission = useMemo(
    () => submissions.find((submissionOption) => submissionOption.id === submissionId),
    [submissionId, submissions],
  )
  const selectedCategory = useMemo(
    () => categories.find((categoryOption) => categoryOption.id === categoryId),
    [categories, categoryId],
  )

  const totalIdeas =
    data?.pagination?.totalCount ?? data?.totalCount ?? data?.total ?? ideas.length
  const totalPages = Math.max(1, Math.ceil(totalIdeas / pageSize))
  const hasCategoryFilter = (categoryId?.length ?? 0) > 0
  const hasSubmissionFilter = (submissionId?.length ?? 0) > 0
  const listDescription =
    hasCategoryFilter || hasSubmissionFilter
      ? `${totalIdeas} ideas matched your current filters.`
      : `${totalIdeas} ideas are currently available in the live university catalogue.`
  const hasMoreCategories = (categoryData?.pagination?.totalPages ?? 1) > categoryOptionPage
  const hasMoreSubmissions =
    (submissionData?.pagination?.totalPages ?? 1) > submissionOptionPage

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryId, submissionId, deferredSearch])

  useEffect(() => {
    if (!isFetchingCategories) {
      categoryLoadLockRef.current = false
    }
  }, [isFetchingCategories])

  useEffect(() => {
    if (!isFetchingSubmissions) {
      submissionLoadLockRef.current = false
    }
  }, [isFetchingSubmissions])

  useEffect(() => {
    if (!categoryData || categoryData.categories.length === 0) {
      return
    }

    setCategoryOptions((currentOptions) =>
      appendUniqueCategoryOptions(currentOptions, categories),
    )
  }, [categories, categoryData])

  useEffect(() => {
    if (!submissionData?.submissions?.length) {
      return
    }

    setSubmissionOptions((currentOptions) =>
      appendUniqueSubmissionOptions(currentOptions, submissions),
    )
  }, [submissionData, submissions])

  const handleSubmissionPopupScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const isNearBottom =
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - IDEA_OPTION_SCROLL_THRESHOLD

    if (
      isNearBottom &&
      hasMoreSubmissions &&
      !isFetchingSubmissions &&
      !submissionLoadLockRef.current
    ) {
      submissionLoadLockRef.current = true
      setSubmissionOptionPage((currentValue) => currentValue + 1)
    }
  }

  const handleCategoryPopupScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const isNearBottom =
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - IDEA_OPTION_SCROLL_THRESHOLD

    if (
      isNearBottom &&
      hasMoreCategories &&
      !isFetchingCategories &&
      !categoryLoadLockRef.current
    ) {
      categoryLoadLockRef.current = true
      setCategoryOptionPage((currentValue) => currentValue + 1)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <IdeaCatalogueFiltersSection
        listDescription={listDescription}
        search={search}
        submissionId={submissionId}
        categoryId={categoryId}
        submissionOptions={submissionOptions}
        categoryOptions={categoryOptions}
        isFetchingSubmissions={isFetchingSubmissions}
        isFetchingCategories={isFetchingCategories}
        totalIdeas={totalIdeas}
        selectedSubmission={selectedSubmission}
        selectedCategory={selectedCategory}
        onSearchChange={setSearch}
        onSubmissionOpenChange={(open) => {
          if (open) {
            setShouldLoadSubmissions(true)
          }
        }}
        onCategoryOpenChange={(open) => {
          if (open) {
            setShouldLoadCategories(true)
          }
        }}
        onSubmissionPopupScroll={handleSubmissionPopupScroll}
        onCategoryPopupScroll={handleCategoryPopupScroll}
        onSubmissionChange={setSubmissionId}
        onSubmissionClear={() => setSubmissionId('')}
        onCategoryChange={setCategoryId}
        onCategoryClear={() => setCategoryId('')}
      />

      <IdeaCatalogueResultsSection
        error={error}
        isLoading={isLoading}
        ideas={ideas}
        totalIdeas={totalIdeas}
        currentPage={currentPage}
        pageSize={pageSize}
        hasCategoryFilter={hasCategoryFilter}
        hasSubmissionFilter={hasSubmissionFilter}
        deferredSearch={deferredSearch}
        onPageChange={(page, nextPageSize) => {
          if (nextPageSize !== pageSize) {
            setPageSize(nextPageSize)
            setCurrentPage(1)
            return
          }

          setCurrentPage(page)
        }}
      />
    </div>
  )
}
