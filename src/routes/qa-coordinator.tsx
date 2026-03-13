import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import QACoordinatorPage from '@/pages/qa/QACoordinatorPage'

export const Route = createFileRoute('/qa-coordinator')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['qa_coordinator', 'admin']}>
      <QACoordinatorPage />
    </ProtectedPage>
  )
}
