import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import DashboardPage from '@/pages/staff/DashboardPage'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['staff']}>
      <DashboardPage />
    </ProtectedPage>
  )
}
