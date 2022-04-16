import { Salutation } from '../entities/user.entity';

export abstract class CreateUserDto {
  lastName: string;

  firstName: string;

  salutation: Salutation;

  street: string;

  city: string;

  postalCode: string;

  email: string;

  phone: string;
}
