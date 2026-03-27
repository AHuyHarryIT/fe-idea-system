import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Department } from '@/api/departments'
import { departmentService } from '@/api/departments'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput, FormTextarea } from '@/components/forms/FormInput'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { ActionButton } from '@/components/app/ActionButton'

interface DepartmentForm {
  name: string
  description: string
}

const initialForm: DepartmentForm = {
  name: '',
  description: '',
}

export default function ManageDepartmentsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DepartmentForm>(initialForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await departmentService.getDepartments()
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to load departments')
      }
      return response.data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) =>
      departmentService.createDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setForm(initialForm)
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: typeof form) => {
      if (!editingId) throw new Error('No department selected')
      return departmentService.updateDepartment(editingId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setForm(initialForm)
      setEditingId(null)
      setShowForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('Department name is required')
      return
    }

    if (editingId) {
      await updateMutation.mutateAsync(form)
    } else {
      await createMutation.mutateAsync(form)
    }
  }

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id)
    setForm({
      name: dept.name,
      description: dept.description || '',
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm(id)
  }

  const handleCancel = () => {
    setForm(initialForm)
    setEditingId(null)
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Manage Departments"
          description="Create, update, and manage departments across the platform."
        />
        <p className="text-slate-500">Loading departments...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Manage Departments"
        description="Create, update, and manage departments across the platform."
      />

      <div className="space-y-6">
        {showForm && (
          <SectionCard
            title={editingId ? 'Edit Department' : 'Create New Department'}
          >
            <div className="space-y-4">
              <FormField label="Department name" required>
                <FormInput
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Engineering, Design, Marketing"
                />
              </FormField>
              <FormField label="Description">
                <FormTextarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Department description (optional)"
                />
              </FormField>
              <div className="flex gap-3">
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={handleSubmit}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingId
                      ? 'Update Department'
                      : 'Create Department'}
                </AppButton>
                <AppButton type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </AppButton>
              </div>
            </div>
          </SectionCard>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Departments ({departments.length})
          </h2>
          {!showForm && (
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => setShowForm(true)}
            >
              + Add New Department
            </AppButton>
          )}
        </div>

        {departments.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No departments found.</p>
            {!showForm && (
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => setShowForm(true)}
                className="mt-4"
              >
                + Create First Department
              </AppButton>
            )}
          </div>
        ) : (
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
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {dept.description || '—'}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <ActionButton
                          action="edit"
                          onClick={() => handleEdit(dept)}
                          disabled={editingId === dept.id}
                        />

                        <ActionButton
                          action="delete"
                          onClick={() => handleDelete(dept.id)}
                          disabled={deleteMutation.isPending}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteMutation.mutate(deleteConfirm)
            setDeleteConfirm(null)
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
