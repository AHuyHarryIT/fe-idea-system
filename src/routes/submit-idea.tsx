import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import SubmitIdeaPage from '@/pages/staff/SubmitIdeaPage'

export const Route = createFileRoute('/submit-idea')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['staff']}>
      <SubmitIdeaPage />
    </ProtectedPage>
  )
}
