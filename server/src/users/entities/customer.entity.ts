import { ChildEntity } from 'typeorm';
import { Role } from 'src/auth/role.enum';
import { User } from './user.entity';

@ChildEntity()
export class Customer extends User {
  role = Role.CUSTOMER;
}
