import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../decorator/roles.decorator'
import { User } from '../decorator/user.decorator'
import { UserEntity } from '../entity/user.entity'
import { RolesGuard } from '../guard/roles.guard'
import { FormService } from '../service/form/form.service'
import { FormCreateService } from '../service/form/form.create.service'
import { FormDeleteService } from '../service/form/form.delete.service'
import { FormUpdateService } from '../service/form/form.update.service'
import { IdService } from '../service/id.service'
import { FormCreateInput } from '../dto/form/form.create.input'
import { FormUpdateInput } from '../dto/form/form.update.input'

@Controller('forms')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FormsController {
  constructor(
    private readonly formService: FormService,
    private readonly formCreateService: FormCreateService,
    private readonly formDeleteService: FormDeleteService,
    private readonly formUpdateService: FormUpdateService,
    private readonly idService: IdService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('user')
  async createForm(@Body() input: FormCreateInput, @User() user: UserEntity) {
    try {
      const form = await this.formCreateService.create(user, input)

      return {
      id: this.idService.encode(form.id),
      title: form.title,
      created: form.created,
      lastModified: form.lastModified,
      language: form.language,
      showFooter: form.showFooter,
      anonymousSubmission: form.anonymousSubmission,
      isLive: form.isLive,
      fields: (form.fields || []).map((field) => ({
        id: this.idService.encode(field.id),
        idx: field.idx,
        title: field.title,
        slug: field.slug,
        type: field.type,
        description: field.description,
        required: field.required,
        defaultValue: field.defaultValue,
        options: (field.options || []).map((option) => ({
          id: this.idService.encode(option.id),
          key: option.key,
          title: option.title,
          value: option.value,
        })),
        logic: (field.logic || []).map((logic) => ({
          id: this.idService.encode(logic.id),
          action: logic.action,
          formula: logic.formula,
          enabled: logic.enabled,
          jumpTo: logic.jumpTo ? this.idService.encode(logic.jumpTo.id) : null,
          require: logic.require,
          visible: logic.visible,
          disable: logic.disable,
        })),
        rating: field.rating ? {
          steps: field.rating.steps,
          shape: field.rating.shape,
        } : null,
      })),
      hooks: (form.hooks || []).map((hook) => ({
        id: this.idService.encode(hook.id),
        enabled: hook.enabled,
        format: hook.format,
        url: hook.url,
      })),
      notifications: (form.notifications || []).map((notification) => ({
        id: this.idService.encode(notification.id),
        enabled: notification.enabled,
        subject: notification.subject,
        htmlTemplate: notification.htmlTemplate,
        fromField: notification.fromField,
        fromEmail: notification.fromEmail,
        toField: notification.toField,
        toEmail: notification.toEmail,
      })),
      design: {
        colors: {
          background: form.design.colors.background,
          question: form.design.colors.question,
          answer: form.design.colors.answer,
          button: form.design.colors.button,
          buttonActive: form.design.colors.buttonActive,
          buttonText: form.design.colors.buttonText,
        },
        font: form.design.font,
        layout: form.design.layout,
      },
      startPage: {
        id: this.idService.encode(form.startPage.id),
        show: form.startPage.show,
        title: form.startPage.title,
        paragraph: form.startPage.paragraph,
        buttonText: form.startPage.buttonText,
        buttons: (form.startPage?.buttons || []).map((button) => ({
          id: this.idService.encode(button.id),
          url: button.url,
          action: button.action,
          text: button.text,
          bgColor: button.bgColor,
          activeColor: button.activeColor,
          color: button.color,
        })),
      },
      endPage: {
        id: this.idService.encode(form.endPage.id),
        show: form.endPage.show,
        title: form.endPage.title,
        paragraph: form.endPage.paragraph,
        buttonText: form.endPage.buttonText,
        buttons: (form.endPage?.buttons || []).map((button) => ({
          id: this.idService.encode(button.id),
          url: button.url,
          action: button.action,
          text: button.text,
          bgColor: button.bgColor,
          activeColor: button.activeColor,
          color: button.color,
        })),
      },
      admin: {
        id: this.idService.encode(form.admin.id),
        username: form.admin.username,
        email: form.admin.email,
      },
      }
    } catch (e) {
      throw new BadRequestException((e as Error).message || 'Failed to create form')
    }
  }

  @Get()
  @Roles('user')
  async listForms(
    @User() user: UserEntity,
    @Query('start') start?: number,
    @Query('limit') limit?: number,
  ) {
    const startNum = start || 0
    const limitNum = limit || 50

    const [forms, total] = await this.formService.find(
      startNum,
      limitNum,
      {},
      user.roles.includes('superuser') ? null : user,
    )

    return {
      entries: forms.map((form) => ({
        id: this.idService.encode(form.id),
        created: form.created,
        lastModified: form.lastModified,
        title: form.title,
        isLive: form.isLive,
        language: form.language,
        admin: {
          id: this.idService.encode(form.admin.id),
          email: form.admin.email,
          username: form.admin.username,
        },
      })),
      total,
      limit: limitNum,
      start: startNum,
    }
  }

  @Get(':id')
  @Roles('user')
  async getForm(@Param('id') id: string, @User() user: UserEntity) {
    const formId = this.idService.decode(id)
    const form = await this.formService.findById(formId)

    // Check if user has access to this form
    if (!this.formService.isAdmin(form, user)) {
      throw new ForbiddenException('You do not have access to this form')
    }

    return {
      id: this.idService.encode(form.id),
      title: form.title,
      created: form.created,
      lastModified: form.lastModified,
      language: form.language,
      showFooter: form.showFooter,
      anonymousSubmission: form.anonymousSubmission,
      isLive: form.isLive,
      fields: form.fields.map((field) => ({
        id: this.idService.encode(field.id),
        idx: field.idx,
        title: field.title,
        slug: field.slug,
        type: field.type,
        description: field.description,
        required: field.required,
        defaultValue: field.defaultValue,
        options: field.options.map((option) => ({
          id: this.idService.encode(option.id),
          key: option.key,
          title: option.title,
          value: option.value,
        })),
        logic: field.logic.map((logic) => ({
          id: this.idService.encode(logic.id),
          action: logic.action,
          formula: logic.formula,
          enabled: logic.enabled,
          jumpTo: logic.jumpTo ? this.idService.encode(logic.jumpTo.id) : null,
          require: logic.require,
          visible: logic.visible,
          disable: logic.disable,
        })),
        rating: field.rating ? {
          steps: field.rating.steps,
          shape: field.rating.shape,
        } : null,
      })),
      hooks: form.hooks.map((hook) => ({
        id: this.idService.encode(hook.id),
        enabled: hook.enabled,
        format: hook.format,
        url: hook.url,
      })),
      notifications: form.notifications.map((notification) => ({
        id: this.idService.encode(notification.id),
        enabled: notification.enabled,
        subject: notification.subject,
        htmlTemplate: notification.htmlTemplate,
        fromField: notification.fromField,
        fromEmail: notification.fromEmail,
        toField: notification.toField,
        toEmail: notification.toEmail,
      })),
      design: {
        colors: {
          background: form.design.colors.background,
          question: form.design.colors.question,
          answer: form.design.colors.answer,
          button: form.design.colors.button,
          buttonActive: form.design.colors.buttonActive,
          buttonText: form.design.colors.buttonText,
        },
        font: form.design.font,
        layout: form.design.layout,
      },
      startPage: {
        id: this.idService.encode(form.startPage.id),
        show: form.startPage.show,
        title: form.startPage.title,
        paragraph: form.startPage.paragraph,
        buttonText: form.startPage.buttonText,
        buttons: form.startPage.buttons.map((button) => ({
          id: this.idService.encode(button.id),
          url: button.url,
          action: button.action,
          text: button.text,
          bgColor: button.bgColor,
          activeColor: button.activeColor,
          color: button.color,
        })),
      },
      endPage: {
        id: this.idService.encode(form.endPage.id),
        show: form.endPage.show,
        title: form.endPage.title,
        paragraph: form.endPage.paragraph,
        buttonText: form.endPage.buttonText,
        buttons: form.endPage.buttons.map((button) => ({
          id: this.idService.encode(button.id),
          url: button.url,
          action: button.action,
          text: button.text,
          bgColor: button.bgColor,
          activeColor: button.activeColor,
          color: button.color,
        })),
      },
      admin: {
        id: this.idService.encode(form.admin.id),
        username: form.admin.username,
        email: form.admin.email,
      },
    }
  }

  @Put(':id')
  @Roles('user')
  async updateForm(
    @Param('id') id: string,
    @Body() input: FormUpdateInput,
    @User() user: UserEntity,
  ) {
    const formId = this.idService.decode(id)
    const form = await this.formService.findById(formId)

    // Check if user has access to this form
    if (!this.formService.isAdmin(form, user)) {
      throw new ForbiddenException('You do not have access to this form')
    }

    const updatedForm = await this.formUpdateService.update(form, { ...input, id })

    return {
      id: this.idService.encode(updatedForm.id),
      title: updatedForm.title,
      created: updatedForm.created,
      lastModified: updatedForm.lastModified,
      language: updatedForm.language,
      showFooter: updatedForm.showFooter,
      anonymousSubmission: updatedForm.anonymousSubmission,
      isLive: updatedForm.isLive,
      fields: updatedForm.fields.map((field) => ({
        id: this.idService.encode(field.id),
        idx: field.idx,
        title: field.title,
        slug: field.slug,
        type: field.type,
        description: field.description,
        required: field.required,
        defaultValue: field.defaultValue,
        options: field.options.map((option) => ({
          id: this.idService.encode(option.id),
          key: option.key,
          title: option.title,
          value: option.value,
        })),
        logic: field.logic.map((logic) => ({
          id: this.idService.encode(logic.id),
          action: logic.action,
          formula: logic.formula,
          enabled: logic.enabled,
          jumpTo: logic.jumpTo ? this.idService.encode(logic.jumpTo.id) : null,
          require: logic.require,
          visible: logic.visible,
          disable: logic.disable,
        })),
        rating: field.rating ? {
          steps: field.rating.steps,
          shape: field.rating.shape,
        } : null,
      })),
      hooks: updatedForm.hooks.map((hook) => ({
        id: this.idService.encode(hook.id),
        enabled: hook.enabled,
        format: hook.format,
        url: hook.url,
      })),
      notifications: updatedForm.notifications.map((notification) => ({
        id: this.idService.encode(notification.id),
        enabled: notification.enabled,
        subject: notification.subject,
        htmlTemplate: notification.htmlTemplate,
        fromField: notification.fromField,
        fromEmail: notification.fromEmail,
        toField: notification.toField,
        toEmail: notification.toEmail,
      })),
      design: {
        colors: {
          background: updatedForm.design.colors.background,
          question: updatedForm.design.colors.question,
          answer: updatedForm.design.colors.answer,
          button: updatedForm.design.colors.button,
          buttonActive: updatedForm.design.colors.buttonActive,
          buttonText: updatedForm.design.colors.buttonText,
        },
        font: updatedForm.design.font,
        layout: updatedForm.design.layout,
      },
      startPage: {
        id: this.idService.encode(updatedForm.startPage.id),
        show: updatedForm.startPage.show,
        title: updatedForm.startPage.title,
        paragraph: updatedForm.startPage.paragraph,
        buttonText: updatedForm.startPage.buttonText,
        buttons: updatedForm.startPage.buttons.map((button) => ({
          id: this.idService.encode(button.id),
          url: button.url,
          action: button.action,
          text: button.text,
          bgColor: button.bgColor,
          activeColor: button.activeColor,
          color: button.color,
        })),
      },
      endPage: {
        id: this.idService.encode(updatedForm.endPage.id),
        show: updatedForm.endPage.show,
        title: updatedForm.endPage.title,
        paragraph: updatedForm.endPage.paragraph,
        buttonText: updatedForm.endPage.buttonText,
        buttons: updatedForm.endPage.buttons.map((button) => ({
          id: this.idService.encode(button.id),
          url: button.url,
          action: button.action,
          text: button.text,
          bgColor: button.bgColor,
          activeColor: button.activeColor,
          color: button.color,
        })),
      },
      admin: {
        id: this.idService.encode(updatedForm.admin.id),
        username: updatedForm.admin.username,
        email: updatedForm.admin.email,
      },
    }
  }

  @Delete(':id')
  @Roles('user')
  async deleteForm(@Param('id') id: string, @User() user: UserEntity) {
    const formId = this.idService.decode(id)
    let form
    try {
      form = await this.formService.findById(formId)
    } catch (e) {
      throw new NotFoundException('Form not found')
    }

    // Check if user has access to delete this form
    if (!this.formService.isAdmin(form, user)) {
      throw new ForbiddenException('You do not have permission to delete this form')
    }

    await this.formDeleteService.delete(formId)

    return { 
      status: 'ok',
      message: 'Form deleted successfully'
    }
  }
}

