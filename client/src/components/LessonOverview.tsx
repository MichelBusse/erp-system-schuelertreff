import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from '@mui/material'
import { Dayjs } from 'dayjs'
import { useNavigate } from 'react-router-dom'

import { contract } from '../types/contract'
import { ContractType } from '../types/enums'
import { lesson, LessonState } from '../types/lesson'

type Props = {
  contract: contract
  existingLesson: lesson | null
  date: Dayjs
  calendarDate: Dayjs
}

const LessonOverview: React.FC<Props> = ({
  contract,
  existingLesson,
  date,
  calendarDate,
}) => {
  const navigate = useNavigate()

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
          <Typography>{contract.teacher ? contract.teacher.firstName + " " + contract.teacher.lastName : 'Ausstehend'}</Typography>
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
              checked={
                existingLesson
                  ? existingLesson.state === LessonState.HELD
                  : false
              }
              disabled
            />
          }
          label="Gehalten"
        />
      </FormGroup>
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
    </Stack>
  )
}

export default LessonOverview
