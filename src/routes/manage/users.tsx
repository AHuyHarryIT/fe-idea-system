import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import ManageUsersPage from '@/pages/admin/ManageUsersPage'

export const Route = createFileRoute('/manage/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['admin']}>
      <ManageUsersPage />
    </ProtectedPage>
  )
}
