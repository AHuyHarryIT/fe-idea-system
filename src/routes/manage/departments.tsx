import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import ManageDepartmentsPage from '@/pages/admin/ManageDepartmentsPage'

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['admin']}>
      <ManageDepartmentsPage />
    </ProtectedPage>
  )
}

export const Route = createFileRoute('/manage/departments')({
  component: RouteComponent,
})
