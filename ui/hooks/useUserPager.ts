import { useEffect, useState } from 'react'

export interface UserPagerEntry {
  id: string
  username: string
  email: string
  roles: string[]
  firstName?: string
  lastName?: string
  language: string
  emailVerified: boolean
  created: string
  lastModified?: string
}

interface UserPagerData {
  entries: UserPagerEntry[]
  total: number
  limit: number
  start: number
}

interface UseUserPagerVariables {
  start?: number
  limit?: number
}

interface UseUserPagerResult {
  data: { pager: UserPagerData } | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

interface UseUserPagerOptions {
  variables?: UseUserPagerVariables
  onCompleted?: (data: { pager: UserPagerData }) => void
  onError?: (error: Error) => void
}

export const useUserPager = (options?: UseUserPagerOptions): UseUserPagerResult => {
  const [data, setData] = useState<{ pager: UserPagerData } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  const refetch = () => setRefetchIndex(prev => prev + 1)

  useEffect(() => {
    const fetchUsers = async () => {
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

        const response = await fetch(`${API_URL}/users?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const usersData: UserPagerData = await response.json()
        const result = { pager: usersData }
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

    fetchUsers()
  }, [options?.variables?.start, options?.variables?.limit, refetchIndex])

  return { data, loading, error, refetch }
}

