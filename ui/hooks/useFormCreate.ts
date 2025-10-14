import { useState } from 'react'
import { FormFragment } from './useFormQuery'

export interface FormCreateInput {
  title: string
  language: string
  showFooter?: boolean
  anonymousSubmission?: boolean
  isLive?: boolean
  layout?: string
  startPage?: {
    show?: boolean
    title?: string
    paragraph?: string
    buttonText?: string
    buttons?: any[]
  }
  endPage?: {
    show?: boolean
    title?: string
    paragraph?: string
    buttonText?: string
    buttons?: any[]
  }
}

interface UseFormCreateResult {
  createForm: (input: FormCreateInput) => Promise<FormFragment | null>
  loading: boolean
  error: Error | null
}

export const useFormCreate = (): UseFormCreateResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createForm = async (input: FormCreateInput): Promise<FormFragment | null> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access')
      if (!token) {
        throw new Error('No access token found')
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
      const response = await fetch(`${API_URL}/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        // Try to extract a meaningful error from JSON or text
        let message = 'Failed to create form'
        try {
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const errorData = await response.json()
            message = (errorData && (errorData.message || errorData.error)) || message
          } else {
            const text = await response.text()
            if (text) message = text
          }
        } catch {}
        throw new Error(message)
      }

      // Prefer JSON when available; if not, handle 201 + Location fallback
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const result: FormFragment = await response.json()
        return result
      }

      // If body is empty but we have a Location header, refetch the resource
      if ((response.status === 201 || response.status === 200)) {
        try {
          const locationUrl = response.headers.get('location')
          if (locationUrl) {
            const token2 = localStorage.getItem('access')
            const follow = await fetch(locationUrl, {
              headers: {
                Authorization: `Bearer ${token2}`,
              },
            })
            if (follow.ok) {
              const followType = follow.headers.get('content-type') || ''
              if (followType.includes('application/json')) {
                const result: FormFragment = await follow.json()
                return result
              }
            }
          }
        } catch {}
      }

      // As a last resort, attempt to parse JSON; if it fails, return null to signal failure
      try {
        const result: FormFragment = await response.json()
        return result
      } catch {
        return null
      }
    } catch (e) {
      setError(e as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createForm, loading, error }
}

