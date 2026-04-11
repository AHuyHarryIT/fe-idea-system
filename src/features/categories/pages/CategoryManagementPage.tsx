import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ActionButton } from "@/components/app/ActionButton"
import { PageHeader } from "@/components/shared/PageHeader"
import {
  useCreateIdeaCategory,
  useDeleteIdeaCategory,
  useIdeaCategories,
  useUpdateIdeaCategory,
} from "@/hooks/useCategories"
import { extractCollection, mapCategory } from "@/utils/api-mappers"
import { appNotification } from "@/utils/notifications"
import { CategoryManagementListSection } from "@/features/categories/components/CategoryManagementListSection"
import {
  buildCategoryManagementPayload,
  DEFAULT_CATEGORY_PAGE_SIZE,
  initialCategoryManagementForm,
  validateCategoryManagementForm,
} from "@/features/categories/helpers/category-management"
import type { CategoryManagementFormState } from "@/features/categories/helpers/category-management"

export default function CategoryManagementPage() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_CATEGORY_PAGE_SIZE)
  const [searchValue, setSearchValue] = useState("")
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

  const [form, setForm] = useState<CategoryManagementFormState>(
    initialCategoryManagementForm,
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const categories = useMemo(
    () =>
      extractCollection(data, ["categories"])
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
      queryClient.invalidateQueries({ queryKey: ["ideaCategories"] }),
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] }),
    ])
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setForm(initialCategoryManagementForm)
    setEditingId(null)
  }

  const openCreateModal = () => {
    setForm(initialCategoryManagementForm)
    setEditingId(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (categoryId: string, categoryName: string) => {
    setEditingId(categoryId)
    setForm({ name: categoryName })
    setIsFormModalOpen(true)
  }

  const handleSaveCategory = async () => {
    const validationMessage = validateCategoryManagementForm(form)
    if (validationMessage) {
      appNotification.warning(validationMessage)
      return
    }

    try {
      if (editingId) {
        await updateIdeaCategory({
          id: editingId,
          request: buildCategoryManagementPayload(form),
        })
        appNotification.success("Category updated successfully.")
      } else {
        await createIdeaCategory(buildCategoryManagementPayload(form))
        appNotification.success("Category created successfully.")
        setCurrentPage(1)
      }

      await refreshCategoryQueries()
      closeFormModal()
    } catch (err) {
      appNotification.error(
        err instanceof Error
          ? err.message
          : editingId
            ? "Unable to update category."
            : "Unable to create category.",
      )
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteConfirmId) return

    try {
      await deleteIdeaCategory(deleteConfirmId)
      await refreshCategoryQueries()
      appNotification.success("Category deleted successfully.")

      if (editingId === deleteConfirmId) {
        closeFormModal()
      }
    } catch (err) {
      appNotification.error(
        err instanceof Error ? err.message : "Unable to delete category.",
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

      <CategoryManagementListSection
        categories={categories}
        totalCategories={totalCategories}
        currentPage={currentPage}
        pageSize={pageSize}
        searchValue={searchValue}
        deferredSearch={deferredSearch}
        isLoading={isLoading}
        error={error}
        form={form}
        editingId={editingId}
        deleteConfirmId={deleteConfirmId}
        isFormModalOpen={isFormModalOpen}
        isSaving={isCreating || isUpdating}
        isDeleting={isDeleting}
        onSearchChange={setSearchValue}
        onResetSearch={() => setSearchValue("")}
        onOpenCreateModal={openCreateModal}
        onEditCategory={handleEdit}
        onDeleteRequest={setDeleteConfirmId}
        onPageChange={(page, nextPageSize) => {
          if (nextPageSize != pageSize) {
            setPageSize(nextPageSize)
            setCurrentPage(1)
            return
          }

          setCurrentPage(page)
        }}
        onCloseFormModal={closeFormModal}
        onFormChange={setForm}
        onSubmit={() => void handleSaveCategory()}
        onDeleteConfirm={() => void handleDeleteCategory()}
        onDeleteCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
