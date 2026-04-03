import type { IdeaCategory, Submission } from '@/types'
import type { IdeaDetailModel, IdeaSummary } from '@/types/idea'
import { formatAppDate } from '@/lib/date'

type UnknownRecord = Record<string, unknown>

const defaultCollectionKeys = [
  'data',
  'items',
  'results',
  'ideas',
  'users',
  'categories',
  'submissions',
  'comments',
  'attachments',
]

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function getNestedValue(record: UnknownRecord, keys: string[]) {
  let current: unknown = record

  for (const key of keys) {
    if (!isRecord(current)) {
      return undefined
    }

    current = current[key]
  }

  return current
}

export function extractCollection<T = unknown>(
  value: unknown,
  keys: string[] = defaultCollectionKeys,
): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }

  if (!isRecord(value)) {
    return []
  }

  for (const key of keys) {
    const nested = value[key]

    if (Array.isArray(nested)) {
      return nested as T[]
    }
  }

  for (const key of keys) {
    const nested = value[key]

    if (isRecord(nested)) {
      const collection = extractCollection<T>(nested, keys)

      if (collection.length > 0) {
        return collection
      }
    }
  }

  return []
}

export function extractRecord(value: unknown): UnknownRecord | null {
  if (isRecord(value)) {
    for (const key of ['data', 'result', 'item']) {
      const nested = value[key]

      if (isRecord(nested)) {
        return nested
      }
    }

    return value
  }

  return null
}

export function asString(value: unknown, fallback = '') {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return fallback
}

export function asNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function asOptionalString(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  return undefined
}

function asOptionalNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

function asBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return fallback
}

function normalizeIdeaStatus(value: unknown): IdeaSummary['status'] {
  const status = asString(value)
    .toLowerCase()
    .replace(/[^a-z]/g, '')

  switch (status) {
    case 'draft':
      return 'draft'
    case 'submitted':
    case 'pending':
      return 'submitted'
    case 'underreview':
    case 'review':
    case 'moderation':
      return 'under_review'
    case 'published':
    case 'approved':
      return 'published'
    case 'closed':
    case 'archived':
      return 'closed'
    default:
      return undefined
  }
}

export function formatDateLabel(value: string | undefined, emptyLabel = '—') {
  return formatAppDate(value, emptyLabel)
}

export function mapIdeaSummary(value: unknown): IdeaSummary {
  const record = extractRecord(value) ?? {}
  const comments = extractCollection(record.comments ?? record.commentList)

  return {
    id: asString(record.id ?? record.ideaId),
    title: asString(
      record.title ?? record.text ?? record.name,
      'Untitled idea',
    ),
    categoryName: asString(
      record.categoryName ?? getNestedValue(record, ['category', 'name']),
    ),
    departmentName: asString(
      record.departmentName ??
        getNestedValue(record, ['department', 'name']) ??
        getNestedValue(record, ['userDepartment', 'name']),
    ),
    authorName: asString(
      record.authorName ??
        record.createdBy ??
        getNestedValue(record, ['author', 'name']) ??
        getNestedValue(record, ['user', 'name']),
    ),
    isAnonymous: asBoolean(record.isAnonymous),
    totalLikes: asNumber(
      record.totalLikes ?? record.likes ?? record.votes ?? record.voteCount,
    ),
    totalViews: asNumber(record.totalViews ?? record.views ?? record.viewCount),
    totalComments: asNumber(
      record.totalComments ?? record.commentsCount,
      comments.length,
    ),
    createdAt: asString(
      record.createdAt ?? record.createdDate ?? record.submittedAt,
    ),
    status: normalizeIdeaStatus(record.status ?? record.ideaStatus),
  }
}

export function mapIdeaDetail(value: unknown): IdeaDetailModel {
  const record = extractRecord(value) ?? {}
  const summary = mapIdeaSummary(record)
  const attachments = extractCollection(record.attachments ?? record.files)
  const comments = extractCollection(
    record.comments ??
      record.commentList ??
      record.commentDtos ??
      record.commentsDto ??
      record.ideaComments,
  )
  return {
    ...summary,
    brief: asString(record.brief ?? record.summary ?? record.shortDescription),
    content: asString(
      record.content ?? record.description ?? record.fullDescription,
    ),
    closureDate: asString(
      record.closureDate ??
        getNestedValue(record, ['submission', 'closureDate']),
    ),
    finalClosureDate: asString(
      record.finalClosureDate ??
        getNestedValue(record, ['submission', 'finalClosureDate']),
    ),
    canComment: asBoolean(record.canComment, true),
    canVote: asBoolean(record.canVote ?? record.canComment, true),
    attachments: attachments.map((attachment, index) => {
      const attachmentRecord = extractRecord(attachment) ?? {}

      return {
        id: asString(
          attachmentRecord.id ?? attachmentRecord.fileId,
          `${index}`,
        ),
        fileName: asString(
          attachmentRecord.fileName ?? attachmentRecord.name,
          `Attachment ${index + 1}`,
        ),
        fileSize: asString(attachmentRecord.fileSize ?? attachmentRecord.size),
      }
    }),
    comments: comments.map((comment, index) => {
      const commentRecord = extractRecord(comment) ?? {}

      return {
        id: asString(commentRecord.id ?? commentRecord.commentId, `${index}`),
        authorName: asString(
          commentRecord.authorName ??
            commentRecord.createdBy ??
            commentRecord.userName ??
            getNestedValue(commentRecord, ['author', 'name']) ??
            getNestedValue(commentRecord, ['user', 'fullName']),
        ),
        content: asString(
          commentRecord.content ??
            commentRecord.text ??
            commentRecord.commentText ??
            commentRecord.description,
        ),
        createdAt: asString(
          commentRecord.createdAt ??
            commentRecord.createdDate ??
            commentRecord.commentDate,
        ),
        isAnonymous: asBoolean(commentRecord.isAnonymous),
      }
    }),
  }
}

export function mapCategory(value: unknown): IdeaCategory {
  const record = extractRecord(value) ?? {}

  return {
    id: asString(record.id),
    name: asString(record.name, 'Unnamed category'),
  }
}

export function mapSubmission(value: unknown): Submission {
  const record = extractRecord(value) ?? {}

  return {
    id: asString(record.id),
    name: asString(record.name, 'Untitled submission'),
    description: asOptionalString(record.description),
    academicYear: asOptionalNumber(record.academicYear),
    closureDate: asString(record.closureDate),
    finalClosureDate: asString(record.finalClosureDate),
  }
}
