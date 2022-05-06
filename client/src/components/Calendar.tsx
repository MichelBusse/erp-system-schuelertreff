import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import CalendarControl from './CalendarControl'
import styles from './Calendar.module.scss'

type teacher = {
  id: number
  name: string
}

type Props = {
  date: Dayjs
  teachers: Array<teacher>
  setOpen: Function
  setDate: Function
}

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
              <TableCell onClick={() => setOpen({ state: true, info: teacher.name })}>
                {teacher.name}
              </TableCell>

              {[1, 2, 3, 4, 5].map((d) => (
                <TableCell key={d}>{d}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
)

export default Calendar