import { Controller, Get, Param } from '@nestjs/common'
import { SettingService } from '../service/setting.service'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  async getPublicSettings() {
    // Public settings that don't require authentication
    const disabledSignUp = this.settingService.getByKey('SIGNUP_DISABLED')
    const loginNote = this.settingService.getByKey('LOGIN_NOTE')
    const hideContrib = this.settingService.getByKey('HIDE_CONTRIB')

    return {
      disabledSignUp: {
        value: disabledSignUp.isTrue,
      },
      loginNote: {
        value: loginNote.value || '',
      },
      hideContrib: {
        value: hideContrib.isTrue,
      },
    }
  }

  @Get(':key')
  async getSetting(@Param('key') key: string) {
    const setting = this.settingService.getByKey(key)
    return {
      key: setting.key,
      value: setting.value,
      isTrue: setting.isTrue,
    }
  }
}

