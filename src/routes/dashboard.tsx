import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import StaffDashboardPage from '@/features/dashboard/staff/pages/StaffDashboardPage'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['staff']}>
      <StaffDashboardPage />
    </ProtectedPage>
  )
}
