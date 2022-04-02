
import CalendarControll from "../components/CalendarControllComponent";

const Timetable: React.FC = () => {

  var date = new Date();
  var currentThursday = new Date(date.getTime() +(3-((date.getDay()+6) % 7)) * 86400000);
  var yearOfThursday = currentThursday.getFullYear();
  var firstThursday = new Date(new Date(yearOfThursday,0,4).getTime() +(3-((new Date(yearOfThursday,0,4).getDay()+6) % 7)) * 86400000);
  var weekNumber = Math.floor(1 + 0.5 + (currentThursday.getTime() - firstThursday.getTime()) / 86400000/7);

  var weekShown = weekNumber

  function changeWeek(direction=""){
    if(direction == "up") weekShown++
    if(direction == "down") weekShown--

    console.log(weekShown)
  }
  
  return (
    <>
      <h1>Stundenplan {weekShown}</h1>
      <CalendarControll changeWeek = {changeWeek} number = {weekShown}/>
    </>
  );
}

export default Timetable
