import { auth } from '@/lib/auth'

const IDEA_VOTE_STATUS_STORAGE_KEY = 'idea_system_vote_status'

export const IDEA_VOTE_STATUS_NONE = 0
export const IDEA_VOTE_STATUS_LIKED = 1
export const IDEA_VOTE_STATUS_DISLIKED = 2

type StoredIdeaVoteStatuses = Record<string, number>

function getIdeaVoteStorageKey() {
  const userId = auth.getUserId()

  return userId
    ? `${IDEA_VOTE_STATUS_STORAGE_KEY}:${userId}`
    : IDEA_VOTE_STATUS_STORAGE_KEY
}

function isStoredIdeaVoteStatuses(
  value: Record<string, number> | null | undefined,
): value is StoredIdeaVoteStatuses {
  if (!value) {
    return false
  }

  return Object.values(value).every(
    (status) =>
      typeof status === 'number' &&
      [
        IDEA_VOTE_STATUS_NONE,
        IDEA_VOTE_STATUS_LIKED,
        IDEA_VOTE_STATUS_DISLIKED,
      ].includes(status),
  )
}

function readStoredIdeaVoteStatuses() {
  try {
    const rawValue = localStorage.getItem(getIdeaVoteStorageKey())

    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue) as Record<string, number> | null

    return isStoredIdeaVoteStatuses(parsedValue) ? parsedValue : {}
  } catch {
    return {}
  }
}

function writeStoredIdeaVoteStatuses(statuses: StoredIdeaVoteStatuses) {
  const storageKey = getIdeaVoteStorageKey()

  if (Object.keys(statuses).length === 0) {
    localStorage.removeItem(storageKey)
    return
  }

  localStorage.setItem(storageKey, JSON.stringify(statuses))
}

export function normalizeIdeaThumbStatus(value?: number) {
  if (value === IDEA_VOTE_STATUS_LIKED || value === IDEA_VOTE_STATUS_DISLIKED) {
    return value
  }

  return IDEA_VOTE_STATUS_NONE
}

export function getStoredIdeaVoteStatus(ideaId: string) {
  const statuses = readStoredIdeaVoteStatuses()

  return ideaId in statuses ? normalizeIdeaThumbStatus(statuses[ideaId]) : undefined
}

export function getResolvedIdeaVoteStatus(ideaId: string, apiThumbStatus?: number) {
  const storedStatus = getStoredIdeaVoteStatus(ideaId)

  if (typeof storedStatus === 'number') {
    return storedStatus
  }

  return normalizeIdeaThumbStatus(apiThumbStatus)
}

export function setStoredIdeaVoteStatus(ideaId: string, status: number) {
  const statuses = readStoredIdeaVoteStatuses()
  const normalizedStatus = normalizeIdeaThumbStatus(status)

  if (normalizedStatus === IDEA_VOTE_STATUS_NONE) {
    delete statuses[ideaId]
  } else {
    statuses[ideaId] = normalizedStatus
  }

  writeStoredIdeaVoteStatuses(statuses)
}

