import styles from "../../../../core/styles/gridList.module.scss";

import { Clear as ClearIcon } from '@mui/icons-material'
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
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from "../../../auth/components/AuthProvider";
import { SNACKBAR_OPTIONS, SNACKBAR_OPTIONS_ERROR } from "../../../../core/res/Constants";
import ConfirmationDialog from "../../../general/components/ConfirmationDialog";
import { schoolFormValidation } from "../../../../core/utils/FormValidation";
import CustomerInvoiceDataSelect from "../../components/CustomerInvoiceDataSelect";
import IconButtonAdornment from "../../../general/components/IconButtonAdornment";
import AddTimes from "../../../general/components/AddTimes";
import ContractList from "../../../general/components/ContractList";
import { Contract } from "../../../../core/types/Contract";
import SchoolFormErrorTexts from "../../../../core/types/Form/SchoolFormErrorTexts";
import ClassCustomerFormState from "../../../../core/types/Form/ClassCustomerFormState";
import SchoolFormState from "../../../../core/types/Form/SchoolFormState";
import UserDeleteState from "../../../../core/enums/UserDeleteState";
import SchoolState from "../../../../core/enums/SchoolState";
import ClassCustomer from "../../../../core/types/ClassCustomer";
import TimeSlotParsed from "../../../../core/types/TimeSlotParsed";
import TimeSlot from "../../../../core/types/TimeSlot";
import SchoolType from "../../../../core/enums/SchoolType";
import UserRole from "../../../../core/enums/UserRole";
import CustomerType from "../../../../core/enums/CustomerType";
import { DEFAULT_CLASS_CUSTOMER_FORM_STATE, DEFAULT_CONFIRMATION_DIALOG_DATA, DEFAULT_SCHOOL_FORM_ERROR_TEXTS, DEFAULT_SCHOOL_FORM_STATE } from "../../../../core/res/Defaults";
import { schoolStateToString } from "../../../../core/utils/EnumToString";
import CustomerInvoiceData from "../../../../core/types/CustomerInvoiceData";
import ConfirmationDialogData from "../../../../core/types/ConfirmationDialogData";
import UserDocumentType from "../../../../core/enums/UserDocumentType";
import UserDocumentList from "../../../general/components/UserDocuments/UserDocumentList";
import ContractCreateDialog from "../../../timetable/components/ContractDialogs/ContractCreateDialog";



