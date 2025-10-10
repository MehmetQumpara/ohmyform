import { Controller, Get } from '@nestjs/common'

@Controller('status')
export class StatusController {
  @Get()
  getStatus() {
    return {
      version: process.env.version || 'dev',
    }
  }
}

