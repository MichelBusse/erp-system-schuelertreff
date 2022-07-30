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

  @Public()
  @Get('pdf')
  async getPdf(@Res() res: Response): Promise<void> {
    const buffer = await this.appService.generatePDF()

    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Length': buffer.length,

      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    })

    res.end(buffer)
  }
}
