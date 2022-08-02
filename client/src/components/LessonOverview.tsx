import { Button, Checkbox, FormControlLabel, FormGroup, Stack, TextField, Typography } from '@mui/material'
import { Dayjs } from 'dayjs'
import { useNavigate } from 'react-router-dom'

import { contract } from '../types/contract'
import { lesson, LessonState } from '../types/lesson'
import styles from './Calendar.module.scss'

type Props = {
  contract: contract
  existingLesson: lesson | null
  date: Dayjs
}

const LessonOverview: React.FC<Props> = ({
  contract,
  existingLesson,
  date,
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
        cursor: 'pointer',
      }}
    >
      <span>
        {contract.startTime.substring(0, 5) +
          ' - ' +
          contract.endTime.substring(0, 5)}
      </span>
      <span>{contract.subject.name}</span>
      <span>Kunden:</span>
      <ul className={styles.list}>
        {contract.customers.map((s) => (
          <li key={s.id}>
            {s.role === 'privateCustomer'
              ? s.firstName + ' ' + s.lastName
              : s.school.schoolName + ' ' + s.className }
          </li>
        ))}
      </ul>
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
      <Button onClick={() => navigate(contract.id + '/' + date.format('YYYY-MM-DD'))}>Mehr anzeigen</Button>
    </Stack>
  )
}

export default LessonOverview
