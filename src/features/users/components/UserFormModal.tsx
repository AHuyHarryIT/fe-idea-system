import type { Department, User } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormInput } from '@/components/forms/FormInput'
import { Modal } from '@/components/shared/Modal'
import {
  AVAILABLE_USER_ROLES,
  type CreateUserFormState,
  type EditUserFormState,
  type UserFormValidationErrors,
  USER_PASSWORD_RULES,
  userRoleSelectClassName,
} from '@/features/users/helpers/user-management'

interface UserFormModalProps {
  isOpen: boolean
  editingUser: User | null
  departments: Department[]
  createForm: CreateUserFormState
  editForm: EditUserFormState
  createErrors: UserFormValidationErrors
  editErrors: UserFormValidationErrors
  isSaving: boolean
  onClose: () => void
  onCreateFormChange: (form: CreateUserFormState) => void
  onEditFormChange: (form: EditUserFormState) => void
  onCreateSubmit: () => void
  onEditSubmit: () => void
}

export function UserFormModal({
  isOpen,
  editingUser,
  departments,
  createForm,
  editForm,
  createErrors,
  editErrors,
  isSaving,
  onClose,
  onCreateFormChange,
  onEditFormChange,
  onCreateSubmit,
  onEditSubmit,
}: UserFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={editingUser ? 'Edit user' : 'Create user'}
      description={
        editingUser
          ? 'Send a complete update payload so the current backend accepts the change.'
          : 'Create a new account with the same password policy enforced by the backend.'
      }
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
      footer={
        <>
          <AppButton type="button" variant="ghost" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            form={editingUser ? 'edit-user-form' : 'create-user-form'}
            variant="secondary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : editingUser ? 'Save changes' : 'Create user'}
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
            onEditSubmit()
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
                onEditFormChange({ ...editForm, name: event.target.value })
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
                onEditFormChange({ ...editForm, role: event.target.value })
              }
              className={userRoleSelectClassName}
            >
              {AVAILABLE_USER_ROLES.map((role) => (
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
                onEditFormChange({ ...editForm, departmentId: event.target.value })
              }
              className={userRoleSelectClassName}
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
            Email and password are not editable in this screen because the live backend only supports name, role, and department updates.
          </div>
        </form>
      ) : (
        <form
          id="create-user-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            onCreateSubmit()
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
                onCreateFormChange({ ...createForm, email: event.target.value })
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
                onCreateFormChange({ ...createForm, name: event.target.value })
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
                onCreateFormChange({ ...createForm, password: event.target.value })
              }
              placeholder="Create a secure password"
            />
          </FormField>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Password rules
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {USER_PASSWORD_RULES.map((rule) => (
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
                onCreateFormChange({ ...createForm, role: event.target.value })
              }
              className={userRoleSelectClassName}
            >
              {AVAILABLE_USER_ROLES.map((role) => (
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
                onCreateFormChange({ ...createForm, departmentId: event.target.value })
              }
              className={userRoleSelectClassName}
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
  )
}
