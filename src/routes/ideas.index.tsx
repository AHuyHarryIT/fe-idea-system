// Defines the default index route for the ideas section.
// This route renders the main idea catalogue page.
import { createFileRoute } from '@tanstack/react-router'
import IdeaListPage from '@/pages/staff/IdeaListPage'

export const Route = createFileRoute('/ideas/')({
  component: IdeaListPage,
})
