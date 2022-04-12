import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Dayjs } from 'dayjs'

type Props = {
  date: Dayjs,
  teachers: Array
}

interface Column {
  id: 'Teacher' | 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag';
  number: number;
  label: string;
  minWidth?: number;
  align?: 'right' | 'center';
}

var minWidth = 130
var color = "#E1FF95"
var columnNumber = 0

const columns: readonly Column[] = [
  { id: 'Montag', number: 1, label: 'Montag', minWidth: minWidth , align: 'center'},
  { id: 'Dienstag', number: 2, label: 'Dienstag', minWidth: minWidth , align: 'center'},
  { id: 'Mittwoch', number: 3, label: 'Mittwoch', minWidth: minWidth , align: 'center'},
  { id: 'Donnerstag', number: 4, label: 'Donnerstag', minWidth: minWidth , align: 'center'},
  { id: 'Freitag', number: 5, label: 'Freitag', minWidth: minWidth , align: 'center'},
];

// interface Data {
//   Montat: string;
//   Dienstag: string;
//   Mittwoch: string;
//   Donnerstag: string;
//   Freitag: string;
// }

const Calendar: React.FC<Props> = ({ date, teachers }) => {

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
            <TableCell style={{ minWidth: 170 , backgroundColor: color}}></TableCell>
              {columns.map((column) => {
                color = (columnNumber%2 == 0)? "#E9FDB7" : "#E1FF95"
                columnNumber++
                return(
                <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth, backgroundColor: color}}>
                  {date.day(column.number).format('dddd - DD.MM')}
                </TableCell>
              )})}
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers
              .map((teacher) => {
                return (
                  <TableRow hover role="checkbox" key={teacher.id}>
                    <TableCell>
                      {teacher.name}
                    </TableCell>
                    <TableCell style={{ borderStyle: "solid", borderColor: "grey", borderWidth: 1}}>1</TableCell>
                    <TableCell style={{ borderStyle: "solid", borderColor: "grey", borderWidth: 1}}>2</TableCell>
                    <TableCell style={{ borderStyle: "solid", borderColor: "grey", borderWidth: 1}}>3</TableCell>
                    <TableCell style={{ borderStyle: "solid", borderColor: "grey", borderWidth: 1}}>4</TableCell>
                    <TableCell style={{ borderStyle: "solid", borderColor: "grey", borderWidth: 1}}>5</TableCell>
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