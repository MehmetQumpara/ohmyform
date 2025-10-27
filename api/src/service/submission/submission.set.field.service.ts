import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { serializeError } from 'serialize-error'
import { Repository } from 'typeorm'
import { SubmissionSetFieldInput } from '../../dto/submission/submission.set.field.input'
import { SubmissionEntity } from '../../entity/submission.entity'
import { SubmissionFieldContent, SubmissionFieldEntity } from '../../entity/submission.field.entity'
import { IdService } from '../id.service'
import { SubmissionHookService } from './submission.hook.service'
import { SubmissionNotificationService } from './submission.notification.service'

@Injectable()
export class SubmissionSetFieldService {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepository: Repository<SubmissionEntity>,
    @InjectRepository(SubmissionFieldEntity)
    private readonly submissionFieldRepository: Repository<SubmissionFieldEntity>,
    private readonly webHook: SubmissionHookService,
    private readonly notifications: SubmissionNotificationService,
    private readonly idService: IdService,
    private readonly logger: PinoLogger,
  ) {
    logger.setContext(this.constructor.name)
  }

  async saveField(submission: SubmissionEntity, input: SubmissionSetFieldInput): Promise<void> {
    let formFieldId: number
    
    // Try to decode the field ID as an encoded ID, fallback to parsing as number
    try {
      formFieldId = this.idService.decode(input.field)
    } catch (e) {
      // If decode fails, try to parse as a regular number (for direct numeric IDs)
      const parsed = parseInt(input.field, 10)
      if (isNaN(parsed)) {
        throw new Error(`Invalid field ID: ${input.field}`)
      }
      formFieldId = parsed
    }

    let field = submission.fields.find(field => field.field.id === formFieldId)

    // Calculate time elapsed and ensure it's never negative
    const elapsed = dayjs().diff(dayjs(submission.created), 'second')
    submission.timeElapsed = Math.max(0, elapsed)

    if (field) {
      // Update existing field
      field.content = this.parseData(field, input.data)

      await this.submissionRepository.save(submission)
      await this.submissionFieldRepository.save(field)
    } else {
      // Create new field
      const formField = submission.form.fields.find(field => field.id === formFieldId)
      
      if (!formField) {
        throw new Error(`Form field with id ${formFieldId} not found in form ${submission.form.id}`)
      }

      field = new SubmissionFieldEntity()

      field.submission = submission
      field.field = formField
      field.type = formField.type
      field.content = this.parseData(field, input.data)

      submission.fields.push(field)
      submission.percentageComplete = Math.min(1, (submission.fields.length) / submission.form.fields.length)

      // Save submission first to ensure it has an ID, then save the field
      await this.submissionRepository.save(submission)
      await this.submissionFieldRepository.save(field)
    }

    if (submission.percentageComplete === 1) {
      await this.finishSubmission(submission)
    }
  }

  async finishSubmission(submission: SubmissionEntity): Promise<void> {
    submission.percentageComplete = 1
    await this.submissionRepository.update({
      id: submission.id,
    }, {
      percentageComplete: 1,
    })

    this.webHook.process(submission).catch(e => {
      this.logger.error({
        submission: submission.id,
        form: submission.formId,
        error: serializeError(e),
      }, 'failed to send webhooks')
    })

    this.notifications.process(submission).catch(e => {
      this.logger.error({
        submission: submission.id,
        form: submission.formId,
        error: serializeError(e),
      }, 'failed to send notifications')
    })
  }

  private parseData(
    field: SubmissionFieldEntity,
    data: string
  ): SubmissionFieldContent {
    let raw: SubmissionFieldContent

    const context = {
      field: field.fieldId,
      type: field.type,
    }

    try {
      raw = JSON.parse(data) as SubmissionFieldContent
    } catch (e) {
      this.logger.warn(context, 'received invalid data for field')
      return { value: null }
    }

    if (Array.isArray(raw)) {
      return raw.map((row: unknown, index) => {
        switch (typeof row) {
          case 'number':
          case 'string':
          case 'boolean':
          case 'undefined':
            return row
        }

        if (row === null) {
          return row
        }

        this.logger.warn({
          ...context,
          path: `${index}`,
        }, 'invalid data in array')
        valid = false

        return null
      })
    }

    if (
      [
        'number',
        'string',
        'boolean',
        'undefined',
      ].includes(typeof raw)
    ) {
      return raw
    }

    // now ensure data structure
    const result = {}

    let valid = true

    Object.keys(raw).forEach((key) => {
      const value = raw[String(key)]

      switch (typeof value) {
        case 'number':
        case 'string':
        case 'boolean':
          result[String(key)] = value
          return
      }

      if (Array.isArray(value)) {
        result[String(key)] = value.map((row: unknown, index) => {
          switch (typeof row) {
            case 'number':
            case 'string':
            case 'boolean':
            case 'undefined':
              return row
          }

          if (row === null) {
            return row
          }

          this.logger.warn({
            ...context,
            path: `${key}/${index}`,
          }, 'invalid data in array')
          valid = false

          return null
        })

        return
      }

      if (typeof value === 'object') {
        result[String(key)] = {}

        for (const subKey of Object.keys(value)) {
          const subValue = raw[String(key)][String(subKey)]

          switch (typeof subValue) {
            case 'number':
            case 'string':
            case 'boolean':
              result[String(key)][String(subKey)] = subValue
              return
          }

          if (Array.isArray(subValue)) {
            result[String(key)][String(subKey)] = subValue.map((row: unknown, index) => {
              switch (typeof row) {
                case 'number':
                case 'string':
                case 'boolean':
                case 'undefined':
                  return row
              }

              if (row === null) {
                return row
              }

              this.logger.warn({
                ...context,
                path: `${key}/${subKey}/${index}`,
              }, 'invalid data in array')
              valid = false

              return null
            })

            return
          }
        }
      }

      this.logger.warn({
        ...context,
        path: String(key),

      }, 'invalid data in entry')

      valid = false
    })

    if (!valid) {
      this.logger.warn(context, 'invalid data in object entries')
      return { value: null }
    }

    return result
  }
}
