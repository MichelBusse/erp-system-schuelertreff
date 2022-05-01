import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from './role.enum';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from 'src/users/users.service';

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
    return this.authService.login(req.user);
  }

  @Get('refresh')
  async refresh(@Request() req) {
    return this.authService.login(req.user);
  }

  @Roles(Role.ADMIN)
  @Post('reset/:id')
  async adminReset(@Param('id') id: number) {
    const user = await this.usersService.findOne(id);

    return this.authService.initReset(user);
  }

  @Public()
  @Post('reset')
  async reset(@Body() dto: ResetPasswordDto) {
    const payload = await this.authService.validateReset(dto.token);

    return this.usersService.setPassword(payload.sub, dto.password);
  }
}
