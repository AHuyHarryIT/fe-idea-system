import { useMemo } from 'react'
import { ClipboardCheck, FolderKanban, Users } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'
import { useQACoordinatorIdeas } from '@/hooks/useIdeas'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'

export default function QACoordinatorPage() {
  const { data, isLoading, error } = useQACoordinatorIdeas()
  
  const ideas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(data)
    return Array.isArray(ideaList) ? ideaList.filter((idea) => idea.id) : []
  }, [data])

  const pendingIdeas = ideas.filter(
    (idea) => idea.status === 'submitted' || idea.status === 'under_review',
  )
  const contributorCount = new Set(
    ideas.map((idea) => idea.authorName).filter(Boolean),
  ).size

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="QA Coordinator Dashboard"
        description="Department-focused view using the QA coordinator idea feed."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          icon={FolderKanban}
          title="Department ideas"
          value={isLoading ? '...' : `${ideas.length}`}
          description="Ideas returned for your department queue."
        />
        <StatCard
          icon={ClipboardCheck}
          title="Pending moderation"
          value={isLoading ? '...' : `${pendingIdeas.length}`}
          description="Submitted or under-review ideas needing attention."
        />
        <StatCard
          icon={Users}
          title="Contributors"
          value={isLoading ? '...' : `${contributorCount}`}
          description="Unique named contributors in the current department feed."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Campaign window"
          description="Quick snapshot of the latest ideas from your department."
        >
          {error ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Campaign data not loaded"
              description={error.message}
            />
          ) : ideas.length > 0 ? (
            <div className="space-y-4">
              {ideas.slice(0, 3).map((idea) => (
                <div
                  key={idea.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"
                >
                  <p className="font-medium text-slate-900">{idea.text || 'Untitled'}</p>
                  <p className="mt-2">Category: {idea.categoryName || 'Uncategorized'}</p>
                  <p>Status: {idea.status?.replace(/_/g, ' ') || 'Pending'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="Campaign data not loaded"
              description="This panel will populate as soon as department ideas are available."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Moderation queue"
          description="Latest departmental ideas waiting for coordinator action."
        >
          {pendingIdeas.length > 0 ? (
            <div className="space-y-4">
              {pendingIdeas.slice(0, 4).map((idea) => (
                <div
                  key={idea.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"
                >
                  <p className="font-medium text-slate-900">{idea.text}</p>
                  <p className="mt-2">Author: {idea.authorName || 'Anonymous'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="No moderation items yet"
              description="Submitted department ideas will show up here for review."
            />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
