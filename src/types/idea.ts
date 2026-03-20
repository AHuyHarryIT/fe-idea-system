// Defines shared front-end data contracts for idea-related workflows.
// These interfaces support consistent typing across listing, detail, and submission pages.
export interface IdeaSummary {
  id: string
  title: string
  categoryName?: string
  departmentName?: string
  authorName?: string
  isAnonymous?: boolean
  totalLikes?: number
  totalViews?: number
  totalComments?: number
  createdAt?: string
  status?: 'draft' | 'submitted' | 'under_review' | 'published' | 'closed'
}

// Represents the complete idea detail model consumed by the detail view.
export interface IdeaDetailModel extends IdeaSummary {
  brief?: string
  content?: string
  closureDate?: string
  finalClosureDate?: string
  canComment?: boolean
  canVote?: boolean
  attachments?: Array<{
    id: string
    fileName: string
    fileSize?: string
  }>
  comments?: Array<{
    id: string
    authorName?: string
    content: string
    createdAt?: string
    isAnonymous?: boolean
  }>
}

// Represents the payload structure used when submitting a new idea.
export interface IdeaSubmitPayload {
  title: string
  brief: string
  content: string
  categoryId: string
  submissionId: string
  isAnonymous: boolean
  attachments: Array<File>
}
