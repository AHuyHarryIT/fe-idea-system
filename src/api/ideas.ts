import { apiClient } from './client'
import type {
  ApiResponse,
  Comment,
  CommentCreateRequest,
  Idea,
  IdeaCreateRequest,
  IdeaListQueryParams,
  IdeaListResponse,
  ReviewIdeaRequest,
  VoteRequest,
} from '@/types'

function getIdeasFromListResponse(data?: IdeaListResponse): Idea[] {
  if (!data) {
    return []
  }

  if (Array.isArray(data.items)) {
    return data.items.map(normalizeIdea)
  }

  if (Array.isArray(data.ideas)) {
    return data.ideas.map(normalizeIdea)
  }

  return []
}

function mapReviewStatusToStatus(value: unknown) {
  if (typeof value === 'number') {
    switch (value) {
      case 0:
        return 'pending_review'
      case 1:
        return 'approved'
      case 2:
        return 'rejected'
      default:
        return undefined
    }
  }

  if (typeof value === 'string' && value.trim()) {
    const numericValue = Number(value)

    if (Number.isFinite(numericValue)) {
      return mapReviewStatusToStatus(numericValue)
    }
  }

  return undefined
}

function normalizeIdea(idea: Idea): Idea {
  return {
    ...idea,
    text: idea.text ?? idea.title,
    status: idea.status ?? mapReviewStatusToStatus(idea.reviewStatus),
    commentCount:
      idea.commentCount ?? idea.commentsCount ?? idea.comments?.length ?? 0,
  }
}

function normalizeComment(comment: Comment): Comment {
  return {
    ...comment,
    content: comment.content ?? comment.text,
    createdDate: comment.createdDate ?? comment.createdAt,
  }
}

function isComment(value: Comment | { data?: Comment } | undefined): value is Comment {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'id' in value &&
      'isAnonymous' in value,
  )
}

function normalizeIdeaListResponse(
  data?: IdeaListResponse,
): IdeaListResponse | undefined {
  if (!data) {
    return data
  }

  const pagination = data.pagination
  const totalCount = data.totalCount ?? pagination?.totalCount
  const pageNumber = data.pageNumber ?? pagination?.pageNumber ?? 1
  const pageSize = data.pageSize ?? pagination?.pageSize ?? 0
  const totalPages = data.totalPages ?? pagination?.totalPages

  return {
    ...data,
    pagination,
    items: Array.isArray(data.items)
      ? data.items.map(normalizeIdea)
      : data.items,
    ideas: Array.isArray(data.ideas)
      ? data.ideas.map(normalizeIdea)
      : data.ideas,
    totalCount,
    total: data.total ?? totalCount,
    pageNumber,
    pageSize,
    totalPages,
  }
}

async function getAllIdeasFromEndpoint(
  endpoint: string,
  params: IdeaListQueryParams = {},
  pageSize: number = 100,
): Promise<ApiResponse<IdeaListResponse>> {
  const firstPageResponse = await apiClient.get<IdeaListResponse, IdeaListQueryParams>(
    endpoint,
    {
      params: {
        ...params,
        pageNumber: 1,
        pageSize,
      },
    },
  )

  if (!firstPageResponse.success) {
    return firstPageResponse
  }

  const normalizedFirstPage = normalizeIdeaListResponse(firstPageResponse.data)
  const collectedIdeas = getIdeasFromListResponse(normalizedFirstPage)
  const totalPages =
    normalizedFirstPage?.totalPages ??
    Math.max(
      1,
      Math.ceil(
        (normalizedFirstPage?.totalCount ?? collectedIdeas.length) / pageSize,
      ),
    )

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    const pageResponse = await apiClient.get<IdeaListResponse, IdeaListQueryParams>(
      endpoint,
      {
        params: {
          ...params,
          pageNumber,
          pageSize,
        },
      },
    )

    if (!pageResponse.success) {
      return { success: false, error: pageResponse.error }
    }

    const normalizedPage = normalizeIdeaListResponse(pageResponse.data)
    collectedIdeas.push(...getIdeasFromListResponse(normalizedPage))
  }

  return {
    success: true,
    data: {
      ...normalizedFirstPage,
      items: collectedIdeas,
      ideas: collectedIdeas,
      totalCount: normalizedFirstPage?.totalCount ?? collectedIdeas.length,
      pageNumber: 1,
      pageSize: collectedIdeas.length,
      totalPages: 1,
    },
  } satisfies ApiResponse<IdeaListResponse>
}

