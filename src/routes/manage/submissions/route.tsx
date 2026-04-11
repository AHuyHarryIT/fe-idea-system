import { Outlet, createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'

export const Route = createFileRoute('/manage/submissions')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['admin', 'qa_manager']}>
      <Outlet />
    </ProtectedPage>
  )
}
