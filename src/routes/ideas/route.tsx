import { Outlet, createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'

export const Route = createFileRoute('/ideas')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage>
      <Outlet />
    </ProtectedPage>
  )
}
