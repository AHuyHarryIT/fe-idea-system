import type { UIEvent } from 'react'
import { Input, Select } from 'antd'
import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import type { IdeaCategory, Submission } from '@/types'
import type { SelectOptionItem } from '@/features/ideas/helpers/idea-catalogue'

interface IdeaCatalogueFiltersSectionProps {
  listDescription: string
  search: string
  submissionId: string
  categoryId: string
  submissionOptions: SelectOptionItem[]
  categoryOptions: SelectOptionItem[]
  isFetchingSubmissions: boolean
  isFetchingCategories: boolean
  totalIdeas: number
  selectedSubmission?: Submission
  selectedCategory?: IdeaCategory
  onSearchChange: (value: string) => void
  onSubmissionOpenChange: (open: boolean) => void
  onCategoryOpenChange: (open: boolean) => void
  onSubmissionPopupScroll: (event: UIEvent<HTMLDivElement>) => void
  onCategoryPopupScroll: (event: UIEvent<HTMLDivElement>) => void
  onSubmissionChange: (value: string) => void
  onSubmissionClear: () => void
  onCategoryChange: (value: string) => void
  onCategoryClear: () => void
  onReset: () => void
}

export function IdeaCatalogueFiltersSection({
  listDescription,
  search,
  submissionId,
  categoryId,
  submissionOptions,
  categoryOptions,
  isFetchingSubmissions,
  isFetchingCategories,
  totalIdeas,
  selectedSubmission,
  selectedCategory,
  onSearchChange,
  onSubmissionOpenChange,
  onCategoryOpenChange,
  onSubmissionPopupScroll,
  onCategoryPopupScroll,
  onSubmissionChange,
  onSubmissionClear,
  onCategoryChange,
  onCategoryClear,
  onReset,
}: IdeaCatalogueFiltersSectionProps) {
  return (
    <>
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
              onChange={(event) => onSearchChange(event.target.value)}
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
              onOpenChange={onSubmissionOpenChange}
              onPopupScroll={onSubmissionPopupScroll}
              onChange={onSubmissionChange}
              onClear={onSubmissionClear}
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
              onOpenChange={onCategoryOpenChange}
              onPopupScroll={onCategoryPopupScroll}
              onChange={onCategoryChange}
              onClear={onCategoryClear}
              className="w-full"
            />
          </label>
          <AppButton type="button" variant="ghost" className="min-w-36" onClick={onReset}>
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
    </>
  )
}
