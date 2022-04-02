import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const CalendarControll: React.FC = (props) => {
    return (
      <>
        <ArrowBackIosIcon onClick = {() => props.changeWeek("down")}/>
        <h2>Kalenderwoche {props.number}</h2>
        <ArrowForwardIosIcon onClick = {() => props.changeWeek("up")}/>
        {/* <button onClick={props.changeWeek("up")}>hoch</button> */}
      </>
    );
  }
  
  export default CalendarControll