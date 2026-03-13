import { Link } from '@tanstack/react-router'
import { FileText, Lightbulb, MessageSquare, TrendingUp } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Dashboard"
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
          value="--"
          description="Bind to total ideas created by current user."
        />
        <StatCard
          icon={TrendingUp}
          title="Total engagement"
          value="--"
          description="Use combined likes, comments, or reactions later."
        />
        <StatCard
          icon={MessageSquare}
          title="Feedback received"
          value="--"
          description="Good place for comment count or moderation results."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Recent ideas"
          description="This list intentionally starts empty until real data is connected."
        >
          <EmptyState
            icon={Lightbulb}
            title="No recent ideas loaded"
            description="Check back later or submit a new idea."
            action={
              <Link to="/ideas">
                <AppButton variant="ghost">Open idea listing</AppButton>
              </Link>
            }
          />
        </SectionCard>
        <SectionCard
          title="Trending ideas"
          description="Use this section to highlight popular or promoted ideas."
        >
          <EmptyState
            icon={TrendingUp}
            title="No trending ideas loaded"
            description="This is a great place to feature high-engagement ideas once your listing page is connected to real data."
            action={
              <Link to="/ideas">
                <AppButton variant="ghost">Open idea listing</AppButton>
              </Link>
            }
          />
        </SectionCard>
      </div>
    </div>
  )
}
