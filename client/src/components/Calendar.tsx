import { Dayjs } from 'dayjs'

type Props = {
  date: Dayjs
}

const Calendar: React.FC<Props> = ({ date }) => {
  return (
    <>
      <h1>Kalender</h1>

      {/* only for demo purposes */}
      <ul>
        {[1, 2, 3, 4, 5].map((d) => (
          <li key={d}>{date.day(d).format('YYYY-MM-DD dddd')}</li>
        ))}
      </ul>
    </>
  )
}

export default Calendar
