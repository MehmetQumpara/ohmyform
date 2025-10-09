import { useState } from 'react'
import { UserData } from './useUserQuery'

export interface UserUpdateInput {
  id: string
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  password?: string
  roles?: string[]
  language?: string
}

interface UseUserUpdateResult {
  updateUser: (input: UserUpdateInput) => Promise<UserData | null>
  loading: boolean
  error: Error | null
}

export const useUserUpdate = (): UseUserUpdateResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateUser = async (input: UserUpdateInput): Promise<UserData | null> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access')
      if (!token) {
        throw new Error('No access token found')
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
      const response = await fetch(`${API_URL}/users/${input.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update user')
      }

      const result: UserData = await response.json()
      return result
    } catch (e) {
      setError(e as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateUser, loading, error }
}

