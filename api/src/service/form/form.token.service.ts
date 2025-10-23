import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FormEntity } from '../../entity/form.entity'
import { SurveyInvitationEntity } from '../../entity/survey.invitation.entity'

export interface TokenValidationResult {
  form: FormEntity
  invitationToken?: string
  isInvitation: boolean
}

@Injectable()
export class FormTokenService {
  constructor(
    @InjectRepository(FormEntity)
    private readonly formRepository: Repository<FormEntity>,
    @InjectRepository(SurveyInvitationEntity)
    private readonly surveyInvitationRepository: Repository<SurveyInvitationEntity>,
  ) {
  }

  async validateAndGetForm(token: string): Promise<TokenValidationResult> {
    if (!token || token.trim() === '') {
      throw new BadRequestException('Token is required')
    }

    // Önce davet linkini kontrol et
    const invitation = await this.surveyInvitationRepository.findOne({
      where: { invitationToken: token }
    })

    if (invitation) {
      // Davet linki bulundu
      if (invitation.isUsed) {
        throw new BadRequestException('This invitation link has already been used')
      }

      // form_id ile form'u bul (form_id aslında form_token)
      const form = await this.formRepository.findOne({
        where: { formToken: invitation.formId }
      })

      if (!form) {
        throw new NotFoundException('Form not found')
      }

      if (!form.isLive) {
        throw new BadRequestException('This form is not active')
      }

      return {
        form,
        invitationToken: token,
        isInvitation: true
      }
    }

    // Davet linki değilse, genel form token olarak kontrol et
    const form = await this.formRepository.findOne({
      where: { formToken: token }
    })

    if (!form) {
      throw new NotFoundException('Form not found')
    }

    if (!form.isLive) {
      throw new BadRequestException('This form is not active')
    }

    return {
      form,
      isInvitation: false
    }
  }

  async markInvitationAsUsed(invitationToken: string): Promise<void> {
    await this.surveyInvitationRepository.update(
      { invitationToken: invitationToken },
      { isUsed: true }
    )
  }
}
