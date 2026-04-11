import { createFileRoute } from "@tanstack/react-router"
import { ProtectedPage } from "@/components/app/ProtectedPage"
import EditIdeaPage from "@/features/ideas/pages/EditIdeaPage"

export const Route = createFileRoute("/ideas/$ideaId/edit")({
  component: RouteComponent,
})

function RouteComponent() {
  const { ideaId } = Route.useParams()

  return <EditIdeaPage ideaId={ideaId} />
}
