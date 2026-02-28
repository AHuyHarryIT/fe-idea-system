import { createFileRoute } from '@tanstack/react-router'
import AdminLayout from '@/Layout/AdminLayout'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminLayout>Admin dashboard here</AdminLayout>
}
