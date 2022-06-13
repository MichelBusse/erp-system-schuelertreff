export function formValidation(form: string, data: any):any{
  const testEmail = (email: string) => /.+@.+\.[A-Za-z]+$/.test(email)

  if(form === 'contract'){
    const temp = {}
    
  }

  if(form === 'teacher'){
    const temp = {}
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

    temp.firstName = data.firstName ? '' : 'Vorname fehlt!'
    temp.lastName = data.lastName ? '' : 'Nachname fehlt!'
    temp.salutation = data.salutation ? '' : 'Anrede fehlt!'
    temp.city = data.city ? '' : 'Stadt fehlt!'
    temp.postalCode = data.postalCode.length == 5 ? '' : 'genau 5 Stellen!'
    temp.street = data.street ? '' : 'Straße fehlt!'
    temp.email = testEmail(data.email) ? '' : 'E-Mail ist nicht korrekt!'
    temp.phone = data.phone.length > 9 ? '' : 'mind. 10 Stellen!'

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

    temp.schoolName = data.schoolName ? '' : 'Schulname fehlt!'
    temp.city = data.city ? '' : 'Stadt fehlt!'
    temp.postalCode = data.postalCode.length == 5 ? '' : 'genau 5 Stellen!'
    temp.street = data.street ? '' : 'Straße fehlt!'
    temp.email = testEmail(data.email) ? '' : 'E-Mail ist nicht korrekt!'
    temp.phone = data.phone.length > 9 ? '' : 'mind. 10 Stellen!'

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
    const temp = {}
  }
}