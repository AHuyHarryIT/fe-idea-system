import { ExternalLink, FileText } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import type { IdeaAttachment } from '@/types'

interface IdeaProposalSectionProps {
  isLoading: boolean
  ideaDescription: string
  attachments: IdeaAttachment[]
  selectedAttachmentId: string | null
  selectedAttachmentUrl: string
  canPreviewSelectedAttachment: boolean
  onSelectAttachment: (attachmentId: string) => void
  getAttachmentUrl: (url?: string) => string
}

export function IdeaProposalSection({
  isLoading,
  ideaDescription,
  attachments,
  selectedAttachmentId,
  selectedAttachmentUrl,
  canPreviewSelectedAttachment,
  onSelectAttachment,
  getAttachmentUrl,
}: IdeaProposalSectionProps) {
  const selectedAttachment =
    attachments.find((attachment) => attachment.id === selectedAttachmentId) ??
    attachments[0]

  return (
    <SectionCard title="Proposal">
      <div className="space-y-5 text-sm leading-7 text-slate-600">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {isLoading ? 'Loading description...' : ideaDescription}
          </p>
        </div>

        {attachments.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Attached documents</p>
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={`flex flex-col gap-4 rounded-[22px] border bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                    attachment.id === selectedAttachment?.id
                      ? 'border-blue-200 ring-2 ring-blue-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {attachment.fileSize || 'Attachment available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AppButton
                      variant={attachment.id === selectedAttachment?.id ? 'primary' : 'ghost'}
                      onClick={() => onSelectAttachment(attachment.id)}
                      disabled={!attachment.fileUrl}
                    >
                      View document
                    </AppButton>
                    {attachment.fileUrl ? (
                      <AppButton
                        variant="ghost"
                        type="button"
                        onClick={() =>
                          window.open(
                            getAttachmentUrl(attachment.fileUrl),
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open tab
                      </AppButton>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {selectedAttachment ? (
              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedAttachment.fileName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedAttachment.fileSize || 'Document preview'}
                    </p>
                  </div>
                  {selectedAttachment.fileUrl ? (
                    <AppButton
                      variant="ghost"
                      type="button"
                      onClick={() =>
                        window.open(
                          selectedAttachmentUrl,
                          '_blank',
                          'noopener,noreferrer',
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in new tab
                    </AppButton>
                  ) : null}
                </div>

                {selectedAttachment.fileUrl ? (
                  canPreviewSelectedAttachment ? (
                    <iframe
                      title={selectedAttachment.fileName}
                      src={selectedAttachmentUrl}
                      className="h-[680px] w-full border-0 bg-slate-50"
                    />
                  ) : (
                    <div className="px-5 py-8">
                      <EmptyState
                        icon={FileText}
                        title="Preview is not available for this file type"
                        description="Open the document in a new tab to view it."
                      />
                    </div>
                  )
                ) : (
                  <div className="px-5 py-8">
                    <EmptyState
                      icon={FileText}
                      title="Document link unavailable"
                      description="This attachment does not include a file URL from the backend."
                    />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionCard>
  )
}
