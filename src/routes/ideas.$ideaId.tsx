import { createFileRoute } from '@tanstack/react-router'
import IdeaDetailPage from '@/pages/staff/IdeaDetailPage'

export const Route = createFileRoute('/ideas/$ideaId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { ideaId } = Route.useParams()

  return <IdeaDetailPage ideaId={ideaId} />
}
