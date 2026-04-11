import { Users } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { ManageButton } from "@/components/app/ManageButton"
import { SectionCard } from "@/components/shared/SectionCard"

interface AdminManagementModulesSectionProps {
  error?: Error | null
  totalUsers: number
  totalCategories: number
  submissionTotal: number
  openSubmissionCount: number
  reviewBacklog: number
  onOpenUsers: () => void
  onOpenCategories: () => void
  onOpenSubmissions: () => void
  onOpenReview: () => void
}

export function AdminManagementModulesSection({
  error,
  totalUsers,
  totalCategories,
  submissionTotal,
  openSubmissionCount,
  reviewBacklog,
  onOpenUsers,
  onOpenCategories,
  onOpenSubmissions,
  onOpenReview,
}: AdminManagementModulesSectionProps) {
  return (
    <SectionCard
      title="Management modules"
      description="Jump straight into the core admin screens with counts aligned to the live stats service."
    >
      {error ? (
        <EmptyState
          icon={Users}
          title="Unable to load admin data"
          description={error.message}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <ManageButton
            variant="blue"
            title={`Manage users · ${totalUsers}`}
            description="Open the directory to create, edit, and manage account roles across the platform."
            meta="Accounts"
            onClick={onOpenUsers}
          />
          <ManageButton
            variant="violet"
            title={`Manage categories · ${totalCategories}`}
            description="Maintain idea themes so submissions remain easy to classify and report on."
            meta="Taxonomy"
            onClick={onOpenCategories}
          />
          <ManageButton
            variant="amber"
            title={`Manage submissions · ${submissionTotal}`}
            description="Schedule submissions, update closure times, and keep campaigns aligned."
            meta={`${openSubmissionCount} open`}
            onClick={onOpenSubmissions}
          />
          <ManageButton
            variant="emerald"
            title={`Review ideas · ${reviewBacklog}`}
            description="Go directly to the moderation queue to approve or reject pending ideas."
            meta="Moderation"
            onClick={onOpenReview}
          />
        </div>
      )}
    </SectionCard>
  )
}
