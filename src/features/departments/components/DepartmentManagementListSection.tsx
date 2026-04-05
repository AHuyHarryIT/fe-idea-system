import { Input } from 'antd'
import { Building2, Search } from 'lucide-react'
import type { Department } from '@/types'
import { ActionButton } from '@/components/app/ActionButton'
import { AppButton } from '@/components/app/AppButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormField } from '@/components/forms/FormField'
import { FormInput, FormTextarea } from '@/components/forms/FormInput'
import { Modal } from '@/components/shared/Modal'
import { SectionCard } from '@/components/shared/SectionCard'
import {
  DEPARTMENT_PAGE_SIZE_OPTIONS,
  type DepartmentManagementFormState,
} from '@/features/departments/helpers/department-management'

interface DepartmentManagementListSectionProps {
  departments: Department[]
  totalDepartments: number
  currentPage: number
  pageSize: number
  searchValue: string
  deferredSearch: string
  isLoading: boolean
  error: Error | null
  form: DepartmentManagementFormState
  editingId: string | null
  deleteConfirm: string | null
  isFormModalOpen: boolean
  isSaving: boolean
  isDeleting: boolean
  onSearchChange: (value: string) => void
  onResetSearch: () => void
  onOpenCreateModal: () => void
  onEditDepartment: (department: Department) => void
  onDeleteRequest: (departmentId: string) => void
  onPageChange: (page: number, nextPageSize: number) => void
  onCloseFormModal: () => void
  onFormChange: (form: DepartmentManagementFormState) => void
  onSubmit: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export function DepartmentManagementListSection({
  departments,
  totalDepartments,
  currentPage,
  pageSize,
  searchValue,
  deferredSearch,
  isLoading,
  error,
  form,
  editingId,
  deleteConfirm,
  isFormModalOpen,
  isSaving,
  isDeleting,
  onSearchChange,
  onResetSearch,
  onOpenCreateModal,
  onEditDepartment,
  onDeleteRequest,
  onPageChange,
  onCloseFormModal,
  onFormChange,
  onSubmit,
  onDeleteConfirm,
  onDeleteCancel,
}: DepartmentManagementListSectionProps) {
  return (
    <>
      <SectionCard>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <label className="block flex-1">
            <Input
              id="department-search"
              name="department-search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by department name or description"
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
            title={
              deferredSearch ? 'No departments match this search' : 'No departments found'
            }
            description={
              deferredSearch
                ? 'Try another keyword or clear the search.'
                : 'Create the first department to organise users and idea ownership.'
            }
            action={
              <ActionButton
                type="button"
                action="add"
                label="Create first department"
                onClick={onOpenCreateModal}
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
                            onClick={() => onEditDepartment(department)}
                            disabled={isSaving}
                          />
                          <ActionButton
                            action="delete"
                            onClick={() => onDeleteRequest(department.id)}
                            disabled={isDeleting}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AppPagination
              current={currentPage}
              total={totalDepartments}
              pageSize={pageSize}
              pageSizeOptions={DEPARTMENT_PAGE_SIZE_OPTIONS}
              onChange={onPageChange}
              showTotal={(total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} departments`
              }
            />
          </div>
        )}
      </SectionCard>

      <Modal
        isOpen={isFormModalOpen}
        title={editingId ? 'Edit department' : 'Create department'}
        description="Keep department details in one focused dialog instead of an inline editor."
        onClose={onCloseFormModal}
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={onCloseFormModal}>
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              form="department-form"
              variant="secondary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Create department'}
            </AppButton>
          </>
        }
      >
        <form
          id="department-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <FormField label="Department name" required>
            <FormInput
              id="department-name"
              name="department-name"
              value={form.name}
              onChange={(event) => onFormChange({ ...form, name: event.target.value })}
              placeholder="e.g., Engineering, Design, Marketing"
            />
          </FormField>

          <FormField label="Description">
            <FormTextarea
              id="department-description"
              name="department-description"
              value={form.description}
              onChange={(event) =>
                onFormChange({ ...form, description: event.target.value })
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
        isLoading={isDeleting}
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />
    </>
  )
}
