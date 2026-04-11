import { FileText } from "lucide-react"
import { useMyIdeas } from "@/hooks/useIdeas"
import { EmptyState } from "@/components/shared/EmptyState"
import { AppButton } from "@/components/app/AppButton"
import { SectionCard } from "@/components/shared/SectionCard"
import { formatAppDateTime } from "@/utils/date"
import type { Idea } from "@/types/idea"

interface IdeaBrowserProps {
  onSelectIdea: (ideaId: string) => void
  isLoading: boolean
  error: Error | null
}

export function IdeaBrowserForEdit({
  onSelectIdea,
  isLoading,
  error,
}: IdeaBrowserProps) {
  const { data: myIdeas } = useMyIdeas()
  const ideas: Idea[] = Array.isArray(myIdeas) ? myIdeas : []

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-900">Error loading ideas</p>
        <p className="mt-1 text-sm text-red-700">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <p className="text-center text-slate-600">Loading your ideas...</p>
  }

  if (!ideas.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No ideas yet"
        description="Create an idea first to edit it later."
      />
    )
  }

  return (
    <div className="space-y-3">
      {ideas.map((idea: Idea) => (
        <SectionCard key={idea.id}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{idea.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {idea.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                <span>📁 {idea.categoryName}</span>
                <span>📅 {formatAppDateTime(idea.createdAt)}</span>
                <span>💬 {idea.commentsCount || 0} comments</span>
              </div>
            </div>
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => onSelectIdea(idea.id)}
            >
              Edit
            </AppButton>
          </div>
        </SectionCard>
      ))}
    </div>
  )
}
