import { Archive, Download } from 'lucide-react'
import type { Submission } from '@/types'
import { AppButton } from '@/components/app/AppButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { formatDateLabel } from '@/features/dashboard/qa-manager/helpers/qa-manager-dashboard'

interface QAManagerExportSectionProps {
  submissionsError?: Error | null
  submissionsLoading: boolean
  exportableSubmissions: Submission[]
  activeExportKey: string | null
  exportFeedback: string
  onExportCsv: () => void
  onExportZip: () => void
}

export function QAManagerExportSection({
  submissionsError,
  submissionsLoading,
  exportableSubmissions,
  activeExportKey,
  exportFeedback,
  onExportCsv,
  onExportZip,
}: QAManagerExportSectionProps) {
  return (
    <SectionCard
      title="Export Data"
      description="Download comprehensive reports after final closure date."
    >
      {submissionsError ? (
        <EmptyState
          icon={Archive}
          title="Export data unavailable"
          description={submissionsError.message}
        />
      ) : submissionsLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          Loading export options...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <AppButton type="button" disabled={activeExportKey !== null} onClick={onExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              {activeExportKey === 'all-csv' ? 'Downloading...' : 'Export as CSV'}
            </AppButton>

            <AppButton
              type="button"
              variant="secondary"
              disabled={activeExportKey !== null}
              onClick={onExportZip}
            >
              <Archive className="mr-2 h-4 w-4" />
              {activeExportKey === 'all-zip'
                ? 'Downloading...'
                : 'Download All Documents (ZIP)'}
            </AppButton>
          </div>

          {exportableSubmissions.length > 0 &&  (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {exportableSubmissions.slice(0, 3).map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <p className="text-sm font-semibold text-slate-950">{submission.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Final closure {formatDateLabel(submission.finalClosureDate)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {submission.ideaCount ?? 0} ideas captured
                  </p>
                </div>
              ))}
            </div>
          )}

          {exportFeedback &&  (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {exportFeedback}
            </p>
          )}
        </div>
      )}
    </SectionCard>
  )
}
