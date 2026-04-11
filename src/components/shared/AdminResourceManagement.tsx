import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { appNotification } from "@/utils/notifications"
import type { JsonObject, JsonValue } from "@/types"

/**
 * Generic configuration for admin resource management
 */
export interface AdminResourceConfig<
  TItem extends JsonObject,
  TCreatePayload,
  TUpdatePayload = TCreatePayload,
  TListResponse extends JsonObject = JsonObject,
  TListParams extends object = object,
> {
  /** Resource name for query cache keys (e.g., "categories", "users") */
  resourceName: string
  /** Display title for the page header */
  pageTitle: string
  /** Display description for the page header */
  pageDescription: string
  /** Default page size for pagination */
  defaultPageSize: number
  /** Extract items array from list response */
  extractItems: (
    response: TListResponse,
  ) => Array<TItem & { id: string }>
  /** Extract total count from list response */
  extractTotalCount: (response: TListResponse) => number
  /** API hook: fetch list of items */
  useGetList: (
    params?: TListParams,
    options?: { enabled?: boolean },
  ) => {
    data?: TListResponse
    isLoading: boolean
    error?: Error | null
  }
  /** API hook: create item */
  useCreate: () => {
    mutateAsync: (payload: TCreatePayload) => Promise<TItem>
    isPending: boolean
  }
  /** API hook: update item */
  useUpdate: () => {
    mutateAsync: (payload: { id: string; data: TUpdatePayload }) => Promise<TItem>
    isPending: boolean
  }
  /** API hook: delete item */
  useDelete: () => {
    mutateAsync: (id: string) => Promise<void>
    isPending: boolean
  }
  /** List params builder */
  buildListParams?: (
    pageNumber: number,
    pageSize: number,
    searchTerm?: string,
  ) => TListParams
  /** Query keys to invalidate on mutation success */
  queryKeysToInvalidate?: readonly (readonly (string | number)[])[]
}

/**
 * Form state management interface
 */
export interface AdminResourceFormState {
  [key: string]: JsonValue
}

/**
 * Props for AdminResourceManagement component
 */
export interface AdminResourceManagementProps<
  TItem extends JsonObject,
  TCreatePayload,
  TUpdatePayload = TCreatePayload,
  TListResponse extends JsonObject = JsonObject,
  TListParams extends object = object,
  TForm extends AdminResourceFormState = AdminResourceFormState,
> {
  config: AdminResourceConfig<
    TItem,
    TCreatePayload,
    TUpdatePayload,
    TListResponse,
    TListParams
  >
  /** Children render function for custom list UI */
  children: (state: AdminResourceManagementState<TForm, TItem>) => React.ReactNode
  /** Initial form state */
  initialFormState: TForm
  /** Form validator function */
  onValidateForm: (form: TForm) => string | null
  /** Payload builder for create operation */
  onBuildCreatePayload: (form: TForm) => TCreatePayload
  /** Payload builder for update operation */
  onBuildUpdatePayload?: (form: TForm) => TUpdatePayload
}

/**
 * State exposed to children render function
 */
export interface AdminResourceManagementState<
  TForm,
  TItem extends JsonObject = JsonObject,
