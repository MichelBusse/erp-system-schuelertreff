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
import { ContractCreationForm } from '../../types/form'
import subject from '../../types/subject'
import { leave, teacher } from '../../types/user'
import { formatDate, getNextDow } from '../../utils/date'
import { useAuth } from '../AuthProvider'
import BetterTimePicker from '../BetterTimePicker'
import EqualStack from '../EqualStack'
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
  updateSelSuggestion: (newSuggestion: string) => void
  leaves: Record<number, leave[]>
  subject: subject | null
  startDate: Dayjs | null
}

const ContractCreation: React.FC<Props> = ({
  form,
  setForm: setForm1,
  suggestions,
  updateSelSuggestion,
  leaves,
  subject,
  startDate,
}) => {
  const [teachers, setTeachers] = useState<teacher[]>([])

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    API.get('users/teacher')
      .then((res) => setTeachers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }, [])

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
          onChange={(e) => updateSelSuggestion(e.target.value)}
        >
          <MenuItem value="">freie Wahl</MenuItem>
          {suggestions.flatMap((t, i) => [
            <ListSubheader key={t.teacherId}>{t.teacherName}</ListSubheader>,
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
            setForm1((data) => ({ ...data, teacher: e.target.value }))
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
            .filter((t) => t.subjects.some((s) => s.id === subject?.id))
            .map((t) => (
              <MenuItem key={t.id} value={t.id.toString()}>
                {`${t.firstName} ${t.lastName}`}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <EqualStack direction="row" spacing={2}>
        <FormControl variant="outlined" fullWidth required>
          <InputLabel htmlFor="weekday-select">Wochentag</InputLabel>
          <Select
            id="weekday-select"
            label={'Wochentag'}
            value={form.dow}
            disabled={form.selsuggestion !== ''}
            onChange={(e) => {
              setForm1((data) => ({
                ...data,
                dow: e.target.value as number,
                startDate:
                  startDate && getNextDow(e.target.value as number, startDate),
              }))
            }}
          >
            <MenuItem value={1}>{`Montag (Start: ${
              startDate ? getNextDow(1, startDate).format('DD.MM.YYYY') : ''
            })`}</MenuItem>
            <MenuItem value={2}>{`Dienstag (Start: ${
              startDate ? getNextDow(2, startDate).format('DD.MM.YYYY') : ''
            })`}</MenuItem>
            <MenuItem value={3}>{`Mittwoch (Start: ${
              startDate ? getNextDow(3, startDate).format('DD.MM.YYYY') : ''
            })`}</MenuItem>
            <MenuItem value={4}>{`Donnerstag (Start: ${
              startDate ? getNextDow(4, startDate).format('DD.MM.YYYY') : ''
            })`}</MenuItem>
            <MenuItem value={5}>{`Freitag (Start: ${
              startDate ? getNextDow(5, startDate).format('DD.MM.YYYY') : ''
            })`}</MenuItem>
          </Select>
        </FormControl>
      </EqualStack>
      <EqualStack direction="row" spacing={2}>
        <BetterTimePicker
          label="Startzeit"
          required
          minutesStep={5}
          minTime={form.minTime ?? undefined}
          maxTime={form.endTime?.subtract(45, 'm')}
          value={form.startTime}
          onChange={(value) => {
            setForm1((data) => ({ ...data, startTime: value }))
          }}
          clearValue={() => {
            setForm1((data) => ({ ...data, startTime: null }))
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
            setForm1((data) => ({ ...data, endTime: value }))
          }}
          clearValue={() => {
            setForm1((data) => ({ ...data, endTime: null }))
          }}
        />
      </EqualStack>

      <FormControlLabel
        label="Bestätigung der Lehrkraft anfordern"
        control={
          <Switch
            checked={form.teacherConfirmation}
            onChange={(event) => {
              setForm1((data) => ({
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
