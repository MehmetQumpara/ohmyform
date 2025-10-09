import { useState } from 'react'
import { FormFragment } from './useFormQuery'

export interface FormUpdateInput {
  id: string
  title?: string
  language?: string
  showFooter?: boolean
  anonymousSubmission?: boolean
  isLive?: boolean
  fields?: any[]
  hooks?: any[]
  design?: {
    colors?: {
      background?: string
      question?: string
      answer?: string
      button?: string
      buttonActive?: string
      buttonText?: string
    }
    font?: string
    layout?: string
  }
  startPage?: {
    id?: string
    show?: boolean
    title?: string
    paragraph?: string
    buttonText?: string
    buttons?: any[]
  }
  endPage?: {
    id?: string
    show?: boolean
    title?: string
    paragraph?: string
    buttonText?: string
    buttons?: any[]
  }
  notifications?: any[]
}

interface UseFormUpdateResult {
  updateForm: (input: FormUpdateInput) => Promise<FormFragment | null>
  loading: boolean
  error: Error | null
}

export const useFormUpdate = (): UseFormUpdateResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateForm = async (input: FormUpdateInput): Promise<FormFragment | null> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access')
      if (!token) {
        throw new Error('No access token found')
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
      const response = await fetch(`${API_URL}/forms/${input.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update form')
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

  return { updateForm, loading, error }
}

