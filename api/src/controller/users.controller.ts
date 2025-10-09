import { Body, Controller, Delete, Get, NotFoundException, Param, Put, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../decorator/roles.decorator'
import { RolesGuard } from '../guard/roles.guard'
import { IdService } from '../service/id.service'
import { UserService } from '../service/user/user.service'
import { UserDeleteService } from '../service/user/user.delete.service'
import { UserUpdateService } from '../service/user/user.update.service'
import { UserUpdateInput } from '../dto/user/user.update.input'

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly userDeleteService: UserDeleteService,
    private readonly userUpdateService: UserUpdateService,
    private readonly idService: IdService,
  ) {}

  @Get()
  async listUsers(
    @Query('start') start?: number,
    @Query('limit') limit?: number,
  ) {
    const startNum = start || 0
    const limitNum = limit || 50

    const [users, total] = await this.userService.find(startNum, limitNum, {})

    return {
      entries: users.map((user) => ({
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
      })),
      total,
      limit: limitNum,
      start: startNum,
    }
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const userId = this.idService.decode(id)
    const user = await this.userService.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

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

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() input: UserUpdateInput) {
    const userId = this.idService.decode(id)
    const user = await this.userService.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const updatedUser = await this.userUpdateService.update(user, { ...input, id })

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

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const userId = this.idService.decode(id)
    const user = await this.userService.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.userDeleteService.delete(userId)

    return {
      status: 'ok',
      message: 'User deleted successfully',
    }
  }
}

