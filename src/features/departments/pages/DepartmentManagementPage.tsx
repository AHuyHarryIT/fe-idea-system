import { useDeferredValue, useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Department } from "@/types"
import { departmentService } from "@/api/departments"
import { ActionButton } from "@/components/app/ActionButton"
import { PageHeader } from "@/components/shared/PageHeader"
import { appNotification } from "@/utils/notifications"
import { DepartmentManagementListSection } from "@/features/departments/components/DepartmentManagementListSection"
import {
  buildDepartmentManagementPayload,
  DEFAULT_DEPARTMENT_PAGE_SIZE,
  initialDepartmentManagementForm,
  validateDepartmentManagementForm,
} from "@/features/departments/helpers/department-management"
import type { DepartmentManagementFormState } from "@/features/departments/helpers/department-management"

export default function DepartmentManagementPage() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_DEPARTMENT_PAGE_SIZE)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DepartmentManagementFormState>(
    initialDepartmentManagementForm,
  )
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const deferredSearch = useDeferredValue(searchValue.trim())

  const { data, isLoading, error } = useQuery({
    queryKey: ["departments", currentPage, pageSize, deferredSearch],
    queryFn: async () => {
      const response = await departmentService.getDepartments({
        pageNumber: currentPage,
        pageSize,
        searchTerm: deferredSearch || undefined,
      })

      if (!response.success) {
        throw new Error(response.error ?? "Failed to load departments")
      }

      return response.data
    },
  })
  const departments = data?.departments ?? []
  const totalDepartments = data?.pagination?.totalCount ?? departments.length
  const totalPages = Math.max(1, Math.ceil(totalDepartments / pageSize))

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, isLoading, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch])

  const createMutation = useMutation({
    mutationFn: async (payload: DepartmentManagementFormState) => {
      const response = await departmentService.createDepartment(
        buildDepartmentManagementPayload(payload),
      )

      if (!response.success) {
        throw new Error(response.error ?? "Unable to create department.")
      }

      return response.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: DepartmentManagementFormState) => {
      if (!editingId) throw new Error("No department selected")

      const response = await departmentService.updateDepartment(
        editingId,
        buildDepartmentManagementPayload(payload),
      )

      if (!response.success) {
        throw new Error(response.error ?? "Unable to update department.")
      }

      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await departmentService.deleteDepartment(id)

      if (!response.success) {
        throw new Error(response.error ?? "Unable to delete department.")
      }
    },
  })

  const refreshDepartments = async () => {
    await queryClient.invalidateQueries({ queryKey: ["departments"] })
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setEditingId(null)
    setForm(initialDepartmentManagementForm)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(initialDepartmentManagementForm)
    setIsFormModalOpen(true)
  }

  const handleSubmit = async () => {
    const validationMessage = validateDepartmentManagementForm(form)
    if (validationMessage) {
      appNotification.warning(validationMessage)
      return
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync(form)
        appNotification.success("Department updated successfully.")
      } else {
        await createMutation.mutateAsync(form)
        appNotification.success("Department created successfully.")
        setCurrentPage(1)
      }

      await refreshDepartments()
      closeFormModal()
    } catch (mutationError) {
      appNotification.error(
        mutationError instanceof Error
          ? mutationError.message
          : editingId
            ? "Unable to update department."
            : "Unable to create department.",
      )
    }
  }

  const handleEdit = (department: Department) => {
    setEditingId(department.id)
    setForm({
      name: department.name,
      description: department.description || "",
    })
    setIsFormModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return

    try {
      await deleteMutation.mutateAsync(deleteConfirm)
      await refreshDepartments()
      appNotification.success("Department deleted successfully.")

      if (editingId === deleteConfirm) {
        closeFormModal()
      }
    } catch (mutationError) {
      appNotification.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to delete department.",
      )
    } finally {
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Manage Departments"
        description="Create, update, and manage departments across the platform."
        actions={
          <ActionButton
            type="button"
            action="add"
            label="Add department"
            onClick={openCreateModal}
          />
        }
      />

      <DepartmentManagementListSection
        departments={departments}
        totalDepartments={totalDepartments}
        currentPage={currentPage}
        pageSize={pageSize}
        searchValue={searchValue}
        deferredSearch={deferredSearch}
        isLoading={isLoading}
        error={error}
        form={form}
        editingId={editingId}
        deleteConfirm={deleteConfirm}
        isFormModalOpen={isFormModalOpen}
        isSaving={createMutation.isPending || updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
        onSearchChange={setSearchValue}
        onResetSearch={() => setSearchValue("")}
        onOpenCreateModal={openCreateModal}
        onEditDepartment={handleEdit}
        onDeleteRequest={setDeleteConfirm}
        onPageChange={(page, nextPageSize) => {
          if (nextPageSize !== pageSize) {
            setPageSize(nextPageSize)
            setCurrentPage(1)
            return
          }

          setCurrentPage(page)
        }}
        onCloseFormModal={closeFormModal}
        onFormChange={setForm}
        onSubmit={() => void handleSubmit()}
        onDeleteConfirm={() => void handleDeleteConfirm()}
        onDeleteCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
