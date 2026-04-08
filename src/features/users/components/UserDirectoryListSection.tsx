import { Input } from 'antd'
import { Building2, Filter, Mail, Search, Users } from 'lucide-react'
import type { User } from '@/types'
import { ActionButton } from '@/components/app/ActionButton'
import { AppPagination } from '@/components/shared/AppPagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { formatAppDateTime } from '@/utils/date'
import {
  AVAILABLE_USER_ROLES,
  formatUserRoleLabel,
  USER_PAGE_SIZE_OPTIONS,
} from '@/features/users/helpers/user-management'

interface UserDirectoryListSectionProps {
  error: Error | null
  isLoading: boolean
  search: string
  deferredSearch: string
  roleFilter: string
  filteredUsers: User[]
  totalUsers: number
  currentPage: number
  pageSize: number
  currentUserId: string | null
  editingUserId: string | null
  deletePending: boolean
  onSearchChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
  onEditUser: (user: User) => void
  onDeleteUser: (user: User) => void
  onPageChange: (page: number, nextPageSize: number) => void
}

export function UserDirectoryListSection({
  error,
  isLoading,
  search,
  deferredSearch,
  roleFilter,
  filteredUsers,
  totalUsers,
  currentPage,
  pageSize,
  currentUserId,
  editingUserId,
  deletePending,
  onSearchChange,
  onRoleFilterChange,
  onEditUser,
  onDeleteUser,
  onPageChange,
}: UserDirectoryListSectionProps) {
  return (
    <SectionCard>
      {error ? (
        <EmptyState
          icon={Users}
          title="Error loading users"
          description={error instanceof Error ? error.message : 'Unknown error'}
        />
      ) : (
        <>
          <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <label className="block">
              <Input
                id="user-directory-search"
                name="user-directory-search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
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
                onChange={(event) => onRoleFilterChange(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">All roles</option>
                {AVAILABLE_USER_ROLES.map((role) => (
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
            {deferredSearch &&  (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                Search: {deferredSearch}
              </span>
            )}
            {roleFilter !== 'all' &&  (
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
                            {formatUserRoleLabel(user.role)}
                          </span>
                          {editingUserId === user.id &&  (
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
                          Created {formatAppDateTime(user.createdAt, 'Recently created')}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!isEditLocked &&  (
                          <ActionButton type="button" action="edit" onClick={() => onEditUser(user)} />
                        )}
                        {!isDeleteLocked &&  (
                          <ActionButton
                            type="button"
                            action="delete"
                            onClick={() => onDeleteUser(user)}
                            disabled={deletePending}
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
                pageSizeOptions={USER_PAGE_SIZE_OPTIONS}
                onChange={onPageChange}
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

              {totalUsers > 0 &&  (
                <AppPagination
                  current={currentPage}
                  total={totalUsers}
                  pageSize={pageSize}
                  pageSizeOptions={USER_PAGE_SIZE_OPTIONS}
                  onChange={onPageChange}
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
  )
}
