import styles from "../../../../core/styles/gridList.module.scss";

import { AddCircle } from '@mui/icons-material'
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { nanoid } from 'nanoid'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmationDialog from '../../../general/components/ConfirmationDialog'
import { useAuth } from '../../../auth/components/AuthProvider'
import CustomerInvoiceDataSelect from '../../components/CustomerInvoiceDataSelect'
import ContractList from "../../../general/components/ContractList";
import { Contract } from "../../../../core/types/Contract";
import TimeSlotParsed from "../../../../core/types/TimeSlotParsed";
import PrivateCustomerFormState from "../../../../core/types/Form/PrivateCustomerFormState";
import PrivateCustomerFormErrorTexts from "../../../../core/types/Form/PrivateCustomerFormErrorTexts";
import UserDeleteState from "../../../../core/enums/UserDeleteState.enum";
import SchoolType from "../../../../core/enums/SchoolType.enum";
import UserRole from "../../../../core/enums/UserRole.enum";
import CustomerType from "../../../../core/enums/CustomerType.enum";
import { DEFAULT_CONFIRMATION_DIALOG_DATA, DEFAULT_PRIVATE_CUSTOMER_FORM_ERROR_TEXTS, DEFAULT_PRIVATE_CUSTOMER_FORM_STATE } from "../../../../core/res/Defaults";
import { SNACKBAR_OPTIONS, SNACKBAR_OPTIONS_ERROR } from "../../../../core/res/Constants";
import { privateCustomerFormValidation } from "../../../../core/utils/FormValidation";
import CustomerInvoiceData from "../../../../core/types/CustomerInvoiceData";
import ConfirmationDialogData from "../../../../core/types/ConfirmationDialogData";
import UserDocumentType from "../../../../core/enums/UserDocumentType.enum";
import UserDocumentList from "../../../general/components/UserDocuments/UserDocumentList";
import ContractCreateDialog from "../../../timetable/components/ContractDialogs/ContractCreateDialog";
import TimeSlotList from "../../../general/components/TimeSlotList";


dayjs.extend(customParseFormat)

