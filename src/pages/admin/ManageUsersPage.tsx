import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Input } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheck,
  Building2,
  Filter,
  Mail,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { departmentService, userService } from '@/api'
import type { UpdateUserRequest, User } from '@/types'
import { ActionButton } from '@/components/app/ActionButton'
import { AppButton } from '@/components/app/AppButton'
import { DEPARTMENT_SELECT_PAGE_SIZE } from '@/constants/department'
import { FormField } from '@/components/forms/FormField'
import { FormInput } from '@/components/forms/FormInput'
import { AppPagination } from '@/components/shared/AppPagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal } from '@/components/shared/Modal'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { auth } from '@/lib/auth'
import { appNotification } from '@/lib/notifications'

interface CreateFormState {
  email: string
  name: string
  password: string
  role: string
  departmentId: string
}

interface EditFormState {
  name: string
  role: string
  departmentId: string
}

type ValidationErrors = Partial<
  Record<keyof CreateFormState | keyof EditFormState, string>
>

const AVAILABLE_ROLES = [
  'Administrator',
  'Staff',
  'QA Manager',
  'QA Coordinator',
]

const passwordRules = [
  'At least 8 characters',
  'At least one uppercase letter',
  'At least one lowercase letter',
  'At least one number',
  'At least one special character',
]

const selectClassName =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

const initialCreateForm: CreateFormState = {
  email: '',
  name: '',
  password: '',
  role: 'Staff',
  departmentId: '',
}

const initialEditForm: EditFormState = {
  name: '',
  role: 'Staff',
  departmentId: '',
}

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = ['10', '20', '50']

function normalizeRoleKey(value?: string | null) {
  return value?.toLowerCase().replace(/[^a-z]/g, '') ?? ''
}

function formatRoleLabel(value?: string | null) {
  if (!value) {
    return 'Unknown'
  }

  const normalized = normalizeRoleKey(value)
  const matchingRole = AVAILABLE_ROLES.find(
    (role) => normalizeRoleKey(role) === normalized,
  )

  return matchingRole ?? value.replace(/_/g, ' ')
}

