export interface CategoryManagementFormState {
  name: string
}

export const initialCategoryManagementForm: CategoryManagementFormState = {
  name: '',
}

export const DEFAULT_CATEGORY_PAGE_SIZE = 10
export const CATEGORY_PAGE_SIZE_OPTIONS = ['10', '20', '50']

export function validateCategoryManagementForm(
  form: CategoryManagementFormState,
) {
  if (!form.name.trim()) {
    return 'Category name is required.'
  }

  return null
}

export function buildCategoryManagementPayload(
  form: CategoryManagementFormState,
) {
  return {
    name: form.name.trim(),
  }
}
