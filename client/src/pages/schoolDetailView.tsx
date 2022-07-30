import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import {
  defaultClassCustomerFormData,
  defaultSchoolFormData,
  snackbarOptions,
  snackbarOptionsError,
} from '../consts'
import styles from '../pages/gridList.module.scss'
import { SchoolType } from '../types/enums'
import { classCustomerForm, schoolForm } from '../types/form'
import timeAvailable from '../types/timeAvailable'
import { classCustomer, timesAvailableParsed } from '../types/user'

const SchoolDetailView: React.FC = () => {
  const { API } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const requestedId = id ? id : 'me'

  const [classCustomers, setClassCustomers] = useState<classCustomerForm[]>([])
  const [school, setSchool] = useState<schoolForm>(defaultSchoolFormData)
  const [newClassCustomer, setNewClassCustomer] = useState<classCustomerForm>(
    defaultClassCustomerFormData,
  )
  const [addClassDialogOpen, setAddClassDialogOpen] = useState<boolean>(false)
  const [invoiceData, setInvoiceData] = useState<{
    month: number
    year: number
  }>({ month: dayjs().subtract(1, 'month').month(), year: dayjs().subtract(1,'month').year() })

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
        fee: res.data.fee
      }))
    })
  }, [])

  useEffect(() => {
    API.get('users/classCustomer/' + requestedId).then((res) => {
      setClassCustomers([])
      res.data.map((classCustomer: classCustomer) => {
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
            id: classCustomer.id,
            className: classCustomer.className,
            numberOfStudents: classCustomer.numberOfStudents,
            timesAvailable: newTimesAvailable,
          },
        ])
      })
    })
  }, [])

  const submitForm = () => {
    API.post('users/school/' + requestedId, school)
      .then(() => {
        enqueueSnackbar(school.schoolName + ' gespeichert')
        if (id) navigate('/schools')
      })
      .catch(() => {
        enqueueSnackbar('Fehler beim Speichern der Schuldaten')
      })
  }

  const deleteUser = () => {
    API.delete('users/school/' + requestedId)
      .then(() => {
        enqueueSnackbar(school.schoolName + ' gelöscht')
        navigate('/schools')
      })
      .catch(() => {
        enqueueSnackbar(
          school.schoolName +
            ' kann nicht gelöscht werden, da sie noch Klassen hat',
        )
      })
  }

  const updateClassCustomer = (newValue: timeAvailable[], index: number) => {
    const updatedClassCutomer: classCustomerForm = { ...classCustomers[index] }
    updatedClassCutomer.timesAvailable = newValue

    API.post('users/classCustomer/' + updatedClassCutomer.id, {
      ...updatedClassCutomer,
      timesAvailable: updatedClassCutomer.timesAvailable.map((time) => ({
        dow: time.dow,
        start: time.start?.format('HH:mm'),
        end: time.end?.format('HH:mm'),
      })),
    })
      .then(() => {
        enqueueSnackbar(updatedClassCutomer.className + ' gespeichert')
        setClassCustomers((classCustomers) => {
          const newClassCustomers = [...classCustomers]
          newClassCustomers[index] = updatedClassCutomer

          return newClassCustomers
        })
      })
      .catch((res) => {
        console.log(res)
        enqueueSnackbar('Fehler beim Speichern der Klasse')
      })
  }

  const deleteClass = (index: number) => {
    const classCustomer = classCustomers[index]

    API.delete('users/classCustomer/' + classCustomer.id)
      .then(() => {
        enqueueSnackbar(classCustomer.className + ' gelöscht', snackbarOptions)
        setClassCustomers(classCustomers.filter((_, i) => i !== index))
      })
      .catch(() => {
        enqueueSnackbar(
          classCustomer.className +
            ' kann nicht gelöscht werden, da noch laufende Verträge existieren.',
          snackbarOptionsError,
        )
      })
  }

  const addClass = () => {
    setAddClassDialogOpen(false)
    if (newClassCustomer.className && newClassCustomer.numberOfStudents != 0) {
      API.post('users/classCustomer/', {
        ...newClassCustomer,
        school: requestedId,
        timesAvailable: newClassCustomer.timesAvailable.map((time) => ({
          dow: time.dow,
          start: time.start?.format('HH:mm'),
          end: time.end?.format('HH:mm'),
        })),
      })
        .then(() => {
          setClassCustomers((classCustomers) => [
            ...classCustomers,
            newClassCustomer,
          ])

          setNewClassCustomer(defaultClassCustomerFormData)
          enqueueSnackbar('Klasse erfolgreich hinzugefügt')
        })
        .catch(() => {
          enqueueSnackbar('Fehler beim Erstellen der Klasse')
        })
    } else {
      enqueueSnackbar('Eingabe unvollständig')
    }
  }

  const cancelAddClass = () => {
    setAddClassDialogOpen(false)
    setNewClassCustomer(defaultClassCustomerFormData)
  }

  const generateInvoice = () => {
    API.get('lessons/invoice/school', {
      params: {
        of: dayjs().year(invoiceData.year).month(invoiceData.month).format('YYYY-MM-DD'),
        schoolId: id
      },
    }).then((res) => {
      console.log(res.data)
    }).catch(() => {
      enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
    })
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
          <h3>Schule:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              fullWidth={true}
              label="Schulname"
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  schoolName: event.target.value,
                }))
              }
              value={school.schoolName}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
            <Autocomplete
              fullWidth
              multiple
              id="schoolTypes"
              options={[
                SchoolType.GRUNDSCHULE,
                SchoolType.OBERSCHULE,
                SchoolType.GYMSEK1,
                SchoolType.GYMSEK2,
              ]}
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
                <TextField {...params} variant="outlined" label="Schularten" />
              )}
              value={school.schoolTypes}
              onChange={(_, value) =>
                setSchool((data) => ({ ...data, schoolTypes: value }))
              }
            />
          </Stack>
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

          <h3>Weitere Infos</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              type="number"
              id="fee"
              label="Stundensatz"
              variant="outlined"
              disabled={requestedId === 'me'}
              value={school.fee ?? ''}
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  fee: Number(event.target.value),
                }))
              }
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
          <Stack direction={'row'} columnGap={2}>
            <h3>Klassen:</h3>
            <IconButton
              sx={{ marginLeft: 'auto' }}
              onClick={() => setAddClassDialogOpen(true)}
            >
              <AddCircleIcon fontSize="large" color="primary" />
            </IconButton>
          </Stack>
          {classCustomers.map((classCustomer, index) => (
            <Accordion
              key={classCustomer.className}
              sx={{
                border: '1px solid rgba(0, 0, 0, 0.23)',
                boxShadow: 'none',
                transition: 'none',
                borderRadius: '4px',
                margin: '4px 0',
              }}
            >
              <AccordionSummary
                aria-controls="panel1a-content"
                id="panel1a-header"
                sx={{ alignItems: 'center' }}
              >
                <Stack
                  direction={'row'}
                  sx={{ width: '100%' }}
                  columnGap={2}
                  alignItems={'center'}
                >
                  <Typography sx={{ width: '10em' }}>
                    {classCustomer.className}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {classCustomer.numberOfStudents} Schüler
                  </Typography>
                  <IconButton
                    onClick={() => deleteClass(index)}
                    sx={{ marginLeft: 'auto' }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
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
          <h3>Rechnung generieren:</h3>
          <Stack direction={'row'} columnGap={2}>
            <FormControl fullWidth>
              <InputLabel id="invoiceYearLabel">Jahr</InputLabel>
              <Select
                id="invoiceYear"
                label="Jahr"
                value={invoiceData.year}
                onChange={(event) => {
                  if(!(event.target.value < dayjs().year()) || !(invoiceData.month < dayjs().month())){
                    setInvoiceData((data) => ({
                      ...data,
                      year: dayjs().subtract(1, 'month').year(),
                      month: dayjs().subtract(1, 'month').month()
                    }))

                  }else{
                    setInvoiceData((data) => ({
                      ...data,
                      year: event.target.value as number,
                    }))
                  }
                }
                }
              >
                {[dayjs().year(), dayjs().year() - 1, dayjs().year() - 2, dayjs().year() - 3].map((e) => (
                  <MenuItem value={e} key={e}>
                    {e}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="invoiceMonthLabel">Monat</InputLabel>
              <Select
                id="invoiceMonth"
                label="Monat"
                value={invoiceData.month}
                onChange={(event) =>
                  setInvoiceData((data) => ({
                    ...data,
                    month: event.target.value as number,
                  }))
                }
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter((e) => {
                  if(invoiceData.year < dayjs().year() || e < dayjs().month()){
                    return true;
                  }
                  return false;
                }).map((e) => (
                  <MenuItem value={e} key={e}>
                    {dayjs().month(e).format('MMMM')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant={"outlined"} fullWidth onClick={() => generateInvoice()}>Rechnung generieren</Button>
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
                Schule entfernen
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
      <Dialog open={addClassDialogOpen}>
        <DialogTitle>Klasse hinzufügen</DialogTitle>
        <DialogContent>
          <Stack direction={'column'} rowGap={2} pt={2}>
            <Stack direction="row" columnGap={2}>
              <TextField
                id="className"
                label="Klassenname"
                fullWidth
                variant="outlined"
                required={true}
                value={newClassCustomer.className}
                onChange={(event) =>
                  setNewClassCustomer((data) => ({
                    ...data,
                    className: event.target.value,
                  }))
                }
              />
              <TextField
                type="number"
                id="numberOfStudents"
                label="Schüler"
                variant="outlined"
                fullWidth
                value={newClassCustomer.numberOfStudents}
                InputProps={{ inputProps: { min: 0, max: 50 } }}
                onChange={(event) =>
                  setNewClassCustomer((data) => ({
                    ...data,
                    numberOfStudents: Number(event.target.value),
                  }))
                }
              />
            </Stack>
            <AddTimes
              value={newClassCustomer.timesAvailable}
              setValue={(newValue) =>
                setNewClassCustomer((classCustomer) => ({
                  ...classCustomer,
                  timesAvailable: newValue,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelAddClass} variant={'outlined'}>
            Abbrechen
          </Button>
          <Button onClick={addClass} variant={'contained'}>
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default SchoolDetailView
