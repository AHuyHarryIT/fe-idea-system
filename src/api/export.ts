import { auth } from '@/lib/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:5000/api'

async function requestExport(endpoint: string, filename: string): Promise<void> {
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
}

export const exportService = {
  // Admin exports
  exportAdminIdeasAsCSV: async (): Promise<void> => {
    return requestExport('/Export/csv', 'ideas.csv')
  },

  exportAdminIdeasAsZip: async (): Promise<void> => {
    return requestExport('/Export/zip', 'ideas.zip')
  },

  // QA Manager exports
  exportQAManagerIdeasAsCSV: async (): Promise<void> => {
    return requestExport('/Export/csv', 'ideas.csv')
  },

  exportQAManagerIdeasAsZip: async (): Promise<void> => {
    return requestExport('/Export/zip', 'ideas.zip')
  },

  // Public exports
  exportIdeasAsCSV: async (): Promise<void> => {
    return requestExport('/Export/csv', 'ideas.csv')
  },

  exportIdeasAsZip: async (): Promise<void> => {
    return requestExport('/Export/zip', 'ideas.zip')
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
