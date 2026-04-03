import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import DashboardPage from '@/pages/staff/DashboardPage'

export const Route = createFileRoute('/my-ideas')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage>
      <DashboardPage
        title="My Ideas"
        description="Track your pending ideas, review outcomes, and rejection notes in one dedicated view."
        enablePagination
        showSummaryCards={false}
      />
    </ProtectedPage>
  )
}
