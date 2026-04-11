import { apiClient } from "./client"

function sanitizeFilename(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, "-").replace(/-+/g, "-")
}

function getFilenameFromDisposition(value: string | null) {
  if (!value) {
    return null
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i)

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const basicMatch = value.match(/filename="?([^"]+)"?/i)

  return basicMatch?.[1] ?? null
}

async function requestExport(
  endpoint: string,
  fallbackFilename: string,
): Promise<void> {
  try {
    const response = await apiClient.download(endpoint)

    if (!response.success || !response.data) {
      throw new Error(response.error ?? "Export failed")
    }
    const headerFilename = getFilenameFromDisposition(
      response.data.headers["content-disposition"] ?? null,
    )

    downloadBlob(response.data.blob, headerFilename ?? fallbackFilename)
  } catch (error) {
    console.error("Export error:", error)
    throw error
  }
}

export const exportService = {
  exportAllSubmissionsAsCSV: async (): Promise<void> => {
    return requestExport("/export/csv", "all-submissions.csv")
  },

  exportAllSubmissionsAsZip: async (): Promise<void> => {
    return requestExport("/export/zip", "all-submissions.zip")
  },

  exportSubmissionAsCSV: async (
    submissionId: string,
    submissionName?: string,
  ): Promise<void> => {
    const filename = sanitizeFilename(submissionName || submissionId)
    return requestExport(`/export/csv/${submissionId}`, `${filename}.csv`)
  },

  exportSubmissionAsZip: async (
    submissionId: string,
    submissionName?: string,
  ): Promise<void> => {
    const filename = sanitizeFilename(submissionName || submissionId)
    return requestExport(`/export/zip/${submissionId}`, `${filename}.zip`)
  },
}

// Helper function to download blob
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
