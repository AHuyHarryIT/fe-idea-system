import { useMemo } from 'react'
import { BarChart3, Building2, TrendingUp } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'
import {
  useDepartmentStats,
  useIdeasWithoutComments,
} from '@/hooks/useDashboard'
import { useQAManagerIdeas } from '@/hooks/useIdeas'
import { extractCollection, mapIdeaSummary } from '@/lib/api-mappers'

export default function QAManagerPage() {
  const { data: ideaData, isLoading, error } = useQAManagerIdeas()
  const { data: departmentData } = useDepartmentStats()
  const { data: withoutCommentsData } = useIdeasWithoutComments()

  const ideas = useMemo(
    () => extractCollection(ideaData, ['ideas']).map(mapIdeaSummary).filter((idea) => idea.id),
    [ideaData],
  )
  const departmentStats = useMemo(
    () => extractCollection<Record<string, unknown>>(departmentData).filter(Boolean),
    [departmentData],
  )
  const ideasWithoutComments = useMemo(
    () => extractCollection<Record<string, unknown>>(withoutCommentsData).filter(Boolean),
    [withoutCommentsData],
  )
  const engagementRate =
    ideas.length > 0
      ? (((ideas.reduce(
          (total, idea) => total + (idea.totalLikes ?? 0) + (idea.totalComments ?? 0),
          0,
        ) /
          ideas.length) *
          100) /
          100).toFixed(1)
      : '0.0'

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="QA Manager Dashboard"
        description="Analytics-oriented view powered by QA manager and statistics endpoints."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          icon={BarChart3}
          title="Total published ideas"
          value={isLoading ? '...' : `${ideas.length}`}
          description="Idea volume returned from the QA manager feed."
        />
        <StatCard
          icon={TrendingUp}
          title="Engagement rate"
          value={isLoading ? '...' : `${engagementRate}`}
          description="Average likes + comments per idea."
        />
        <StatCard
          icon={Building2}
          title="Departments contributing"
          value={isLoading ? '...' : `${departmentStats.length}`}
          description="Department count returned by the statistics endpoint."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Reporting widgets"
          description="Ideas that still need comments or follow-up."
        >
          {error ? (
            <EmptyState
              icon={BarChart3}
              title="Analytics widgets unavailable"
              description={error.message}
            />
          ) : ideasWithoutComments.length > 0 ? (
            <div className="space-y-4">
              {ideasWithoutComments.slice(0, 5).map((idea, index) => (
                <div
                  key={String(idea.id ?? index)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"
                >
                  <p className="font-medium text-slate-900">
                    {String(idea.text ?? idea.title ?? `Idea ${index + 1}`)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No unmanaged ideas"
              description="Ideas without comments will appear here for QA follow-up."
            />
          )}
        </SectionCard>
        <SectionCard
          title="Manager notes"
          description="Quick summaries generated from department statistics and trending ideas."
        >
          <div className="space-y-4 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-4">
              Top idea engagement: {ideas[0]?.title || 'No ideas loaded'}
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              Department comparison entries: {departmentStats.length}
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              Ideas awaiting comments: {ideasWithoutComments.length}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
