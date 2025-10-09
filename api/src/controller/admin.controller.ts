import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../decorator/roles.decorator'
import { RolesGuard } from '../guard/roles.guard'
import { FormStatisticService } from '../service/form/form.statistic.service'
import { SubmissionStatisticService } from '../service/submission/submission.statistic.service'
import { UserStatisticService } from '../service/user/user.statistic.service'

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(
    private readonly formStatisticService: FormStatisticService,
    private readonly userStatisticService: UserStatisticService,
    private readonly submissionStatisticService: SubmissionStatisticService,
  ) {}

  @Get('statistics')
  @Roles('admin')
  async getStatistics() {
    const [formsTotal, usersTotal, submissionsTotal] = await Promise.all([
      this.formStatisticService.getTotal(),
      this.userStatisticService.getTotal(),
      this.submissionStatisticService.getTotal(),
    ])

    return {
      forms: {
        total: formsTotal,
      },
      users: {
        total: usersTotal,
      },
      submissions: {
        total: submissionsTotal,
      },
    }
  }
}

