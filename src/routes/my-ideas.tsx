import { createFileRoute } from "@tanstack/react-router"
import { ProtectedPage } from "@/components/app/ProtectedPage"
import StaffDashboardPage from "@/features/dashboard/staff/pages/StaffDashboardPage"

export const Route = createFileRoute("/my-ideas")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage>
      <StaffDashboardPage
        title="My Ideas"
        description="Track your pending ideas, review outcomes, and rejection notes in one dedicated view."
        enablePagination
        showSummaryCards={false}
      />
    </ProtectedPage>
  )
}
