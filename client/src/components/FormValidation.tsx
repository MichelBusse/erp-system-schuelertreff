export function formValidation(form: string, data: any): any {
  const testEmail = (email: string) => /.+@.+\.[A-Za-z]+$/.test(email)

  const errorText = {
    schoolName: 'fehlt',
    firstName: 'fehlt',
    lastName: 'fehlt',
    city: 'fehlt',
    postalCode: 'genau 5 Stellen',
    street: 'fehlt',
    email: 'fehlt',
    phone: 'mind. 10 Stellen',
    subjectName: 'fehlt',
    shortForm: 'fehlt',
    grade: '1 bis 13',
  }

  if (form === 'teacher') {
    const temp = {
      firstName: '',
      lastName: '',
      city: '',
      postalCode: '',
      street: '',
      email: '',
      phone: '',
      validation: false,
    }

    temp.firstName = data.firstName ? '' : errorText.firstName
    temp.lastName = data.lastName ? '' : errorText.lastName
    temp.city = data.city ? '' : errorText.city
    temp.postalCode = data.postalCode.length == 5 ? '' : errorText.postalCode
    temp.street = data.street ? '' : errorText.street
    temp.email = testEmail(data.email) ? '' : errorText.email
    temp.phone = data.phone.length > 9 ? '' : errorText.phone

    if (
      data.firstName &&
      data.lastName &&
      data.city &&
      data.postalCode.length == 5 &&
      data.street &&
      testEmail(data.email) &&
      data.phone.length > 9
    )
      temp.validation = true

    return temp
  }

  if (form === 'privateCustomer') {
    const temp = {
      firstName: '',
      lastName: '',
      city: '',
      postalCode: '',
      street: '',
      email: '',
      phone: '',
      validation: false,
      grade: '',
    }

    temp.firstName = data.firstName ? '' : errorText.firstName
    temp.lastName = data.lastName ? '' : errorText.lastName
    temp.city = data.city ? '' : errorText.city
    temp.postalCode = data.postalCode.length == 5 ? '' : errorText.postalCode
    temp.street = data.street ? '' : errorText.street
    temp.email = testEmail(data.email) ? '' : errorText.email
    temp.phone = data.phone.length > 9 ? '' : errorText.phone
    temp.grade = data.grade > 0 && data.grade < 14 ? '' : errorText.grade

    if (
      data.firstName &&
      data.lastName &&
      data.city &&
      data.postalCode.length == 5 &&
      data.street &&
      testEmail(data.email) &&
      data.phone.length > 9
    )
      temp.validation = true

    return temp
  }

  if (form === 'schoolCustomer') {
    const temp = {
      schoolName: '',
      city: '',
      postalCode: '',
      street: '',
      email: '',
      phone: '',
      validation: false,
    }

    temp.schoolName = data.schoolName ? '' : errorText.schoolName
    temp.city = data.city ? '' : errorText.city
    temp.postalCode = data.postalCode.length == 5 ? '' : errorText.phone
    temp.street = data.street ? '' : errorText.street
    temp.email = testEmail(data.email) ? '' : errorText.email
    temp.phone = data.phone.length > 9 ? '' : errorText.phone

    if (
      data.schoolName &&
      data.city &&
      data.postalCode.length == 5 &&
      data.street &&
      testEmail(data.email) &&
      data.phone.length > 9
    )
      temp.validation = true

    return temp
  }

  if (form === 'subject') {
    const temp = {
      name: '',
      shortForm: '',
      validation: false,
    }

    temp.name = data.name ? '' : errorText.subjectName
    temp.shortForm = data.schortForm ? '' : errorText.shortForm

    if (data.name && data.shortForm) temp.validation = true

    return temp
  }
}
