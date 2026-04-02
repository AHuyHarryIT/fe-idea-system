import { useEffect, useMemo, useState } from 'react'
import { Lightbulb, Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { AppButton } from '@/components/app/AppButton'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'

import { useIdeaFilters } from '@/hooks/useIdeaFilters'
import { useAllIdeas } from '@/hooks/useIdeas'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'
import { useIdeaCategories } from '@/hooks/useCategories'

const PAGE_SIZE = 5

export default function IdeaListPage() {
  const { search, setSearch, category, setCategory } = useIdeaFilters()
  const { data, isLoading, error } = useAllIdeas()
  const { data: categoryData } = useIdeaCategories()
  const [currentPage, setCurrentPage] = useState(1)

  const ideas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(data)
    return Array.isArray(ideaList) ? ideaList.filter((idea) => idea.id) : []
  }, [data])

  const categories = useMemo(() => {
    const categoryList = categoryData ?? []
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

  const totalPages = Math.max(1, Math.ceil(filteredIdeas.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [search, category])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pagedIdeas = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredIdeas.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, filteredIdeas])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Idea Listing"
        description={`${filteredIdeas.length} ideas matched from the live catalogue.`}
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
        ) : pagedIdeas.length > 0 ? (
          <>
            <div className="space-y-4">
              {pagedIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-600">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredIdeas.length)} of{' '}
                {filteredIdeas.length} ideas
              </p>
              <div className="flex items-center gap-2">
                <AppButton
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </AppButton>
                <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <AppButton
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </AppButton>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Lightbulb}
            title="No idea records loaded"
            description="Try adjusting your search or filter criteria."
          />
        )}
      </div>
    </div>
  )
}
