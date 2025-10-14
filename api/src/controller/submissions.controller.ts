import { Controller, ForbiddenException, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../decorator/roles.decorator'
import { User } from '../decorator/user.decorator'
import { UserEntity } from '../entity/user.entity'
import { RolesGuard } from '../guard/roles.guard'
import { FormService } from '../service/form/form.service'
import { IdService } from '../service/id.service'
import { SubmissionService } from '../service/submission/submission.service'

@Controller('forms/:formId/submissions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('user')
export class SubmissionsController {
  constructor(
    private readonly formService: FormService,
    private readonly submissionService: SubmissionService,
    private readonly idService: IdService,
  ) {}

  @Get()
  async listSubmissions(
    @Param('formId') formId: string,
    @User() user: UserEntity,
    @Query('start') start?: number,
    @Query('limit') limit?: number,
    @Query('excludeEmpty') excludeEmpty?: string,
  ) {
    const startNum = start || 0
    const limitNum = limit || 50

    const decodedFormId = this.idService.decode(formId)
    const form = await this.formService.findById(decodedFormId)

    if (!form) {
      throw new NotFoundException('Form not found')
    }

    // Check if user has access to this form
    if (!this.formService.isAdmin(form, user)) {
      throw new ForbiddenException('You do not have access to this form')
    }

    const [submissions, total] = await this.submissionService.find(
      form,
      startNum,
      limitNum,
      {},
      {
        excludeEmpty: excludeEmpty === 'true',
      }
    )

    return {
      entries: submissions.map((submission) => ({
        id: this.idService.encode(submission.id),
        created: submission.created,
        lastModified: submission.lastModified,
        timeElapsed: submission.timeElapsed,
        percentageComplete: submission.percentageComplete,
        geoLocation: submission.geoLocation || {},
        ipAddr: submission.ipAddr,
        device: {
          type: submission.device?.type || '',
          name: submission.device?.name || '',
        },
        fields: submission.fields.map((field) => ({
          id: this.idService.encode(field.id),
          field: field.field ? this.idService.encode(field.field.id) : null,
          content: field.content ?? '',
        })),
      })),
      total,
      limit: limitNum,
      start: startNum,
      form: {
        id: this.idService.encode(form.id),
        title: form.title,
        language: form.language,
      },
    }
  }
}

