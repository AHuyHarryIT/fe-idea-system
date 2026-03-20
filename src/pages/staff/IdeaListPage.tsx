import { useMemo } from 'react'
import { Funnel, Lightbulb, Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { AppButton } from '@/components/app/AppButton'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { useCategories } from '@/hooks/useCategories'
import { useIdeaFilters } from '@/hooks/useIdeaFilters'
import { useAllIdeas } from '@/hooks/useIdeas'
import {
  extractCollection,
  mapCategory,
  mapIdeaSummary,
} from '@/lib/api-mappers'

export default function IdeaListPage() {
  const { search, setSearch, status, setStatus, category, setCategory } =
    useIdeaFilters()
  const { data, isLoading, error } = useAllIdeas()
  const { data: categoryData } = useCategories()

  const ideas = useMemo(
    () =>
      extractCollection(data, ['ideas'])
        .map(mapIdeaSummary)
        .filter((idea) => idea.id),
    [data],
  )
  const categories = useMemo(
    () =>
      extractCollection(categoryData, ['categories'])
        .map(mapCategory)
        .filter((item) => item.id),
    [categoryData],
  )

  const statuses = useMemo(
    () => Array.from(new Set(ideas.map((idea) => idea.status).filter(Boolean))),
    [ideas],
  )

  const filteredIdeas = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return ideas.filter((idea) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [idea.title, idea.categoryName, idea.departmentName, idea.authorName]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch))
      const matchesStatus = !status || idea.status === status
      const matchesCategory = !category || idea.categoryName === category

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [category, ideas, search, status])

  return (
    <div className="mx-auto max-w-7xl">
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
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ideas by title, content, category..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All statuses</option>
            {statuses.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption?.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
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
              setStatus('')
              setCategory('')
            }}
          >
            <Funnel className="mr-2 h-4 w-4" />
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
          <div className="space-y-4">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
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
