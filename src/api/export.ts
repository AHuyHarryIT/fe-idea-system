import { auth } from '@/lib/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:5000/api'

function sanitizeFilename(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-')
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

async function getErrorMessage(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      const payload = (await response.json()) as Record<string, unknown>
      const message =
        payload.message ?? payload.error ?? payload.title ?? payload.detail

      if (typeof message === 'string' && message.trim()) {
        return message
      }
    } catch {
      return `Export failed (HTTP ${response.status})`
    }
  }

  try {
    const text = await response.text()

    if (text.trim()) {
      return text
    }
  } catch {
    return `Export failed (HTTP ${response.status})`
  }

  return `Export failed (HTTP ${response.status})`
}

async function requestExport(
  endpoint: string,
  fallbackFilename: string,
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${auth.getToken() ?? ''}`,
      },
    })

    if (!response.ok) {
      throw new Error(await getErrorMessage(response))
    }

    const blob = await response.blob()
    const headerFilename = getFilenameFromDisposition(
      response.headers.get('content-disposition'),
    )

    downloadBlob(blob, headerFilename ?? fallbackFilename)
  } catch (error) {
    console.error('Export error:', error)
    throw error
  }
}

export const exportService = {
  exportIdeasAsCSV: async (): Promise<void> => {
    return requestExport('/export/csv', 'ideas.csv')
  },

  exportIdeasAsZip: async (): Promise<void> => {
    return requestExport('/export/zip', 'ideas.zip')
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

  exportAdminIdeasAsCSV: async (): Promise<void> => {
    return requestExport('/export/csv', 'ideas.csv')
  },

  exportAdminIdeasAsZip: async (): Promise<void> => {
    return requestExport('/export/zip', 'ideas.zip')
  },

  exportQAManagerIdeasAsCSV: async (): Promise<void> => {
    return requestExport('/export/csv', 'ideas.csv')
  },

  exportQAManagerIdeasAsZip: async (): Promise<void> => {
    return requestExport('/export/zip', 'ideas.zip')
  },
}

// Helper function to download blob
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
