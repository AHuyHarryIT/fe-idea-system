import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import QAManagerDashboardPage from '@/features/dashboard/qa-manager/pages/QAManagerDashboardPage'

export const Route = createFileRoute('/qa-manager')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['qa_manager', 'admin']}>
      <QAManagerDashboardPage />
    </ProtectedPage>
  )
}
