import { useEffect, useState } from 'react'

export interface FormPagerEntry {
  id: string
  created: string
  lastModified?: string
  title: string
  isLive: boolean
  language: string
  formToken: string
  admin: {
    id: string
    email: string
    username: string
  }
}

interface FormPagerData {
  pager: {
    entries: FormPagerEntry[]
    total: number
    limit: number
    start: number
  }
}

interface UseFormPagerOptions {
  variables?: {
    start?: number
    limit?: number
  }
  onCompleted?: (data: FormPagerData) => void
  onError?: (error: Error) => void
}

interface UseFormPagerResult {
  loading: boolean
  data: FormPagerData | null
  error: Error | null
  refetch: () => void
}

export const useFormPager = (options?: UseFormPagerOptions): UseFormPagerResult => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<FormPagerData | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchForms = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access')
      if (!token) {
        throw new Error('No access token')
      }

      const start = options?.variables?.start || 0
      const limit = options?.variables?.limit || 50

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
      const response = await fetch(`${API_URL}/forms?start=${start}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch forms')
      }

      const formsData = await response.json()
      const formattedData = {
        pager: {
          entries: formsData.entries,
          total: formsData.total,
          limit: formsData.limit,
          start: formsData.start,
        },
      }

      setData(formattedData)
      options?.onCompleted?.(formattedData)
    } catch (err) {
      setError(err as Error)
      setData(null)
      options?.onError?.(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForms()
  }, [options?.variables?.start, options?.variables?.limit])

  return { loading, data, error, refetch: fetchForms }
}

