import { AlertCircle, UserRound } from "lucide-react"
import type { Idea } from "@/types"
import { EmptyState } from "@/components/shared/EmptyState"
import { SectionCard } from "@/components/shared/SectionCard"
import {
  formatDateLabel,
  getCommentCount,
  getIdeaDateValue,
  getIdeaTitle,
} from "@/features/dashboard/qa-manager/helpers/qa-manager-dashboard"

interface QAManagerInsightListsSectionProps {
  error?: Error | null
  ideasWithoutComments: Idea[]
  anonymousIdeas: Idea[]
}

export function QAManagerInsightListsSection({
  error,
  ideasWithoutComments,
  anonymousIdeas,
}: QAManagerInsightListsSectionProps) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <SectionCard
        title="Ideas without comments"
        description="Follow-up ideas that still need coordinator outreach."
      >
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Follow-up queue unavailable"
            description={error.message}
          />
        ) : ideasWithoutComments.length > 0 ? (
          <div className="space-y-4">
            {ideasWithoutComments.map((idea) => (
              <div
                key={idea.id}
                className="rounded-[22px] border border-amber-200 bg-amber-50/60 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {getIdeaTitle(idea)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {idea.categoryName || "Uncategorized"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDateLabel(getIdeaDateValue(idea))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="No ideas without comments"
            description="Ideas without comments will appear here for follow-up."
          />
        )}
      </SectionCard>

      <SectionCard
        title="Anonymous submissions"
        description="Anonymous ideas currently visible in the analytics feed."
      >
        {error ? (
          <EmptyState
            icon={UserRound}
            title="Anonymous idea data unavailable"
            description={error.message}
          />
        ) : anonymousIdeas.length > 0 ? (
          <div className="space-y-4">
            {anonymousIdeas.map((idea) => (
              <div
                key={idea.id}
                className="rounded-[22px] border border-violet-200 bg-violet-50/60 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {getIdeaTitle(idea)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {idea.categoryName || "Uncategorized"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {getCommentCount(idea)} comments
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UserRound}
            title="No anonymous ideas in the feed"
            description="Anonymous submissions will appear here when the feed contains them."
          />
        )}
      </SectionCard>
    </div>
  )
}
