import { ErrorPage } from 'components/error.page'
import { LoadingPage } from 'components/loading.page'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardLayout } from '../components/form/layouts/card'
import { ModernLayout } from '../components/form/layouts/modern'
import { SliderLayout } from '../components/form/layouts/slider'
import { useSubmissionWithToken } from '../components/use.submission.token'
import { apiClient } from '../lib/api.client'

const AnketPage: NextPage = () => {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { token } = router.query
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  
  const submission = useSubmissionWithToken(token as string)

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchForm = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<any>(`/form/public?token=${token}`)
        setFormData(response)
        setError(null)
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [token])

  useEffect(() => {
    if (!formData) {
      return
    }

    if (i18n.language !== formData.form.language) {
      i18n
        .changeLanguage(formData.form.language)
        .catch((e: Error) => console.error('failed to change language', e))
    }
  }, [formData])

  if (!token) {
    return <ErrorPage />
  }

  if (loading) {
    return <LoadingPage message={t('form:build')} />
  }

  if (error) {
    return <ErrorPage />
  }

  if (!formData) {
    return <ErrorPage />
  }

  const layoutProps = {
    form: formData.form,
    submission,
    isInvitation: formData.isInvitation,
    invitationToken: formData.invitationToken,
  }

  switch (formData.form.design.layout) {
    case 'card':
      return <CardLayout {...layoutProps} />

    case 'modern':
      return <ModernLayout {...layoutProps} />

    case 'slider':
    default:
      return <SliderLayout {...layoutProps} />
  }
}

export default AnketPage
