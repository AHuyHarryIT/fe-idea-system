import { createFileRoute } from "@tanstack/react-router"
import { ProtectedPage } from "@/components/app/ProtectedPage"
import DepartmentManagementPage from "@/features/departments/pages/DepartmentManagementPage"

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={["admin"]}>
      <DepartmentManagementPage />
    </ProtectedPage>
  )
}

export const Route = createFileRoute("/manage/departments")({
  component: RouteComponent,
})
