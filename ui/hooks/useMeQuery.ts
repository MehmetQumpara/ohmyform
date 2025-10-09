import { useEffect, useState } from 'react'

interface MeData {
  id: string
  username: string
  email: string
  roles: string[]
  firstName?: string
  lastName?: string
  language: string
  emailVerified: boolean
  created: Date
  lastModified: Date
}

interface UseMeQueryResult {
  loading: boolean
  data: { me: MeData } | null
  error: Error | null
  refetch: () => void
}

export const useMeQuery = (): UseMeQueryResult => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ me: MeData } | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchMe = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access')
      if (!token) {
        throw new Error('No access token')
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
      const response = await fetch(`${API_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const userData = await response.json()
      setData({ me: userData })
    } catch (err) {
      setError(err as Error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  return { loading, data, error, refetch: fetchMe }
}

