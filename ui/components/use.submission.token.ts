import debug from 'debug'
import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../lib/api.client'

const logger = debug('useSubmissionWithToken')

export interface SubmissionData {
  id: string
  percentageComplete: number
  timeElapsed: number
}

export interface Submission {
  setField: (fieldId: string, data: unknown) => Promise<void>
  finish: () => Promise<void>
}

export const useSubmissionWithToken = (formToken: string): Submission => {
  const [submission, setSubmission] = useState<{ id: string; token: string }>()

  useEffect(() => {
    const submissionToken = [...Array(40)].map(() => Math.random().toString(36)[2]).join('')

    const startSubmission = async () => {
      try {
        const result = await apiClient.post<SubmissionData>(
          `/submissions/start-with-token`,
          {
            formToken: formToken, // This is the form/invitation token
            token: submissionToken, // This is the submission token
            device: {
              name: /Mobi/i.test(window.navigator.userAgent) ? 'mobile' : 'desktop',
              type: window.navigator.userAgent,
              language: window.navigator.language,
            },
          }
        )
        logger('submission id = %O', result.id)
        setSubmission({
          id: result.id,
          token: submissionToken,
        })
      } catch (e) {
        logger('failed to start submission %J', e)
      }
    }

    if (formToken) {
      startSubmission()
    }
  }, [formToken])

  const setField = useCallback(
    async (fieldId: string, data: unknown) => {
      if (data === undefined || data === null) {
        logger('skip save field id=%O %O', fieldId, data)
        return
      }

      if (!submission) {
        logger('submission not started yet')
        return
      }

      logger('save field id=%O %O', fieldId, data)
      try {
        await apiClient.put<SubmissionData>(
          `/submissions/${submission.id}/field`,
          {
            token: submission.token,
            field: fieldId,
            data: JSON.stringify(data),
          }
        )
      } catch (e) {
        logger('failed to save field %J', e)
        throw e
      }
    },
    [submission]
  )

  const finish = useCallback(async () => {
    if (!submission) {
      logger('submission not started yet')
      return
    }

    logger('finish submission!!', formToken)
    try {
      await apiClient.post<SubmissionData>(
        `/submissions/${submission.id}/finish`,
        { token: submission.token }
      )
    } catch (e) {
      logger('failed to finish submission %J', e)
      throw e
    }
  }, [submission, formToken])

  return {
    setField,
    finish,
  }
}
