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
  IconButton,
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
import ConfirmationDialog, {
  ConfirmationDialogProps,
  defaultConfirmationDialogProps,
} from '../components/ConfirmationDialog'
import InvoiceDataSelect from '../components/InvoiceDateSelect'
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

  const [confirmationDialogProps, setConfirmationDialogProps] =
    useState<ConfirmationDialogProps>(defaultConfirmationDialogProps)

  useEffect(() => {
    API.get('users/school/' + requestedId).then((res) => {
      setSchool((data) => ({
        ...data,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        schoolName: res.data.schoolName,
        city: res.data.city,
        postalCode: res.data.postalCode,
        street: res.data.street,
        email: res.data.email,
        phone: res.data.phone,
        schoolTypes: res.data.schoolTypes,
        fee: res.data.fee,
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
            schoolType: classCustomer.schoolType,
            grade: classCustomer.grade,
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
    setConfirmationDialogProps({
      open: true,
      setProps: setConfirmationDialogProps,
      title: `${school.schoolName} wirklich löschen?`,
      text: `Möchtest du die Schule '${school.schoolName}' wirklich löschen? Wenn noch laufende Verträge mit einigen Klassen existieren, kann die Schule nicht gelöscht werden.`,
      action: () => {
        API.delete('users/school/' + requestedId)
          .then(() => {
            enqueueSnackbar(school.schoolName + ' gelöscht')
            navigate('/schools')
          })
          .catch(() => {
            enqueueSnackbar(
              school.schoolName +
                ' kann nicht gelöscht werden, da sie noch Klassen hat',
              snackbarOptionsError,
            )
          })
      },
    })
  }

  const editClassCustomer = (
    newValue: {
      timesAvailable?: timeAvailable[]
      schoolType?: SchoolType
      grade?: number
      className?: string
    },
    index: number,
  ) => {
    const updatedClassCutomer: classCustomerForm = {
      ...classCustomers[index],
      ...newValue,
    }

    setClassCustomers((classCustomers) => {
      const newClassCustomers = [...classCustomers]
      newClassCustomers[index] = updatedClassCutomer

      return newClassCustomers
    })
  }

  const saveClassCustomer = (index: number) => {
    const updatedClassCutomer = classCustomers[index]

    if(updatedClassCutomer.className.trim() === "") return;

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
      })
      .catch((res) => {
        console.log(res)
        enqueueSnackbar('Fehler beim Speichern der Klasse')
      })
  }

  const deleteClass = (index: number) => {
    const classCustomer = classCustomers[index]

    setConfirmationDialogProps({
      open: true,
      setProps: setConfirmationDialogProps,
      title: `${classCustomer.className} wirklich löschen?`,
      text: `Möchtest du die Klasse ${classCustomer.className} wirklich löschen?`,
      action: () => {
        API.delete('users/classCustomer/' + classCustomer.id)
          .then(() => {
            enqueueSnackbar(
              classCustomer.className + ' gelöscht',
              snackbarOptions,
            )
            setClassCustomers(classCustomers.filter((_, i) => i !== index))
          })
          .catch(() => {
            enqueueSnackbar(
              classCustomer.className +
                ' kann nicht gelöscht werden, da noch laufende Verträge existieren.',
              snackbarOptionsError,
            )
          })
      },
    })
  }

  const addClass = () => {
    setAddClassDialogOpen(false)
    if (newClassCustomer.className) {
      API.post('users/classCustomer/', {
        ...newClassCustomer,
        school: requestedId,
        timesAvailable: newClassCustomer.timesAvailable.map((time) => ({
          dow: time.dow,
          start: time.start?.format('HH:mm'),
          end: time.end?.format('HH:mm'),
        })),
      })
        .then((res) => {
          const newTimesAvailable =
            res.data.timesAvailableParsed.length === 1 &&
            res.data.timesAvailableParsed[0].dow === 1 &&
            res.data.timesAvailableParsed[0].start === '00:00' &&
            res.data.timesAvailableParsed[0].end === '00:00'
              ? []
              : res.data.timesAvailableParsed.map(
                  (time: timesAvailableParsed) => ({
                    dow: time.dow,
                    start: dayjs(time.start, 'HH:mm'),
                    end: dayjs(time.end, 'HH:mm'),
                    id: nanoid(),
                  }),
                )

          setClassCustomers((classCustomers) => [
            ...classCustomers,
            {
              id: res.data.id,
              className: res.data.className,
              schoolType: res.data.schoolType,
              grade: res.data.grade,
              timesAvailable: newTimesAvailable,
            },
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

  const generateInvoice = (
    year: number,
    month: number,
    invoiceData?: { invoiceNumber: number; invoiceType: string },
  ) => {
    API.post('lessons/invoice/customer', invoiceData, {
      params: {
        of: dayjs().year(year).month(month).format('YYYY-MM-DD'),
        schoolId: id,
      },
      responseType: 'blob',
    })
      .then((res) => {
        window.open(URL.createObjectURL(res.data))
      })
      .catch(() => {
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
              value={school.schoolName ?? ''}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
          </Stack>
          <h3>Ansprechpartner</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              fullWidth={true}
              label="Vorname"
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  firstName: event.target.value,
                }))
              }
              value={school.firstName ?? ''}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
            <TextField
              fullWidth={true}
              label="Nachname"
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  lastName: event.target.value,
                }))
              }
              value={school.lastName ?? ''}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
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
              key={classCustomer.id}
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
                  <Stack direction={'column'} rowGap={2}>
                    <Stack direction={'row'} columnGap={2}>
                      <TextField 
                        fullWidth
                        value={classCustomer.className}
                        label={"Klassenname"}
                        onChange= {(e) => editClassCustomer({className: e.target.value}, index)}
                      />
                    </Stack>
                    <Stack direction={'row'} columnGap={2}>
                      <FormControl fullWidth>
                        <InputLabel id="invoiceMonthLabel">Schulart</InputLabel>
                        <Select
                          label={'Schulart'}
                          fullWidth
                          value={classCustomer.schoolType ?? ''}
                          onChange={(e) => {
                            editClassCustomer(
                              { schoolType: e.target.value as SchoolType },
                              index,
                            )
                          }}
                        >
                          <MenuItem value={SchoolType.GRUNDSCHULE}>
                            Grundschule
                          </MenuItem>
                          <MenuItem value={SchoolType.OBERSCHULE}>
                            Oberschule
                          </MenuItem>
                          <MenuItem value={SchoolType.GYMNASIUM}>
                            Gymnasium
                          </MenuItem>
                          <MenuItem value={SchoolType.ANDERE}>Andere</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        type="number"
                        label={'Klassenstufe'}
                        InputProps={{ inputProps: { min: 0, max: 13 } }}
                        fullWidth
                        value={classCustomer.grade ?? ''}
                        onChange={(e) => {
                          editClassCustomer(
                            { grade: Number(e.target.value) },
                            index,
                          )
                        }}
                      />
                    </Stack>
                    <AddTimes
                      value={classCustomer.timesAvailable}
                      setValue={(newValue) =>
                        editClassCustomer({ timesAvailable: newValue }, index)
                      }
                    />
                    <Stack direction={'row'}>
                      <Button
                        variant="contained"
                        onClick={() => saveClassCustomer(index)}
                      >
                        Klasse Speichern
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
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
              Schule Speichern
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
          <h3>Rechnung generieren:</h3>
          <InvoiceDataSelect
            generateInvoice={generateInvoice}
            invoiceDialog={true}
          />
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
            </Stack>
            <Stack direction={'row'} columnGap={2}>
              <FormControl fullWidth>
                <InputLabel id="invoiceMonthLabel">Schulart</InputLabel>
                <Select
                  label={'Schulart'}
                  fullWidth
                  value={newClassCustomer.schoolType ?? ''}
                  onChange={(e) => {
                    setNewClassCustomer((c) => ({
                      ...c,
                      schoolType: e.target.value as SchoolType,
                    }))
                  }}
                >
                  <MenuItem value={SchoolType.GRUNDSCHULE}>
                    Grundschule
                  </MenuItem>
                  <MenuItem value={SchoolType.OBERSCHULE}>Oberschule</MenuItem>
                  <MenuItem value={SchoolType.GYMNASIUM}>Gymnasium</MenuItem>
                  <MenuItem value={SchoolType.ANDERE}>Andere</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="number"
                label={'Klassenstufe'}
                fullWidth
                value={newClassCustomer.grade ?? ''}
                InputProps={{ inputProps: { min: 0, max: 13 } }}
                onChange={(e) => {
                  setNewClassCustomer((c) => ({
                    ...c,
                    grade: Number(e.target.value),
                  }))
                }}
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
      <ConfirmationDialog confirmationDialogProps={confirmationDialogProps} />
    </div>
  )
}

export default SchoolDetailView
