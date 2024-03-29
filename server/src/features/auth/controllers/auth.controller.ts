import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from 'src/features/users/services/users.service'
import UserRole from 'src/core/enums/UserRole.enum'
import { ResetPasswordDto } from '../dto/reset-password.dto'
import { AuthService } from '../services/auth.service'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import { Public } from 'src/core/decorators/public.decorator'
import { Roles } from 'src/core/decorators/roles.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user)
  }

  @Get('refresh')
  async refresh(@Request() req) {
    return this.authService.login(req.user)
  }

  @Post('reset/mail/admin')
  @Roles(UserRole.ADMIN)
  async adminReset(@Body() body: { mail: string }) {
    const user = await this.usersService.findByEmailAuth(body.mail)

    if (user === null) throw new NotFoundException('Nutzer nicht gefunden')

    if (!user.mayAuthenticate) {
      // If Admin requests reset and user may not authenticate yet, change that
      await this.usersService.updateUserMayAuthenticate(user.id, true)
    }

    this.authService.initReset(user)
  }

  @Public()
  @Post('reset/mail')
  async selfReset(@Body() body: { mail: string }) {
    const user = await this.usersService.findByEmailAuth(body.mail)

    if (user === null || !user.mayAuthenticate)
      throw new NotFoundException('Nutzer nicht gefunden')

    this.authService.initReset(user)
  }

  @Public()
  @Post('reset')
  async reset(@Body() dto: ResetPasswordDto) {
    const payload = await this.authService.validateReset(dto.token)

    return this.usersService.setPassword(payload.sub, dto.password)
  }
}
