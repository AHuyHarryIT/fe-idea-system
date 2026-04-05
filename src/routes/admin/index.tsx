import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import AdminDashboardPage from '@/features/dashboard/admin/pages/AdminDashboardPage'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['admin']}>
      <AdminDashboardPage />
    </ProtectedPage>
  )
}
