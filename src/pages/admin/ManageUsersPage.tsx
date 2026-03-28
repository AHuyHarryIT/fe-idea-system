import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Users } from 'lucide-react'
import { departmentService, userService } from '@/api'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { AppButton } from '@/components/app/AppButton'
import { ActionButton } from '@/components/app/ActionButton'
import { auth } from '@/lib/auth'

interface FormState {
  email: string
  name: string
  password: string
  role: string
}

const AVAILABLE_ROLES = [
  'Administrator',
  'Staff',
  'QA Manager',
  'QA Coordinator',
]

export default function ManageUsersPage() {
  const { getUserId } = auth
  const userId = getUserId()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState>({
    email: '',
    name: '',
    password: '',
    role: 'Staff',
  })
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await userService.getUsers()
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to load users')
      }
      return response.data
    },
  })

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await departmentService.getDepartments()
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to load departments')
      }
      return response.data
    },
  })

  const users = useMemo(() => data?.users ?? [], [data])

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (newUser: typeof formState) =>
      userService.createUser({
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        role: newUser.role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setFormState({ email: '', name: '', password: '', role: 'Staff' })
      setIsCreating(false)
    },
  })

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      userService.updateUserRole(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setEditingUserId(null)
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })

  const handleCreateUser = async () => {
    if (!formState.email || !formState.name || !formState.password) {
      alert('Please fill in all required fields')
      return
    }
    await createUserMutation.mutateAsync(formState)
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    await updateRoleMutation.mutateAsync({ userId, role: newRole })
  }

  const handleUpdateName = async (userId: string, newName: string) => {
    if (newName.trim()) {
      await userService.updateUser(userId, { name: newName })
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setEditingUserId(null)
    }
  }

  const handleDeleteUser = (userId: string) => {
    setDeleteConfirm(userId)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center gap-3">
        <PageHeader
          title="Manage Users"
          description="Create, update roles, and manage user accounts across the platform."
        />
      </div>

      {/* Create user form */}
      {isCreating && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Create New User</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, email: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, name: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={formState.password}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, password: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                value={formState.role}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, role: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {AVAILABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <AppButton
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </AppButton>
            <button
              onClick={() => setIsCreating(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create button */}
      {!isCreating && (
        <div className="mb-6">
          <AppButton onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New User
          </AppButton>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">Loading users...</div>
        ) : error ? (
          <EmptyState
            icon={Users}
            title="Error loading users"
            description={
              error instanceof Error ? error.message : 'Unknown error'
            }
          />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Create a user account to get started."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          defaultValue={user.name}
                          onBlur={(e) =>
                            handleUpdateName(user.id, e.target.value)
                          }
                        />
                      ) : (
                        <>{user.name}</>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingUserId === user.id ? (
                        <select
                          value={
                            users.find((u) => u.id === user.id)?.role ||
                            user.role
                          }
                          onChange={(e) => {
                            handleUpdateRole(user.id, e.target.value)
                          }}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                        >
                          {AVAILABLE_ROLES.map((role) => (
                            <option
                              key={role}
                              value={role}
                              selected={user.role == role}
                            >
                              {role}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {editingUserId === user.id ? (
                        <select
                          className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                          value={
                            users.find((u) => u.id === user.id)
                              ?.departmentName ||
                            user.departmentName ||
                            ''
                          }
                          onChange={(e) =>
                            userService.updateUser(user.id, {
                              department: e.target.value,
                            })
                          }
                        >
                          <option value="">No department</option>
                          {departmentsData?.map((dept: any) => (
                            <option
                              key={dept.id}
                              value={dept.name}
                              selected={user.departmentName === dept.name}
                            >
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <>{user.departmentName || '—'}</>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.role != 'Administrator' && user.id !== userId && (
                        <div className="flex gap-2">
                          <ActionButton
                            action="edit"
                            onClick={() =>
                              setEditingUserId(
                                editingUserId === user.id ? null : user.id,
                              )
                            }
                            className="rounded-lg p-2 hover:bg-slate-100"
                            title="Edit role"
                          ></ActionButton>
                          <ActionButton
                            action="delete"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleteUserMutation.isPending}
                            className="rounded-lg p-2 hover:bg-red-50 disabled:opacity-50"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </ActionButton>
                        </div>
                      )}
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
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={deleteUserMutation.isPending}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteUserMutation.mutate(deleteConfirm)
            setDeleteConfirm(null)
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
