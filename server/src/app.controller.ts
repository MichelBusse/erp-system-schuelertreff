import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'

import { AppService } from './app.service'
import { Public } from './auth/decorators/public.decorator'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }

}
