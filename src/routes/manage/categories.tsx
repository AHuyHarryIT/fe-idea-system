import { createFileRoute } from '@tanstack/react-router'
import { ProtectedPage } from '@/components/app/ProtectedPage'
import ManageCategoryPage from '@/pages/admin/ManageCaterogyPage'

// Defines the admin route for managing idea categories.
export const Route = createFileRoute('/manage/categories')({
  component: RouteComponent,
})
// Restricts the category management interface to administrator accounts.
function RouteComponent() {
  return (
    <ProtectedPage allowedRoles={['admin', 'qa_manager']}>
      <ManageCategoryPage />
    </ProtectedPage>
  )
}
