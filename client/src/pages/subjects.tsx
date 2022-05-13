import { Grid, Paper, IconButton } from "@mui/material"
import { styled } from "@mui/material/styles"
import SubjectCard from "../components/SubjectCard"
import { BsPlusLg } from "react-icons/bs"
import './subjects.scss'

const Item = styled(Paper)(() => ({
  backgroundColor: 'white',
  borderRadius: '15px',
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));

const SubjectsList = [{subjectName: 'Deutsch', color: 'red'},
                      {subjectName: 'Mathe', color: 'green'},
                      {subjectName: 'Info', color: 'blue'},
                      {subjectName: 'Englisch', color: 'yellow'},
                      {subjectName: 'Religion', color: 'orange'},
                      {subjectName: 'Physik', color: 'aqua'},
                      {subjectName: 'Biologie', color: 'grey'},
                      {subjectName: 'Geschichte', color: 'silver'},
                      {subjectName: 'Französisch', color: 'purple'}
]

const Subjects: React.FC = () => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
            <Item className='plusField'>
              <IconButton sx={{ height: '124px' }}>
                <BsPlusLg/>
              </IconButton>
            </Item>
      </Grid>
      {SubjectsList.map((subject) =>
        <SubjectCard key={subject.subjectName} subjectName={subject.subjectName} color={subject.color}/>
      )}
    </Grid>)
}

export default Subjects