async function findIdeaByIdFromPagedList(
  id: string,
): Promise<ApiResponse<Idea>> {
  const pageSize = 100
  const firstPageResponse = await apiClient.get<IdeaListResponse>(
    `/ideas?PageNumber=1&PageSize=${pageSize}`,
  )

  if (!firstPageResponse.success) {
    return { success: false, error: firstPageResponse.error }
  }

  const firstPageIdeas = getIdeasFromListResponse(firstPageResponse.data)
  const firstMatch = firstPageIdeas.find((idea) => idea.id === id)

  if (firstMatch) {
    return { success: true, data: firstMatch } satisfies ApiResponse<Idea>
  }

  const totalPages =
    firstPageResponse.data?.totalPages ??
    Math.max(
      1,
      Math.ceil(
        (firstPageResponse.data?.totalCount ?? firstPageIdeas.length) /
          pageSize,
      ),
    )

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    const pageResponse = await apiClient.get<IdeaListResponse>(
      `/ideas?PageNumber=${pageNumber}&PageSize=${pageSize}`,
    )

    if (!pageResponse.success) {
      return { success: false, error: pageResponse.error }
    }

    const pageIdeas = getIdeasFromListResponse(pageResponse.data)
    const match = pageIdeas.find((idea) => idea.id === id)

    if (match) {
      return { success: true, data: match } satisfies ApiResponse<Idea>
    }
  }

  return {
    success: false,
    error: 'Idea not found in the current idea list.',
  } satisfies ApiResponse<Idea>
}

export const ideaService = {
  // Common endpoints
  getMyIdeas: async (
    params?: IdeaListQueryParams,
  ): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient
      .get<IdeaListResponse, IdeaListQueryParams>('/ideas/my-ideas', { params })
      .then((response) =>
        response.success
          ? {
              ...response,
              data: normalizeIdeaListResponse(response.data),
            }
          : response,
      ),

  getMyIdeasMatching: async (
    params?: IdeaListQueryParams,
  ): Promise<ApiResponse<IdeaListResponse>> =>
    getAllIdeasFromEndpoint('/ideas/my-ideas', params),

  getAllIdeasMatching: async (
    params?: IdeaListQueryParams,
  ): Promise<ApiResponse<IdeaListResponse>> =>
    getAllIdeasFromEndpoint('/ideas', params),

  getAllIdeas: async (
    params?: IdeaListQueryParams,
  ): Promise<ApiResponse<IdeaListResponse>> => {
    return apiClient
      .get<IdeaListResponse, IdeaListQueryParams>(`/ideas`, { params })
      .then((response) =>
        response.success
          ? {
              ...response,
              data: normalizeIdeaListResponse(response.data),
            }
          : response,
      )
  },

  getIdeaById: async (id: string): Promise<ApiResponse<Idea>> => {
    const directResponse = await apiClient.get<Idea>(`/ideas/${id}`)

    if (directResponse.success) {
      return {
        ...directResponse,
        data: directResponse.data
          ? normalizeIdea(directResponse.data)
          : undefined,
      }
    }

    if (directResponse.error !== 'HTTP 404') {
      return directResponse
    }

    return findIdeaByIdFromPagedList(id)
  },

  createIdea: (request: IdeaCreateRequest): Promise<ApiResponse<Idea>> =>
    apiClient.post<Idea>('/ideas', request),

  submitIdea: (formData: FormData): Promise<ApiResponse<Idea>> =>
    apiClient.uploadFiles<Idea>('/ideas', formData),

  voteOnIdea: (
    ideaId: string,
    request: VoteRequest,
  ): Promise<ApiResponse<void>> =>
    apiClient.post<void>(`/ideas/${ideaId}/vote`, request),

  addComment: (
    ideaId: string,
    request: CommentCreateRequest,
  ): Promise<ApiResponse<Comment>> =>
    apiClient
      .post<Comment | { data?: Comment }>(`/ideas/${ideaId}/comments`, request)
      .then((response) => {
        if (!response.success) {
          return response as ApiResponse<Comment>
        }

        const comment =
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data &&
          response.data.data
            ? response.data.data
            : isComment(response.data)
              ? response.data
              : undefined

        return {
          ...response,
          data: comment ? normalizeComment(comment) : undefined,
        }
      }),

  reviewIdea: (
    ideaId: string,
    request: ReviewIdeaRequest,
  ): Promise<ApiResponse<void>> =>
    apiClient.put<void>(`/ideas/${ideaId}/review`, {
      status: request.isApproved ? 1 : 2,
      rejectionReason: request.isApproved ? undefined : request.rejectionReason,
    }),

  // QA Manager endpoints
  getIdeasWithoutComments: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/Stats/ideas-without-comments'),
}
