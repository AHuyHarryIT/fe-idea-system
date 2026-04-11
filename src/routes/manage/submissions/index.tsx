import { createFileRoute } from "@tanstack/react-router"
import SubmissionManagementPage from "@/features/submissions/pages/SubmissionManagementPage"

export const Route = createFileRoute("/manage/submissions/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <SubmissionManagementPage />
}
