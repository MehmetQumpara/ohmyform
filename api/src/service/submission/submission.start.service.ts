import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import anonymize from 'ip-anonymize'
import { Repository } from 'typeorm'
import { SubmissionStartInput } from '../../dto/submission/submission.start.input'
import { FormEntity } from '../../entity/form.entity'
import { SubmissionEntity } from '../../entity/submission.entity'
import { UserEntity } from '../../entity/user.entity'
import { FormTokenService } from '../form/form.token.service'
import { SubmissionTokenService } from './submission.token.service'

@Injectable()
export class SubmissionStartService {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepository: Repository<SubmissionEntity>,
    private readonly tokenService: SubmissionTokenService,
    private readonly formTokenService: FormTokenService,
  ) {
  }

  async start(
    form: FormEntity,
    input: SubmissionStartInput,
    user?: UserEntity,
    ipAddr?: string,
  ): Promise<SubmissionEntity> {
    // Generate token hash first
    const tokenHash = await this.tokenService.hash(input.token)

    // Check if this token has already been used for this form
    const existingSubmission = await this.submissionRepository.findOne({
      where: {
        form: { id: form.id },
        tokenHash: tokenHash,
      },
    })

    if (existingSubmission) {
      // Return existing submission instead of creating a duplicate
      return existingSubmission
    }

    // Create new submission
    const submission = new SubmissionEntity()

    if (!form.anonymousSubmission) {
      submission.user = user
    }

    submission.form = form
    submission.ipAddr = anonymize(ipAddr, 16, 16) || '?'
    submission.timeElapsed = 0
    submission.percentageComplete = 0

    // TODO set country!

    submission.device.language = input.device.language
    submission.device.name = input.device.name
    submission.device.type = input.device.type

    submission.tokenHash = tokenHash

    return await this.submissionRepository.save(submission)
  }

  async startWithToken(
    formToken: string,
    input: SubmissionStartInput,
    user?: UserEntity,
    ipAddr?: string,
  ): Promise<SubmissionEntity> {
    // Validate token and get form
    const tokenResult = await this.formTokenService.validateAndGetForm(formToken)
    const form = tokenResult.form

    // Generate submission token hash
    const tokenHash = await this.tokenService.hash(input.token)

    // Check if this token has already been used for this form
    const existingSubmission = await this.submissionRepository.findOne({
      where: {
        form: { id: form.id },
        tokenHash: tokenHash,
      },
    })

    if (existingSubmission) {
      return existingSubmission
    }

    // Create new submission
    const submission = new SubmissionEntity()

    if (!form.anonymousSubmission) {
      submission.user = user
    }

    submission.form = form
    submission.ipAddr = anonymize(ipAddr, 16, 16) || '?'
    submission.timeElapsed = 0
    submission.percentageComplete = 0

    submission.device.language = input.device.language
    submission.device.name = input.device.name
    submission.device.type = input.device.type

    submission.tokenHash = tokenHash

    // If it's an invitation token, save it
    if (tokenResult.isInvitation && tokenResult.invitationToken) {
      submission.invitationtoken = tokenResult.invitationToken
    }

    const savedSubmission = await this.submissionRepository.save(submission)

    // Mark invitation as used
    if (tokenResult.isInvitation && tokenResult.invitationToken) {
      await this.formTokenService.markInvitationAsUsed(tokenResult.invitationToken)
    }

    return savedSubmission
  }
}
