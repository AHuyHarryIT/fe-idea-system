import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Input } from 'antd'
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
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'
import { useIdeaCategories } from '@/hooks/useCategories'

const DEFAULT_PAGE_SIZE = 5
const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50']

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
  const deferredSearch = useDeferredValue(search.trim())
  const { data, isLoading, error } = useAllIdeas({
    pageNumber: currentPage,
    pageSize,
    searchTerm: deferredSearch || undefined,
    submissionId: submissionId || undefined,
    categoryId: categoryId || undefined,
  })
  const { data: categoryData } = useIdeaCategories({
    pageNumber: 1,
    pageSize: CATEGORY_SELECT_PAGE_SIZE,
  })
  const { data: submissionData } = useSubmissions({
    pageNumber: 1,
    pageSize: SUBMISSION_SELECT_PAGE_SIZE,
  })

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

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryId, submissionId, deferredSearch])

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
        description="Search the catalogue, narrow by category or submission window, and open any idea to read the full proposal and discussion."
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
          <select
            id="idea-submission-filter"
            name="idea-submission-filter"
            value={submissionId}
            onChange={(event) => setSubmissionId(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All submissions</option>
            {submissions.map((submissionOption) => (
              <option key={submissionOption.id} value={submissionOption.id}>
                {submissionOption.name}
              </option>
            ))}
          </select>
          <select
            id="idea-category-filter"
            name="idea-category-filter"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All categories</option>
            {categories.map((categoryOption) => (
              <option key={categoryOption.id} value={categoryOption.id}>
                {categoryOption.name}
              </option>
            ))}
          </select>
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
          {selectedCategory ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
              Category: {selectedCategory.name}
            </span>
          ) : null}
          {selectedSubmission ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              Submission: {selectedSubmission.name}
            </span>
          ) : null}
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
                  ? 'Try another category, submission window, or clear the filters.'
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
