import { useEffect, useState } from 'react'

export interface UserData {
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

interface UseUserQueryVariables {
  id: string
}

interface UseUserQueryResult {
  data: { user: UserData } | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

interface UseUserQueryOptions {
  variables?: UseUserQueryVariables
  skip?: boolean
  onCompleted?: (data: { user: UserData }) => void
  onError?: (error: Error) => void
}

export const useUserQuery = (options?: UseUserQueryOptions): UseUserQueryResult => {
  const [data, setData] = useState<{ user: UserData } | null>(null)
  const [loading, setLoading] = useState(!options?.skip)
  const [error, setError] = useState<Error | null>(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  const refetch = () => setRefetchIndex(prev => prev + 1)

  useEffect(() => {
    if (options?.skip || !options?.variables?.id) {
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('access')
        if (!token) {
          throw new Error('No access token found')
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
        const response = await fetch(`${API_URL}/users/${options.variables.id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }

        const userData: UserData = await response.json()
        const result = { user: userData }
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

    fetchUser()
  }, [options?.variables?.id, options?.skip, refetchIndex])

  return { data, loading, error, refetch }
}

