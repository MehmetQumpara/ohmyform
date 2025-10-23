import { Body, Controller, HttpCode, HttpStatus, NotFoundException, Param, Post, Put } from '@nestjs/common'
import { IpAddress } from '../decorator/ip.address.decorator'
import { Public } from '../decorator/public.decorator'
import { User } from '../decorator/user.decorator'
import { UserEntity } from '../entity/user.entity'
import { FormService } from '../service/form/form.service'
import { IdService } from '../service/id.service'
import { SubmissionService } from '../service/submission/submission.service'
import { SubmissionStartService } from '../service/submission/submission.start.service'
import { SubmissionSetFieldService } from '../service/submission/submission.set.field.service'
import { SubmissionStartInput } from '../dto/submission/submission.start.input'
import { SubmissionSetFieldInput } from '../dto/submission/submission.set.field.input'

@Controller('submissions')
export class SubmissionPublicController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly submissionStartService: SubmissionStartService,
    private readonly submissionSetFieldService: SubmissionSetFieldService,
    private readonly formService: FormService,
    private readonly idService: IdService,
  ) {}

  @Post('start/:formId')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async startSubmission(
    @Param('formId') formId: string,
    @Body() input: SubmissionStartInput,
    @IpAddress() ipAddr: string,
    @User() user?: UserEntity,
  ) {
    const decodedFormId = this.idService.decode(formId)
    const form = await this.formService.findById(decodedFormId)

    if (!form) {
      throw new NotFoundException('Form not found')
    }

    if (!form.isLive && (!user || !this.formService.isAdmin(form, user))) {
      throw new NotFoundException('Form is not available')
    }

    const submission = await this.submissionStartService.start(form, input, user, ipAddr)

    return {
      id: this.idService.encode(submission.id),
      percentageComplete: submission.percentageComplete,
      timeElapsed: submission.timeElapsed,
    }
  }

  @Post('start-with-token')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async startSubmissionWithToken(
    @Body('formToken') formToken: string,
    @Body() input: SubmissionStartInput,
    @IpAddress() ipAddr: string,
    @User() user?: UserEntity,
  ) {
    const submission = await this.submissionStartService.startWithToken(formToken, input, user, ipAddr)

    return {
      id: this.idService.encode(submission.id),
      percentageComplete: submission.percentageComplete,
      timeElapsed: submission.timeElapsed,
    }
  }

  @Put(':id/field')
  @Public()
  async setField(
    @Param('id') id: string,
    @Body() input: SubmissionSetFieldInput,
  ) {
    const submissionId = this.idService.decode(id)
    const submission = await this.submissionService.findById(submissionId)

    if (!submission) {
      throw new NotFoundException('Submission not found')
    }

    if (!await this.submissionService.isOwner(submission, input.token)) {
      throw new NotFoundException('No access to submission')
    }

    await this.submissionSetFieldService.saveField(submission, input)

    return {
      id: this.idService.encode(submission.id),
      percentageComplete: submission.percentageComplete,
      timeElapsed: submission.timeElapsed,
    }
  }

  @Post(':id/finish')
  @Public()
  async finishSubmission(
    @Param('id') id: string,
    @Body('token') token: string,
  ) {
    const submissionId = this.idService.decode(id)
    const submission = await this.submissionService.findById(submissionId)

    if (!submission) {
      throw new NotFoundException('Submission not found')
    }

    if (!await this.submissionService.isOwner(submission, token)) {
      throw new NotFoundException('No access to submission')
    }

    await this.submissionSetFieldService.finishSubmission(submission)

    return {
      id: this.idService.encode(submission.id),
      percentageComplete: submission.percentageComplete,
      timeElapsed: submission.timeElapsed,
    }
  }
}
