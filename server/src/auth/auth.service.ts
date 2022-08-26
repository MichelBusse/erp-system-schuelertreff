import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import ejs from 'ejs'
import nodemailer from 'nodemailer'
import path from 'path'

import { Teacher, User } from 'src/users/entities'
import { DeleteState } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'

import { Role } from './role.enum'

const transporter = nodemailer.createTransport({
  host: 'smtp',
  port: 25,
})

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,

    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailAuth(email)

    if (!user || user.deleteState === DeleteState.DELETED) return null

    try {
      if (
        user.mayAuthenticate &&
        (await argon2.verify(user.passwordHash, password))
      ) {
        const { passwordHash: _, ...result } = user

        return result
      }
    } catch (err) {}

    return null
  }

  async login(user: User) {
    const payload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      state: undefined,
    }

    if (user.role === Role.TEACHER)
      payload.state = (user as unknown as Teacher).state

    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async initReset(user: User, registration = false) {
    const payload = { sub: user.id, reset: true }

    const passwordLink =
      this.config.get<string>('CLIENT_ORIGIN') +
      '/reset/' +
      this.jwtService.sign(payload, { expiresIn: '7d' })

    const deleteLink = registration
      ? this.config.get<string>('CLIENT_ORIGIN') +
        '/cancelRegistration/' +
        this.jwtService.sign(payload, { expiresIn: '1y' })
      : ''

    //TODO: send email to user
    console.log(`reset link for ${user.email} - ${passwordLink}`)

    const mailOptions = !registration
      ? {
          from: 'noreply@m-to-b.com',
          to: user.email,
          subject: 'Schülertreff: Passwort-Reset',
          text:
            'Lege unter folgendem Link dein neues Passwort fest: \n' +
            passwordLink,
        }
      : {
          from: 'noreply@m-to-b.com',
          to: user.email,
          subject: 'Schülertreff: Registrierung',
          html: await ejs.renderFile(
            path.join(__dirname, '../templates', 'registrationEmail.ejs'),
            {
              passwordLink,
              deleteLink,
            },
          ),
          text:
            'Bitte schließe die Registrierung ab, indem du unter folgendem Link dein Passwort festlegst ' +
            'und anschließend alle benötigten Informationen im Profil hinterlegst:\n' +
            passwordLink +
            '\n\n' +
            'Solltest du die Registrierung nicht beauftragt haben oder nicht mehr wünschen, ' +
            'bestätige dies bitte über den folgenden Link. ' +
            'Das Konto und sämtliche zugehörigen Daten werden umgehend entfernt.\n' +
            deleteLink,
        }

    try {
      transporter.sendMail(mailOptions, (error) => {
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
