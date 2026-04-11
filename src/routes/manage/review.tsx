import { ProtectedPage } from "@/components/app/ProtectedPage"
import ReviewQueuePage from "@/features/review/pages/ReviewQueuePage"
import { createFileRoute } from "@tanstack/react-router"

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={["admin", "qa_manager", "qa_coordinator"]}>
      <ReviewQueuePage />
    </ProtectedPage>
  )
}

export const Route = createFileRoute("/manage/review")({
  component: RouteComponent,
})