> {
  // Data
  items: TItem[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  isLoading: boolean
  error: Error | null | undefined

  // UI State
  searchValue: string
  deferredSearch: string
  isFormOpen: boolean
  editingId: string | null
  deleteConfirmId: string | null
  isSaving: boolean
  isDeleting: boolean

  // Form
  form: TForm

  // Handlers
  onSearchChange: (value: string) => void
  onResetSearch: () => void
  onPageChange: (page: number, pageSize?: number) => void
  onOpenCreateModal: () => void
  onCloseFormModal: () => void
  onFormChange: (form: TForm) => void
  onEditItem: (id: string, item: TItem) => void
  onDeleteRequest: (id: string) => void
  onDeleteCancel: () => void
  onSave: () => Promise<void>
  onDeleteConfirm: () => Promise<void>
}

/**
 * Reusable admin resource management component
 * Handles pagination, search, create, update, delete operations
 *
 * Usage:
 * ```
 * <AdminResourceManagement
 *   config={categoryConfig}
 *   initialFormState={initialForm}
 *   onValidateForm={validateForm}
 *   onBuildCreatePayload={buildPayload}
 * >
 *   {(state) => <CategoryManagementUI {...state} />}
 * </AdminResourceManagement>
 * ```
 */
export function AdminResourceManagement<
  TItem extends JsonObject,
  TCreatePayload,
  TUpdatePayload = TCreatePayload,
  TListResponse extends JsonObject = JsonObject,
  TListParams extends object = object,
  TForm extends AdminResourceFormState = AdminResourceFormState,
>(
  props: AdminResourceManagementProps<
    TItem,
    TCreatePayload,
    TUpdatePayload,
    TListResponse,
    TListParams,
    TForm
  >,
) {
  const queryClient = useQueryClient()
  const {
    config,
    children,
    initialFormState,
    onValidateForm,
    onBuildCreatePayload,
    onBuildUpdatePayload,
  } = props

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(config.defaultPageSize)
  const [searchValue, setSearchValue] = useState("")
  const deferredSearch = useDeferredValue(searchValue.trim())

  // Form State
  const [form, setForm] = useState<TForm>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // API Hooks
  const buildParams =
    config.buildListParams ||
    ((pageNumber: number, pageSize_: number, searchTerm?: string) => ({
      pageNumber,
      pageSize: pageSize_,
      ...(searchTerm && { searchTerm }),
    } as TListParams))

  const { data, isLoading, error } = config.useGetList(
    buildParams(currentPage, pageSize, deferredSearch),
  )

  const { mutateAsync: createItem, isPending: isCreating } = config.useCreate()
  const { mutateAsync: updateItem, isPending: isUpdating } = config.useUpdate()
  const { mutateAsync: deleteItem, isPending: isDeleting } = config.useDelete()

  // Data Extraction
  const items = useMemo(() => {
    if (!data) return []
    return config.extractItems(data)
  }, [data, config])

  const totalItems = data ? config.extractTotalCount(data) : items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Sync page when total pages changes
  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, isLoading, totalPages])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch])

  // Invalidate queries on mutation
  const invalidateQueries = async () => {
    const keysToInvalidate = config.queryKeysToInvalidate || [
      [config.resourceName],
    ]
    await Promise.all(
      keysToInvalidate.map((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      ),
    )
  }

  // Form Modal Handlers
  const closeFormModal = () => {
    setIsFormOpen(false)
    setForm(initialFormState)
    setEditingId(null)
  }

  const openCreateModal = () => {
    setForm(initialFormState)
    setEditingId(null)
    setIsFormOpen(true)
  }

  const handleEditItem = (id: string, item: TItem) => {
    setEditingId(id)
    // Both TItem (JsonObject) and TForm (AdminResourceFormState) extend { [key: string]: JsonValue }
    setForm((item as Record<string, JsonValue>) as TForm)
    setIsFormOpen(true)
  }

  // CRUD Handlers
  const handleSave = async () => {
    const validationMessage = onValidateForm(form)
    if (validationMessage) {
      appNotification.warning(validationMessage)
      return
    }

    try {
      if (editingId) {
        const updatePayload =
          onBuildUpdatePayload?.(form) || onBuildCreatePayload(form)
        await updateItem({
          id: editingId,
          data: updatePayload as TUpdatePayload,
        })
        appNotification.success(
          `${config.resourceName} updated successfully.`,
        )
      } else {
        await createItem(onBuildCreatePayload(form))
        appNotification.success(
          `${config.resourceName} created successfully.`,
        )
        setCurrentPage(1)
      }

      await invalidateQueries()
      closeFormModal()
    } catch (err) {
      appNotification.error(
        err instanceof Error
          ? err.message
          : editingId
            ? `Unable to update ${config.resourceName}.`
            : `Unable to create ${config.resourceName}.`,
      )
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return

    try {
      await deleteItem(deleteConfirmId)
      await invalidateQueries()
      appNotification.success(
        `${config.resourceName} deleted successfully.`,
      )

      if (editingId === deleteConfirmId) {
        closeFormModal()
      }
    } catch (err) {
      appNotification.error(
        err instanceof Error
          ? err.message
          : `Unable to delete ${config.resourceName}.`,
      )
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const state: AdminResourceManagementState<TForm, TItem> = {
    // Data
    items,
    totalItems,
    currentPage,
    pageSize,
    totalPages,
    isLoading,
    error,

    // UI State
    searchValue,
    deferredSearch,
    isFormOpen,
    editingId,
    deleteConfirmId,
    isSaving: isCreating || isUpdating,
    isDeleting,

    // Form
    form,

    // Handlers
    onSearchChange: setSearchValue,
    onResetSearch: () => setSearchValue(""),
    onPageChange: (page: number, nextPageSize?: number) => {
      if (nextPageSize && nextPageSize !== pageSize) {
        setPageSize(nextPageSize)
        setCurrentPage(1)
        return
      }
      setCurrentPage(page)
    },
    onOpenCreateModal: openCreateModal,
    onCloseFormModal: closeFormModal,
    onFormChange: setForm,
    onEditItem: handleEditItem,
    onDeleteRequest: setDeleteConfirmId,
    onDeleteCancel: () => setDeleteConfirmId(null),
    onSave: handleSave,
    onDeleteConfirm: handleDelete,
  }

  return <>{children(state)}</>
}
