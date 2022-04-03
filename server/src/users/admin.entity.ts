import { ChildEntity } from 'typeorm';
import { Role, User } from './user.entity';

@ChildEntity()
export class Admin extends User {
  role = Role.ADMIN;
}
