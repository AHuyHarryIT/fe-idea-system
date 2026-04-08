import { Lightbulb } from 'lucide-react'
import type { Idea } from '@/types'
import { IdeaCard } from '@/features/ideas/components/IdeaCard'
import { AppPagination } from '@/components/shared/AppPagination'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  IDEA_CATALOGUE_PAGE_SIZE_OPTIONS,
} from '@/features/ideas/helpers/idea-catalogue'

interface IdeaCatalogueResultsSectionProps {
  error: Error | null
  isLoading: boolean
  ideas: Idea[]
  totalIdeas: number
  currentPage: number
  pageSize: number
  hasCategoryFilter: boolean
  hasSubmissionFilter: boolean
  deferredSearch: string
  onPageChange: (page: number, nextPageSize: number) => void
}

export function IdeaCatalogueResultsSection({
  error,
  isLoading,
  ideas,
  totalIdeas,
  currentPage,
  pageSize,
  hasCategoryFilter,
  hasSubmissionFilter,
  deferredSearch,
  onPageChange,
}: IdeaCatalogueResultsSectionProps) {
  return (
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
            pageSizeOptions={IDEA_CATALOGUE_PAGE_SIZE_OPTIONS}
            onChange={onPageChange}
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
            title="No ideas found"
            description={
              deferredSearch
                ? 'Try another keyword or clear the search.'
                : hasCategoryFilter || hasSubmissionFilter
                ? 'Try another category, submission, or clear the filters.'
                : 'No ideas have been created yet.'
            }
          />

          {totalIdeas > 0 ? (
            <AppPagination
              current={currentPage}
              total={totalIdeas}
              pageSize={pageSize}
              pageSizeOptions={IDEA_CATALOGUE_PAGE_SIZE_OPTIONS}
              onChange={onPageChange}
              showTotal={(total) =>
                hasCategoryFilter || hasSubmissionFilter
                  ? `${total} total matching ideas`
                  : `${total} total ideas`
              }
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
