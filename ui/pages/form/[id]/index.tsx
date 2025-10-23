import { LoadingPage } from 'components/loading.page'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const Index: NextPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const formId = router.query.id as string
    if (!formId) {
      return
    }

    setIsRedirecting(true)

    // Form ID'den token almak için API çağrısı yapıp redirect edelim
    // Veya direkt error page gösterelim çünkü artık token bazlı sistem kullanıyoruz
    const fetchFormToken = async () => {
      try {
        const token = localStorage.getItem('access')
        const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
        
        const response = await fetch(`${API_URL}/forms/${formId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.formToken) {
            // Token bazlı sayfaya yönlendir
            router.replace(`/anket?token=${data.formToken}`)
            return
          }
        }
        
        // Token bulunamazsa ana sayfaya yönlendir
        router.replace('/')
      } catch (e) {
        console.error('Failed to fetch form token:', e)
        router.replace('/')
      }
    }

    fetchFormToken()
  }, [router.query.id])

  return <LoadingPage message={t('form:redirecting') || 'Redirecting...'} />
}

export default Index
