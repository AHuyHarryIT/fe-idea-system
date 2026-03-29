import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Archive, BarChart3, Building2, Download, TrendingUp } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { exportService } from '@/api/export'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'
import {
  useDepartmentStats,
  useIdeasWithoutComments,
} from '@/hooks/useDashboard'
import { useQAManagerIdeas } from '@/hooks/useIdeas'
import { useSubmissions } from '@/hooks/useSubmissions'
import { normalizeIdeaResponse } from '@/lib/idea-response-mapper'

function isReviewableIdea(status?: string) {
  if (!status) return true

  return [
    'submitted',
    'under_review',
    'pending',
    'pending_review',
    'awaiting_review',
  ].includes(status.toLowerCase().replace(/\s+/g, '_'))
}

export default function QAManagerPage() {
  const { data: ideaData, isLoading, error } = useQAManagerIdeas()
  const { data: departmentData } = useDepartmentStats()
  const { data: withoutCommentsData } = useIdeasWithoutComments()
  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useSubmissions()
  const [activeExportKey, setActiveExportKey] = useState<string | null>(null)
  const [exportFeedback, setExportFeedback] = useState<string>('')

  const ideas = useMemo(() => {
    const ideaList = normalizeIdeaResponse(ideaData)
    return Array.isArray(ideaList) ? ideaList.filter((idea) => idea.id) : []
  }, [ideaData])

  const departmentStats = useMemo(
    () => (Array.isArray(departmentData) ? departmentData : []),
    [departmentData],
  )

  const ideasWithoutComments = useMemo(
    () => (Array.isArray(withoutCommentsData) ? withoutCommentsData : []),
    [withoutCommentsData],
  )
  const reviewQueue = useMemo(
    () => ideas.filter((idea) => isReviewableIdea(idea.status)),
    [ideas],
  )
  const exportableSubmissions = useMemo(() => {
    const submissions = Array.isArray(submissionsData) ? submissionsData : []
    const now = Date.now()

    return submissions
      .filter((submission) => {
        const finalClosure = Date.parse(submission.finalClosureDate)
        return !Number.isNaN(finalClosure) && finalClosure <= now
      })
      .sort(
        (left, right) =>
          Date.parse(right.finalClosureDate) - Date.parse(left.finalClosureDate),
      )
  }, [submissionsData])
  const engagementRate =
    ideas.length > 0
      ? (((ideas.reduce(
          (total, idea) => total + (idea.thumbsUpCount ?? 0) + (idea.thumbsDownCount ?? 0) + (idea.commentCount ?? 0),
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
          title="Approval queue"
          description="Open an idea to approve it or reject it with reviewer feedback."
        >
          {error ? (
            <EmptyState
              icon={BarChart3}
              title="Approval queue unavailable"
              description={error.message}
            />
          ) : reviewQueue.length > 0 ? (
            <div className="space-y-4">
              {reviewQueue.slice(0, 5).map((idea) => (
                <div
                  key={idea.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"
                >
                  <p className="font-medium text-slate-900">
                    {idea.text || 'Untitled idea'}
                  </p>
                  <p className="mt-2">
                    Status: {idea.status?.replace(/_/g, ' ') || 'Pending'}
                  </p>
                  <p>
                    Category: {idea.categoryName || 'Uncategorized'}
                  </p>
                  <div className="mt-4">
                    <Link to="/manage/review">
                      <AppButton type="button">Open review view</AppButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No ideas waiting for review"
              description="Submitted ideas will appear here when moderation is needed."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Export centre"
          description="Download CSV and ZIP packages for submission windows that have passed the final closure date."
        >
          {submissionsError ? (
            <EmptyState
              icon={Archive}
              title="Export data unavailable"
              description={submissionsError.message}
            />
          ) : submissionsLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Loading submission windows...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      University-wide export
                    </p>
                    <p className="text-sm text-slate-600">
                      Download the complete idea dataset and document bundle.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AppButton
                      type="button"
                      variant="ghost"
                      disabled={activeExportKey !== null}
                      onClick={async () => {
                        setActiveExportKey('all-csv')
                        setExportFeedback('')

                        try {
                          await exportService.exportQAManagerIdeasAsCSV()
                          setExportFeedback('Downloaded university-wide CSV export.')
                        } catch (downloadError) {
                          setExportFeedback(
                            downloadError instanceof Error
                              ? downloadError.message
                              : 'Unable to download CSV export.',
                          )
                        } finally {
                          setActiveExportKey(null)
                        }
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {activeExportKey === 'all-csv' ? 'Downloading...' : 'CSV'}
                    </AppButton>
                    <AppButton
                      type="button"
                      variant="ghost"
                      disabled={activeExportKey !== null}
                      onClick={async () => {
                        setActiveExportKey('all-zip')
                        setExportFeedback('')

                        try {
                          await exportService.exportQAManagerIdeasAsZip()
                          setExportFeedback('Downloaded university-wide ZIP export.')
                        } catch (downloadError) {
                          setExportFeedback(
                            downloadError instanceof Error
                              ? downloadError.message
                              : 'Unable to download ZIP export.',
                          )
                        } finally {
                          setActiveExportKey(null)
                        }
                      }}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      {activeExportKey === 'all-zip' ? 'Downloading...' : 'ZIP'}
                    </AppButton>
                  </div>
                </div>
              </div>

              {exportableSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {exportableSubmissions.map((submission) => {
                    const csvKey = `${submission.id}-csv`
                    const zipKey = `${submission.id}-zip`

                    return (
                      <div
                        key={submission.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">
                              {submission.name}
                            </p>
                            <p>
                              Final closure:{' '}
                              {new Date(submission.finalClosureDate).toLocaleDateString()}
                            </p>
                            <p>Ideas captured: {submission.ideaCount ?? 0}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <AppButton
                              type="button"
                              variant="ghost"
                              disabled={activeExportKey !== null}
                              onClick={async () => {
                                setActiveExportKey(csvKey)
                                setExportFeedback('')

                                try {
                                  await exportService.exportSubmissionAsCSV(
                                    submission.id,
                                    submission.name,
                                  )
                                  setExportFeedback(
                                    `Downloaded CSV export for ${submission.name}.`,
                                  )
                                } catch (downloadError) {
                                  setExportFeedback(
                                    downloadError instanceof Error
                                      ? downloadError.message
                                      : 'Unable to download submission CSV export.',
                                  )
                                } finally {
                                  setActiveExportKey(null)
                                }
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {activeExportKey === csvKey ? 'Downloading...' : 'CSV'}
                            </AppButton>
                            <AppButton
                              type="button"
                              variant="ghost"
                              disabled={activeExportKey !== null}
                              onClick={async () => {
                                setActiveExportKey(zipKey)
                                setExportFeedback('')

                                try {
                                  await exportService.exportSubmissionAsZip(
                                    submission.id,
                                    submission.name,
                                  )
                                  setExportFeedback(
                                    `Downloaded ZIP export for ${submission.name}.`,
                                  )
                                } catch (downloadError) {
                                  setExportFeedback(
                                    downloadError instanceof Error
                                      ? downloadError.message
                                      : 'Unable to download submission ZIP export.',
                                  )
                                } finally {
                                  setActiveExportKey(null)
                                }
                              }}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {activeExportKey === zipKey ? 'Downloading...' : 'ZIP'}
                            </AppButton>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Archive}
                  title="No export-ready submissions"
                  description="Submission windows appear here after their final closure date has passed."
                />
              )}

              {exportFeedback ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {exportFeedback}
                </p>
              ) : null}
            </div>
          )}
        </SectionCard>

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
                  key={String(idea.id || index)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"
                >
                  <p className="font-medium text-slate-900">
                    {String(idea.text || `Idea ${index + 1}`)}
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
              Top idea engagement: {ideas[0]?.text || 'No ideas loaded'}
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
