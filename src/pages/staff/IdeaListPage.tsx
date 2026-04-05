import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { UIEvent } from 'react'
import { Input, Select } from 'antd'
import { Lightbulb, Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { AppButton } from '@/components/app/AppButton'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { AppPagination } from '@/components/shared/AppPagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'

import { CATEGORY_SELECT_PAGE_SIZE } from '@/constants/category'
import { SUBMISSION_SELECT_PAGE_SIZE } from '@/constants/submission'
import { useIdeaFilters } from '@/hooks/useIdeaFilters'
import { useAllIdeas } from '@/hooks/useIdeas'
import { useSubmissions } from '@/hooks/useSubmissions'
import { normalizeIdeaResponse } from '@/utils/idea-response-mapper'
import { useIdeaCategories } from '@/hooks/useCategories'

const DEFAULT_PAGE_SIZE = 5
const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50']
const OPTION_SCROLL_THRESHOLD = 16

export default function IdeaListPage() {
  const {
    search,
    setSearch,
    categoryId,
    setCategoryId,
    submissionId,
    setSubmissionId,
  } = useIdeaFilters()
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(1)
  const [shouldLoadCategories, setShouldLoadCategories] = useState(false)
  const [shouldLoadSubmissions, setShouldLoadSubmissions] = useState(false)
  const [categoryOptionPage, setCategoryOptionPage] = useState(1)
  const [submissionOptionPage, setSubmissionOptionPage] = useState(1)
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([])
  const [submissionOptions, setSubmissionOptions] = useState<
    { label: string; value: string }[]
  >([])
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
  const { data: categoryData, isFetching: isFetchingCategories } =
    useIdeaCategories(
      {
        pageNumber: categoryOptionPage,
        pageSize: CATEGORY_SELECT_PAGE_SIZE,
      },
      { enabled: shouldLoadCategories },
    )
  const { data: submissionData, isFetching: isFetchingSubmissions } =
    useSubmissions(
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
    return Array.isArray(categoryList)
      ? categoryList.filter((item) => item.id)
      : []
  }, [categoryData])
  const submissions = useMemo(() => {
    const submissionList = submissionData?.submissions ?? []
    return Array.isArray(submissionList)
      ? submissionList.filter((item) => item.id)
      : []
  }, [submissionData])
  const selectedSubmission = useMemo(
    () =>
      submissions.find((submissionOption) => submissionOption.id === submissionId),
    [submissionId, submissions],
  )
  const selectedCategory = useMemo(
    () => categories.find((categoryOption) => categoryOption.id === categoryId),
    [categories, categoryId],
  )

  const totalIdeas =
    data?.pagination?.totalCount ??
    data?.totalCount ??
    data?.total ??
    ideas.length
  const totalPages = Math.max(1, Math.ceil(totalIdeas / pageSize))
  const hasCategoryFilter = categoryId.length > 0
  const hasSubmissionFilter = submissionId.length > 0
  const listDescription =
    hasCategoryFilter || hasSubmissionFilter
      ? `${totalIdeas} ideas matched your current filters.`
      : `${totalIdeas} ideas are currently available in the live university catalogue.`
  const hasMoreCategories =
    (categoryData?.pagination?.totalPages ?? 1) > categoryOptionPage
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

    setCategoryOptions((currentOptions) => {
      const seenValues = new Set(currentOptions.map((option) => option.value))
      const nextOptions = [...currentOptions]

      categories.forEach((categoryOption) => {
        if (!seenValues.has(categoryOption.id)) {
          nextOptions.push({
            value: categoryOption.id,
            label: categoryOption.name,
          })
        }
      })

      return nextOptions
    })
  }, [categories, categoryData])

  useEffect(() => {
    if (!submissionData?.submissions?.length) {
      return
    }

    setSubmissionOptions((currentOptions) => {
      const seenValues = new Set(currentOptions.map((option) => option.value))
      const nextOptions = [...currentOptions]

      submissions.forEach((submissionOption) => {
        if (!seenValues.has(submissionOption.id)) {
          nextOptions.push({
            value: submissionOption.id,
            label: submissionOption.name,
          })
        }
      })

      return nextOptions
    })
  }, [submissionData, submissions])

  const handleSubmissionPopupScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const isNearBottom =
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - OPTION_SCROLL_THRESHOLD

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
      target.scrollHeight - OPTION_SCROLL_THRESHOLD

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
      <PageHeader
        title="Browse Ideas"
        description={listDescription}
        actions={
          <Link to="/submit-idea">
            <AppButton variant="secondary">Submit Idea</AppButton>
          </Link>
        }
      />

      <SectionCard
        title="Discover ideas"
        description="Search the catalogue, narrow by category or submission, and open any idea to read the full proposal and discussion."
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="block">
            <Input
              id="idea-search"
              name="idea-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, description, author, or category"
              allowClear
              size="large"
              prefix={<Search className="h-4 w-4 text-slate-400" />}
              className="rounded-2xl"
            />
          </label>
          <label className="block">
            <Select<string>
              value={submissionId || undefined}
              size="large"
              allowClear
              showSearch={false}
              loading={isFetchingSubmissions}
              placeholder="All submissions"
              options={submissionOptions}
              onOpenChange={(open) => {
                if (open) {
                  setShouldLoadSubmissions(true)
                }
              }}
              onPopupScroll={handleSubmissionPopupScroll}
              onChange={(value) => setSubmissionId(value)}
              onClear={() => setSubmissionId('')}
              className="w-full"
            />
          </label>
          <label className="block">
            <Select<string>
              value={categoryId || undefined}
              size="large"
              allowClear
              showSearch={false}
              loading={isFetchingCategories}
              placeholder="All categories"
              options={categoryOptions}
              onOpenChange={(open) => {
                if (open) {
                  setShouldLoadCategories(true)
                }
              }}
              onPopupScroll={handleCategoryPopupScroll}
              onChange={(value) => setCategoryId(value)}
              onClear={() => setCategoryId('')}
              className="w-full"
            />
          </label>
          <AppButton
            type="button"
            variant="ghost"
            className="min-w-36"
            onClick={() => {
              setSearch('')
              setCategoryId('')
              setSubmissionId('')
            }}
          >
            Reset
          </AppButton>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            {totalIdeas} total ideas
          </span>
          {selectedCategory && (
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
              Category: {selectedCategory.name}
            </span>
          )}
          {selectedSubmission && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              Submission: {selectedSubmission.name}
            </span>
          )}
        </div>
      </SectionCard>

      <div className="mt-6">
        {error ? (
          <EmptyState
            icon={Lightbulb}
            title="Unable to load ideas"
            description={error.message}
          />
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Loading ideas...
          </div>
        ) : ideas.length > 0 ? (
          <>
            <div className="space-y-4">
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>

            <AppPagination
              containerClassName="mt-6"
              current={currentPage}
              total={totalIdeas}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onChange={(page, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize)
                  setCurrentPage(1)
                  return
                }

                setCurrentPage(page)
              }}
              showTotal={(total, range) =>
                hasCategoryFilter || hasSubmissionFilter
                  ? `Showing ${range[0]}-${range[1]} of ${total} matching ideas`
                  : `Showing ${range[0]}-${range[1]} of ${total} ideas`
              }
            />
          </>
        ) : (
          <div className="space-y-6">
            <EmptyState
              icon={Lightbulb}
              title="No idea records loaded"
              description={
                hasCategoryFilter || hasSubmissionFilter
                  ? 'Try another category, submission, or clear the filters.'
                  : deferredSearch
                    ? 'Try another keyword or clear the search.'
                    : 'Try adjusting your page selection.'
              }
            />

            {totalIdeas > 0 && (
              <AppPagination
                current={currentPage}
                total={totalIdeas}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onChange={(page, nextPageSize) => {
                  if (nextPageSize !== pageSize) {
                    setPageSize(nextPageSize)
                    setCurrentPage(1)
                    return
                  }

                  setCurrentPage(page)
                }}
                showTotal={(total) =>
                  hasCategoryFilter || hasSubmissionFilter
                    ? `${total} total matching ideas`
                    : `${total} total ideas`
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
