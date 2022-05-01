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
  var teachers = [ {id: 1, name: 'Prof. der Magie Fugi'},
                   {id: 2, name: 'Oberhaupt Michel'},
                   {id: 3, name: 'Dr. Shishos Cönos'},
                   {id: 4, name: 'Klimmzug Teubner'},
                   {id: 5, name: 'Eggi Extrem'},
                   {id: 6, name: 'Außendienstler Bley'},
                   {id: 7, name: 'Angela Merkel'},
                   {id: 8, name: 'Luis Günthersohn'},
                   {id: 9, name: 'Litsch'},
                   {id: 10, name: 'Paul Albert Hendinger'}] 
  return (
    <>
      <CalendarControl date={date} setDate={setDate} />
      <Calendar date = {date} teachers = {teachers}/>
    </>
  )
}

export default Timetable
