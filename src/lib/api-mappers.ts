// Provides mapping utilities that transform heterogeneous backend responses
// into stable front-end models. The mapping layer reduces direct coupling
// between UI components and variations in API response structure.
import type { Category } from '@/api/categories'
import type { Submission } from '@/api/submissions'
import type { IdeaDetailModel, IdeaSummary } from '@/types/idea'

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

function getNestedValue(record: UnknownRecord, keys: Array<string>) {
  let current: unknown = record

  for (const key of keys) {
    if (!isRecord(current)) {
      return undefined
    }

    current = current[key]
  }

  return current
}

// Extracts the first array-like collection discovered within a response object.
// This supports multiple wrapper conventions such as data, items, results, or ideas.
export function extractCollection<T = unknown>(
  value: unknown,
  keys: Array<string> = defaultCollectionKeys,
): Array<T> {
  if (Array.isArray(value)) {
    return value as Array<T>
  }

  if (!isRecord(value)) {
    return []
  }

  for (const key of keys) {
    const nested = value[key]

    if (Array.isArray(nested)) {
      return nested as Array<T>
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

// Extracts a single record from common API wrapper structures.
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

// Converts unknown input values into display-safe strings.
export function asString(value: unknown, fallback = '') {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return fallback
}

// Converts unknown input values into numeric values used by engagement metrics.
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

// Formats ISO-style dates into a human-readable label for the UI.
export function formatDateLabel(value: string | undefined, emptyLabel = '—') {
  if (!value) {
    return emptyLabel
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

// Maps summary-level idea data used by listing views and lightweight cards.
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

// Maps detailed idea data, including attachments and comments,
// into a unified model for the idea detail page.
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
        id: asString(attachmentRecord.id ?? attachmentRecord.fileId, `${index}`),
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
            getNestedValue(commentRecord, ['user', 'name']),
        ),
        content: asString(
          commentRecord.content ??
            commentRecord.text ??
            commentRecord.commentText,
        ),
        createdAt: asString(
          commentRecord.createdAt ?? commentRecord.createdDate,
        ),
        isAnonymous: asBoolean(commentRecord.isAnonymous),
      }
    }),
  }
}

// Maps category payloads into a simplified front-end category model.
export function mapCategory(value: unknown): Category {
  const record = extractRecord(value) ?? {}

  return {
    id: asString(record.id),
    name: asString(record.name, 'Unknown category'),
    description: asString(record.description),
  }
}

// Maps submission payloads and normalises date fields used by submission forms.
export function mapSubmission(value: unknown): Submission {
  const record = extractRecord(value) ?? {}

  return {
    id: asString(record.id),
    name: asString(record.name, 'Untitled submission'),
    closureDate: asString(record.closureDate),
    finalClosureDate: asString(record.finalClosureDate),
  }
}
