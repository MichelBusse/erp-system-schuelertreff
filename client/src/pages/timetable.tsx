import dayjs from 'dayjs'
import 'dayjs/locale/de'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useState } from 'react'
import Calendar from '../components/Calendar'
import CalendarControl from '../components/CalendarControl'

dayjs.locale('de')
dayjs.extend(weekOfYear)

const Timetable: React.FC = () => {
  const [date, setDate] = useState(dayjs())

  return (
    <>
      <h1>Stundenplan</h1>
      <CalendarControl date={date} setDate={setDate} />
      <Calendar date={date} />
    </>
  )
}

export default Timetable
