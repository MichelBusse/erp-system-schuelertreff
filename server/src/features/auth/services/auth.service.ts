import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import nodemailer from 'nodemailer'
import UserDeleteState from 'src/core/enums/UserDeleteState.enum'
import UserRole from 'src/core/enums/UserRole.enum'
import {
  passwordResetMail,
  passwordResetMailSchools,
  registrationMailText,
  registrationMailTextSchool,
} from 'src/core/res/mailTexts'
import { School } from 'src/features/users/entities/school.entity'
import { Teacher } from 'src/features/users/entities/teacher.entity'
import { User } from 'src/features/users/entities/user.entity'
import { UsersService } from 'src/features/users/services/users.service'


@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,

    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private transport = nodemailer.createTransport(
    {
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
    },
    {
      from: this.config.get<string>('EMAIL_NOREPLY'),
      replyTo: this.config.get<string>('EMAIL_FROM'),
    },
  )

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailAuth(email)

    if (!user || user.deleteState === UserDeleteState.DELETED) {
      console.log(`Login failed for ${email}: User not found or is deleted`)
      return null
    }

    try {
      if (
        user.mayAuthenticate &&
        (await argon2.verify(user.passwordHash, password))
      ) {
        const { passwordHash: _, ...result } = user

        return result
      }
    } catch (err) {
      console.log(err)
    }

    console.log(
      `Login failed for ${email}: User may not authenticate or password hash could not be verified`,
    )
    return null
  }

  async login(user: User) {
    const payload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      state: undefined,
    }

    if (user.role === UserRole.TEACHER)
      payload.state = (user as unknown as Teacher).state

    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async initReset(user: User | School) {
    const payload = { sub: user.id, reset: true }

    const link =
      this.config.get<string>('CLIENT_ORIGIN') +
      '/reset/' +
      this.jwtService.sign(payload, { expiresIn: '7d' })

    console.log(`reset link for ${user.email} - ${link}`)

    const mailOptions = {
      to: user.email,
      subject: 'Schülertreff - Passwort-Reset',
      text: passwordResetMail(link),
    }

    if (user.role === UserRole.SCHOOL) {
      mailOptions.text = passwordResetMailSchools(
        link,
        (user as School).schoolName,
      )
    } else {
      mailOptions.text = passwordResetMail(link)
    }

    // Welcome Mail when setting password the first time
    if (!user.passwordHash || user.passwordHash === '') {
      if (user.role === UserRole.SCHOOL) {
        mailOptions.subject = 'Willkommen auf unserer Plattform! | Schülertreff'
        mailOptions.text = registrationMailTextSchool(
          link,
          (user as School).schoolName,
        )
      } else {
        mailOptions.subject = 'Willkommen bei Schülertreff'
        mailOptions.text = registrationMailText(link)
      }
    }

    try {
      this.transport.sendMail(mailOptions, (error) => {
        if (error) console.log(error)
      })
    } catch {
      console.log('Failed to send Reminder Mail to ' + user.email)
    }
  }

  async validateReset(token: string) {
    try {
      const payload = this.jwtService.verify(token)

      if (payload.reset) {
        const user = await this.usersService.findOne(payload.sub)

        if (payload.iat * 1000 > user.jwtValidAfter.getTime()) return payload
      }
    } catch (e) {}

    throw new UnauthorizedException()
  }
}
