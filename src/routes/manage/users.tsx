import { createFileRoute } from "@tanstack/react-router"
import { ProtectedPage } from "@/components/app/ProtectedPage"
import UserManagementPage from "@/features/users/pages/UserManagementPage"

export const Route = createFileRoute("/manage/users")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={["admin"]}>
      <UserManagementPage />
    </ProtectedPage>
  )
}
