export type Role = 'staff' | 'qa_coordinator' | 'qa_manager' | 'admin'

export interface LoginFormValues {
  email: string
  password: string
}
