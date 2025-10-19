# GraphQL'den REST'e Geçiş Rehberi - OhMyForm

## ✅ Tamamlanan İşlemler

### 1. REST Client Utility (✓)
- **Dosya**: `ui/lib/api.client.ts`
- Token yönetimi ile fetch tabanlı REST client oluşturuldu
- Server-side ve client-side endpoint desteği eklendi
- GET, POST, PUT, DELETE metodları hazır

### 2. API Backend - REST Endpoints (✓)
- **Public Form Endpoint**: `GET /forms/:id/public` 
  - Kimlik doğrulama gerektirmez
  - Sadece yayında olan formları döner
  
- **Submission Endpoints**: `api/src/controller/submission.controller.ts`
  - `POST /submissions/start/:formId` - Yeni submission başlat
  - `PUT /submissions/:id/field` - Field değeri kaydet
  - `POST /submissions/:id/finish` - Submission'ı tamamla

### 3. Config Güncellemeleri (✓)
- `next.config.js` - apiBase ve endpoint eklendi
- `next.config.type.ts` - TypeScript tipleri güncellendi

## 🔄 Yapılması Gerekenler

### Adım 1: API Backend Module Güncellemesi
**Dosya**: `api/src/app.module.ts`

SubmissionController'ı module'a ekle:

\`\`\`typescript
import { SubmissionController } from './controller/submission.controller'

@Module({
  controllers: [
    // ...mevcut controller'lar
    SubmissionController,
  ],
  // ...
})
\`\`\`

### Adım 2: UI Hooks'larını REST'e Çevir

#### A. useFormPublicQuery Hook
**Dosya**: `ui/hooks/useFormPublicQuery.ts`

\`\`\`typescript
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
          \`/forms/\${options.variables.id}/public\`
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
\`\`\`

#### B. useSubmission Hook
**Dosya**: `ui/components/use.submission.ts`

Mevcut dosyayı REST API kullanacak şekilde güncelle:

\`\`\`typescript
import { useCallback, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { apiClient } from '../lib/api.client'

export interface SubmissionData {
  id: string
  percentageComplete: number
  timeElapsed: number
}

export const useSubmission = (formId: string) => {
  const [submission, setSubmission] = useState<SubmissionData | null>(null)
  const [token] = useState(() => uuid())
  const [isStarted, setIsStarted] = useState(false)

  const start = useCallback(async (device: any) => {
    try {
      const result = await apiClient.post<SubmissionData>(
        \`/submissions/start/\${formId}\`,
        { token, device }
      )
      setSubmission(result)
      setIsStarted(true)
      return result
    } catch (error) {
      console.error('Failed to start submission:', error)
      throw error
    }
  }, [formId, token])

  const save = useCallback(async (fieldId: string, content: any) => {
    if (!submission) {
      throw new Error('Submission not started')
    }

    try {
      const result = await apiClient.put<SubmissionData>(
        \`/submissions/\${submission.id}/field\`,
        { token, fieldId, content }
      )
      setSubmission(result)
      return result
    } catch (error) {
      console.error('Failed to save field:', error)
      throw error
    }
  }, [submission, token])

  const submit = useCallback(async () => {
    if (!submission) {
      throw new Error('Submission not started')
    }

    try {
      const result = await apiClient.post<SubmissionData>(
        \`/submissions/\${submission.id}/finish\`,
        { token }
      )
      setSubmission(result)
      return result
    } catch (error) {
      console.error('Failed to finish submission:', error)
      throw error
    }
  }, [submission, token])

  return {
    start,
    save,
    submit,
    isStarted,
    submission,
    token,
  }
}
\`\`\`

### Adım 3: Diğer Hooks'ları Güncelle

Aşağıdaki hook'ları benzer şekilde REST'e çevir:
- `useFormQuery.ts` → `GET /forms/:id`
- `useFormCreate.ts` → `POST /forms`
- `useFormUpdate.ts` → `PUT /forms/:id`
- `useFormDelete.ts` → `DELETE /forms/:id`
- `useFormPager.ts` → `GET /forms?start=&limit=`

### Adım 4: Auth Controller Kontrol

Auth endpoint'lerinin REST'te mevcut olduğundan emin ol:
- `POST /auth/login`
- `POST /auth/register`
- `GET /me`
- `POST /auth/logout`

### Adım 5: Apollo'yu Kaldır

**Dosya**: `ui/pages/_app.tsx`

\`\`\`typescript
// ÖNCE:
import { ApolloProvider } from '@apollo/client'
import getClient from '../graphql/client'

<ApolloProvider client={getClient()}>
  <Component {...pageProps} />
</ApolloProvider>

// SONRA:
<Component {...pageProps} />
\`\`\`

**Dosya**: `ui/package.json`

Apollo bağımlılıklarını kaldır:
\`\`\`json
{
  "dependencies": {
    "@apollo/client": "...",  // KALDIR
    "graphql": "...",         // KALDIR
  }
}
\`\`\`

Sonra çalıştır:
\`\`\`powershell
cd ui
npm uninstall @apollo/client graphql
\`\`\`

### Adım 6: Test

\`\`\`powershell
# Rebuild ve başlat
docker-compose down
docker-compose up --build -d

# Log'ları izle
docker-compose logs -f

# Test URL'leri:
# - http://localhost:4100/form/[form_id]
# - http://localhost:4100/admin
\`\`\`

## 📝 Notlar

1. **Tedrici Geçiş**: Önce kritik sayfaları (form görüntüleme, submission) REST'e çevirin
2. **Type Safety**: API yanıtları için interface'ler oluşturun
3. **Error Handling**: apiClient'ta merkezi error handling yapın
4. **Loading States**: Her hook'ta loading, error state'leri yönetin

## ⚠️ Dikkat Edilmesi Gerekenler

- Token yönetimi client-side'da kalıyor (localStorage)
- Submission token'ı UUID ile client-side oluşturuluyor
- ID encoding/decoding API'de yapılıyor (Hashids kullanılıyor)
- Anonymous submission desteği korunmalı

## 🚀 Öneriler

Tüm geçişi bir seferde yapmak yerine:
1. Önce form görüntüleme ve submission işlevlerini REST'e çevir
2. Test et ve stabil hale getir
3. Sonra admin paneli ve diğer özellikleri güncelle

Bu yaklaşım, hataya düşme riskini azaltır ve her adımda test imkanı verir.
