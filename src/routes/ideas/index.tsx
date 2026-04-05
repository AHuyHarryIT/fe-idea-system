import { createFileRoute } from '@tanstack/react-router'
import IdeaCataloguePage from '@/features/ideas/pages/IdeaCataloguePage'

export const Route = createFileRoute('/ideas/')({
  component: IdeaCataloguePage,
})
