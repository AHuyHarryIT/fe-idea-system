import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { departmentService, userService } from '@/api'
import type { User } from '@/types'
import { ActionButton } from '@/components/app/ActionButton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { DEPARTMENT_SELECT_PAGE_SIZE } from '@/constants/department'
import { auth } from '@/utils/auth'
import { appNotification } from '@/utils/notifications'
import { UserDirectorySummaryCards } from '@/features/users/components/UserDirectorySummaryCards'
import { UserDirectoryListSection } from '@/features/users/components/UserDirectoryListSection'
import { UserFormModal } from '@/features/users/components/UserFormModal'
import {
  buildUpdateUserPayload,
  DEFAULT_USER_PAGE_SIZE,
  type CreateUserFormState,
  type EditUserFormState,
  getMatchingUserRole,
  getUserDepartmentValue,
  initialCreateUserForm,
  initialEditUserForm,
  isStrongUserPassword,
  isValidUserEmail,
  normalizeUserRoleKey,
  type UserFormValidationErrors,
} from '@/features/users/helpers/user-management'

export default function UserManagementPage() {
  const queryClient = useQueryClient()
  const currentUserId = auth.getUserId()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_USER_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [createForm, setCreateForm] =
    useState<CreateUserFormState>(initialCreateUserForm)
  const [createErrors, setCreateErrors] = useState<UserFormValidationErrors>({})
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditUserFormState>(initialEditUserForm)
  const [editErrors, setEditErrors] = useState<UserFormValidationErrors>({})
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
    mutationFn: async (payload: CreateUserFormState) => {
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
    mutationFn: async ({ userId, payload }: { userId: string; payload: ReturnType<typeof buildUpdateUserPayload> }) => {
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
      (user) => normalizeUserRoleKey(user.role) === 'administrator',
    ).length
    const qaCount = users.filter((user) => {
      const normalized = normalizeUserRoleKey(user.role)
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
        normalizeUserRoleKey(user.role) === normalizeUserRoleKey(roleFilter),
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
    const nextErrors: UserFormValidationErrors = {}

    if (!createForm.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidUserEmail(createForm.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!createForm.name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!createForm.password) {
      nextErrors.password = 'Password is required.'
    } else if (!isStrongUserPassword(createForm.password)) {
      nextErrors.password = 'Password must match the backend password policy.'
    }

    if (!createForm.role) {
      nextErrors.role = 'Role is required.'
    }

    setCreateErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const validateEditForm = () => {
    const nextErrors: UserFormValidationErrors = {}

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
        mutationError instanceof Error ? mutationError.message : 'Unable to create user.',
      )
    }
  }

  const handleEditStart = (user: User) => {
    setEditingUserId(user.id)
    setEditErrors({})
    setEditForm({
      name: user.name,
      role: getMatchingUserRole(user.role),
      departmentId: getUserDepartmentValue(user),
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
        payload: buildUpdateUserPayload(editForm),
      })
    } catch (mutationError) {
      appNotification.error(
        mutationError instanceof Error ? mutationError.message : 'Unable to update user.',
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
    setEditForm(initialEditUserForm)
    setEditErrors({})
    setCreateForm(initialCreateUserForm)
    setCreateErrors({})
  }

  const closeUserForm = () => {
    setIsUserFormOpen(false)
    setEditingUserId(null)
    setEditForm(initialEditUserForm)
    setEditErrors({})
    setCreateForm(initialCreateUserForm)
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

      <UserDirectorySummaryCards summary={summary} />

      <UserDirectoryListSection
        error={error}
        isLoading={isLoading}
        search={search}
        deferredSearch={deferredSearch}
        roleFilter={roleFilter}
        filteredUsers={filteredUsers}
        totalUsers={totalUsers}
        currentPage={currentPage}
        pageSize={pageSize}
        currentUserId={currentUserId}
        editingUserId={editingUserId}
        deletePending={deleteUserMutation.isPending}
        onSearchChange={setSearch}
        onRoleFilterChange={setRoleFilter}
        onEditUser={handleEditStart}
        onDeleteUser={setDeleteConfirmUser}
        onPageChange={(page, nextPageSize) => {
          if (nextPageSize !== pageSize) {
            setPageSize(nextPageSize)
            setCurrentPage(1)
            return
          }

          setCurrentPage(page)
        }}
      />

      <UserFormModal
        isOpen={isUserFormOpen}
        editingUser={editingUser}
        departments={departments}
        createForm={createForm}
        editForm={editForm}
        createErrors={createErrors}
        editErrors={editErrors}
        isSaving={createUserMutation.isPending || updateUserMutation.isPending}
        onClose={closeUserForm}
        onCreateFormChange={setCreateForm}
        onEditFormChange={setEditForm}
        onCreateSubmit={() => void handleCreateSubmit()}
        onEditSubmit={() => void handleEditSubmit()}
      />

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