function formatDateLabel(value?: string) {
  if (!value) {
    return 'Recently created'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getMatchingRole(value?: string | null) {
  const normalized = normalizeRoleKey(value)

  return (
    AVAILABLE_ROLES.find((role) => normalizeRoleKey(role) === normalized) ??
    'Staff'
  )
}

function getDepartmentValue(user: User) {
  return user.departmentId ?? ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isStrongPassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  )
}

export default function ManageUsersPage() {
  const queryClient = useQueryClient()
  const currentUserId = auth.getUserId()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [createForm, setCreateForm] =
    useState<CreateFormState>(initialCreateForm)
  const [createErrors, setCreateErrors] = useState<ValidationErrors>({})
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>(initialEditForm)
  const [editErrors, setEditErrors] = useState<ValidationErrors>({})
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null)
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)
  const deferredSearch = useDeferredValue(search.trim())

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsers', currentPage, pageSize, deferredSearch],
    queryFn: async () => {
      const response = await userService.getUsers({
        pageNumber: currentPage,
        pageSize,
        searchTerm: deferredSearch || undefined,
      })

      if (!response.success) {
        throw new Error(response.error ?? 'Failed to load users')
      }

      return response.data
    },
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await departmentService.getDepartments({
        pageNumber: 1,
        pageSize: DEPARTMENT_SELECT_PAGE_SIZE,
      })

      if (!response.success) {
        throw new Error(response.error ?? 'Failed to load departments')
      }

      return response.data?.departments ?? []
    },
  })

  const users = useMemo(() => data?.users ?? [], [data])
  const totalUsers = data?.pagination?.totalCount ?? users.length
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize))

  const createUserMutation = useMutation({
    mutationFn: async (payload: CreateFormState) => {
      const response = await userService.createUser({
        email: payload.email.trim(),
        name: payload.name.trim(),
        password: payload.password,
        role: payload.role,
        departmentId: payload.departmentId || undefined,
      })

      if (!response.success) {
        throw new Error(response.error ?? 'Unable to create user.')
      }

      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      appNotification.success('User account created successfully.')
      closeUserForm()
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string
      payload: UpdateUserRequest
    }) => {
      const response = await userService.updateUser(userId, payload)

      if (!response.success) {
        throw new Error(response.error ?? 'Unable to update user.')
      }

      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      appNotification.success('User information updated successfully.')
      closeUserForm()
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await userService.deleteUser(userId)

      if (!response.success) {
        throw new Error(response.error ?? 'Unable to delete user.')
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      appNotification.success('User deleted successfully.')
      setDeleteConfirmUser(null)
    },
  })

  const summary = useMemo(() => {
    const noDepartmentCount = users.filter((user) => !user.departmentId).length
    const adminCount = users.filter(
      (user) => normalizeRoleKey(user.role) === 'administrator',
    ).length
    const qaCount = users.filter((user) => {
      const normalized = normalizeRoleKey(user.role)
      return normalized === 'qamanager' || normalized === 'qacoordinator'
    }).length

    return {
      total: totalUsers,
      admins: adminCount,
      qaMembers: qaCount,
      noDepartment: noDepartmentCount,
    }
  }, [totalUsers, users])

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        roleFilter === 'all' ||
        normalizeRoleKey(user.role) === normalizeRoleKey(roleFilter),
    )
  }, [roleFilter, users])

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingUserId) ?? null,
    [editingUserId, users],
  )

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, isLoading, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch, roleFilter])

  const validateCreateForm = () => {
    const nextErrors: ValidationErrors = {}

    if (!createForm.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidEmail(createForm.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!createForm.name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!createForm.password) {
      nextErrors.password = 'Password is required.'
    } else if (!isStrongPassword(createForm.password)) {
      nextErrors.password = 'Password must match the backend password policy.'
    }

    if (!createForm.role) {
      nextErrors.role = 'Role is required.'
    }

    setCreateErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const validateEditForm = () => {
    const nextErrors: ValidationErrors = {}

    if (!editForm.name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!editForm.role) {
      nextErrors.role = 'Role is required.'
    }

    setEditErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleCreateSubmit = async () => {
    if (!validateCreateForm()) {
      return
    }

    try {
      await createUserMutation.mutateAsync(createForm)
    } catch (mutationError) {
      appNotification.error(
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to create user.',
      )
    }
  }

  const handleEditStart = (user: User) => {
    setEditingUserId(user.id)
    setEditErrors({})
    setEditForm({
      name: user.name,
      role: getMatchingRole(user.role),
      departmentId: getDepartmentValue(user),
    })
    setIsUserFormOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editingUserId || !validateEditForm()) {
      return
    }

    try {
      await updateUserMutation.mutateAsync({
        userId: editingUserId,
        payload: {
          name: editForm.name.trim(),
          role: editForm.role,
          departmentId: editForm.departmentId || null,
        },
      })
    } catch (mutationError) {
      appNotification.error(
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to update user.',
      )
    }
  }

  const resetFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setCurrentPage(1)
  }

  const openCreateModal = () => {
    setIsUserFormOpen(true)
    setEditingUserId(null)
    setEditForm(initialEditForm)
    setEditErrors({})
    setCreateForm(initialCreateForm)
    setCreateErrors({})
  }

  const closeUserForm = () => {
    setIsUserFormOpen(false)
    setEditingUserId(null)
    setEditForm(initialEditForm)
    setEditErrors({})
    setCreateForm(initialCreateForm)
    setCreateErrors({})
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Manage Users"
        description="Create accounts, keep roles clean, and update department assignments from one admin workspace."
        actions={
          <>
            <ActionButton
              type="button"
              action="ghost"
              label="Reset filters"
              onClick={resetFilters}
            />
            <ActionButton
              type="button"
              action="add"
              label="New user"
              onClick={openCreateModal}
            />
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total accounts',
            value: summary.total,
            icon: Users,
            tone: 'bg-slate-900 text-white',
          },
          {
            label: 'Administrators on page',
            value: summary.admins,
            icon: ShieldCheck,
            tone: 'bg-blue-50 text-blue-700',
          },
          {
            label: 'QA members on page',
            value: summary.qaMembers,
            icon: BadgeCheck,
            tone: 'bg-amber-50 text-amber-700',
          },
          {
            label: 'No department on page',
            value: summary.noDepartment,
            icon: Building2,
            tone: 'bg-emerald-50 text-emerald-700',
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
                <div className={`rounded-2xl p-3 ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <SectionCard>
        {error ? (
          <EmptyState
            icon={Users}
            title="Error loading users"
            description={
              error instanceof Error ? error.message : 'Unknown error'
            }
          />
        ) : (
          <>
            <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <Input
                  id="user-directory-search"
                  name="user-directory-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by email, name, role, or department"
                  allowClear
                  size="large"
                  prefix={<Search className="h-4 w-4 text-slate-400" />}
                  className="rounded-xl"
                />
              </label>

              <label className="relative block">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="user-directory-role-filter"
                  name="user-directory-role-filter"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="all">All roles</option>
                  {AVAILABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {filteredUsers.length} shown on this page
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {totalUsers} total matching users
              </span>
              {deferredSearch && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                  Search: {deferredSearch}
                </span>
              )}
              {roleFilter !== 'all' && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                  Filtered by {roleFilter}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-60 animate-pulse rounded bg-slate-200" />
                    <div className="mt-5 h-10 animate-pulse rounded-xl bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : filteredUsers.length ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId
                  const isEditLocked = isCurrentUser
                  const isDeleteLocked = isCurrentUser

                  return (
                    <article
                      key={user.id}
                      className={`rounded-2xl border p-5 transition ${
                        editingUserId === user.id
                          ? 'border-blue-300 bg-blue-50/60 shadow-sm'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900">
                              {user.name}
                            </h3>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                              {formatRoleLabel(user.role)}
                            </span>
                            {editingUserId === user.id && (
                              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                                Editing
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-400" />
                              {user.email}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              {user.departmentName || 'No Department'}
                            </span>
                          </div>

                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Created {formatDateLabel(user.createdAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!isEditLocked && (
                            <ActionButton
                              type="button"
                              action="edit"
                              onClick={() => handleEditStart(user)}
                            />
                          )}
                          {!isDeleteLocked && (
                            <ActionButton
                              type="button"
                              action="delete"
                              onClick={() => setDeleteConfirmUser(user)}
                              disabled={deleteUserMutation.isPending}
                            />
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}

                <AppPagination
                  current={currentPage}
                  total={totalUsers}
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
                    roleFilter !== 'all'
                      ? `${filteredUsers.length} role matches on this page · ${total} total matching users`
                      : `Showing ${range[0]}-${range[1]} of ${total} users`
                  }
                />
              </div>
            ) : (
              <div className="space-y-6">
                <EmptyState
                  icon={Users}
                  title="No matching users"
                  description={
                    roleFilter !== 'all'
                      ? 'Try a broader search or reset the role filter.'
                      : 'Try a broader search.'
                  }
                />

                {totalUsers > 0 && (
                  <AppPagination
                    current={currentPage}
                    total={totalUsers}
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
                    showTotal={(total) =>
                      roleFilter !== 'all'
                        ? `${filteredUsers.length} role matches on this page · ${total} total matching users`
                        : `${total} total users`
                    }
                  />
                )}
              </div>
            )}
          </>
        )}
      </SectionCard>

      <Modal
        isOpen={isUserFormOpen}
        title={editingUser ? 'Edit user' : 'Create user'}
        description={
          editingUser
            ? 'Send a complete update payload so the current backend accepts the change.'
            : 'Create a new account with the same password policy enforced by the backend.'
        }
        onClose={closeUserForm}
        maxWidthClassName="max-w-3xl"
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeUserForm}>
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              form={editingUser ? 'edit-user-form' : 'create-user-form'}
              variant="secondary"
              disabled={
                createUserMutation.isPending || updateUserMutation.isPending
              }
            >
              {createUserMutation.isPending || updateUserMutation.isPending
                ? 'Saving...'
                : editingUser
                  ? 'Save changes'
                  : 'Create user'}
            </AppButton>
          </>
        }
      >
        {editingUser ? (
          <form
            id="edit-user-form"
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void handleEditSubmit()
            }}
          >
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Editing <span className="font-medium">{editingUser.email}</span>
            </div>

            <FormField label="Name" required error={editErrors.name}>
              <FormInput
                id="edit-user-name"
                name="edit-user-name"
                autoComplete="name"
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Full name"
              />
            </FormField>

            <FormField label="Role" required error={editErrors.role}>
              <select
                id="edit-user-role"
                name="edit-user-role"
                value={editForm.role}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    role: event.target.value,
                  }))
                }
                className={selectClassName}
              >
                {AVAILABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Department"
              hint="Optional. The API accepts an empty department by sending null."
            >
              <select
                id="edit-user-department"
                name="edit-user-department"
                value={editForm.departmentId}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    departmentId: event.target.value,
                  }))
                }
                className={selectClassName}
              >
                <option value="">No department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Email and password are not editable in this screen because the
              live backend only supports name, role, and department updates.
            </div>
          </form>
        ) : (
          <form
            id="create-user-form"
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void handleCreateSubmit()
            }}
          >
            <FormField label="Email" required error={createErrors.email}>
              <FormInput
                id="create-user-email"
                name="create-user-email"
                type="email"
                autoComplete="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="name@university.edu"
              />
            </FormField>

            <FormField label="Full name" required error={createErrors.name}>
              <FormInput
                id="create-user-name"
                name="create-user-name"
                autoComplete="name"
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Full name"
              />
            </FormField>

            <FormField label="Password" required error={createErrors.password}>
              <FormInput
                id="create-user-password"
                name="create-user-password"
                type="password"
                autoComplete="new-password"
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Create a secure password"
              />
            </FormField>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Password rules
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {passwordRules.map((rule) => (
                  <li key={rule} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <FormField label="Role" required error={createErrors.role}>
              <select
                id="create-user-role"
                name="create-user-role"
                value={createForm.role}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    role: event.target.value,
                  }))
                }
                className={selectClassName}
              >
                {AVAILABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Department"
              hint="Optional. Leaving this blank creates the account without a department."
            >
              <select
                id="create-user-department"
                name="create-user-department"
                value={createForm.departmentId}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    departmentId: event.target.value,
                  }))
                }
                className={selectClassName}
              >
                <option value="">No department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </FormField>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirmUser}
        title="Delete User"
        message={
          deleteConfirmUser
            ? `Delete ${deleteConfirmUser.email}? This cannot be undone.`
            : 'Delete this user?'
        }
        confirmText="Delete user"
        cancelText="Cancel"
        isDangerous
        isLoading={deleteUserMutation.isPending}
        onConfirm={() => {
          if (deleteConfirmUser) {
            deleteUserMutation.mutate(deleteConfirmUser.id, {
              onError: (mutationError) => {
                appNotification.error(
                  mutationError instanceof Error
                    ? mutationError.message
                    : 'Unable to delete user.',
                )
              },
            })
          }
        }}
        onCancel={() => setDeleteConfirmUser(null)}
      />
    </div>
  )
}
