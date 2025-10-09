import { useEffect, useState } from 'react'

interface AdminStatisticsData {
  forms: {
    total: number
  }
  users: {
    total: number
  }
  submissions: {
    total: number
  }
}

interface UseAdminStatisticsResult {
  loading: boolean
  data: AdminStatisticsData | null
  error: Error | null
  refetch: () => void
}

export const useAdminStatistics = (): UseAdminStatisticsResult => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AdminStatisticsData | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchStatistics = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access')
      if (!token) {
        throw new Error('No access token')
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
      const response = await fetch(`${API_URL}/admin/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      const statsData = await response.json()
      setData(statsData)
    } catch (err) {
      setError(err as Error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  return { loading, data, error, refetch: fetchStatistics }
}

