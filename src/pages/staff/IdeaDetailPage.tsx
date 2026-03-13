import { MessageSquare, Paperclip, ThumbsUp } from 'lucide-react'
import { AppButton } from '@/components/app/AppButton'
import { FormField } from '@/components/forms/FormField'
import { FormTextarea } from '@/components/forms/FormInput'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'

interface IdeaDetailPageProps {
  ideaId: string
}

export default function IdeaDetailPage({ ideaId }: IdeaDetailPageProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Idea Detail"
        description={`Detail page shell for idea #${ideaId}. Later, load record detail, comments, attachments, and reactions by ID.`}
        actions={
          <>
            <AppButton variant="ghost">
              <ThumbsUp className="mr-2 h-4 w-4" />
              Like
            </AppButton>
            <AppButton>
              <MessageSquare className="mr-2 h-4 w-4" />
              Add comment
            </AppButton>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <SectionCard
          title="Main content"
          description="Title, brief, and full content can be rendered here from the idea detail DTO."
        >
          <div className="space-y-4 text-sm leading-7 text-slate-600">
            <div className="rounded-xl bg-slate-50 p-4">Title placeholder</div>
            <div className="rounded-xl bg-slate-50 p-4">
              Brief summary placeholder
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              Full idea content placeholder
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="Meta information"
            description="Category, department, author, publish status, closure date, and counters fit well here."
          >
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 p-4">
                Category placeholder
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                Department placeholder
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                Status placeholder
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                Created date placeholder
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Attachments"
            description="Use multipart file metadata from backend."
          >
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <Paperclip className="h-4 w-4" />
              No attachment loaded yet.
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Comments"
          description="Comment list and posting form shell."
        >
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Comments will appear here after binding to the idea comment
              endpoint.
            </div>
            <div>
              <FormField label="Write a comment">
                <FormTextarea placeholder="Enter comment content" />
              </FormField>
              <AppButton className="mt-4">Post comment</AppButton>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
