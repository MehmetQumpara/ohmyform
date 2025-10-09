import { useEffect, useState } from 'react'

interface ProfileData {
  user: {
    id: string
    username: string
    email: string
    language: string
    firstName?: string
    lastName?: string
  }
}

interface UseProfileQueryOptions {
  onCompleted?: (data: ProfileData) => void
  onError?: (error: Error) => void
}

interface UseProfileQueryResult {
  loading: boolean
  data: ProfileData | null
  error: Error | null
  refetch: () => void
}

export const useProfileQuery = (options?: UseProfileQueryOptions): UseProfileQueryResult => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = async () => {
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
        throw new Error('Failed to fetch profile')
      }

      const profileData = await response.json()
      const formattedData = {
        user: {
          id: profileData.id,
          username: profileData.username,
          email: profileData.email,
          language: profileData.language,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
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
    fetchProfile()
  }, [])

  return { loading, data, error, refetch: fetchProfile }
}

