import { Funnel, Lightbulb, Search } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { useIdeaFilters } from '@/hooks/useIdeaFilters'

export default function IdeaListPage() {
  const { search, setSearch, status, setStatus, category, setCategory } =
    useIdeaFilters()

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Idea Listing" />

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
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All categories</option>
          </select>
          <AppButton type="button" variant="ghost" className="min-w-36">
            <Funnel className="mr-2 h-4 w-4" />
            Apply
          </AppButton>
        </div>
      </SectionCard>

      <div className="mt-6">
        <EmptyState
          icon={Lightbulb}
          title="No idea records loaded"
          description="Try adjusting your search or filter criteria."
        />
      </div>
    </div>
  )
}
