// Registers the parent route for idea-related pages.
// Nested routes such as the catalogue and detail view are rendered through the Outlet component.
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
