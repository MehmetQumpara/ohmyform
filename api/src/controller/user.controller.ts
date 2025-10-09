import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '../decorator/user.decorator'
import { UserEntity } from '../entity/user.entity'
import { IdService } from '../service/id.service'
import { UserUpdateService } from '../service/user/user.update.service'

interface ProfileUpdateDto {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  password?: string
  language?: string
}

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    private readonly idService: IdService,
    private readonly userUpdateService: UserUpdateService,
  ) {}

  @Get('me')
  async me(@User() user: UserEntity) {
    return {
      id: this.idService.encode(user.id),
      username: user.username,
      email: user.email,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName,
      language: user.language,
      emailVerified: user.emailVerified,
      created: user.created,
      lastModified: user.lastModified,
    }
  }

  @Put('profile')
  async updateProfile(@User() user: UserEntity, @Body() updateData: ProfileUpdateDto) {
    // UserUpdateService için input yapısını hazırlıyoruz
    const inputData = {
      id: this.idService.encode(user.id),
      username: updateData.username,
      email: updateData.email,
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      password: updateData.password,
      language: updateData.language,
      roles: user.roles, // Kullanıcı kendi rollerini değiştiremez
    }
    
    const updatedUser = await this.userUpdateService.update(user, inputData)
    
    return {
      id: this.idService.encode(updatedUser.id),
      username: updatedUser.username,
      email: updatedUser.email,
      roles: updatedUser.roles,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      language: updatedUser.language,
      emailVerified: updatedUser.emailVerified,
      created: updatedUser.created,
      lastModified: updatedUser.lastModified,
    }
  }
}

