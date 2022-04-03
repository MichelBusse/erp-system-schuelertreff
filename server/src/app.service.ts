import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Salutation } from './users/user.entity';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private usersService: UsersService,
    private config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const adminUser = this.config.get<string>('ADMIN_USER');

    if (!(await this.usersService.findOneByEmail(adminUser))) {
      console.log('Creating admin user...');

      this.usersService.createAdmin({
        lastName: 'Administrator',
        firstName: '',
        salutation: Salutation.HERR,
        street: '',
        city: 'Dresden',
        postalCode: '',
        email: adminUser,
        phone: '',
      });
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
