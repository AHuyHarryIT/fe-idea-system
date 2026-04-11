import { createFileRoute, redirect } from "@tanstack/react-router"
import { PublicPage } from "@/components/app/PublicPage"
import LoginPage from "@/features/auth/pages/LoginPage"
import { auth } from "@/utils/auth"

export const Route = createFileRoute("/(auth)/login")({
  beforeLoad: () => {
    if (auth.isAuthed()) {
      throw redirect({ to: "/" })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PublicPage>
      <LoginPage />
    </PublicPage>
  )
}
