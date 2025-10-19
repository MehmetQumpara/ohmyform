import { useEffect, useState } from 'react'
import { apiClient } from '../lib/api.client'
import { FormPublicFragment } from '../graphql/fragment/form.public.fragment'

interface UseFormPublicQueryOptions {
  variables: {
    id: string
  }
}

interface UseFormPublicQueryResult {
  loading: boolean
  data?: { form: FormPublicFragment }
  error?: Error
}

export const useFormPublicQuery = (
  options: UseFormPublicQueryOptions
): UseFormPublicQueryResult => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ form: FormPublicFragment }>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true)
        const form = await apiClient.get<FormPublicFragment>(
          `/forms/${options.variables.id}/public`
        )
        setData({ form })
        setError(undefined)
      } catch (err) {
        setError(err as Error)
        setData(undefined)
      } finally {
        setLoading(false)
      }
    }

    if (options.variables.id) {
      fetchForm()
    }
  }, [options.variables.id])

  return { loading, data, error }
}
