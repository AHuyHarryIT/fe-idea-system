import { ArrowRight, PlusCircle, Sparkles } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { AppButton } from "@/components/app/AppButton"
import { SectionCard } from "@/components/shared/SectionCard"

export function StaffQuickActionsSection() {
  return (
    <SectionCard title="Quick actions">
      <div className="flex flex-wrap gap-3">
        <Link to="/submit-idea">
          <AppButton>
            <PlusCircle className="mr-2 h-4 w-4" />
            Submit New Idea
          </AppButton>
        </Link>
        <Link to="/ideas">
          <AppButton variant="ghost">
            <Sparkles className="mr-2 h-4 w-4" />
            View All Ideas
          </AppButton>
        </Link>
        <Link to="/my-ideas">
          <AppButton variant="ghost">
            <ArrowRight className="mr-2 h-4 w-4" />
            Open My Ideas
          </AppButton>
        </Link>
      </div>
    </SectionCard>
  )
}
