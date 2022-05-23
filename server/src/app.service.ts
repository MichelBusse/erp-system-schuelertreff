import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { nanoid } from 'nanoid'

import { Salutation } from './users/entities/user.entity'
import { UsersService } from './users/users.service'

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private usersService: UsersService,
    private config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const adminUser = this.config.get<string>('ADMIN_USER')

    // create intial admin user if it does not exist
    if (!(await this.usersService.findByEmailAuth(adminUser))) {
      const password = nanoid()

      console.log(`Creating admin user with password '${password}'`)

      const user = await this.usersService.createAdmin({
        lastName: 'Administrator',
        firstName: '',
        salutation: Salutation.HERR,
        street: '',
        city: '',
        postalCode: '',
        email: adminUser,
        phone: '',
      })

      this.usersService.setPassword(user.id, password)
    }
  }

  getHello(): string {
    return 'Hello World!'
  }
}
