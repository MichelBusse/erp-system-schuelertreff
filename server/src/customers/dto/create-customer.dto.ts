import { Salutation } from 'src/user';

export class CreateCustomerDto {
  lastName: string;

  firstName: string;

  salutation: Salutation;

  street: string;

  city: string;

  postalCode: number;

  //TODO: E-Mail type?
  email: string;

  phone: string;
}
