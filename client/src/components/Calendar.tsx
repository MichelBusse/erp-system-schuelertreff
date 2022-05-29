import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Dayjs } from 'dayjs'

import { SideMenu } from '../pages/timetable'
import styles from './Calendar.module.scss'
import CalendarControl from './CalendarControl'

type teacher = {
  id: number
  name: string
}

type Props = {
  date: Dayjs
  teachers: Array<teacher>
  setOpen: (open: SideMenu) => void
  setDate: (date: Dayjs) => void
}

const lessons = [
  { Day: 'Mon', Subject: ['Deu'] },
  { Day: 'Tue', Subject: ['Deu', 'Ma'] },
  { Day: 'Wed', Subject: ['Ph', 'Fr', 'Lat'] },
  { Day: 'Thu', Subject: ['Deu', 'Eng', 'Bio', 'Geo'] },
  { Day: 'Fri', Subject: ['Eth'] },
]

const Calendar: React.FC<Props> = ({ date, teachers, setOpen, setDate }) => (
  <Paper className={styles.wrapper}>
    <CalendarControl date={date} setDate={setDate} />

    <TableContainer sx={{ maxHeight: 'calc(100vh - 104px)' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell />

            {[1, 2, 3, 4, 5].map((d) => (
              /* if its a column of day (all except the first one):*/
              <TableCell key={d} align="center">
                <div style={{ fontSize: '1.2rem' }}>
                  {date.day(d).format('dddd')}
                </div>
                <div style={{ fontSize: '0.8rem', margin: '-5px' }}>
                  {date.day(d).format('DD.MM.YYYY')}
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id} hover role="checkbox">
              <TableCell
                onClick={() => setOpen({ state: true, info: teacher.name })}
              >
                {teacher.name}
              </TableCell>

              {lessons.map((day) => (
                <TableCell key={day.Day} className={styles.lessonCell}>
                  <div className={styles.lessonContainer}>
                    {day.Subject.map((subject, i) => (
                      <div key={i} className={styles.lesson}>
                        {subject}
                      </div>
                    ))}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
)

export default Calendar
