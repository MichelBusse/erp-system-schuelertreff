import { Clear as ClearIcon } from '@mui/icons-material'
import {
  Autocomplete,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../../auth/components/AuthProvider'
import { SNACKBAR_OPTIONS_ERROR } from '../../../../../core/res/Constants'
import IconButtonAdornment from '../../../../general/components/IconButtonAdornment'
import { getNextDow } from '../../../../../core/utils/DateUtils'
import BetterTimePicker from '../../../../general/components/BetterTimePicker'
import { Contract } from '../../../../../core/types/Contract'
import ContractFilterFormState from '../../../../../core/types/Form/ContractFilterFormState'
import School from '../../../../../core/types/School'
import Subject from '../../../../../core/types/Subject'
import ClassCustomer from '../../../../../core/types/ClassCustomer'
import PrivateCustomer from '../../../../../core/types/PrivateCustomer'
import CustomerType from '../../../../../core/enums/CustomerType'
import UserRole from '../../../../../core/enums/UserRole'
import ContractType from '../../../../../core/enums/ContractType'

dayjs.extend(customParseFormat)

type Props = {
  form: ContractFilterFormState
  setForm: React.Dispatch<React.SetStateAction<ContractFilterFormState>>
  initialContract?: Contract | null
  alreadySubmitted?: boolean
}

export default function ContractFilterPage({
  form,
  setForm,
  initialContract,
  alreadySubmitted,
}: Props) {
  const [privCustomers, setPrivCustomers] = useState<PrivateCustomer[]>([])
  const [classCustomers, setClassCustomers] = useState<ClassCustomer[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (!initialContract) return
    if (alreadySubmitted) return

    if (initialContract.customers[0].role === UserRole.PRIVATECUSTOMER) {
      setForm((f) => ({ ...f, customerType: CustomerType.PRIVATE }))
    } else {
      setForm((f) => ({ ...f, customerType: CustomerType.SCHOOL }))
    }
    setForm((f) => {
      const initialForm0Entry: ContractFilterFormState = {
        ...f,
        minStartDate: dayjs(initialContract.startDate, 'YYYY-MM-DD'),
        startDate: dayjs(initialContract.startDate, 'YYYY-MM-DD'),
        endDate: initialContract.endDate
          ? dayjs(initialContract.endDate, 'YYYY-MM-DD')
          : null,
        subject: initialContract.subject,
        interval: initialContract.interval,
        startTime: dayjs(initialContract.startTime, 'HH:mm'),
        endTime: dayjs(initialContract.endTime, 'HH:mm'),
        dow: dayjs(initialContract.startDate, 'YYYY-MM-DD').day(),
      }
      if (initialContract.customers[0].role === UserRole.PRIVATECUSTOMER) {
        initialForm0Entry.privateCustomers =
          initialContract.customers as PrivateCustomer[]
      } else {
        const school = (initialContract.customers[0] as ClassCustomer).school
        initialForm0Entry.school = school
        initialForm0Entry.classCustomers = (
          initialContract.customers as ClassCustomer[]
        ).filter((c) => !c.defaultClassCustomer) as ClassCustomer[]

        loadClasses(school.id)
      }

      return initialForm0Entry
    })
  }, [initialContract])

  useEffect(() => {
    API.get('users/privateCustomer')
      .then((res) => setPrivCustomers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
      })

    API.get('users/school')
      .then((res) => setSchools(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
      })

    API.get('subjects')
      .then((res) => setSubjects(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
      })

    // if school is already set, load classCustomers
    if (form.school !== null) loadClasses(form.school.id)
  }, [])

  const loadClasses = (id: number) => {
    API.get('users/classCustomer/' + id)
      .then((res) => setClassCustomers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
      })
  }

  const PrivateCustomerSelect = () => {
    return (
      <Autocomplete
        fullWidth
        multiple
        size="small"
        options={privCustomers}
        getOptionLabel={(o) => o.firstName + ' ' + o.lastName + ` (${o.city})`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={form.privateCustomers}
        onChange={(_, value) =>
          setForm((f) => ({ ...f, privateCustomers: value }))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            required
            size="medium"
            variant="standard"
            label="Kunde(n)"
          />
        )}
      />
    )
  }

  const SchoolSelect = () => {
    return (
      <>
        <Autocomplete
          fullWidth
          size="small"
          options={schools}
          getOptionLabel={(o) => o.schoolName}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={form.school}
          onChange={(_, value) => {
            setForm((f) => ({ ...f, school: value, classCustomers: [] }))

            if (value !== null) loadClasses(value.id)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              size="medium"
              variant="standard"
              label="Schule"
            />
          )}
        />
        <Autocomplete
          disabled={form.school === null}
          fullWidth
          multiple
          size="small"
          options={classCustomers}
          getOptionLabel={(o) => o.className}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={form.classCustomers}
          onChange={(_, value) =>
            setForm((f) => ({ ...f, classCustomers: value }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="medium"
              variant="standard"
              label="Klasse(n)"
            />
          )}
        />
      </>
    )
  }

  return (
    <Stack spacing={2} marginTop={1}>
      <FormControl>
        <RadioGroup
          row
          value={form.customerType}
          onChange={(event) =>
            setForm((f) => ({
              ...f,
              customerType: event.target.value as CustomerType,
            }))
          }
        >
          <FormControlLabel
            value={CustomerType.PRIVATE}
            label="Privatkunde"
            control={<Radio />}
          />
          <FormControlLabel
            value={CustomerType.SCHOOL}
            label="Schule"
            control={<Radio />}
          />
        </RadioGroup>
      </FormControl>

      {form.customerType === 'privateCustomer' ? (
        <PrivateCustomerSelect />
      ) : (
        <SchoolSelect />
      )}

      <Stack direction="row" spacing={2}>
        <Autocomplete
          fullWidth
          options={subjects}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={form.subject}
          onChange={(_, value) => setForm((f) => ({ ...f, subject: value }))}
          renderInput={(params) => (
            <TextField {...params} required variant="outlined" label="Fach" />
          )}
        />
        <TextField
          required
          label="Wochenintervall"
          variant="outlined"
          type="number"
          disabled={initialContract != null}
          value={form.interval}
          sx={{ width: '150px' }}
          onChange={(e) => {
            let value = parseInt(e.target.value, 10) || 1
            value = Math.max(1, Math.min(value, 4))

            setForm((f) => ({
              ...f,
              interval: value,
            }))
          }}
          InputProps={{
            inputProps: {
              max: 4,
              min: 1,
            },
          }}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <DatePicker
          label={initialContract ? 'Änderungsdatum' : 'Startdatum'}
          mask="__.__.____"
          value={form.minStartDate}
          onChange={(value) => {
            setForm((f) => ({
              ...f,
              minStartDate: value,
              startDate: value,
            }))
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              variant="outlined"
              helperText={
                initialContract &&
                !form.minStartDate?.isSame(initialContract?.startDate, 'day') &&
                'Alle gehaltenen Stunden ab diesem Datum werden gelöscht'
              }
            />
          )}
          InputAdornmentProps={{
            position: 'start',
          }}
          InputProps={{
            endAdornment: (
              <IconButtonAdornment
                icon={ClearIcon}
                hidden={form.minStartDate === null}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    minStartDate: null,
                    startDate: null,
                  }))
                }
              />
            ),
          }}
        />
        <DatePicker
          label="Enddatum"
          mask="__.__.____"
          minDate={form.startDate?.add(7, 'day') ?? undefined}
          defaultCalendarMonth={form.startDate ?? undefined}
          disabled={form.startDate === null}
          value={form.endDate}
          onChange={(value) => {
            setForm((f) => ({ ...f, endDate: value }))
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" />}
          InputAdornmentProps={{
            position: 'start',
          }}
          InputProps={{
            endAdornment: (
              <IconButtonAdornment
                icon={ClearIcon}
                hidden={form.endDate === null}
                onClick={() => setForm((f) => ({ ...f, endDate: null }))}
              />
            ),
          }}
        />
      </Stack>
      <Select
        value={form.contractType}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            contractType: e.target.value as ContractType,
          }))
        }
      >
        <MenuItem value={ContractType.STANDARD}>Präsenz</MenuItem>
        <MenuItem value={ContractType.ONLINE}>Online</MenuItem>
      </Select>
      <Divider />
      <FormControl variant="outlined" fullWidth>
        <InputLabel htmlFor="weekday-select">Wochentag</InputLabel>
        <Select
          id="weekday-select"
          label={'Wochentag'}
          value={form.dow ?? ''}
          onChange={(e) => {
            setForm((data) => {
              if (e.target.value !== '') {
                return {
                  ...data,
                  dow:
                    (form.minStartDate &&
                      getNextDow(
                        e.target.value as number,
                        form.minStartDate,
                      ).day()) ??
                    undefined,
                  startDate:
                    form.minStartDate &&
                    getNextDow(e.target.value as number, form.minStartDate),
                }
              } else {
                return {
                  ...data,
                  dow: undefined,
                  startDate: form.minStartDate,
                }
              }
            })
          }}
        >
          <MenuItem value={''}>Später wählen</MenuItem>
          <MenuItem value={1}>{`Montag (Start: ${
            form.minStartDate
              ? getNextDow(1, form.minStartDate).format('DD.MM.YYYY')
              : ''
          })`}</MenuItem>
          <MenuItem value={2}>{`Dienstag (Start: ${
            form.minStartDate
              ? getNextDow(2, form.minStartDate).format('DD.MM.YYYY')
              : ''
          })`}</MenuItem>
          <MenuItem value={3}>{`Mittwoch (Start: ${
            form.minStartDate
              ? getNextDow(3, form.minStartDate).format('DD.MM.YYYY')
              : ''
          })`}</MenuItem>
          <MenuItem value={4}>{`Donnerstag (Start: ${
            form.minStartDate
              ? getNextDow(4, form.minStartDate).format('DD.MM.YYYY')
              : ''
          })`}</MenuItem>
          <MenuItem value={5}>{`Freitag (Start: ${
            form.minStartDate
              ? getNextDow(5, form.minStartDate).format('DD.MM.YYYY')
              : ''
          })`}</MenuItem>
        </Select>
      </FormControl>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <BetterTimePicker
          label="Startzeit"
          minutesStep={5}
          value={form.startTime}
          onChange={(value) => {
            setForm((data) => ({ ...data, startTime: value }))
          }}
          clearValue={() => {
            setForm((data) => ({ ...data, startTime: null }))
          }}
        />
        <BetterTimePicker
          label="Endzeit"
          minutesStep={5}
          value={form.endTime}
          minTime={form.startTime?.add(45, 'm')}
          onChange={(value) => {
            setForm((data) => ({ ...data, endTime: value }))
          }}
          clearValue={() => {
            setForm((data) => ({ ...data, endTime: null }))
          }}
        />
      </Stack>
    </Stack>
  )
}