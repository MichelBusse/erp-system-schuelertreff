import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailAuth(email);

    try {
      if (user.mayAuthenticate && await argon2.verify(user.passwordHash, password)) {
        const { passwordHash, ...result } = user;

        return result;
      }
    } catch (err) {}

    return null;
  }

  async login(user: User) {
    const payload = { username: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async initReset(user: User) {
    const payload = { sub: user.id, reset: true };

    //TODO: send email to user
    console.log(`reset token for ${user.email} - ${this.jwtService.sign(payload)}`)
  }

  async validateReset(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.reset) {
        const user = await this.usersService.findOne(payload.sub);

        if (payload.iat * 1000 > user.jwtValidAfter.getTime()) return payload;
      }
    } catch (e) {}

    throw new UnauthorizedException();
  }
}
