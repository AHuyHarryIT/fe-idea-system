import { createFileRoute } from '@tanstack/react-router'
import IdeaListPage from '@/pages/staff/IdeaListPage'

export const Route = createFileRoute('/ideas/')({
  component: IdeaListPage,
})
