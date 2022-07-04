import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  DialogActions,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import { defaultClassCustomerFormData, defaultSchoolFormData } from '../consts'
import styles from '../pages/gridList.module.scss'
import { SchoolType } from '../types/enums'
import { classCustomerForm, schoolForm } from '../types/form'
import timeAvailable from '../types/timeAvailable'
import { timesAvailableParsed } from '../types/user'

const SchoolDetailView: React.FC = () => {
  const { API } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const requestedId = id ? id : 'me'

  const [classCustomers, setClassCustomers] = useState<classCustomerForm[]>([])
  const [school, setSchool] = useState<schoolForm>(defaultSchoolFormData)
  const [newClassCustomer, setNewClassCustomer] = useState<classCustomerForm>(
    defaultClassCustomerFormData,
  )

  useEffect(() => {
    API.get('users/school/' + requestedId).then((res) => {
      setSchool((data) => ({
        ...data,
        schoolName: res.data.schoolName,
        city: res.data.city,
        postalCode: res.data.postalCode,
        street: res.data.street,
        email: res.data.email,
        phone: res.data.phone,
        schoolTypes: res.data.schoolTypes,
      }))
    })
  }, [])

  useEffect(() => {
    API.get('users/classCustomer/' + requestedId).then((res) => {
      setClassCustomers([])
      res.data.map((classCustomer: any) => {
        const newTimesAvailable =
          classCustomer.timesAvailableParsed.length === 1 &&
          classCustomer.timesAvailableParsed[0].dow === 1 &&
          classCustomer.timesAvailableParsed[0].start === '00:00' &&
          classCustomer.timesAvailableParsed[0].end === '00:00'
            ? []
            : classCustomer.timesAvailableParsed.map(
                (time: timesAvailableParsed) => ({
                  dow: time.dow,
                  start: dayjs(time.start, 'HH:mm'),
                  end: dayjs(time.end, 'HH:mm'),
                  id: nanoid(),
                }),
              )

        setClassCustomers((data: classCustomerForm[]) => [
          ...data,
          {
            className: classCustomer.className,
            numberOfStudents: classCustomer.numberOfStudents,
            grade: classCustomer.grade,
            timesAvailable: newTimesAvailable,
            schoolTypes: classCustomer.schoolTypes,
          },
        ])
      })
    })
  }, [])

  const submitForm = () => {
    //   setErrors(formValidation('privateCustomer', data))
    //   if (formValidation('privateCustomer', data).validation) {
    //     API.post('users/privateCustomer/' + requestedId, {
    //       ...data,
    //       timesAvailable: data.timesAvailable.map((time) => ({
    //         dow: time.dow,
    //         start: time.start?.format('HH:mm'),
    //         end: time.end?.format('HH:mm'),
    //       })),
    //     }).then(() => {
    //       enqueueSnackbar(data.firstName + ' ' + data.lastName + ' gespeichert')
    //       if (id) navigate('/privateCustomers')
    //     })
    //   }
  }

  const deleteUser = () => {
    console.log('deletePrivateCustomer')
  }

  const updateClassCustomer = (newValue: timeAvailable[], index: number) => {
    setClassCustomers((classCustomers) => {
      const newClassCustomers = [...classCustomers]
      newClassCustomers[index] = {
        ...classCustomers[index],
        timesAvailable: newValue,
      }

      return newClassCustomers
    })
  }

  const deleteClass = (index: number) => {
    setClassCustomers(classCustomers.filter((_, i) => i !== index))
  }

  const addClass = () => {
    if (
      newClassCustomer.className &&
      newClassCustomer.numberOfStudents != 0 &&
      newClassCustomer.schoolTypes.length != 0
    ) {
      setClassCustomers((classCustomers) => [
        ...classCustomers,
        newClassCustomer,
      ])

      setNewClassCustomer(defaultClassCustomerFormData)
    }
  }

  const cancelAddClass = () => {
    setNewClassCustomer(defaultClassCustomerFormData)
  }

  return (
    <div className={styles.wrapper}>
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          padding: '30px',
          boxSizing: 'border-box',
          borderRadius: '25px',
        }}
      >
        <Stack direction="column" alignItems={'stretch'}>
          <h1>
            {school.schoolName} ({school.schoolTypes.map((Type) => Type + ' ')})
          </h1>
          <h3>Adresse:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              label="Straße"
              fullWidth={true}
              value={school.street}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Postleitzahl"
              fullWidth={true}
              value={school.postalCode}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Stadt"
              fullWidth={true}
              value={school.city}
              InputProps={{
                readOnly: false,
              }}
            />
          </Stack>
          <h3>Kontakt:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField fullWidth={true} label="Email" value={school.email} />

            <TextField
              fullWidth={true}
              label="Telefonnummer"
              value={school.phone}
            />
          </Stack>
          <h3>Klassen:</h3>
          <Stack direction="column" rowGap={2}>
            <Box sx={{ bgcolor: 'background.default' }}>
              {classCustomers.map((classCustomer, index) => (
                <Accordion key={classCustomer.className}>
                  <AccordionSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography sx={{ width: '20%' }}>
                      {classCustomer.className}
                    </Typography>
                    <Typography sx={{ width: '20%', color: 'text.secondary' }}>
                      {classCustomer.numberOfStudents} Schüler
                    </Typography>
                    <Typography sx={{ width: '20%', color: 'text.secondary' }}>
                      {classCustomer.schoolTypes}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => deleteClass(index)}
                      sx={{ marginLeft: 'auto' }}
                      color="error"
                    >
                      Entfernen
                    </Button>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <AddTimes
                        value={classCustomer.timesAvailable}
                        setValue={(newValue) =>
                          updateClassCustomer(newValue, index)
                        }
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
            <Stack
              direction="column"
              rowGap={2}
              sx={{
                padding: '15px',
                backgroundColor: '#D9D9D9',
                borderRadius: '5px',
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>
                Klasse hinzufügen
              </Typography>
              <Stack direction="row" columnGap={2}>
                <TextField
                  size="small"
                  id="className"
                  label="Klassenname"
                  variant="outlined"
                  required={true}
                  sx={{ width: '15%' }}
                  value={newClassCustomer.className}
                  onChange={(event) =>
                    setNewClassCustomer((data) => ({
                      ...data,
                      className: event.target.value,
                    }))
                  }
                />
                <TextField
                  size="small"
                  type="number"
                  id="numberOfStudents"
                  label="Schüler"
                  variant="outlined"
                  sx={{ width: '7%' }}
                  value={newClassCustomer.numberOfStudents}
                  InputProps={{ inputProps: { min: 0, max: 50 } }}
                  onChange={(event) =>
                    setNewClassCustomer((data) => ({
                      ...data,
                      numberOfStudents: Number(event.target.value),
                    }))
                  }
                />
                <Autocomplete
                  multiple
                  size="small"
                  sx={{ width: '25%' }}
                  id="schoolTypes"
                  options={school.schoolTypes}
                  getOptionLabel={(option) => {
                    switch (option) {
                      case SchoolType.GRUNDSCHULE:
                        return 'Grundschule'
                      case SchoolType.OBERSCHULE:
                        return 'Oberschule'
                      case SchoolType.GYMSEK1:
                        return 'Gymnasium Sek. 1'
                      case SchoolType.GYMSEK2:
                        return 'Gymnasium Sek. 2'
                      default:
                        return ''
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Schularten"
                    />
                  )}
                  value={newClassCustomer.schoolTypes}
                  onChange={(_, value) =>
                    setNewClassCustomer((data) => ({
                      ...data,
                      schoolTypes: value,
                    }))
                  }
                />
              </Stack>
              <Box>
                <AddTimes
                  value={newClassCustomer.timesAvailable}
                  setValue={(newValue) =>
                    setNewClassCustomer((classCustomer) => ({
                      ...classCustomer,
                      timesAvailable: newValue,
                    }))
                  }
                />
                <DialogActions>
                  <Button onClick={cancelAddClass}>Abbrechen</Button>
                  <Button onClick={addClass}>Hinzufügen</Button>
                </DialogActions>
              </Box>
            </Stack>
          </Stack>
          <Stack direction={'row'} columnGap={5} sx={{ marginTop: '15px' }}>
            {id && (
              <Button
                onClick={() => {
                  navigate('/schools')
                }}
                variant="outlined"
              >
                Abbrechen
              </Button>
            )}
            <Button onClick={submitForm} variant="contained">
              Speichern
            </Button>
            {id && (
              <Button
                variant="outlined"
                onClick={deleteUser}
                sx={{ marginLeft: 'auto' }}
                color="error"
              >
                Entfernen
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </div>
  )
}

export default SchoolDetailView
