import { createFileRoute } from '@tanstack/react-router'
import Sidebar from '@/Layout/Sidebar'

export const Route = createFileRoute('/dashboard/staff')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Sidebar userRole="qa_manager" />
}
