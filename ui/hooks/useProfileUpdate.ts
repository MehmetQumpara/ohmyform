import { useState } from 'react'

interface ProfileUpdateData {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  password?: string
  language?: string
}

interface ProfileResponse {
  user: {
    id: string
    username: string
    email: string
    language: string
    firstName?: string
    lastName?: string
  }
}

export const useProfileUpdate = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateProfile = async (data: ProfileUpdateData): Promise<ProfileResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access')
      if (!token) {
        throw new Error('No access token')
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const profileData = await response.json()
      return {
        user: {
          id: profileData.id,
          username: profileData.username,
          email: profileData.email,
          language: profileData.language,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        },
      }
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateProfile, loading, error }
}

