import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import ManageSubmissionPage from '@/pages/admin/ManageSubmission'

export const Route = createFileRoute('/manage/submissions')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['admin', 'qa_manager']}>
      <ManageSubmissionPage />
    </ProtectedPage>
  )
}
