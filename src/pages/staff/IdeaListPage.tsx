import { useEffect, useMemo, useState } from 'react'
import { Lightbulb, Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { AppButton } from '@/components/app/AppButton'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { AppPagination } from '@/components/shared/AppPagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'

import { CATEGORY_SELECT_PAGE_SIZE } from '@/constants/category'
import { useIdeaFilters } from '@/hooks/useIdeaFilters'
import { useAllIdeas } from '@/hooks/useIdeas'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'
import { useIdeaCategories } from '@/hooks/useCategories'

const DEFAULT_PAGE_SIZE = 5
const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50']

export default function IdeaListPage() {
  const { search, setSearch, category, setCategory } = useIdeaFilters()
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(1)
  const { data, isLoading, error } = useAllIdeas({
    pageNumber: currentPage,
    pageSize,
  })
  const { data: categoryData } = useIdeaCategories({
    pageNumber: 1,
    pageSize: CATEGORY_SELECT_PAGE_SIZE,
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

  const filteredIdeas = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return ideas.filter((idea) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [idea.text, idea.categoryName, idea.departmentName, idea.authorName]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch))
      const matchesCategory = !category || idea.categoryName === category

      return matchesSearch && matchesCategory
    })
  }, [category, ideas, search])

  const totalIdeas =
    data?.pagination?.totalCount ??
    data?.totalCount ??
    data?.total ??
    ideas.length
  const totalPages = Math.max(1, Math.ceil(totalIdeas / pageSize))
  const hasLocalFilters = search.trim().length > 0 || category.length > 0
  const listDescription = hasLocalFilters
    ? `${filteredIdeas.length} ideas matched on this page.`
    : `${totalIdeas} ideas matched from the live catalogue.`

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Idea Listing"
        description={listDescription}
        actions={
          <Link to="/submit-idea">
            <AppButton>Submit Idea</AppButton>
          </Link>
        }
      />

      <SectionCard title="Search & filters">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="idea-search"
              name="idea-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ideas by title, content, category..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <select
            id="idea-category-filter"
            name="idea-category-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All categories</option>
            {categories.map((categoryOption) => (
              <option key={categoryOption.id} value={categoryOption.name}>
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
              setCategory('')
            }}
          >
            Reset
          </AppButton>
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
        ) : filteredIdeas.length > 0 ? (
          <>
            <div className="space-y-4">
              {filteredIdeas.map((idea) => (
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
                hasLocalFilters
                  ? `${filteredIdeas.length} matches on this page · ${total} total ideas`
                  : `Showing ${range[0]}-${range[1]} of ${total} ideas`
              }
            />
          </>
        ) : (
          <div className="space-y-6">
            <EmptyState
              icon={Lightbulb}
              title="No idea records loaded"
              description="Try adjusting your search, category, or page selection."
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
                  hasLocalFilters
                    ? `${filteredIdeas.length} matches on this page · ${total} total ideas`
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
