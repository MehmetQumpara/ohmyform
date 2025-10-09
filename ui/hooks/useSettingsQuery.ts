import { useEffect, useState } from 'react'

interface SettingsData {
  disabledSignUp: {
    value: boolean
  }
  loginNote: {
    value: string
  }
  hideContrib: {
    value: boolean
  }
}

interface UseSettingsQueryResult {
  loading: boolean
  data: SettingsData | null
  error: Error | null
  refetch: () => void
}

export const useSettingsQuery = (): UseSettingsQueryResult => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SettingsData | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
      const response = await fetch(`${API_URL}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const settingsData = await response.json()
      setData(settingsData)
    } catch (err) {
      setError(err as Error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return { loading, data, error, refetch: fetchSettings }
}

