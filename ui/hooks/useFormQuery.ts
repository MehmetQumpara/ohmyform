import { useEffect, useState } from 'react'

export interface FormPageFragment {
  id: string
  show: boolean
  title?: string
  paragraph?: string
  buttonText?: string
  buttons: {
    id: string
    url?: string
    action?: string
    text?: string
    bgColor?: string
    color?: string
  }[]
}

export interface FormFieldOptionFragment {
  id: string
  key?: string
  title?: string
  value: string
}

export interface FormFieldLogicFragment {
  id: string
  action: string
  formula: string
  enabled: boolean
  jumpTo?: string
  require?: boolean
  visible?: boolean
  disable?: boolean
}

export interface FormFieldFragment {
  id: string
  idx?: number
  title: string
  slug?: string
  type: string
  description: string
  required: boolean
  defaultValue?: string
  options: FormFieldOptionFragment[]
  logic: FormFieldLogicFragment[]
  rating?: {
    steps?: number
    shape?: string
  }
}

export interface FormHookFragment {
  id: string
  enabled: boolean
  url?: string
  format?: string
}

export interface FormNotificationFragment {
  id: string
  enabled: boolean
  subject?: string
  htmlTemplate?: string
  toField?: string
  toEmail?: string
  fromField?: string
  fromEmail?: string
}

export interface FormFragment {
  id?: string
  title: string
  created: string
  lastModified?: string
  language: string
  showFooter: boolean
  anonymousSubmission: boolean
  isLive: boolean
  fields: FormFieldFragment[]
  hooks: FormHookFragment[]
  notifications: FormNotificationFragment[]
  design: {
    colors: {
      background: string
      question: string
      answer: string
      button: string
      buttonText: string
    }
    font?: string
    layout?: string
  }
  startPage: FormPageFragment
  endPage: FormPageFragment
  admin: {
    id: string
    username: string
    email: string
  }
}

interface UseFormQueryVariables {
  id: string
}

interface UseFormQueryResult {
  data: { form: FormFragment } | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

interface UseFormQueryOptions {
  variables?: UseFormQueryVariables
  skip?: boolean
  onCompleted?: (data: { form: FormFragment }) => void
  onError?: (error: Error) => void
}

export const useFormQuery = (options?: UseFormQueryOptions): UseFormQueryResult => {
  const [data, setData] = useState<{ form: FormFragment } | null>(null)
  const [loading, setLoading] = useState(!options?.skip)
  const [error, setError] = useState<Error | null>(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  const refetch = () => setRefetchIndex(prev => prev + 1)

  useEffect(() => {
    if (options?.skip || !options?.variables?.id) {
      setLoading(false)
      return
    }

    const fetchForm = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('access')
        if (!token) {
          throw new Error('No access token found')
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
        const response = await fetch(`${API_URL}/forms/${options.variables.id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch form')
        }

        const formData: FormFragment = await response.json()
        const result = { form: formData }
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

    fetchForm()
  }, [options?.variables?.id, options?.skip, refetchIndex])

  return { data, loading, error, refetch }
}

