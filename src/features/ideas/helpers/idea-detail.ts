import type { Comment as IdeaComment } from "@/types"

export function getCommentText(comment: { text?: string; content?: string }) {
  return comment.text || comment.content || "No comment content available."
}

export function getIdeaStatusLabel(status?: string) {
  return status?.replace(/_/g, " ") || "Pending review"
}

export function normalizeIdeaStatus(status?: string) {
  return status?.toLowerCase().replace(/\s+/g, "_")
}

export function getAttachmentUrl(url?: string) {
  return url?.trim() ? encodeURI(url) : ""
}

export function isPdfAttachment(fileName?: string, fileUrl?: string) {
  const normalizedName = fileName?.toLowerCase() ?? ""
  const normalizedUrl = fileUrl?.toLowerCase() ?? ""

  return normalizedName.endsWith(".pdf") || normalizedUrl.includes(".pdf")
}

export function isPdfFile(file: File) {
  const normalizedType = file.type.toLowerCase()
  const normalizedName = file.name.toLowerCase()

  return normalizedType === "application/pdf" || normalizedName.endsWith(".pdf")
}

export function mergeIdeaComments(
  apiComments: IdeaComment[] = [],
  postedComments: IdeaComment[] = [],
) {
  const mergedComments = [...postedComments]

  for (const comment of apiComments) {
    if (
      !mergedComments.some((postedComment) => postedComment.id === comment.id)
    ) {
      mergedComments.push(comment)
    }
  }

  return mergedComments
}