const PrivateCustomerDetailView: React.FC = () => {
  const { API } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [confirmationDialogData, setConfirmationDialogData] =
    useState<ConfirmationDialogData>(DEFAULT_CONFIRMATION_DIALOG_DATA)

  const requestedId = id ? id : 'me'

  const [data, setData] = useState<PrivateCustomerFormState>(
    DEFAULT_PRIVATE_CUSTOMER_FORM_STATE,
  )
  const [errors, setErrors] = useState<PrivateCustomerFormErrorTexts>(
    DEFAULT_PRIVATE_CUSTOMER_FORM_ERROR_TEXTS,
  )

  const [render, setRender] = useState<number>(0)
  const [contractDialogOpen, setContractDialogOpen] = useState<boolean>(false)

  const [contracts, setContracts] = useState<Contract[]>([])
  const [refreshContracts, setRefreshContracts] = useState<number>(0)

  useEffect(() => {
    API.get('contracts/privateCustomer/' + requestedId).then((res) => {
      setContracts(res.data)
    })
  }, [refreshContracts])

  useEffect(() => {
    API.get('users/privateCustomer/' + requestedId).then((res) => {
      const newTimesAvailable =
        res.data.timesAvailableParsed.length === 1 &&
        res.data.timesAvailableParsed[0].dow === 1 &&
        res.data.timesAvailableParsed[0].start === '00:00' &&
        res.data.timesAvailableParsed[0].end === '00:00'
          ? []
          : res.data.timesAvailableParsed.map((time: TimeSlotParsed) => ({
              dow: time.dow,
              start: dayjs(time.start, 'HH:mm'),
              end: dayjs(time.end, 'HH:mm'),
              id: nanoid(),
            }))

      setData((data) => ({
        ...data,
        firstName: res.data.firstName ?? '',
        lastName: res.data.lastName ?? '',
        city: res.data.city ?? '',
        postalCode: res.data.postalCode ?? '',
        street: res.data.street ?? '',
        email: res.data.email ?? '',
        phone: res.data.phone ?? '',
        timesAvailable: newTimesAvailable,
        grade: res.data.grade,
        schoolType: res.data.schoolType ?? '',
        feeStandard: res.data.feeStandard,
        feeOnline: res.data.feeOnline,
        notes: res.data.notes ?? '',
        deleteState: res.data.deleteState as UserDeleteState,
      }))
    })
  }, [])

  const submitForm = () => {
    const errorTexts = privateCustomerFormValidation(data)

    if (errorTexts.valid) {
      API.post('users/privateCustomer/' + requestedId, {
        ...data,
        timesAvailable: data.timesAvailable.map((time) => ({
          dow: time.dow,
          start: time.start?.format('HH:mm'),
          end: time.end?.format('HH:mm'),
        })),
      }).then(() => {
        enqueueSnackbar(
          data.firstName + ' ' + data.lastName + ' gespeichert',
          SNACKBAR_OPTIONS,
        )
      })
    } else {
      setErrors(errorTexts)
      enqueueSnackbar('Überprüfe deine Eingaben', SNACKBAR_OPTIONS_ERROR)
    }
  }

  const deleteUser = () => {
    setConfirmationDialogData({
      open: true,
      setProps: setConfirmationDialogData,
      title:
        data.deleteState === UserDeleteState.ACTIVE
          ? `${data.firstName + ' ' + data.lastName} wirklich archivieren?`
          : `${data.firstName + ' ' + data.lastName} wirklich löschen?`,
      text:
        data.deleteState === UserDeleteState.ACTIVE
          ? `Möchtest du '${
              data.firstName + ' ' + data.lastName
            }' wirklich archivieren? Schüler können nur archiviert werden, wenn sie an keinen laufenden Verträgen beteiligt sind.`
          : `Möchtest du '${
              data.firstName + ' ' + data.lastName
            }' wirklich löschen? Schüler können nur gelöscht werden, wenn sie an keinen Verträgen beteiligt waren.`,
      action: () => {
        API.delete('users/privateCustomer/' + requestedId)
          .then(() => {
            enqueueSnackbar(
              data.firstName + ' ' + data.lastName + ' gelöscht',
              SNACKBAR_OPTIONS,
            )
            navigate('/privateCustomers')
          })
          .catch(() => {
            enqueueSnackbar(
              data.firstName +
                ' ' +
                data.lastName +
                ' kann nicht gelöscht werden, da noch laufende Verträge existieren.',
              SNACKBAR_OPTIONS_ERROR,
            )
          })
      },
    })
  }

  const generateInvoice = (
    year: number,
    month: number,
    invoiceData: CustomerInvoiceData,
  ) => {
    enqueueSnackbar('Rechnung wird generiert...', SNACKBAR_OPTIONS)
    API.post(
      'lessons/invoice/customer',
      {
        ...invoiceData,
        invoiceDate: invoiceData?.invoiceDate.format('YYYY-MM-DD'),
      },
      {
        params: {
          of: dayjs().year(year).month(month).format('YYYY-MM-DD'),
          customerId: id,
        },
        responseType: 'blob',
      },
    )
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
          `${data.firstName + ' ' + data.lastName} ist entarchiviert`,
          SNACKBAR_OPTIONS,
        )
        navigate('/privateCustomers')
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', SNACKBAR_OPTIONS_ERROR)
      })
  }

  return (
    <div className={styles.wrapper}>
      <Box className={styles.contentBox}>
        <Stack direction="column" alignItems={'stretch'}>
          <h3>Person:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              helperText={errors.firstName}
              error={errors.firstName !== ''}
              fullWidth={true}
              label="Vorname"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  firstName: event.target.value,
                }))
              }
              value={data.firstName ?? ''}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
            <TextField
              helperText={errors.lastName}
              error={errors.lastName !== ''}
              fullWidth={true}
              label="Nachname"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  lastName: event.target.value,
                }))
              }
              value={data.lastName ?? ''}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
          </Stack>
          <h3>Adresse:</h3>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              helperText={errors.street}
              error={errors.street !== ''}
              label="Straße"
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  street: event.target.value,
                }))
              }
              value={data.street ?? ''}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Postleitzahl"
              helperText={errors.postalCode}
              error={errors.postalCode !== ''}
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  postalCode: event.target.value,
                }))
              }
              value={data.postalCode ?? ''}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Stadt"
              helperText={errors.city}
              error={errors.city !== ''}
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  city: event.target.value,
                }))
              }
              value={data.city ?? ''}
              InputProps={{
                readOnly: false,
              }}
            />
          </Stack>
          <h3>Kontakt:</h3>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth={true}
              helperText={errors.email}
              error={errors.email !== ''}
              label="Email"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  email: event.target.value.toLowerCase(),
                }))
              }
              value={data.email ?? ''}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />

            <TextField
              fullWidth={true}
              helperText={errors.phone}
              error={errors.phone !== ''}
              label="Telefonnummer"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  phone: event.target.value,
                }))
              }
              value={data.phone ?? ''}
            />
          </Stack>
          <h3>Weitere Infos:</h3>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="invoiceMonthLabel">Schulart</InputLabel>
              <Select
                label={'Schulart'}
                fullWidth
                value={data.schoolType ?? ''}
                onChange={(e) => {
                  setData((c) => ({
                    ...c,
                    schoolType: e.target.value as SchoolType,
                  }))
                }}
              >
                <MenuItem value={SchoolType.GRUNDSCHULE}>Grundschule</MenuItem>
                <MenuItem value={SchoolType.OBERSCHULE}>Oberschule</MenuItem>
                <MenuItem value={SchoolType.GYMNASIUM}>Gymnasium</MenuItem>
                <MenuItem value={SchoolType.ANDERE}>Andere</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="number"
              id="grade"
              label="Klasse"
              variant="outlined"
              helperText={errors.grade}
              error={errors.grade !== ''}
              fullWidth
              value={data.grade ?? ''}
              InputProps={{ inputProps: { min: 0, max: 13 } }}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  grade: parseInt(event.target.value),
                }))
              }
            />
            <TextField
              type="number"
              id="fee"
              label="Stundensatz Präsenz"
              variant="outlined"
              fullWidth
              disabled={requestedId === 'me'}
              value={data.feeStandard ?? ''}
              helperText={errors.feeStandard}
              error={errors.feeStandard !== ''}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  feeStandard: Number(event.target.value),
                }))
              }
            />
            <TextField
              type="number"
              id="fee"
              label="Stundensatz Online"
              variant="outlined"
              fullWidth
              disabled={requestedId === 'me'}
              value={data.feeOnline ?? ''}
              helperText={errors.feeOnline}
              error={errors.feeOnline !== ''}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  feeOnline: Number(event.target.value),
                }))
              }
            />
          </Stack>
          <h3>Verfügbarkeit:</h3>
          <Box>
            <TimeSlotList
              value={data.timesAvailable}
              setValue={(newValue) =>
                setData((data) => ({ ...data, timesAvailable: newValue }))
              }
            />
          </Box>
          <h3>Notizen:</h3>
          <TextField
            multiline
            value={data.notes ?? ''}
            onChange={(e) => {
              setData((data) => ({ ...data, notes: e.target.value }))
            }}
            fullWidth
            rows={5}
          />

          <Stack direction={'row'} columnGap={2}>
            <h3>Einsätze:</h3>
            {data.deleteState !== UserDeleteState.DELETED && (
              <IconButton
                sx={{ marginLeft: 'auto' }}
                onClick={() => {
                  setRender((r) => ++r)
                  setContractDialogOpen(true)
                }}
              >
                <AddCircle fontSize="large" color="primary" />
              </IconButton>
            )}
          </Stack>
          <ContractList
            contracts={contracts}
            setContracts={setContracts}
            allowTogglePast={true}
            onSuccess={() => setRefreshContracts((r) => r + 1)}
          />
          <h3>Dokumente:</h3>
          <UserDocumentList
            userDocumentsType={UserDocumentType.PRIVATE}
            userId={requestedId !== 'me' ? parseInt(requestedId) : undefined}
          />
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
            <Button onClick={submitForm} variant="contained">
              Speichern
            </Button>
            {id && data.deleteState === UserDeleteState.DELETED && (
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
                onClick={() => deleteUser()}
                sx={{ marginLeft: 'auto' }}
                color="error"
              >
                {data.deleteState === UserDeleteState.DELETED
                  ? 'Löschen'
                  : 'Archivieren'}
              </Button>
            )}
          </Stack>

          <h3>Rechnung generieren:</h3>
          <CustomerInvoiceDataSelect
            generateInvoice={generateInvoice}
            type={UserRole.PRIVATECUSTOMER}
          />
        </Stack>
      </Box>
      <ConfirmationDialog confirmationDialogData={confirmationDialogData} />
      <ContractCreateDialog
        key={render}
        open={contractDialogOpen}
        setOpen={setContractDialogOpen}
        onSuccess={() => setRefreshContracts((r) => ++r)}
        initialForm0Props={
          id
            ? {
                customerType: CustomerType.PRIVATE,
              }
            : undefined
        }
      />
    </div>
  )
}

export default PrivateCustomerDetailView