const SchoolDetailView: React.FC = () => {
  const { API } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { decodeToken } = useAuth()
  const role = decodeToken().role

  const requestedId = id ?? 'me'

  const [classCustomers, setClassCustomers] = useState<ClassCustomerFormState[]>([])
  const [school, setSchool] = useState<SchoolFormState>(DEFAULT_SCHOOL_FORM_STATE)
  const [newClassCustomer, setNewClassCustomer] = useState<ClassCustomerFormState>(
    DEFAULT_CLASS_CUSTOMER_FORM_STATE,
  )
  const [addClassDialogOpen, setAddClassDialogOpen] = useState<boolean>(false)

  const [confirmationDialogData, setConfirmationDialogData] =
    useState<ConfirmationDialogData>(DEFAULT_CONFIRMATION_DIALOG_DATA)

  const [schoolErrors, setSchoolErrors] = useState<SchoolFormErrorTexts>(
    DEFAULT_SCHOOL_FORM_ERROR_TEXTS,
  )

  const [render, setRender] = useState<number>(0)
  const [contractDialogOpen, setContractDialogOpen] = useState<boolean>(false)

  const [contracts, setContracts] = useState<Contract[]>([])
  const [refreshContracts, setRefreshContracts] = useState<number>(0)

  useEffect(() => {
    API.get('contracts/school/' + requestedId).then((res) => {
      setContracts(res.data)
    })
  }, [refreshContracts])

  useEffect(() => {
    API.get('users/school/' + requestedId).then((res) => {
      updateSchool(res.data)
    })
  }, [])

  const updateSchool = (newData: SchoolFormState) => {
    setSchool((data) => ({
      ...data,
      firstName: newData.firstName ?? '',
      lastName: newData.lastName ?? '',
      schoolName: newData.schoolName ?? '',
      city: newData.city ?? '',
      postalCode: newData.postalCode ?? '',
      street: newData.street ?? '',
      email: newData.email ?? '',
      phone: newData.phone ?? '',
      schoolTypes: newData.schoolTypes ?? [],
      feeStandard: newData.feeStandard,
      feeOnline: newData.feeOnline,
      notes: newData.notes ?? '',
      dateOfStart: newData.dateOfStart ? dayjs(newData.dateOfStart) : null,
      deleteState: newData.deleteState as UserDeleteState,
      schoolState: newData.schoolState as SchoolState,
    }))
  }

  useEffect(() => {
    API.get('users/classCustomer/' + requestedId).then((res) => {
      setClassCustomers([])
      res.data.map((classCustomer: ClassCustomer) => {
        const newTimesAvailable =
          classCustomer.timesAvailableParsed.length === 1 &&
          classCustomer.timesAvailableParsed[0].dow === 1 &&
          classCustomer.timesAvailableParsed[0].start === '00:00' &&
          classCustomer.timesAvailableParsed[0].end === '00:00'
            ? []
            : classCustomer.timesAvailableParsed.map(
                (time: TimeSlotParsed) => ({
                  dow: time.dow,
                  start: dayjs(time.start, 'HH:mm'),
                  end: dayjs(time.end, 'HH:mm'),
                  id: nanoid(),
                }),
              )

        setClassCustomers((data: ClassCustomerFormState[]) => [
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

  const submitForm = (override: Partial<SchoolFormState> = {}) => {
    const errorTexts = schoolFormValidation(school)

    if (errorTexts.valid) {
      API.post('users/school/' + requestedId, {
        ...school,
        ...override,
        firstName: school.firstName !== '' ? school.firstName : undefined,
        lastName: school.lastName !== '' ? school.lastName : undefined,
        dateOfStart: school.dateOfStart?.format(),
      })
        .then((res) => {
          enqueueSnackbar(school.schoolName + ' gespeichert')
          updateSchool(res.data)
        })
        .catch(() => {
          enqueueSnackbar('Fehler beim Speichern der Schuldaten')
        })
    } else {
      setSchoolErrors(errorTexts)
      enqueueSnackbar('Überprüfe deine Eingaben', SNACKBAR_OPTIONS_ERROR)
    }
  }

  const deleteUser = () => {
    setConfirmationDialogData({
      open: true,
      setProps: setConfirmationDialogData,
      title:
        school.deleteState === UserDeleteState.ACTIVE
          ? `${school.schoolName} wirklich archivieren?`
          : `${school.schoolName} wirklich löschen?`,
      text:
        school.deleteState === UserDeleteState.ACTIVE
          ? `Möchtest du die Schule '${school.schoolName}' wirklich archivieren? Wenn die Schule noch Klassen besitzt, kann sie nicht archiviert werden.`
          : `Möchtest du die Schule '${school.schoolName}' wirklich löschen?`,
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
              SNACKBAR_OPTIONS_ERROR,
            )
          })
      },
    })
  }

  const editClassCustomer = (
    newValue: {
      timesAvailable?: TimeSlot[]
      schoolType?: SchoolType
      grade?: number
      className?: string
    },
    index: number,
  ) => {
    const updatedClassCutomer: ClassCustomerFormState = {
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

    if (updatedClassCutomer.className.trim() === '') return

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
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Fehler beim Speichern der Klasse')
      })
  }

  const deleteClass = (index: number) => {
    const classCustomer = classCustomers[index]

    setConfirmationDialogData({
      open: true,
      setProps: setConfirmationDialogData,
      title: `${classCustomer.className} wirklich löschen?`,
      text: `Möchtest du die Klasse ${classCustomer.className} wirklich löschen?`,
      action: () => {
        API.delete('users/classCustomer/' + classCustomer.id)
          .then(() => {
            enqueueSnackbar(
              classCustomer.className + ' gelöscht',
              SNACKBAR_OPTIONS,
            )
            setClassCustomers(classCustomers.filter((_, i) => i !== index))
          })
          .catch(() => {
            enqueueSnackbar(
              classCustomer.className +
                ' kann nicht gelöscht werden, da noch laufende Verträge existieren.',
              SNACKBAR_OPTIONS_ERROR,
            )
          })
      },
    })
  }

  const addClass = () => {
    setAddClassDialogOpen(false)
    if (newClassCustomer.className) {
      let schoolId: number | string
      requestedId === 'me' ? (schoolId = -1) : (schoolId = requestedId)
      API.post('users/classCustomer/', {
        ...newClassCustomer,
        school: schoolId,
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
                  (time: TimeSlotParsed) => ({
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

          setNewClassCustomer(DEFAULT_CLASS_CUSTOMER_FORM_STATE)
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
    setNewClassCustomer(DEFAULT_CLASS_CUSTOMER_FORM_STATE)
  }

  const generateInvoice = (
    year: number,
    month: number,
    invoiceData: CustomerInvoiceData,
  ) => {
    enqueueSnackbar('Rechnung wird generiert...', SNACKBAR_OPTIONS)
    API.post('lessons/invoice/customer', invoiceData, {
      params: {
        of: dayjs().year(year).month(month).format('YYYY-MM-DD'),
        schoolId: id,
      },
      responseType: 'blob',
    })
      .then((res) => {
        const url = URL.createObjectURL(res.data)

        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          'Rechnung-' + invoiceData.invoiceNumber + '.pdf',
        )
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', SNACKBAR_OPTIONS_ERROR)
      })
  }

  const unarchive = () => {
    API.get('users/unarchive/' + id)
      .then(() => {
        enqueueSnackbar(
          `${school.schoolName} ist entarchiviert`,
          SNACKBAR_OPTIONS,
        )
        navigate('/schools')
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', SNACKBAR_OPTIONS_ERROR)
      })
  }

  const resetPassword = () => {
    API.post('auth/reset/mail/admin', { mail: school.email })
      .then(() => {
        enqueueSnackbar('Der Passwort-Reset wurde an die E-Mail gesendet')
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', SNACKBAR_OPTIONS_ERROR)
      })
  }

  return (
    <div className={styles.wrapper}>
      <Box className={styles.contentBox}>
        <Stack direction="column" alignItems={'stretch'}>
          <h3>Schule:</h3>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth={true}
              label="Schulname"
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  schoolName: event.target.value,
                }))
              }
              helperText={schoolErrors.schoolName}
              error={schoolErrors.schoolName !== ''}
              value={school.schoolName ?? ''}
              InputProps={{
                disabled: requestedId === 'me',
              }}
            />
            <Autocomplete
              fullWidth
              multiple
              id="schoolTypes"
              options={[
                SchoolType.GRUNDSCHULE,
                SchoolType.OBERSCHULE,
                SchoolType.GYMNASIUM,
                SchoolType.ANDERE,
              ]}
              getOptionLabel={(option) => {
                switch (option) {
                  case SchoolType.GRUNDSCHULE:
                    return 'Grundschule'
                  case SchoolType.OBERSCHULE:
                    return 'Oberschule'
                  case SchoolType.GYMNASIUM:
                    return 'Gymnasium'
                  case SchoolType.ANDERE:
                    return 'Andere'
                  default:
                    return ''
                }
              }}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Schularten" />
              )}
              value={school.schoolTypes ?? []}
              onChange={(_, value) =>
                setSchool((data) => ({ ...data, schoolTypes: value }))
              }
            />
          </Stack>
          <h3>Ansprechpartner</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              fullWidth={true}
              label="Vorname"
              helperText={schoolErrors.firstName}
              error={schoolErrors.firstName !== ''}
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  firstName: event.target.value,
                }))
              }
              value={school.firstName ?? ''}
            />
            <TextField
              fullWidth={true}
              label="Nachname"
              helperText={schoolErrors.lastName}
              error={schoolErrors.lastName !== ''}
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  lastName: event.target.value,
                }))
              }
              value={school.lastName ?? ''}
            />
          </Stack>
          <h3>Adresse:</h3>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Straße"
              helperText={schoolErrors.street}
              error={schoolErrors.street !== ''}
              fullWidth={true}
              value={school.street ?? ''}
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  street: event.target.value,
                }))
              }
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Postleitzahl"
              fullWidth={true}
              value={school.postalCode ?? ''}
              helperText={schoolErrors.postalCode}
              error={schoolErrors.postalCode !== ''}
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  postalCode: event.target.value,
                }))
              }
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Stadt"
              fullWidth={true}
              helperText={schoolErrors.city}
              error={schoolErrors.city !== ''}
              value={school.city ?? ''}
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  city: event.target.value,
                }))
              }
              InputProps={{
                readOnly: false,
              }}
            />
          </Stack>
          {id && (
            <>
              <h3>Weitere Infos</h3>
              <Stack direction="row" columnGap={2}>
                <TextField
                  type="number"
                  id="fee"
                  label="Stundensatz Standard"
                  helperText={schoolErrors.feeStandard}
                  error={schoolErrors.feeStandard !== ''}
                  variant="outlined"
                  fullWidth
                  disabled={requestedId === 'me'}
                  value={school.feeStandard ?? ''}
                  onChange={(event) =>
                    setSchool((data) => ({
                      ...data,
                      feeStandard: Number(event.target.value),
                    }))
                  }
                />
                <TextField
                  type="number"
                  id="fee"
                  label="Stundensatz Online"
                  helperText={schoolErrors.feeOnline}
                  error={schoolErrors.feeOnline !== ''}
                  variant="outlined"
                  fullWidth
                  disabled={requestedId === 'me'}
                  value={school.feeOnline ?? ''}
                  onChange={(event) =>
                    setSchool((data) => ({
                      ...data,
                      feeOnline: Number(event.target.value),
                    }))
                  }
                />
                <DatePicker
                  label="Startdatum"
                  mask="__.__.____"
                  value={school.dateOfStart}
                  onChange={(value) => {
                    setSchool((s) => ({ ...s, dateOfStart: value }))
                  }}
                  renderInput={(params) => (
                    <TextField
                      fullWidth
                      {...params}
                      required
                      variant="outlined"
                      helperText={schoolErrors.dateOfStart}
                      error={schoolErrors.dateOfStart !== ''}
                    />
                  )}
                  InputAdornmentProps={{
                    position: 'start',
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButtonAdornment
                        icon={ClearIcon}
                        hidden={school.dateOfStart === null}
                        onClick={() =>
                          setSchool((s) => ({ ...s, dateOfStart: null }))
                        }
                      />
                    ),
                  }}
                />
              </Stack>
            </>
          )}
          <h3>Kontakt:</h3>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth={true}
              label="Email"
              helperText={schoolErrors.email}
              error={schoolErrors.email !== ''}
              value={school.email ?? ''}
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  email: event.target.value.toLowerCase(),
                }))
              }
              InputProps={{
                disabled: requestedId === 'me',
              }}
            />

            <TextField
              fullWidth={true}
              label="Telefonnummer"
              helperText={schoolErrors.phone}
              error={schoolErrors.phone !== ''}
              value={school.phone ?? ''}
              onChange={(event) =>
                setSchool((data) => ({
                  ...data,
                  phone: event.target.value,
                }))
              }
            />
          </Stack>
          {id && (
            <>
              <h3>Notizen</h3>
              <TextField
                multiline
                value={school.notes ?? ''}
                onChange={(e) => {
                  setSchool((data) => ({ ...data, notes: e.target.value }))
                }}
                fullWidth
                rows={5}
              />
            </>
          )}
          {id && (
            <Stack direction={'row'} columnGap={2}>
              <h3>Klassen:</h3>
              {school.deleteState !== UserDeleteState.DELETED && (
                <IconButton
                  sx={{ marginLeft: 'auto' }}
                  onClick={() => {
                    if (school.schoolTypes.length > 0) {
                      newClassCustomer.schoolType = school
                        .schoolTypes[0] as SchoolType
                    }
                    setAddClassDialogOpen(true)
                  }}
                >
                  <AddCircleIcon fontSize="large" color="primary" />
                </IconButton>
              )}
            </Stack>
          )}
          {id &&
            classCustomers.map((classCustomer, index) => (
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
                          value={classCustomer.className ?? ''}
                          label={'Klassenname'}
                          onChange={(e) =>
                            editClassCustomer(
                              { className: e.target.value },
                              index,
                            )
                          }
                        />
                      </Stack>
                      <Stack direction={'row'} columnGap={2}>
                        <FormControl fullWidth>
                          <InputLabel id="invoiceMonthLabel">
                            Schulart
                          </InputLabel>
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
                            <MenuItem value={SchoolType.ANDERE}>
                              Andere
                            </MenuItem>
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
                        value={classCustomer.timesAvailable ?? []}
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
          <Stack direction={'row'} columnGap={2}>
            <h3>Einsätze:</h3>
            {id && school.deleteState !== UserDeleteState.DELETED && (
              <IconButton
                sx={{ marginLeft: 'auto' }}
                onClick={() => {
                  setRender((r) => ++r)
                  setContractDialogOpen(true)
                }}
              >
                <AddCircleIcon fontSize="large" color="primary" />
              </IconButton>
            )}
          </Stack>
          <ContractList
            contracts={contracts}
            allowTogglePast={true}
            setContracts={setContracts}
            onSuccess={() => setRefreshContracts((r) => r + 1)}
            userRole={role}
          />
          <h3>Dokumente:</h3>
          <UserDocumentList
            userDocumentsType={UserDocumentType.PRIVATE}
            userId={requestedId !== 'me' ? parseInt(requestedId) : undefined}
          />
          {id && (
            <Typography>
              Status: {schoolStateToString[school.schoolState]}
            </Typography>
          )}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ marginTop: '15px' }}
          >
            {id && (
              <Button onClick={() => navigate(-1)} variant="outlined">
                Zurück
              </Button>
            )}
            <Button onClick={() => submitForm()} variant="contained">
              Schule Speichern
            </Button>
            {id && school.deleteState === UserDeleteState.DELETED && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => unarchive()}
              >
                Entarchivieren
              </Button>
            )}
            {id && (
              <Button
                variant="outlined"
                onClick={deleteUser}
                sx={{ marginLeft: 'auto' }}
                color="error"
              >
                {school.deleteState === UserDeleteState.DELETED
                  ? 'Schule löschen'
                  : 'Schule archivieren'}
              </Button>
            )}
            {id &&
              school.schoolState === SchoolState.CREATED &&
              school.deleteState === UserDeleteState.ACTIVE && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() =>
                    submitForm({ schoolState: SchoolState.CONFIRMED })
                  }
                >
                  Bestätigen
                </Button>
              )}
            {id &&
              school.deleteState === UserDeleteState.ACTIVE &&
              school.schoolState === SchoolState.CONFIRMED && (
                <Button variant="outlined" onClick={() => resetPassword()}>
                  Passwort-Reset
                </Button>
              )}
          </Stack>
          {id && (
            <>
              <h3>Rechnung generieren:</h3>
              <CustomerInvoiceDataSelect
                generateInvoice={generateInvoice}
                type={UserRole.SCHOOL}
              />
            </>
          )}
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
      <ConfirmationDialog confirmationDialogData={confirmationDialogData} />
      <ContractCreateDialog
        key={render}
        open={contractDialogOpen}
        setOpen={setContractDialogOpen}
        onSuccess={() => setRefreshContracts((r) => ++r)}
        initialForm0Props={
          id
            ? {
                school: { id: Number(id), schoolName: school.schoolName },
                customerType: CustomerType.SCHOOL,
                startDate:
                  school.dateOfStart &&
                  dayjs(school.dateOfStart).isAfter(dayjs())
                    ? school.dateOfStart
                    : dayjs().add(1, 'day'),
              }
            : undefined
        }
      />
    </div>
  )
}

export default SchoolDetailView
