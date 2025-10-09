import { Body, Controller, HttpCode, Post, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { AuthService } from '../service/auth/auth.service'
import { UserCreateService } from '../service/user/user.create.service'
import { UserCreateInput } from '../dto/user/user.create.input'

@Controller('login')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userCreateService: UserCreateService,
  ) {}

  @Post()
  @HttpCode(200)
  async login(@Body('username') username: string, @Body('password') password: string) {
    const user = await this.authService.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı')
    }
    return this.authService.login(user)
  }

  @Post('/register')
  @HttpCode(201)
  async register(@Body() input: UserCreateInput) {
    try {
      const user = await this.userCreateService.create(input)
      return this.authService.login(user)
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }
}
