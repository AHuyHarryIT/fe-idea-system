export interface Idea {
  id: string
  text?: string
  title?: string
  description?: string
  categoryId?: string
  categoryName: string
  submissionId?: string
  submissionName?: string
  votes?: number
  commentsCount?: number
  thumbsUpCount?: number
  thumbsDownCount?: number
  thumbStatus?: number
  commentCount?: number
  isAnonymous: boolean
  createdBy?: string
  authorName?: string
  createdAt?: string
  createdDate?: string
  status?: string
  reviewStatus?: number
  rejectionReason?: string
  viewCount?: number
  canComment?: boolean
  departmentName?: string
  comments?: Comment[]
  attachments?: {
    id: string
    fileName: string
    fileSize?: string
  }[]
}

export interface IdeaListResponse {
  items?: Idea[]
  ideas?: Idea[]
  pagination?: IdeaListPagination
  totalCount?: number
  total?: number
  pageNumber?: number
  pageSize?: number
  totalPages?: number
}

export interface IdeaListPagination {
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface IdeaListQueryParams {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  submissionId?: string
  sortBy?: string
  departmentId?: string
  reviewStatus?: number
}

export interface IdeaCreateRequest {
  text: string
  description?: string
  categoryId: string
  submissionId?: string
  isAnonymous?: boolean
}

export interface Comment {
  id: string
  text?: string
  content?: string
  isAnonymous: boolean
  createdBy?: string
  authorName?: string
  createdAt?: string
  createdDate?: string
}

export interface CommentCreateRequest {
  content: string
  isAnonymous: boolean
}

export interface VoteRequest {
  isThumbsUp?: boolean
}

export interface ReviewIdeaRequest {
  isApproved: boolean
  rejectionReason?: string
}

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
