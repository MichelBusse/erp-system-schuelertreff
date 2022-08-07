import { Clear as ClearIcon } from '@mui/icons-material'
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
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

import { snackbarOptionsError } from '../../consts'
import { contractWithTeacher } from '../../types/contract'
import { ContractType } from '../../types/enums'
import { ContractFilterForm } from '../../types/form'
import subject from '../../types/subject'
import { classCustomer, privateCustomer, school } from '../../types/user'
import { useAuth } from '../AuthProvider'
import { CustomerType } from '../ContractDialog'
import IconButtonAdornment from '../IconButtonAdornment'

dayjs.extend(customParseFormat)

type Props = {
  form: ContractFilterForm
  setForm: React.Dispatch<React.SetStateAction<ContractFilterForm>>
  initialContract?: contractWithTeacher | null
}

const Filter: React.FC<Props> = ({ form, setForm, initialContract }) => {
  const [privCustomers, setPrivCustomers] = useState<privateCustomer[]>([])
  const [classCustomers, setClassCustomers] = useState<classCustomer[]>([])
  const [schools, setSchools] = useState<school[]>([])
  const [subjects, setSubjects] = useState<subject[]>([])

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (!initialContract) return

    if (initialContract.customers[0].role === CustomerType.PRIVATE) {
      setForm((f) => ({ ...f, customerType: CustomerType.PRIVATE }))
    } else {
      setForm((f) => ({ ...f, customerType: CustomerType.SCHOOL }))
    }

    setForm((f) => {
      const initialForm0Entry: ContractFilterForm = {
        ...f,
        startDate: dayjs(initialContract.startDate, 'YYYY-MM-DD'),
        endDate: dayjs(initialContract.endDate, 'YYYY-MM-DD'),
        subject: initialContract.subject,
        interval: initialContract.interval,
      }
      if (initialContract.customers[0].role === CustomerType.PRIVATE) {
        initialForm0Entry.privateCustomers =
          initialContract.customers as privateCustomer[]
      } else {
        initialForm0Entry.school = (
          initialContract.customers[0] as classCustomer
        ).school
        initialForm0Entry.classCustomers =
          initialContract.customers as classCustomer[]
      }

      return initialForm0Entry
    })
  }, [initialContract])

  useEffect(() => {
    API.get('users/privateCustomer')
      .then((res) => setPrivCustomers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })

    API.get('users/school')
      .then((res) => setSchools(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })

    API.get('subjects')
      .then((res) => setSubjects(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }, [])

  const loadClasses = (id: number) => {
    API.get('users/classCustomer/' + id)
      .then((res) => setClassCustomers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }

  const PrivateCustomerSelect = () => {
    return (
      <Autocomplete
        fullWidth
        multiple
        size="small"
        options={privCustomers}
        getOptionLabel={(o) => o.firstName + ' ' + o.lastName}
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
            setForm((f) => ({ ...f, school: value }))

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
              required
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
          value={form.interval}
          sx={{width: '150px'}}
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
      <Stack direction={{xs: "column", sm: 'row'}} spacing={2}>
        <DatePicker
          label="Startdatum"
          mask="__.__.____"
          minDate={dayjs().add(1, 'd')}
          value={form.startDate}
          onChange={(value) => {
            setForm((f) => ({
              ...f,
              startDate: value,
              endDate: value ? value.add(1, 'year') : null,
            }))
          }}
          shouldDisableDate={(date) => [0, 6].includes(date.day())}
          renderInput={(params) => (
            <TextField {...params} required variant="outlined" />
          )}
          InputAdornmentProps={{
            position: 'start',
          }}
          InputProps={{
            endAdornment: (
              <IconButtonAdornment
                icon={ClearIcon}
                hidden={form.startDate === null}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
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
          renderInput={(params) => (
            <TextField {...params} required variant="outlined" />
          )}
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
        onChange={(e) => setForm((f) => ({...f, contractType: e.target.value as ContractType}))}
      >
        <MenuItem value={ContractType.STANDARD}>Präsenz</MenuItem>
        <MenuItem value={ContractType.ONLINE}>Online</MenuItem>
      </Select>
    </Stack>
  )
}

export default Filter
