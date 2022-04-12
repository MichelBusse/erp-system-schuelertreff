import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import dayjs, { Dayjs } from 'dayjs'

//Properties of the Component
type Props = {
  date: Dayjs,
  teachers: Array
}

//Properties of the Columns
interface Column {
  id: 'Teacher' | 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag'; //list of possible IDs
  number: number;
  label: string; //ColumnName
  minWidth?: number; 
  backgroundColor: string;
  align?: 'right' | 'center'; //Position (default is left)
  type: 'day' | 'noday';
}

var minWidth = 130 //default minWidth of Column
var color1 = "#E9FDB7"  //green bright
var color2 = "#E1FF95" //green dark
var rowNumber = 0 //counter for rows to change color
var backgroundColor = "" //backgorundColor for rows

//Array of all Columns with there Propertys
const columns: readonly Column[] = [
  { id: 'Montag', number: -1, label: '', minWidth: minWidth , backgroundColor: color1, align: 'center', type: 'noday'},
  { id: 'Montag', number: 1, label: 'Montag', minWidth: minWidth , backgroundColor: color2, align: 'center', type: 'day'},
  { id: 'Dienstag', number: 2, label: 'Dienstag', minWidth: minWidth , backgroundColor: color1, align: 'center', type: 'day'},
  { id: 'Mittwoch', number: 3, label: 'Mittwoch', minWidth: minWidth , backgroundColor: color2, align: 'center', type: 'day'},
  { id: 'Donnerstag', number: 4, label: 'Donnerstag', minWidth: minWidth , backgroundColor: color1, align: 'center', type: 'day'},
  { id: 'Freitag', number: 5, label: 'Freitag', minWidth: minWidth , backgroundColor: color2, align: 'center', type: 'day'},
];

//Type of the Datas:
// interface Data {
//   Montat: string;
//   Dienstag: string;
//   Mittwoch: string;
//   Donnerstag: string;
//   Freitag: string;
// }

//Calendar Component:
const Calendar: React.FC<Props> = ({ date, teachers }) => {

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          {/* Tablehead (.map iterates through all columns and print them into single cells): */}
          <TableHead>
            <TableRow>
              {columns.map((column) => {
                // if its a column of day (all except the first on):
                if(column.type == "day"){
                  return(
                    <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth, backgroundColor: column.backgroundColor}}>
                      {/* Content of each cell (Day + Date): */}
                      <p style={{margin: 0, height: 13}}>{column.label}</p>
                      <p style={{margin: 0, fontSize: 10}}>{date.day(column.number).format('DD.MM.YYYY')}</p>
                    </TableCell>
                  )
                // if its not a column of day (the first one)
                } else{
                  return(
                    <TableCell key={column.id} style={{ minWidth: column.minWidth, backgroundColor: column.backgroundColor}}>
                      {/* Content of each cell (empty): */}
                    </TableCell>
                  )
                }
              })}
            </TableRow>
          </TableHead>
          {/* Tablebody (.map iterates through all teachers and prints them in rows): */}
          <TableBody>
            {teachers
              .map((teacher) => {
                backgroundColor = (rowNumber%2==0)? color1 : color2
                rowNumber++
                return (
                  <TableRow hover role="checkbox" key={teacher.id}>
                    <TableCell style={{ backgroundColor: backgroundColor}}>
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