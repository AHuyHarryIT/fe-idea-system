import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Input } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Tag } from 'lucide-react'
import { ActionButton } from '@/components/app/ActionButton'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { FormField } from '@/components/forms/FormField'
import { FormInput } from '@/components/forms/FormInput'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal } from '@/components/shared/Modal'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import {
  useCreateIdeaCategory,
  useDeleteIdeaCategory,
  useIdeaCategories,
  useUpdateIdeaCategory,
} from '@/hooks/useCategories'
import { extractCollection, mapCategory } from '@/utils/api-mappers'
import { appNotification } from '@/utils/notifications'

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = ['10', '20', '50']

export default function ManageCategoryPage() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [searchValue, setSearchValue] = useState('')
  const deferredSearch = useDeferredValue(searchValue.trim())
  const { data, isLoading, error } = useIdeaCategories({
    pageNumber: currentPage,
    pageSize,
    searchTerm: deferredSearch || undefined,
  })
  const { mutateAsync: createIdeaCategory, isPending: isCreating } =
    useCreateIdeaCategory()
  const { mutateAsync: updateIdeaCategory, isPending: isUpdating } =
    useUpdateIdeaCategory()
  const { mutateAsync: deleteIdeaCategory, isPending: isDeleting } =
    useDeleteIdeaCategory()

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const categories = useMemo(
    () =>
      extractCollection(data, ['categories'])
        .map(mapCategory)
        .filter((item) => item.id),
    [data],
  )
  const totalCategories = data?.pagination?.totalCount ?? categories.length
  const totalPages = Math.max(1, Math.ceil(totalCategories / pageSize))

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, isLoading, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch])

  const refreshCategoryQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['ideaCategories'] }),
      queryClient.invalidateQueries({ queryKey: ['adminOverview'] }),
    ])
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setName('')
    setEditingId(null)
  }

  const openCreateModal = () => {
    setName('')
    setEditingId(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (categoryId: string, categoryName: string) => {
    setEditingId(categoryId)
    setName(categoryName)
    setIsFormModalOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!name.trim()) {
      appNotification.warning('Category name is required.')
      return
    }

    try {
      if (editingId) {
        await updateIdeaCategory({ id: editingId, request: { name: name.trim() } })
        appNotification.success('Category updated successfully.')
      } else {
        await createIdeaCategory({ name: name.trim() })
        appNotification.success('Category created successfully.')
        setCurrentPage(1)
      }

      await refreshCategoryQueries()
      closeFormModal()
    } catch (err) {
      appNotification.error(
        err instanceof Error
          ? err.message
          : editingId
            ? 'Unable to update category.'
            : 'Unable to create category.',
      )
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteConfirmId) return

    try {
      await deleteIdeaCategory(deleteConfirmId)
      await refreshCategoryQueries()
      appNotification.success('Category deleted successfully.')

      if (editingId === deleteConfirmId) {
        closeFormModal()
      }
    } catch (err) {
      appNotification.error(
        err instanceof Error ? err.message : 'Unable to delete category.',
      )
    } finally {
      setDeleteConfirmId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Manage Idea Categories"
        description="Create, review, update, and remove thematic categories used to classify submitted ideas."
        actions={
          <ActionButton
            type="button"
            action="add"
            label="Add category"
            onClick={openCreateModal}
          />
        }
      />

      <SectionCard>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <label className="block flex-1">
            <Input
              id="category-search"
              name="category-search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by category name or id"
              allowClear
              size="large"
              prefix={<Search className="h-4 w-4 text-slate-400" />}
              className="rounded-xl"
            />
          </label>
          <AppButton
            type="button"
            variant="ghost"
            className="sm:min-w-36"
            onClick={() => setSearchValue('')}
          >
            Reset
          </AppButton>
        </div>

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
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    action="edit"
                    onClick={() => handleEdit(category.id, category.name)}
                    disabled={isUpdating}
                  />
                  <ActionButton
                    action="delete"
                    onClick={() => setDeleteConfirmId(category.id)}
                    disabled={isDeleting}
                  />
                </div>
              </div>
            ))}

            <AppPagination
              current={currentPage}
              total={totalCategories}
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
                `Showing ${range[0]}-${range[1]} of ${total} categories`
              }
            />
          </div>
        ) : (
          <EmptyState
            icon={Tag}
            title={
              deferredSearch
                ? 'No categories match this search'
                : 'No categories available'
            }
            description={
              deferredSearch
                ? 'Try another keyword or clear the search.'
                : 'Create a category to start organising ideas by topic.'
            }
            action={
              <ActionButton
                type="button"
                action="add"
                label="Create first category"
                onClick={openCreateModal}
              />
            }
          />
        )}
      </SectionCard>

      <Modal
        isOpen={isFormModalOpen}
        title={editingId ? 'Edit category' : 'Create category'}
        description="Add a new thematic category for idea classification or rename an existing one."
        onClose={closeFormModal}
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeFormModal}>
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              form="category-form"
              disabled={isCreating || isUpdating}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating || isUpdating
                ? 'Saving...'
                : editingId
                  ? 'Save changes'
                  : 'Create category'}
            </AppButton>
          </>
        }
      >
        <form
          id="category-form"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSaveCategory()
          }}
        >
          <FormField label="Category name" required>
            <FormInput
              id="category-name"
              name="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter category name"
            />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
