import { getDateTimestamp } from "@/utils/date"

export const DEFAULT_SUBMISSION_PAGE_SIZE = 10
export const SUBMISSION_PAGE_SIZE_OPTIONS = ["10", "20", "50"]
export const MAX_FILE_SIZE_MB = 5
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export function isSubmissionClosed(closureDate?: string) {
  const closureTimestamp = getDateTimestamp(closureDate)

  return closureTimestamp > 0 && closureTimestamp < Date.now()
}

export function isPdfFile(file: File) {
  const normalizedType = file.type.toLowerCase()
  const normalizedName = file.name.toLowerCase()

  return normalizedType === "application/pdf" || normalizedName.endsWith(".pdf")
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (!isPdfFile(file)) {
    return {
      valid: false,
      error: `File '${file.name}' is invalid. Only PDF files are allowed.`,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File '${file.name}' exceeds the maximum size of ${MAX_FILE_SIZE_MB}MB.`,
    }
  }

  return { valid: true }
}

export enum FileValidationErrorType {
  WRONG_FILE_TYPE = "WRONG_FILE_TYPE",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  EMPTY_FILE = "EMPTY_FILE",
  UNKNOWN = "UNKNOWN",
}

export interface FileValidationError {
  type: FileValidationErrorType
  fileName: string
  message: string
  details?: string
}

export function validateFileWithDetails(
  file: File,
): { valid: boolean; error?: FileValidationError } {
  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        type: FileValidationErrorType.EMPTY_FILE,
        fileName: file.name,
        message: `File '${file.name}' is empty.`,
        details: "Please upload a file with content.",
      },
    }
  }

  // Check file type
  if (!isPdfFile(file)) {
    return {
      valid: false,
      error: {
        type: FileValidationErrorType.WRONG_FILE_TYPE,
        fileName: file.name,
        message: `File '${file.name}' has an invalid format.`,
        details: `Only PDF files are supported. You selected a ${file.type || "file with no extension"}. Ensure the file has a .pdf extension.`,
      },
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: {
        type: FileValidationErrorType.FILE_TOO_LARGE,
        fileName: file.name,
        message: `File '${file.name}' is too large (${fileSizeMB}MB).`,
        details: `Maximum file size is ${MAX_FILE_SIZE_MB}MB. Please compress or split the file.`,
      },
    }
  }

  return { valid: true }
}
