import { ClipboardCheck, FolderKanban, Users } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'

export default function QACoordinatorPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="QA Coordinator Dashboard"
        description="Department-focused workspace for monitoring idea submissions, moderation flow, and campaign periods."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          icon={FolderKanban}
          title="Department ideas"
          value="--"
          description="Department-level counter."
        />
        <StatCard
          icon={ClipboardCheck}
          title="Pending moderation"
          value="--"
          description="Items waiting for coordinator action."
        />
        <StatCard
          icon={Users}
          title="Contributors"
          value="--"
          description="Optional unique staff count for department reports."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Campaign window"
          description="Add closure dates, final closure dates, and reminders here."
        >
          <EmptyState
            icon={ClipboardCheck}
            title="Campaign data not loaded"
            description="This panel can show active department campaign timeline, deadline status, and coordinator announcements."
          />
        </SectionCard>

        <SectionCard
          title="Moderation queue"
          description="Good place for latest departmental ideas that need review."
        >
          <EmptyState
            icon={FolderKanban}
            title="No moderation items yet"
            description="Connect this card to a filtered idea list for the coordinator's department."
          />
        </SectionCard>
      </div>
    </div>
  )
}
