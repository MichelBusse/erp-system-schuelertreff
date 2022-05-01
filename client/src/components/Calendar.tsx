import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import dayjs, { Dayjs } from 'dayjs';
import './calendar.scss';
import { borderRadius } from '@mui/system';

//Type of the Array Teachers
type teachers = {
  id: number,
  name: string
}
//Properties of the Component
type Props = {
  date: Dayjs,
  teachers: Array<teachers>
}

//Properties of the Columns
// interface Column {

// }

//Array of all Columns with there Propertys
// const columns: readonly Column[] = [
//   { },
// ];

//Type of the Datas:
// interface Data {

// }

//Calendar Component:
const Calendar: React.FC<Props> = ({ date, teachers }) => {

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' , borderRadius: 5}}>
      <TableContainer sx={{ maxHeight: 440}}>
        <Table stickyHeader aria-label="sticky table">
          {/* Tablehead (.map iterates through all columns and print them into single cells): */}
          <TableHead>
            <TableRow>
              <TableCell className='TableHeadCell'></TableCell>
              {[1,2,3,4,5].map((d) => {
                // if its a column of day (all except the first on):
                  return(
                    <TableCell align="center" key={d} className='TableHeadCell'>
                      {/* Content of each cell (Day + Date): */}
                      <p className='DayLable'>{date.day(d).format("dddd")}</p>
                      <p className='DateLable'>{date.day(d).format('DD.MM.YYYY')}</p>
                    </TableCell>
                  )
              })}
            </TableRow>
          </TableHead>
          {/* Tablebody (.map iterates through all teachers and prints them in rows): */}
          <TableBody>
            {teachers
              .map((teacher) => {
                return (
                  <TableRow hover role="checkbox" key={teacher.id}>
                    <TableCell >
                      {teacher.name}
                    </TableCell>
                    <TableCell className='TableCell'>1</TableCell>
                    <TableCell className='TableCell'>2</TableCell>
                    <TableCell className='TableCell'>3</TableCell>
                    <TableCell className='TableCell'>4</TableCell>
                    <TableCell className='TableCell'>5</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default Calendar