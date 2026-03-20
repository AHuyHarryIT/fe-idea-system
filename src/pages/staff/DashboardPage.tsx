import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Lightbulb, MessageSquare, TrendingUp } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'
import { useMyIdeas } from '@/hooks/useIdeas'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'

function getTimestamp(value?: string) {
  if (!value) {
    return 0
  }

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export default function DashboardPage() {
  const { data, isLoading, error } = useMyIdeas()

  const ideas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(data)
    return Array.isArray(ideaList) ? ideaList.filter((idea) => idea.id) : []
  }, [data])

  const recentIdeas = useMemo(
    () => [...ideas].sort((left, right) => getTimestamp(right.createdAt || right.createdDate) - getTimestamp(left.createdAt || left.createdDate)).slice(0, 3),
    [ideas],
  )

  const trendingIdeas = useMemo(
    () =>
      [...ideas]
        .sort(
          (left, right) =>
            ((right.thumbsUpCount ?? 0) + (right.commentCount ?? 0)) - ((left.thumbsUpCount ?? 0) + (left.commentCount ?? 0)),
        )
        .slice(0, 3),
    [ideas],
  )

  const totalEngagement = ideas.reduce(
    (total, idea) => total + (idea.thumbsUpCount ?? 0) + (idea.commentCount ?? 0),
    0,
  )
  const totalFeedback = ideas.reduce(
    (total, idea) => total + (idea.commentCount ?? 0),
    0,
  )

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Dashboard"
        description="Your recent submissions and engagement from the live idea API."
        actions={
          <>
            <Link to="/submit-idea">
              <AppButton>Submit Idea</AppButton>
            </Link>
            <Link to="/ideas">
              <AppButton variant="ghost">Browse Ideas</AppButton>
            </Link>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Lightbulb}
          title="Ideas submitted"
          value={isLoading ? '...' : `${ideas.length}`}
          description="Total ideas created from your workspace account."
        />
        <StatCard
          icon={TrendingUp}
          title="Total engagement"
          value={isLoading ? '...' : `${totalEngagement}`}
          description="Combined likes and comments across your ideas."
        />
        <StatCard
          icon={MessageSquare}
          title="Feedback received"
          value={isLoading ? '...' : `${totalFeedback}`}
          description="Comment volume gathered from your published ideas."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Recent ideas"
          description="Newest ideas returned by the staff listing endpoint."
        >
          {error ? (
            <EmptyState
              icon={Lightbulb}
              title="Unable to load your ideas"
              description={error.message}
            />
          ) : isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Loading recent ideas...
            </div>
          ) : recentIdeas.length > 0 ? (
            <div className="space-y-4">
              {recentIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Lightbulb}
              title="No recent ideas loaded"
              description="Submit your first idea to start building your dashboard."
              action={
                <Link to="/submit-idea">
                  <AppButton variant="ghost">Submit an idea</AppButton>
                </Link>
              }
            />
          )}
        </SectionCard>
        <SectionCard
          title="Trending ideas"
          description="Most engaged ideas based on likes and comments."
        >
          {error ? (
            <EmptyState
              icon={TrendingUp}
              title="Trending ideas unavailable"
              description={error.message}
            />
          ) : isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Loading engagement data...
            </div>
          ) : trendingIdeas.length > 0 ? (
            <div className="space-y-4">
              {trendingIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No trending ideas yet"
              description="Engagement metrics appear here after your ideas receive likes or comments."
              action={
                <Link to="/ideas">
                  <AppButton variant="ghost">Open idea listing</AppButton>
                </Link>
              }
            />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
