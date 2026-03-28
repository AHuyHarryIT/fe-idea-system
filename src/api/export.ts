import { auth } from '@/lib/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:5000/api'

async function requestExport(endpoint: string, filename: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${auth.getToken() ?? ''}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Export failed (HTTP ${response.status})`)
    }

    const blob = await response.blob()
    downloadBlob(blob, filename)
  } catch (error) {
    console.error('Export error:', error)
    throw error
  }
}

export const exportService = {
  // Admin and QA Manager exports
  exportIdeasAsCSV: async (): Promise<void> => {
    return requestExport('/exports/csv', 'ideas.csv')
  },

  exportIdeasAsZip: async (): Promise<void> => {
    return requestExport('/exports/zip', 'ideas.zip')
  },

  // Alias methods for backwards compatibility
  exportAdminIdeasAsCSV: async (): Promise<void> => {
    return requestExport('/exports/csv', 'ideas.csv')
  },

  exportAdminIdeasAsZip: async (): Promise<void> => {
    return requestExport('/exports/zip', 'ideas.zip')
  },

  exportQAManagerIdeasAsCSV: async (): Promise<void> => {
    return requestExport('/exports/csv', 'ideas.csv')
  },

  exportQAManagerIdeasAsZip: async (): Promise<void> => {
    return requestExport('/exports/zip', 'ideas.zip')
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
