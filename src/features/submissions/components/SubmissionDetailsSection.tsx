import { ArrowLeft } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { SectionCard } from '@/components/shared/SectionCard'
import { formatAppDateTime } from '@/utils/date'
import type { Submission } from '@/types'
import { isSubmissionClosed } from '@/features/ideas/helpers/submit-idea'

interface SubmissionDetailsSectionProps {
  selectedSubmission: Submission
  onBackToList: () => void
  onOpenSubmitForm: () => void
}

export function SubmissionDetailsSection({
  selectedSubmission,
  onBackToList,
  onOpenSubmitForm,
}: SubmissionDetailsSectionProps) {
  const closed = isSubmissionClosed(selectedSubmission.closureDate)

  return (
    <div className="space-y-6">
      <AppButton type="button" variant="ghost" onClick={onBackToList}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to submissions
      </AppButton>

      <SectionCard
        title={selectedSubmission.name}
        description="Review the submission details before opening the submit form."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                closed ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {closed ? 'Closed for new ideas' : 'Open for submission'}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-800">Description</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {selectedSubmission.description?.trim() ||
                'No description has been added for this submission yet.'}
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-800">Closure date</p>
              <p className="mt-1 text-sm text-slate-600">
                {formatAppDateTime(selectedSubmission.closureDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Final closure date</p>
              <p className="mt-1 text-sm text-slate-600">
                {formatAppDateTime(selectedSubmission.finalClosureDate)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <AppButton type="button" variant="ghost" onClick={onBackToList}>
              Back
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              onClick={onOpenSubmitForm}
              disabled={closed}
            >
              Submit idea
            </AppButton>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
