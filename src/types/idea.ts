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
  status?:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'pending_review'
    | 'approved'
    | 'rejected'
    | 'published'
    | 'closed'
}

export interface IdeaDetailModel extends IdeaSummary {
  brief?: string
  content?: string
  closureDate?: string
  finalClosureDate?: string
  canComment?: boolean
  canVote?: boolean
  attachments?: {
    id: string
    fileName: string
    fileSize?: string
  }[]
  comments?: {
    id: string
    authorName?: string
    content: string
    createdAt?: string
    isAnonymous?: boolean
  }[]
}

export interface IdeaSubmitPayload {
  title: string
  description: string
  hasAcceptedTerms: boolean
  // termversion: string
  categoryId: string
  // departmentId: string
  submissionId: string
  isAnonymous: boolean
  uploadFiles?: File[]
}
