// Defines the dynamic route for displaying the detail of a selected idea.
// The idea identifier is resolved from the route parameters and passed to the page component.
import { createFileRoute } from '@tanstack/react-router'
import IdeaDetailPage from '@/pages/staff/IdeaDetailPage'

export const Route = createFileRoute('/ideas/$ideaId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { ideaId } = Route.useParams()

  return <IdeaDetailPage ideaId={ideaId} />
}
