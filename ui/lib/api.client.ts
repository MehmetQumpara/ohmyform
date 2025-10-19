import getConfig from 'next/config'
import { NextConfigType } from '../next.config.type'

interface RequestOptions extends RequestInit {
  params?: Record<string, any>
}

class ApiClient {
  private baseUrl: string

  constructor() {
    const config = getConfig() as NextConfigType
    
    if (typeof window === 'undefined') {
      // Server-side
      this.baseUrl = config?.serverRuntimeConfig?.apiBase || 'http://localhost:4000'
    } else {
      // Client-side
      this.baseUrl = config?.publicRuntimeConfig?.apiBase || 'http://localhost:4000'
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    return localStorage.getItem('access')
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, headers = {}, ...restOptions } = options

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const queryString = new URLSearchParams(params).toString()
      url = `${url}?${queryString}`
    }

    // Add auth token if available
    const token = this.getAuthToken()
    const authHeaders: Record<string, string> = {}
    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }))
      throw new Error(error.message || `Request failed: ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
