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
import { useAuth } from '../../../../auth/components/AuthProvider'
import {
  leaveTypeToString,
  snackbarOptionsError,
} from '../../../../../core/res/consts'
import { formatDate, getNextDow } from '../../../../../core/utils/date'
import IconButtonAdornment from '../../../../general/components/IconButtonAdornment'
import BetterTimePicker from '../../../../general/components/BetterTimePicker'
import ContractCreationFormState from '../../../../../core/types/Form/ContractCreationFormState'
import TimeSuggestion from '../../../../../core/types/TimeSuggestion'
import Leave from '../../../../../core/types/Leave'
import Subject from '../../../../../core/types/Subject'
import Teacher from '../../../../../core/types/Teacher'
import TeacherState from '../../../../../core/enums/TeacherState'

type Props = {
  form: ContractCreationFormState
  setForm: React.Dispatch<React.SetStateAction<ContractCreationFormState>>
  suggestions: TimeSuggestion[]
  leaves: Record<number, Leave[]>
  subject: Subject | null
  minStartDate: Dayjs | null
  maxEndDate: Dayjs | null
  initialDow?: number
  initialStartTime: Dayjs | null
  initialEndTime: Dayjs | null
}

export default function CreationPage({
  form,
  setForm,
  suggestions,
  leaves,
  subject,
  minStartDate,
  maxEndDate,
  initialDow,
  initialStartTime,
  initialEndTime,
}: Props) {
  const [teachers, setTeachers] = useState<Teacher[]>([])

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const getTeacherById = (id: number): Teacher | undefined => {
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
        startTime: initialStartTime,
        endTime: initialEndTime,
        minTime: startTime,
        maxTime: endTime,
        teacher:
          teacher.teacherId === -1 ? 'later' : teacher.teacherId.toString(),
        teacherConfirmation: false,
        dow: suggestion.dow,
        selsuggestion: form.selsuggestion,
      })
    } else {
      setForm({
        startDate: minStartDate
          ? getNextDow(initialDow ?? minStartDate?.day(), minStartDate)
          : null,
        endDate: maxEndDate,
        startTime: initialStartTime,
        endTime: initialEndTime,
        minTime: null,
        maxTime: null,
        teacher: 'later',
        teacherConfirmation: false,
        dow: initialDow ?? minStartDate?.day() ?? 1,
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
              {t.teacherId === -1
                ? 'Ohne Lehrkraft'
                : t.teacherName + ` (${getTeacherById(t.teacherId)?.city})`}
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
          onChange={(e) => {
            setForm((data) => ({
              ...data,
              teacher: e.target.value,
              teacherConfirmation: false,
            }))
          }}
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
          <MenuItem key={-1} value={'later'}>
            Später auswählen
          </MenuItem>
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
            disabled={form.teacher === 'later'}
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
