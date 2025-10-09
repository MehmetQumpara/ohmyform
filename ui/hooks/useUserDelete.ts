import { useState } from 'react'

interface UseUserDeleteResult {
  deleteUser: (id: string) => Promise<boolean>
  loading: boolean
  error: Error | null
}

export const useUserDelete = (): UseUserDeleteResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteUser = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access')
      if (!token) {
        throw new Error('No access token found')
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete user')
      }

      return true
    } catch (e) {
      setError(e as Error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteUser, loading, error }
}

