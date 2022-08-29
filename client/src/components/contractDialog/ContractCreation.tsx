import { InfoOutlined } from '@mui/icons-material'
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  Switch,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import { leaveTypeToString, snackbarOptionsError } from '../../consts'
import { TeacherState } from '../../types/enums'
import { ContractCreationForm } from '../../types/form'
import subject from '../../types/subject'
import { leave, teacher } from '../../types/user'
import { formatDate, getNextDow } from '../../utils/date'
import { useAuth } from '../AuthProvider'
import BetterTimePicker from '../BetterTimePicker'
import IconButtonAdornment from '../IconButtonAdornment'

export type suggestion = {
  teacherId: number
  teacherName: string
  suggestions: {
    dow: number
    start: string
    end: string
    overlap: number[]
  }[]
  leave: leave[]
}

type Props = {
  form: ContractCreationForm
  setForm: React.Dispatch<React.SetStateAction<ContractCreationForm>>
  suggestions: suggestion[]
  leaves: Record<number, leave[]>
  subject: subject | null
  minStartDate: Dayjs | null
  maxEndDate: Dayjs | null
}

const ContractCreation: React.FC<Props> = ({
  form,
  setForm,
  suggestions,
  leaves,
  subject,
  minStartDate,
  maxEndDate,
}) => {
  const [teachers, setTeachers] = useState<teacher[]>([])

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const getTeacherById = (id: number): teacher | undefined => {
    return teachers.find((t) => t.id === id)
  }

  useEffect(() => {
    API.get('users/teacher')
      .then((res) => setTeachers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }, [])

  useEffect(() => {
    if (form.selsuggestion !== '') {
      const [t, s] = form.selsuggestion.split(',').map((n) => parseInt(n))

      const teacher = suggestions[t]
      const suggestion = teacher.suggestions[s]

      const startTime = dayjs(suggestion.start, 'HH:mm')
      const endTime =
        suggestion.end !== '24:00'
          ? dayjs(suggestion.end, 'HH:mm')
          : dayjs(suggestion.end, 'HH:mm').subtract(5, 'minute')

      setForm({
        startDate: minStartDate
          ? getNextDow(suggestion.dow, minStartDate)
          : null,
        endDate: maxEndDate,
        startTime: startTime,
        endTime: endTime,
        minTime: startTime,
        maxTime: endTime,
        teacher: teacher.teacherId.toString(),
        teacherConfirmation: true,
        dow: suggestion.dow,
        selsuggestion: form.selsuggestion,
      })
    } else {
      setForm({
        startDate: minStartDate,
        endDate: maxEndDate,
        startTime: null,
        endTime: null,
        minTime: null,
        maxTime: null,
        teacher: '',
        teacherConfirmation: true,
        dow: minStartDate?.day() ?? 1,
        selsuggestion: form.selsuggestion,
      })
    }
  }, [form.selsuggestion])

  return (
    <Stack spacing={2} marginTop={1}>
      <FormControl variant="outlined" fullWidth>
        <InputLabel htmlFor="suggestion-select">
          {suggestions.length > 0 ? 'Vorschläge' : 'Keine Vorschläge'}
        </InputLabel>
        <Select
          id="suggestion-select"
          label={suggestions.length > 0 ? 'Vorschläge' : 'Keine Vorschläge'}
          disabled={suggestions.length === 0}
          value={form.selsuggestion}
          onChange={(e) =>
            setForm((f) => ({ ...f, selsuggestion: e.target.value }))
          }
        >
          <MenuItem value="">freie Wahl</MenuItem>
          {suggestions.flatMap((t, i) => [
            <ListSubheader key={t.teacherId}>
              {t.teacherName + ` (${getTeacherById(t.teacherId)?.city})`}
            </ListSubheader>,
            t.suggestions.map((s, j) => {
              let text =
                `${dayjs().day(s.dow).format('dd')} ` + `${s.start} - ${s.end}`

              if (s.overlap.length > 0) text += ' *'

              return (
                <MenuItem key={i + ',' + j} value={i + ',' + j}>
                  {text}
                </MenuItem>
              )
            }),
          ])}
        </Select>
      </FormControl>

      <FormControl variant="outlined" fullWidth required>
        <InputLabel htmlFor="teacher-select">Lehrkraft</InputLabel>
        <Select
          id="teacher-select"
          label={'Lehrkraft'}
          disabled={form.selsuggestion !== ''}
          value={form.teacher}
          onChange={(e) =>
            setForm((data) => ({ ...data, teacher: e.target.value }))
          }
          endAdornment={
            <IconButtonAdornment
              margin="16px"
              color="warning"
              icon={InfoOutlined}
              hidden={!leaves[parseInt(form.teacher)]}
              tooltip={
                !leaves[parseInt(form.teacher)] ? (
                  ''
                ) : (
                  <>
                    {leaves[parseInt(form.teacher)]?.map((l) => (
                      <p key={l.id}>
                        {leaveTypeToString[l.type] +
                          ': ' +
                          formatDate(l.startDate) +
                          ' - ' +
                          formatDate(l.endDate)}
                      </p>
                    ))}
                  </>
                )
              }
            />
          }
        >
          {teachers
            .filter(
              (t) =>
                (t.subjects.some((s) => s.id === subject?.id) &&
                  t.state === TeacherState.EMPLOYED) ||
                t.state === TeacherState.CONTRACT,
            )
            .map((t) => (
              <MenuItem key={t.id} value={t.id.toString()}>
                {`${t.firstName} ${t.lastName} (${t.city})`}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl variant="outlined" fullWidth required>
        <InputLabel htmlFor="weekday-select">Wochentag</InputLabel>
        <Select
          id="weekday-select"
          label={'Wochentag'}
          value={form.dow}
          disabled={form.selsuggestion !== ''}
          onChange={(e) => {
            setForm((data) => ({
              ...data,
              dow: e.target.value as number,
              startDate:
                minStartDate &&
                getNextDow(e.target.value as number, minStartDate),
            }))
          }}
        >
          <MenuItem value={1}>{`Montag (Start: ${
            minStartDate ? getNextDow(1, minStartDate).format('DD.MM.YYYY') : ''
          })`}</MenuItem>
          <MenuItem value={2}>{`Dienstag (Start: ${
            minStartDate ? getNextDow(2, minStartDate).format('DD.MM.YYYY') : ''
          })`}</MenuItem>
          <MenuItem value={3}>{`Mittwoch (Start: ${
            minStartDate ? getNextDow(3, minStartDate).format('DD.MM.YYYY') : ''
          })`}</MenuItem>
          <MenuItem value={4}>{`Donnerstag (Start: ${
            minStartDate ? getNextDow(4, minStartDate).format('DD.MM.YYYY') : ''
          })`}</MenuItem>
          <MenuItem value={5}>{`Freitag (Start: ${
            minStartDate ? getNextDow(5, minStartDate).format('DD.MM.YYYY') : ''
          })`}</MenuItem>
        </Select>
      </FormControl>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <BetterTimePicker
          label="Startzeit"
          required
          minutesStep={5}
          minTime={form.minTime ?? undefined}
          maxTime={form.endTime?.subtract(45, 'm')}
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
          required
          minutesStep={5}
          minTime={form.startTime?.add(45, 'm')}
          maxTime={form.maxTime ?? undefined}
          value={form.endTime}
          onChange={(value) => {
            setForm((data) => ({ ...data, endTime: value }))
          }}
          clearValue={() => {
            setForm((data) => ({ ...data, endTime: null }))
          }}
        />
      </Stack>

      <FormControlLabel
        label="Bestätigung der Lehrkraft anfordern"
        control={
          <Switch
            checked={form.teacherConfirmation}
            onChange={(event) => {
              setForm((data) => ({
                ...data,
                teacherConfirmation: event.target.checked,
              }))
            }}
          />
        }
      />
    </Stack>
  )
}

export default ContractCreation
