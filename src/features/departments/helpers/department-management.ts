export interface DepartmentManagementFormState {
  name: string
  description: string
}

export const initialDepartmentManagementForm: DepartmentManagementFormState = {
  name: '',
  description: '',
}

export const DEFAULT_DEPARTMENT_PAGE_SIZE = 10
export const DEPARTMENT_PAGE_SIZE_OPTIONS = ['10', '20', '50']

export function validateDepartmentManagementForm(
  form: DepartmentManagementFormState,
) {
  if (!form.name.trim()) {
    return 'Department name is required.'
  }

  return null
}

export function buildDepartmentManagementPayload(
  form: DepartmentManagementFormState,
) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
  }
}