export function getNextIdeaVoteState(
  previousThumbStatus: number,
  isThumbsUp: boolean,
  thumbsUpCount: number,
  thumbsDownCount: number,
) {
  const normalizedPreviousStatus = normalizeIdeaThumbStatus(previousThumbStatus)
  let nextThumbStatus = IDEA_VOTE_STATUS_NONE
  let nextThumbsUpCount = thumbsUpCount
  let nextThumbsDownCount = thumbsDownCount

  if (isThumbsUp) {
    if (normalizedPreviousStatus === IDEA_VOTE_STATUS_LIKED) {
      nextThumbStatus = IDEA_VOTE_STATUS_NONE
      nextThumbsUpCount = Math.max(0, thumbsUpCount - 1)
    } else if (normalizedPreviousStatus === IDEA_VOTE_STATUS_DISLIKED) {
      nextThumbStatus = IDEA_VOTE_STATUS_LIKED
      nextThumbsUpCount = thumbsUpCount + 1
      nextThumbsDownCount = Math.max(0, thumbsDownCount - 1)
    } else {
      nextThumbStatus = IDEA_VOTE_STATUS_LIKED
      nextThumbsUpCount = thumbsUpCount + 1
    }
  } else if (normalizedPreviousStatus === IDEA_VOTE_STATUS_DISLIKED) {
    nextThumbStatus = IDEA_VOTE_STATUS_NONE
    nextThumbsDownCount = Math.max(0, thumbsDownCount - 1)
  } else if (normalizedPreviousStatus === IDEA_VOTE_STATUS_LIKED) {
    nextThumbStatus = IDEA_VOTE_STATUS_DISLIKED
    nextThumbsUpCount = Math.max(0, thumbsUpCount - 1)
    nextThumbsDownCount = thumbsDownCount + 1
  } else {
    nextThumbStatus = IDEA_VOTE_STATUS_DISLIKED
    nextThumbsDownCount = thumbsDownCount + 1
  }

  return {
    nextThumbStatus,
    nextThumbsUpCount,
    nextThumbsDownCount,
  }
}

export function resolveIdeaVoteStateFromCounts(
  isThumbsUp: boolean,
  previousThumbStatus: number,
  previousThumbsUpCount: number,
  previousThumbsDownCount: number,
  refreshedThumbsUpCount: number,
  refreshedThumbsDownCount: number,
) {
  const normalizedPreviousStatus = normalizeIdeaThumbStatus(previousThumbStatus)
  const upvoteDelta = refreshedThumbsUpCount - previousThumbsUpCount
  const downvoteDelta = refreshedThumbsDownCount - previousThumbsDownCount

  if (isThumbsUp) {
    if (upvoteDelta < 0) {
      return {
        nextThumbStatus: IDEA_VOTE_STATUS_NONE,
        nextThumbsUpCount: refreshedThumbsUpCount,
        nextThumbsDownCount: refreshedThumbsDownCount,
      }
    }

    if (upvoteDelta > 0 || downvoteDelta < 0) {
      return {
        nextThumbStatus: IDEA_VOTE_STATUS_LIKED,
        nextThumbsUpCount: refreshedThumbsUpCount,
        nextThumbsDownCount: refreshedThumbsDownCount,
      }
    }
  } else {
    if (downvoteDelta < 0) {
      return {
        nextThumbStatus: IDEA_VOTE_STATUS_NONE,
        nextThumbsUpCount: refreshedThumbsUpCount,
        nextThumbsDownCount: refreshedThumbsDownCount,
      }
    }

    if (downvoteDelta > 0 || upvoteDelta < 0) {
      return {
        nextThumbStatus: IDEA_VOTE_STATUS_DISLIKED,
        nextThumbsUpCount: refreshedThumbsUpCount,
        nextThumbsDownCount: refreshedThumbsDownCount,
      }
    }
  }

  return {
    nextThumbStatus: normalizedPreviousStatus,
    nextThumbsUpCount: refreshedThumbsUpCount,
    nextThumbsDownCount: refreshedThumbsDownCount,
  }
}

export function getIdeaVoteFeedbackMessage(
  isThumbsUp: boolean,
  nextThumbStatus: number,
  previousThumbStatus: number,
) {
  const normalizedPreviousStatus = normalizeIdeaThumbStatus(previousThumbStatus)

  if (isThumbsUp) {
    if (nextThumbStatus === IDEA_VOTE_STATUS_NONE) {
      return 'Your like has been removed.'
    }

    if (normalizedPreviousStatus === IDEA_VOTE_STATUS_DISLIKED) {
      return 'Your vote has been changed to like.'
    }

    return 'Thanks! Your like has been recorded.'
  }

  if (nextThumbStatus === IDEA_VOTE_STATUS_NONE) {
    return 'Your dislike has been removed.'
  }

  if (normalizedPreviousStatus === IDEA_VOTE_STATUS_LIKED) {
    return 'Your vote has been changed to dislike.'
  }

  return 'Thanks! Your dislike has been recorded.'
}
