import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectDataSource } from '@nestjs/typeorm'
import ejs from 'ejs'
import { readFileSync } from 'fs'
import { nanoid } from 'nanoid'
import path from 'path'
import * as puppeteer from 'puppeteer'
import { DataSource } from 'typeorm'

import { UsersService } from './users/users.service'

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectConnection()
    private connection: Connection,

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

  async generatePDF(): Promise<Buffer> {
    const passengers = [
      {
        name: 'Joyce',
        flightNumber: 7859,
        time: '18:00',
      },
      {
        name: 'Brock',
        flightNumber: 7859,
        time: '18:00',
      },
      {
        name: 'Eve',
        flightNumber: 7859,
        time: '18:00',
      },
    ]

    const filePath = path.join(__dirname, 'templates/test.ejs')

    const content = await ejs.renderFile(filePath, { passengers })

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(content)

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        left: '20px',
        top: '20px',
        right: '20px',
        bottom: '20px',
      },
    })

    await browser.close()

    return buffer
  }
}
