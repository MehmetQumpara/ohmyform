import { Controller, Get, Query, BadRequestException } from '@nestjs/common'
import { FormTokenService } from '../service/form/form.token.service'

@Controller('form/public')
export class FormPublicController {
  constructor(
    private readonly formTokenService: FormTokenService,
  ) {
  }

  @Get()
  async getFormByToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token parameter is required')
    }

    const result = await this.formTokenService.validateAndGetForm(token)

    return {
      form: {
        id: result.form.id,
        title: result.form.title,
        language: result.form.language,
        showFooter: result.form.showFooter,
        isLive: result.form.isLive,
        anonymousSubmission: result.form.anonymousSubmission,
        design: result.form.design,
        startPage: result.form.startPage,
        endPage: result.form.endPage,
        fields: result.form.fields,
      },
      isInvitation: result.isInvitation,
      invitationToken: result.invitationToken,
    }
  }
}
