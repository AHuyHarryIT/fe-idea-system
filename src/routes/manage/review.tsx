import { ProtectedPage } from '@/components/app/ProtectedPage'
import ReviewIdea from '@/pages/admin/ReviewIdea'
import { createFileRoute } from '@tanstack/react-router'

function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['admin', 'qa_manager']}>
      <ReviewIdea />
    </ProtectedPage>
  )
}

export const Route = createFileRoute('/manage/review')({
  component: RouteComponent,
})
