import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import SubmissionManagementPage from '@/features/submissions/pages/SubmissionManagementPage'

export const Route = createFileRoute('/manage/submissions')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['admin', 'qa_manager']}>
      <SubmissionManagementPage />
    </ProtectedPage>
  )
}
