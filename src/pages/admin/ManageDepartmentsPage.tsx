import { useEffect, useState } from 'react'
import { Pagination } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import type { Department } from '@/types'
import { departmentService } from '@/api/departments'
import { ActionButton } from '@/components/app/ActionButton'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput, FormTextarea } from '@/components/forms/FormInput'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal } from '@/components/shared/Modal'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'

interface DepartmentForm {
  name: string
  description: string
}

const initialForm: DepartmentForm = {
  name: '',
  description: '',
}

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = ['10', '20', '50']

export default function ManageDepartmentsPage() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DepartmentForm>(initialForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['departments', currentPage, pageSize],
    queryFn: async () => {
      const response = await departmentService.getDepartments({
        pageNumber: currentPage,
        pageSize,
      })

      if (!response.success) {
        throw new Error(response.error ?? 'Failed to load departments')
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

  const createMutation = useMutation({
    mutationFn: async (payload: DepartmentForm) => {
      const response = await departmentService.createDepartment(payload)

      if (!response.success) {
        throw new Error(response.error ?? 'Unable to create department.')
      }

      return response.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: DepartmentForm) => {
      if (!editingId) throw new Error('No department selected')

      const response = await departmentService.updateDepartment(editingId, payload)

      if (!response.success) {
        throw new Error(response.error ?? 'Unable to update department.')
      }

      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await departmentService.deleteDepartment(id)

      if (!response.success) {
        throw new Error(response.error ?? 'Unable to delete department.')
      }
    },
  })

  const refreshDepartments = async () => {
    await queryClient.invalidateQueries({ queryKey: ['departments'] })
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setEditingId(null)
    setForm(initialForm)
  }

  const openCreateModal = () => {
    setFeedbackMessage('')
    setEditingId(null)
    setForm(initialForm)
    setIsFormModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setFeedbackMessage('Department name is required.')
      return
    }

    setFeedbackMessage('')

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim(),
        })
        setFeedbackMessage('Department updated successfully.')
      } else {
        await createMutation.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim(),
        })
        setFeedbackMessage('Department created successfully.')
        setCurrentPage(1)
      }

      await refreshDepartments()
      closeFormModal()
    } catch (mutationError) {
      setFeedbackMessage(
        mutationError instanceof Error
          ? mutationError.message
          : editingId
            ? 'Unable to update department.'
            : 'Unable to create department.',
      )
    }
  }

  const handleEdit = (department: Department) => {
    setFeedbackMessage('')
    setEditingId(department.id)
    setForm({
      name: department.name,
      description: department.description || '',
    })
    setIsFormModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return

    try {
      await deleteMutation.mutateAsync(deleteConfirm)
      await refreshDepartments()
      setFeedbackMessage('Department deleted successfully.')

      if (editingId === deleteConfirm) {
        closeFormModal()
      }
    } catch (mutationError) {
      setFeedbackMessage(
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to delete department.',
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

      {feedbackMessage ? (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {feedbackMessage}
        </div>
      ) : null}

      <SectionCard>
        {totalDepartments > 0 ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalDepartments)} of{' '}
              {totalDepartments} departments
            </p>
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        ) : null}

        {error ? (
          <EmptyState
            icon={Building2}
            title="Unable to load departments"
            description={error instanceof Error ? error.message : 'Unknown error'}
          />
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No departments found"
            description="Create the first department to organise users and idea ownership."
            action={
              <ActionButton
                type="button"
                action="add"
                label="Create first department"
                onClick={openCreateModal}
              />
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((department) => (
                    <tr
                      key={department.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-6 py-3 font-medium text-slate-900">
                        {department.name}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {department.description || '—'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <ActionButton
                            action="edit"
                            onClick={() => handleEdit(department)}
                            disabled={
                              createMutation.isPending || updateMutation.isPending
                            }
                          />
                          <ActionButton
                            action="delete"
                            onClick={() => setDeleteConfirm(department.id)}
                            disabled={deleteMutation.isPending}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <Pagination
                align="end"
                current={currentPage}
                total={totalDepartments}
                pageSize={pageSize}
                showSizeChanger
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
                  `Showing ${range[0]}-${range[1]} of ${total} departments`
                }
              />
            </div>
          </div>
        )}
      </SectionCard>

      <Modal
        isOpen={isFormModalOpen}
        title={editingId ? 'Edit department' : 'Create department'}
        description="Keep department details in one focused dialog instead of an inline editor."
        onClose={closeFormModal}
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeFormModal}>
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              form="department-form"
              variant="secondary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingId
                  ? 'Save changes'
                  : 'Create department'}
            </AppButton>
          </>
        }
      >
        <form
          id="department-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <FormField label="Department name" required>
            <FormInput
              id="department-name"
              name="department-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="e.g., Engineering, Design, Marketing"
            />
          </FormField>

          <FormField label="Description">
            <FormTextarea
              id="department-description"
              name="department-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Department description (optional)"
            />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
