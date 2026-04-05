import axios, { isAxiosError } from 'axios'
import type { AxiosInstance, Method } from 'axios'
import { auth } from '@/lib/auth'
import type { ApiRequestBody, ApiResponse, JsonObject, JsonValue } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_URL in .env')
}

type ApiQueryValue = string | number | boolean | null | undefined
type ApiQueryParams = Record<string, ApiQueryValue>

interface RequestOptions<TParams extends object = ApiQueryParams> {
  body?: ApiRequestBody
  headers?: Record<string, string>
  method?: Method
  params?: TParams
  signal?: AbortSignal
}

interface DownloadResponse {
  blob: Blob
  headers: Record<string, string | undefined>
}

class ApiClient {
  private http: AxiosInstance

  constructor(baseURL: string) {
    this.http = axios.create({
      baseURL,
      paramsSerializer: {
        serialize: (params) => this.serializeParams(params),
      },
    })
  }

  private normalizeQueryParamKey(key: string) {
    if (!key) {
      return key
    }

    return `${key[0].toUpperCase()}${key.slice(1)}`
  }

  private serializeParams(params?: object) {
    const searchParams = new URLSearchParams()

    if (!params) {
      return searchParams.toString()
    }

    Object.entries(params as Record<string, ApiQueryValue>).forEach(
      ([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return
        }

        searchParams.set(this.normalizeQueryParamKey(key), String(value))
      },
    )

    return searchParams.toString()
  }

  private isLoginEndpoint(endpoint: string) {
    return endpoint === '/Auth/login'
  }

  private buildHeaders(
    customHeaders?: Record<string, string>,
    body?: ApiRequestBody,
  ) {
    const headers: Record<string, string> = {
      ...(customHeaders ?? {}),
    }

    const token = auth.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    if (!(body instanceof FormData) && body !== undefined) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
    }

    return headers
  }

  private isJsonObject(
    value: object | JsonValue | FormData | Blob | undefined,
  ): value is JsonObject {
    return typeof value === 'object' && value !== null && !(value instanceof FormData) && !(value instanceof Blob) && !Array.isArray(value)
  }

  private getErrorMessage(
    payload: object | JsonValue | FormData | Blob | undefined,
    status: number,
  ) {
    if (typeof payload === 'string' && payload.trim()) {
      return payload
    }

    if (this.isJsonObject(payload)) {
      const record = payload
      const validationErrors = record.errors

      if (
        validationErrors &&
        typeof validationErrors === 'object' &&
        !Array.isArray(validationErrors)
      ) {
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

  private async getBlobErrorMessage(
    payload: object | JsonValue | Blob | FormData | undefined,
    status: number,
  ) {
    if (payload instanceof Blob) {
      try {
        const text = await payload.text()

        if (!text.trim()) {
          return `HTTP ${status}`
        }

        try {
          return this.getErrorMessage(JSON.parse(text) as JsonValue, status)
        } catch {
          return text
        }
      } catch {
        return `HTTP ${status}`
      }
    }

    return this.getErrorMessage(payload, status)
  }

  async request<T, TParams extends object = ApiQueryParams>(
    endpoint: string,
    options: RequestOptions<TParams> = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.http.request<T>({
        url: endpoint,
        method: options.method ?? 'GET',
        params: options.params as ApiQueryParams | undefined,
        data: options.body,
        headers: this.buildHeaders(options.headers, options.body),
        signal: options.signal,
      })

      return { success: true, data: (response.data ?? null) as T }
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status ?? 0
        const data = error.response?.data

        if (status === 401) {
          if (!this.isLoginEndpoint(endpoint)) {
            auth.logout()
            window.location.href = '/login'
          }

          return {
            success: false,
            error: this.getErrorMessage(data, status),
          }
        }

        return {
          success: false,
          error: this.getErrorMessage(data, status),
        }
      }

      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }
    }
  }

  async get<T, TParams extends object = ApiQueryParams>(
    endpoint: string,
    options: Omit<RequestOptions<TParams>, 'body' | 'method'> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T, TParams>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: ApiRequestBody): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
    })
  }

  async put<T>(endpoint: string, body?: ApiRequestBody): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async uploadFiles<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    })
  }

  async updateFiles<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: formData,
    })
  }

  async download(endpoint: string): Promise<ApiResponse<DownloadResponse>> {
    try {
      const response = await this.http.request<Blob>({
        url: endpoint,
        method: 'GET',
        responseType: 'blob',
        headers: this.buildHeaders(),
      })

      return {
        success: true,
        data: {
          blob: response.data,
          headers: {
            'content-disposition': response.headers['content-disposition'],
            'content-type': response.headers['content-type'],
          },
        },
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status ?? 0
        const data = error.response?.data

        if (status === 401) {
          auth.logout()
          window.location.href = '/login'
          return { success: false, error: 'Unauthorized' }
        }

        return {
          success: false,
          error: await this.getBlobErrorMessage(data, status),
        }
      }

      console.error('File download failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
