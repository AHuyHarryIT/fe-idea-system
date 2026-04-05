import { Input } from 'antd'
import { Plus, Search, Tag } from 'lucide-react'
import type { IdeaCategory } from '@/types'
import { ActionButton } from '@/components/app/ActionButton'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormField } from '@/components/forms/FormField'
import { FormInput } from '@/components/forms/FormInput'
import { Modal } from '@/components/shared/Modal'
import { SectionCard } from '@/components/shared/SectionCard'
import {
  CATEGORY_PAGE_SIZE_OPTIONS
  
} from '@/features/categories/helpers/category-management'
import type {CategoryManagementFormState} from '@/features/categories/helpers/category-management';

interface CategoryManagementListSectionProps {
  categories: IdeaCategory[]
  totalCategories: number
  currentPage: number
  pageSize: number
  searchValue: string
  deferredSearch: string
  isLoading: boolean
  error: Error | null
  form: CategoryManagementFormState
  editingId: string | null
  deleteConfirmId: string | null
  isFormModalOpen: boolean
  isSaving: boolean
  isDeleting: boolean
  onSearchChange: (value: string) => void
  onResetSearch: () => void
  onOpenCreateModal: () => void
  onEditCategory: (categoryId: string, categoryName: string) => void
  onDeleteRequest: (categoryId: string) => void
  onPageChange: (page: number, nextPageSize: number) => void
  onCloseFormModal: () => void
  onFormChange: (form: CategoryManagementFormState) => void
  onSubmit: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export function CategoryManagementListSection({
  categories,
  totalCategories,
  currentPage,
  pageSize,
  searchValue,
  deferredSearch,
  isLoading,
  error,
  form,
  editingId,
  deleteConfirmId,
  isFormModalOpen,
  isSaving,
  isDeleting,
  onSearchChange,
  onResetSearch,
  onOpenCreateModal,
  onEditCategory,
  onDeleteRequest,
  onPageChange,
  onCloseFormModal,
  onFormChange,
  onSubmit,
  onDeleteConfirm,
  onDeleteCancel,
}: CategoryManagementListSectionProps) {
  return (
    <>
      <SectionCard>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <label className="block flex-1">
            <Input
              id="category-search"
              name="category-search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
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
            onClick={onResetSearch}
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
                  <p className="text-base font-medium text-slate-900">{category.name}</p>
                  <p className="mt-2 text-xs text-slate-400">Category ID: {category.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    action="edit"
                    onClick={() => onEditCategory(category.id, category.name)}
                    disabled={isSaving}
                  />
                  <ActionButton
                    action="delete"
                    onClick={() => onDeleteRequest(category.id)}
                    disabled={isDeleting}
                  />
                </div>
              </div>
            ))}

            <AppPagination
              current={currentPage}
              total={totalCategories}
              pageSize={pageSize}
              pageSizeOptions={CATEGORY_PAGE_SIZE_OPTIONS}
              onChange={onPageChange}
              showTotal={(total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} categories`
              }
            />
          </div>
        ) : (
          <EmptyState
            icon={Tag}
            title={
              deferredSearch ? 'No categories match this search' : 'No categories available'
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
                onClick={onOpenCreateModal}
              />
            }
          />
        )}
      </SectionCard>

      <Modal
        isOpen={isFormModalOpen}
        title={editingId ? 'Edit category' : 'Create category'}
        description="Add a new thematic category for idea classification or rename an existing one."
        onClose={onCloseFormModal}
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={onCloseFormModal}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="category-form" disabled={isSaving}>
              <Plus className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Create category'}
            </AppButton>
          </>
        }
      >
        <form
          id="category-form"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <FormField label="Category name" required>
            <FormInput
              id="category-name"
              name="category-name"
              value={form.name}
              onChange={(event) => onFormChange({ name: event.target.value })}
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
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />
    </>
  )
}
