import { ChildEntity } from 'typeorm';
import { Role, User } from './user.entity';

@ChildEntity()
export class Customer extends User {
  role = Role.CUSTOMER;
}
