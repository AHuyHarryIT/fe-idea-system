import { Eye, FolderKanban, MessageSquare } from "lucide-react"
import { Link } from "@tanstack/react-router"
import type { Idea } from "@/types"
import { AppButton } from "@/components/app/AppButton"
import { EmptyState } from "@/components/shared/EmptyState"
import { SectionCard } from "@/components/shared/SectionCard"
import {
  formatCoordinatorDateLabel,
  getCoordinatorCommentCount,
  getCoordinatorIdeaDateValue,
  getCoordinatorIdeaTitle,
  getCoordinatorStatusMeta,
} from "@/features/dashboard/qa-coordinator/helpers/qa-coordinator-dashboard"

interface QACoordinatorRecentIdeasSectionProps {
  error?: Error | null
  ideas: Idea[]
  departmentName: string
}

export function QACoordinatorRecentIdeasSection({
  error,
  ideas,
  departmentName,
}: QACoordinatorRecentIdeasSectionProps) {
  return (
    <div className="mt-6">
      <SectionCard
        title="Recent department ideas"
        description="Newest submissions in your department, with quick access to full review details."
      >
        {error ? (
          <EmptyState
            icon={FolderKanban}
            title="Department ideas unavailable"
            description={error.message}
          />
        ) : ideas.length > 0 ? (
          <div className="space-y-4">
            {ideas.slice(0, 5).map((idea) => {
              const statusMeta = getCoordinatorStatusMeta(idea)
              return (
                <div
                  key={idea.id}
                  className="rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] px-5 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold text-slate-950">
                          {getCoordinatorIdeaTitle(idea)}
                        </p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {idea.categoryName || "Uncategorized"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span>
                          {idea.authorName || "Anonymous contributor"}
                        </span>
                        <span>
                          {formatCoordinatorDateLabel(
                            getCoordinatorIdeaDateValue(idea),
                          )}
                        </span>
                        <span>{departmentName}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <div className="flex items-center gap-4 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" />
                          {getCoordinatorCommentCount(idea)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Eye className="h-4 w-4" />
                          {idea.viewCount ?? 0}
                        </span>
                      </div>
                      <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
                        <AppButton type="button" variant="ghost">
                          Review details
                        </AppButton>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No department ideas yet"
            description="Ideas from your department will appear here as soon as staff submit them."
          />
        )}
      </SectionCard>
    </div>
  )
}
