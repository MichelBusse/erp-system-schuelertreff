import { registerDecorator, ValidationOptions } from 'class-validator'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export function IsValidDate(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDate',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: '$property must be a valid date (YYYY-MM-DD)',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          return (
            typeof value === 'string' &&
            dayjs(value, 'YYYY-MM-DD', true).isValid()
          )
        },
      },
    })
  }
}
