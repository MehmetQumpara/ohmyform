import { message } from 'antd'
import ExcelJS, { CellValue } from 'exceljs'
import { useCallback, useState } from 'react'
import { useFormQuery } from '../../../hooks/useFormQuery'
import { fieldTypes } from '../types'

interface SubmissionFieldFragmentLocal {
  id: string
  type: string
  value: any
  field?: { id: string } | null
}

interface SubmissionFragmentLocal {
  id: string
  created: string
  lastModified?: string
  geoLocation: {
    country?: string
    city?: string
  }
  device: {
    type?: string
    name?: string
  }
  fields: SubmissionFieldFragmentLocal[]
}

interface Props {
  form: string
  trigger: (open: () => any, loading: boolean) => JSX.Element
}

export const ExportSubmissionAction: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState(false)

  const form = useFormQuery({
    variables: {
      id: props.form,
    },
  })

  const getSubmissions = async (
    {
      form,
      limit,
      start,
    }: { form: string; limit: number; start: number }
  ) => {
    const token = localStorage.getItem('access')
    if (!token) {
      throw new Error('No access token found')
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
    const params = new URLSearchParams()
    params.append('limit', String(limit))
    params.append('start', String(start))
    params.append('excludeEmpty', 'true')

    const response = await fetch(`${API_URL}/forms/${form}/submissions?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch submissions')
    }

    const data = await response.json()
    return {
      data: {
        pager: {
          entries: data.entries,
          total: data.total,
          limit: data.limit,
          start: data.start,
        },
      },
    }
  }

  const exportSubmissions = useCallback(async () => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'OhMyForm'
      workbook.lastModifiedBy = 'OhMyForm'
      workbook.created = new Date()
      workbook.modified = new Date()

      const orderedFields = form.data.form.fields
        .map(field => field)
        .sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0))

      // TODO should go through deleted fields as well to have a complete overview!

      const sheet = workbook.addWorksheet('Submissions')
      const dynamicHeaders = orderedFields.map((field) => `${field.title} (${field.type})`)
      sheet.getRow(1).values = [
        'Submission ID',
        'Created',
        'Last Change',
        'Country',
        'City',
        'User Agent',
        'Device',
        ...dynamicHeaders,
      ]

      const firstPage = await getSubmissions({
        form: props.form,
        limit: 50,
        start: 0,
      })

      const buildRow = (data: SubmissionFragmentLocal): CellValue[] => {
        const row: CellValue[] = [
          data.id,
          data.created,
          data.lastModified,
          data.geoLocation?.country ?? '',
          data.geoLocation?.city ?? '',
          data.device?.type ?? '',
          data.device?.name ?? '',
        ]

        orderedFields.forEach((formField) => {
          const field = data.fields.find((submission) => submission.field?.id === formField.id)

          try {
            if (field) {
              const raw = (fieldTypes[field.type]?.stringifyValue as
                | ((this: void, v: unknown) => unknown)
                | undefined
              )?.call(undefined, field.value)
              const safe: CellValue = raw == null ? '' : (String(raw) as CellValue)
              row.push(safe)
            } else {
              row.push('')
            }
          } catch (e) {
            row.push('')
          }
        })

        return row
      }

      const firstEntries = firstPage.data.pager.entries as unknown as SubmissionFragmentLocal[]
      firstEntries.forEach((row: SubmissionFragmentLocal, index: number) => {
        sheet.getRow(index + 2).values = buildRow(row)
      })

      const total = Number(firstPage.data.pager.total)
      const pages = Math.ceil(total / 50)
      for (let page = 1; page < pages; page++) {
        // now process each page!
        const next = await getSubmissions({
          form: props.form,
          limit: 50,
          start: page * 50,
        })

        const nextEntries = next.data.pager.entries as unknown as SubmissionFragmentLocal[]
        nextEntries.forEach((row: SubmissionFragmentLocal, index: number) => {
          sheet.getRow(index + 2 + page * 50).values = buildRow(row)
        })
      }

      const buffer = await workbook.xlsx.writeBuffer()

      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(new Blob([buffer], { type: 'application/xlsx' }))
      link.download = 'submissions.xlsx'
      link.click()
    } catch (e) {
      console.log('error', e)
      void message.error({
        content: 'Failed to generate export',
      })
    }
    setLoading(false)
  }, [
    form, getSubmissions, props.form, setLoading, loading,
  ])

  return props.trigger(() => exportSubmissions(), loading)
}
