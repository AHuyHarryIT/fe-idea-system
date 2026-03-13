import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import IdeaListPage from '@/pages/staff/IdeaListPage'

export const Route = createFileRoute('/ideas')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage>
      <IdeaListPage />
    </ProtectedPage>
  )
}
