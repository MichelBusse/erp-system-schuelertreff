import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectDataSource } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { DataSource } from 'typeorm'

import { UsersService } from './users/users.service'

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectDataSource()
    private connection: DataSource,

    private config: ConfigService,

    private usersService: UsersService,
  ) {}

  async onApplicationBootstrap() {
    await this.initDb()
    await this.createAdminUser()
  }

  private async initDb() {
    const runner = this.connection.createQueryRunner()

    await runner.connect()

    await runner.query(`
      CREATE or REPLACE FUNCTION int_tstzmultirange(a tstzmultirange, b tstzmultirange)
        returns tstzmultirange language plpgsql as
          'begin return a * b; end';

      CREATE or REPLACE AGGREGATE intersection ( tstzmultirange ) (
        SFUNC = int_tstzmultirange,
        STYPE = tstzmultirange,
        INITCOND = '{[,]}'
      );

      CREATE or REPLACE FUNCTION union_tstzmultirange(a tstzmultirange, b tstzmultirange)
        returns tstzmultirange language plpgsql as
          'begin return a + b; end';

      CREATE or REPLACE AGGREGATE union_multirange ( tstzmultirange ) (
        SFUNC = union_tstzmultirange,
        STYPE = tstzmultirange,
        INITCOND = '{}'
      );
    `)

    await runner.release()
  }

  private async createAdminUser() {
    const adminUser = this.config.get<string>('ADMIN_USER')

    // create intial admin user if it does not exist
    if (!(await this.usersService.findByEmailAuth(adminUser))) {
      const password = nanoid()

      console.log(`Creating admin user with password '${password}'`)

      const user = await this.usersService.createAdmin({
        lastName: 'Administrator',
        firstName: '',
        email: adminUser,
      })

      this.usersService.setPassword(user.id, password)
    }
  }

  getHello(): string {
    return 'Hello World!'
  }
}
