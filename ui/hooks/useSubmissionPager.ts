import { useEffect, useState } from 'react'

export interface SubmissionField {
  id: string
  field: string
  content: string
}

export interface SubmissionEntry {
  id: string
  created: string
  lastModified?: string
  timeElapsed: number
  percentageComplete: number
  geoLocation?: {
    city?: string
    country?: string
  }
  ipAddr?: string
  device: {
    type: string
    name: string
  }
  fields: SubmissionField[]
}

interface SubmissionPagerData {
  entries: SubmissionEntry[]
  total: number
  limit: number
  start: number
  form: {
    id: string
    title: string
    language: string
  }
}

interface UseSubmissionPagerVariables {
  form: string
  start?: number
  limit?: number
  filter?: {
    excludeEmpty?: boolean
  }
}

interface UseSubmissionPagerResult {
  data: { pager: SubmissionPagerData; form: any } | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

interface UseSubmissionPagerOptions {
  variables?: UseSubmissionPagerVariables
  onCompleted?: (data: { pager: SubmissionPagerData; form: any }) => void
  onError?: (error: Error) => void
}

export const useSubmissionPager = (options?: UseSubmissionPagerOptions): UseSubmissionPagerResult => {
  const [data, setData] = useState<{ pager: SubmissionPagerData; form: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  const refetch = () => setRefetchIndex(prev => prev + 1)

  useEffect(() => {
    if (!options?.variables?.form) {
      setLoading(false)
      return
    }

    const fetchSubmissions = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('access')
        if (!token) {
          throw new Error('No access token found')
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
        const params = new URLSearchParams()
        if (options?.variables?.start !== undefined) {
          params.append('start', options.variables.start.toString())
        }
        if (options?.variables?.limit !== undefined) {
          params.append('limit', options.variables.limit.toString())
        }
        if (options?.variables?.filter?.excludeEmpty) {
          params.append('excludeEmpty', 'true')
        }

        const response = await fetch(
          `${API_URL}/forms/${options.variables.form}/submissions?${params.toString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch submissions')
        }

        const submissionsData = await response.json()
        const result = {
          pager: {
            entries: submissionsData.entries,
            total: submissionsData.total,
            limit: submissionsData.limit,
            start: submissionsData.start,
            form: submissionsData.form,
          },
          form: submissionsData.form,
        }
        setData(result)
        options?.onCompleted?.(result)
      } catch (e) {
        setError(e as Error)
        setData(null)
        options?.onError?.(e as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [
    options?.variables?.form,
    options?.variables?.start,
    options?.variables?.limit,
    options?.variables?.filter?.excludeEmpty,
    refetchIndex,
  ])

  return { data, loading, error, refetch }
}

