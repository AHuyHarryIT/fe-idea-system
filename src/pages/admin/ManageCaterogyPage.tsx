import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Trash2 } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput } from '@/components/forms/FormInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import {
  useCreateIdeaCategory,
  useDeleteIdeaCategory,
  useIdeaCategories,
} from '@/hooks/useCategories'
import { extractCollection, mapCategory } from '@/lib/api-mappers'

// Renders the administrative interface for managing idea categories.
// Categories are used as thematic labels that classify submitted ideas.
export default function ManageCategoryPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useIdeaCategories()
  const { mutateAsync: createIdeaCategory, isPending: isCreating } =
    useCreateIdeaCategory()
  const { mutateAsync: deleteIdeaCategory, isPending: isDeleting } =
    useDeleteIdeaCategory()

  const [name, setName] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  // Normalises raw API category data into a stable UI model.
  const categories = useMemo(
    () =>
      extractCollection(data, ['categories'])
        .map(mapCategory)
        .filter((item) => item.id),
    [data],
  )

  // Refreshes category queries after create or delete operations.
  const refreshCategoryQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['ideaCategories'] }),
    ])
  }

  // Handles creation of a new idea category.
  const handleCreateCategory = async () => {
    if (!name.trim()) {
      setFeedbackMessage('Category name is required.')
      return
    }

    setFeedbackMessage('')

    try {
      await createIdeaCategory({
        name: name.trim(),
      })

      setName('')
      await refreshCategoryQueries()
      setFeedbackMessage('Category created successfully.')
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : 'Unable to create category.',
      )
    }
  }

  // Handles deletion of an existing idea category.
  const handleDeleteCategory = async (id: string) => {
    setFeedbackMessage('')

    try {
      await deleteIdeaCategory(id)
      await refreshCategoryQueries()
      setFeedbackMessage('Category deleted successfully.')
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : 'Unable to delete category.',
      )
    }
  }

  return (
    <div className="w-full px-6 py-6 lg:px-8">
      <PageHeader
        title="Manage Idea Categories"
        description="Create, review, and remove thematic categories used to classify submitted ideas."
      />

      {feedbackMessage ? (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {feedbackMessage}
        </div>
      ) : null}

      <div className="space-y-6">
        <SectionCard
          title="Create category"
          description="Add a new thematic category for idea classification."
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <FormField label="Category name">
              <FormInput
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter category name"
              />
            </FormField>

            <AppButton
              onClick={handleCreateCategory}
              disabled={isCreating}
              className="h-12 w-5 min-w-44"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? 'Creating...' : 'Add category'}
            </AppButton>
          </div>
        </SectionCard>

        <SectionCard
          title="Category list"
          description="All idea categories currently available in the system."
        >
          {error ? (
            <EmptyState
              icon={Tag}
              title="Unable to load categories"
              description={error.message}
            />
          ) : isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Loading categories...
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-base font-medium text-slate-900">
                      {category.name}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Category ID: {category.id}
                    </p>
                  </div>

                  <AppButton
                    variant="ghost"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={isDeleting}
                    className="self-start"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </AppButton>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Tag}
              title="No categories available"
              description="Create a category to start organising ideas by topic."
            />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
