import { useEffect, useState } from 'react'

interface StatusData {
  status: {
    version: string
  }
}

interface UseStatusQueryResult {
  data: StatusData | undefined
  loading: boolean
  error: Error | undefined
}

export const useStatusQuery = (): UseStatusQueryResult => {
  const [data, setData] = useState<StatusData | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true)
      setError(undefined)
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
        const response = await fetch(`${API_URL}/status`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch status')
        }

        const statusData = await response.json()
        setData({ status: statusData })
      } catch (e) {
        setError(e as Error)
        setData(undefined)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  return { data, loading, error }
}

