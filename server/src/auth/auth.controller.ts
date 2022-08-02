import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'

import { UsersService } from 'src/users/users.service'

import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'
import { Roles } from './decorators/roles.decorator'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { Role } from './role.enum'

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

  @Public()
  @Post('reset/mail')
  async adminReset(@Body() body: {mail: string}) {
    const user = await this.usersService.findByEmailAuth(body.mail)

    return this.authService.initReset(user)
  }

  @Public()
  @Post('reset')
  async reset(@Body() dto: ResetPasswordDto) {
    const payload = await this.authService.validateReset(dto.token)

    return this.usersService.setPassword(payload.sub, dto.password)
  }
}
