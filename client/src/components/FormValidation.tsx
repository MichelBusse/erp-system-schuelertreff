export function formValidation(form: string, data: any):any{
  const testEmail = (email: string) => /.+@.+\.[A-Za-z]+$/.test(email)

  const errorText = {
    schoolName: 'Schulname fehlt',
    firstName: 'Vorname fehlt',
    lastName: 'Nachname fehlt',
    salutation: 'Anrede fehlt',
    city: 'Stadt fehlt',
    postalCode: 'genau 5 Stellen',
    street: 'Straße fehlt',
    email: 'Email fehlt',
    phone: 'mind. 10 Stellen',
    subjectName: 'Fachbezeichnung fehlt',
    shortForm: 'Abkürzung fehlt'
  }

  if(form === 'contract'){
    const temp = {}
    
  }

  if(form === 'teacher'){
    const temp = {
      firstName: '',
      lastName: '',
      salutation: '',
      city: '',
      postalCode: '',
      street: '',
      email: '',
      phone: '',
      validation: false
    }

    temp.firstName = data.firstName ? '' : errorText.firstName
    temp.lastName = data.lastName ? '' : errorText.lastName
    temp.salutation = data.salutation ? '' : errorText.salutation
    temp.city = data.city ? '' : errorText.city
    temp.postalCode = data.postalCode.length == 5 ? '' : errorText.postalCode
    temp.street = data.street ? '' : errorText.street
    temp.email = testEmail(data.email) ? '' : errorText.email
    temp.phone = data.phone.length > 9 ? '' : errorText.phone

    if (
      data.firstName &&
      data.lastName &&
      data.salutation &&
      data.city &&
      data.postalCode.length == 5 &&
      data.street &&
      testEmail(data.email) &&
      data.phone.length > 9
    ) temp.validation = true

    return(temp)
  }

  if(form === 'privateCustomer'){
    const temp = {
      firstName: '',
      lastName: '',
      salutation: '',
      city: '',
      postalCode: '',
      street: '',
      email: '',
      phone: '',
      validation: false
    }

    temp.firstName = data.firstName ? '' : errorText.firstName
    temp.lastName = data.lastName ? '' : errorText.lastName
    temp.salutation = data.salutation ? '' : errorText.salutation
    temp.city = data.city ? '' : errorText.city
    temp.postalCode = data.postalCode.length == 5 ? '' : errorText.postalCode
    temp.street = data.street ? '' : errorText.street
    temp.email = testEmail(data.email) ? '' : errorText.email
    temp.phone = data.phone.length > 9 ? '' : errorText.phone

    if (
      data.firstName &&
      data.lastName &&
      data.salutation &&
      data.city &&
      data.postalCode.length == 5 &&
      data.street &&
      testEmail(data.email) &&
      data.phone.length > 9
    ) temp.validation = true

    return(temp)
  }

  if(form === 'schoolCustomer'){
    const temp = {
      schoolName: '',
      city: '',
      postalCode: '',
      street: '',
      email: '',
      phone: '',
      validation: false
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
    ) temp.validation = true

    return(temp)
  }

  if(form === 'subject'){
    const temp = {
      name: '',
      shortForm: '',
      validation: false
    }

    temp.name = data.name ? '' : errorText.subjectName
    temp.shortForm = data.schortForm ? '' : errorText.shortForm

    if (
      data.name &&
      data.shortForm
    ) temp.validation = true

    return(temp)
  }
}