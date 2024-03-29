import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from 'src/features/users/services/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub)

    // reject password reset token
    if (payload.reset) return

    // reject if the JWT was issued before e.g. the last password reset
    if (payload.iat * 1000 < user.jwtValidAfter.getTime()) return

    return user
  }
}
