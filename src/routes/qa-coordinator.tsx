import { createFileRoute } from "@tanstack/react-router"
import { ProtectedPage } from "@/components/app/ProtectedPage"
import QACoordinatorDashboardPage from "@/features/dashboard/qa-coordinator/pages/QACoordinatorDashboardPage"

export const Route = createFileRoute("/qa-coordinator")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={["qa_coordinator", "admin"]}>
      <QACoordinatorDashboardPage />
    </ProtectedPage>
  )
}
