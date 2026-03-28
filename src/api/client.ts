import { auth } from '@/lib/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_URL in .env')
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = auth.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return null
    }

    const contentType = response.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      return response.json()
    }

    const text = await response.text()

    if (!text) {
      return null
    }

    try {
      return JSON.parse(text) as unknown
    } catch {
      return text
    }
  }

  private getErrorMessage(payload: unknown, status: number) {
    if (typeof payload === 'string' && payload.trim()) {
      return payload
    }

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>
      const validationErrors = record.errors

      if (validationErrors && typeof validationErrors === 'object') {
        const messages = Object.values(validationErrors)
          .flatMap((value) => {
            if (Array.isArray(value)) {
              return value.filter(
                (item): item is string =>
                  typeof item === 'string' && item.trim().length > 0,
              )
            }

            if (typeof value === 'string' && value.trim()) {
              return [value]
            }

            return []
          })
          .filter((message, index, list) => list.indexOf(message) === index)

        if (messages.length) {
          return messages.join(' ')
        }
      }

      const message =
        record.message ?? record.error ?? record.title ?? record.detail

      if (typeof message === 'string' && message.trim()) {
        return message
      }
    }

    return `HTTP ${status}`
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      })

      if (response.status === 401) {
        auth.logout()
        window.location.href = '/login'
        return { success: false, error: 'Unauthorized' }
      }

      const data = await this.parseResponseBody(response)

      if (!response.ok) {
        return {
          success: false,
          error: this.getErrorMessage(data, response.status),
        }
      }

      return { success: true, data: data as T }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async uploadFiles<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    try {
      const token = auth.getToken()
      const headers: HeadersInit = {}

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (response.status === 401) {
        auth.logout()
        window.location.href = '/login'
        return { success: false, error: 'Unauthorized' }
      }

      const data = await this.parseResponseBody(response)

      if (!response.ok) {
        return {
          success: false,
          error: this.getErrorMessage(data, response.status),
        }
      }

      return { success: true, data: data as T }
    } catch (error) {
      console.error('File upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
