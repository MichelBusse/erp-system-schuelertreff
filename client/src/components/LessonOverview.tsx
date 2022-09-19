import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { snackbarOptions, snackbarOptionsError } from '../consts'
import { contract } from '../types/contract'
import { ContractType } from '../types/enums'
import { lesson, LessonState } from '../types/lesson'
import { useAuth } from './AuthProvider'

type Props = {
  contract: contract
  existingLesson: lesson | null
  date: Dayjs
  calendarDate: Dayjs
  refresh: () => void
  userRole: string
}

const LessonOverview: React.FC<Props> = ({
  contract,
  existingLesson,
  date,
  calendarDate,
  refresh,
  userRole,
}) => {
  const navigate = useNavigate()
  const { API } = useAuth()
  const [held, setHeld] = useState(existingLesson?.state === LessonState.HELD)
  const { enqueueSnackbar } = useSnackbar()
  const [limitedView, setLimitedView] = useState(userRole === 'school' ? true : false)

  const toggleLessonHeld = (held: boolean) => {
    setHeld(held)
    API.post('lessons/' + (existingLesson?.id ?? ''), {
      date: dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      contractId: contract.id,
      state: held ? LessonState.HELD : LessonState.IDLE,
    })
      .then(() => {
        enqueueSnackbar('Stunde gespeichert', snackbarOptions)
        refresh()
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }

  return (
    <Stack
      key={contract.id}
      spacing={0.5}
      sx={{
        backgroundColor: contract.subject.color + 50,
        p: 2,
        borderRadius: 2,
      }}
    >
      <span>
        {contract.startTime.substring(0, 5) +
          ' - ' +
          contract.endTime.substring(0, 5)}
      </span>
      <Stack
        direction={'row'}
        columnGap={2}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Typography>
          <b>Lehrkraft:</b>
        </Typography>
        <Typography>
          {contract.teacher
            ? contract.teacher.firstName + ' ' + contract.teacher.lastName
            : 'Ausstehend'}
        </Typography>
      </Stack>
      {contract.customers && contract.customers[0].role === 'classCustomer' && (
        <Stack
          direction={'row'}
          columnGap={2}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Typography>
            <b>Schule:</b>
          </Typography>
          <Typography>{contract.customers[0].school.schoolName}</Typography>
        </Stack>
      )}
      <Stack
        direction={'row'}
        columnGap={2}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Typography>
          <b>
            {contract.customers[0]?.role === 'privateCustomer'
              ? 'Schüler:'
              : 'Klassen:'}
          </b>
        </Typography>
        <Typography>
          {contract.customers
            ? contract.customers
                .map((c) => {
                  return c.role === 'privateCustomer'
                    ? c.firstName + ' ' + c.lastName
                    : c.className
                })
                .join(', ')
            : ''}
        </Typography>
      </Stack>
      <Stack
        direction={'row'}
        columnGap={2}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Typography>
          <b>Fach:</b>
        </Typography>
        <Typography>
          {contract.subject.name +
            (contract.contractType === ContractType.STANDARD
              ? ' (Präsenz)'
              : ' (Online)')}
        </Typography>
      </Stack>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              disabled = {limitedView}
              checked={held}
              onChange={(e) => {
                toggleLessonHeld(e.target.checked)
              }}
            />
          }
          label="Gehalten"
        />
      </FormGroup>
      {!limitedView? (
        <Button
          onClick={() =>
            navigate(
              '/timetable/' +
                calendarDate.format('YYYY-MM-DD') +
                '/' +
                contract.id +
                '/' +
                date.format('YYYY-MM-DD'),
            )
          }
        >
          Mehr anzeigen
        </Button>
      ) : null}
    </Stack>
  )
}

export default LessonOverview
