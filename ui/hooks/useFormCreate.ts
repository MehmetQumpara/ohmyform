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
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create form')
      }

      const result: FormFragment = await response.json()
      return result
    } catch (e) {
      setError(e as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createForm, loading, error }
}

