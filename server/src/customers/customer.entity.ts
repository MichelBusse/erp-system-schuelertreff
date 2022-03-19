import { Entity } from 'typeorm';
import { User } from 'src/user';

@Entity()
export class Customer extends User {}
