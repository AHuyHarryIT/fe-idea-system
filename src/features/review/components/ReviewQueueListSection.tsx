import { AppPagination } from '@/components/shared/AppPagination'
import { SectionCard } from '@/components/shared/SectionCard'
import type { Idea } from '@/types'
import { Empty, Input } from 'antd'
import { Search } from 'lucide-react'
import { ReviewCard } from './ReviewCard'

interface ReviewQueueListSectionProps {
  search: string
  onSearchChange: (value: string) => void
  error: Error | null
  isLoading: boolean
  reviewQueue: Idea[]
  currentPage: number
  totalIdeas: number
  pageSize: number
  onPageChange: (page: number, nextPageSize: number) => void
}

export function ReviewQueueListSection({
  search,
  onSearchChange,
  error,
  isLoading,
  reviewQueue,
  currentPage,
  totalIdeas,
  pageSize,
  onPageChange,
}: ReviewQueueListSectionProps) {
  return (
    <SectionCard>
      <label className="mb-6 block">
        <Input
          id="review-search"
          name="review-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by idea title, description, author, or category"
          allowClear
          size="large"
          prefix={<Search className="h-4 w-4 text-slate-400" />}
          className="rounded-xl"
        />
      </label>

      {error ? (
        <Empty description="Unable to load review queue" />
      ) : isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          Loading ideas for review...
        </div>
      ) : reviewQueue.length > 0 ? (
        <div className="space-y-5">
          {reviewQueue.map((idea) => {
            return <ReviewCard key={idea.id} idea={idea} />
          })}

          <AppPagination
            current={currentPage}
            total={totalIdeas}
            pageSize={pageSize}
            onChange={onPageChange}
            showTotal={(total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} ideas awaiting review`
            }
          />
        </div>
      ) : (
        <Empty description="No ideas waiting for review" />
      )}
    </SectionCard>
  )
}
