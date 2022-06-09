import { registerDecorator, ValidationOptions } from 'class-validator'

const regexTime = /^([01][0-9]|2[0-3]):([0-5][0-9])$/

export function IsTime24h(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTime24h',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: '$property must be a valid 24h time',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          return typeof value === 'string' && regexTime.test(value)
        },
      },
    })
  }
}
