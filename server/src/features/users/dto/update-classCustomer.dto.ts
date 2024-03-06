import { UpdateCustomerDto } from './update-customer.dto'

/**
 * Schema for updating a class customer
 */ 
export class UpdateClassCustomerDto extends UpdateCustomerDto {
  className: string
}
