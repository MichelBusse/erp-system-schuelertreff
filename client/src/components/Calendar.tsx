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
import { styled } from '@mui/system';
import CalendarControl from './CalendarControl';
import { grey } from '@mui/material/colors';

//Type of the Array Teachers
type teachers = {
  id: number
  name: string
}
//Properties of the Component
type Props = {
  date: Dayjs
  teachers: Array<teachers>
  setOpen: Function
  setDate: Function
}
//Styling:
const StyledPaper = styled(Paper, {})({
  width: '100%',
  overflow: 'hidden',
  borderRadius: 25,
});

const StyledCellContent = styled(TableCell, {})({
  borderRightStyle: 'solid',
  borderWidth: 0.5,
  borderColor: '#CDCDCD',
  backgroundColor: 'white'
});

const StyledCellWeekday = styled(TableCell, {})({
  width: "17%",
  minWidth: 150
});

const StyledCellTeacherName = styled(TableCell, {})({
  width: '15em',
  height: '5em',
  borderStyle: 'none',
  borderRightStyle: 'solid',
  borderWidth: 0.5,
  borderColor: '#CDCDCD',
  paddingTop: 5,
  paddingBottom: 5,
});

//Calendar Component:
const Calendar: React.FC<Props> = ({ date, teachers, setOpen, setDate }) => {
  return (<>
    <StyledPaper>
      <CalendarControl date={date} setDate={setDate} />
      <TableContainer sx={{ maxHeight: 'calc(100vh - 104px)'}}>
        <Table stickyHeader aria-label="sticky table">
          {/* Tablehead (.map iterates through all columns and print them into single cells): */}
          <TableHead>
            <TableRow>
              <StyledCellTeacherName sx={{borderStyle: "none"}} className="coloredCell"></StyledCellTeacherName>
              {[1,2,3,4,5].map((d) => {
                // if its a column of day (all except the first on):
                  return(
                    <StyledCellWeekday align="center" key={d} className="coloredCell">
                      <div style={{fontSize: '1.2rem'}}>{date.day(d).format("dddd")}</div>
                      <div style={{fontSize: '0.8rem', margin: '-5px'}}>{date.day(d).format('DD.MM.YYYY')}</div>
                    </StyledCellWeekday>
                  )
              })}
            </TableRow>
          </TableHead>
          {/* Tablebody (.map iterates through all teachers and prints them in rows): */}
          <TableBody>
            {teachers
              .map((teacher) => {
                return (
                  <TableRow hover role="checkbox" key={teacher.id} className="coloredCell2">
                    <StyledCellTeacherName onClick={() => setOpen({state: true, info: teacher.name})} >
                      {teacher.name}
                    </StyledCellTeacherName>
                    <StyledCellContent>1</StyledCellContent>
                    <StyledCellContent>2</StyledCellContent>
                    <StyledCellContent>3</StyledCellContent>
                    <StyledCellContent>4</StyledCellContent>
                    <StyledCellContent>5</StyledCellContent>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledPaper>
   </>
  );
}

export default Calendar