import { Grid, Paper, IconButton } from "@mui/material"
import { styled } from "@mui/material/styles"
import SubjectCard from "../components/SubjectCard"
import { BsPlusLg } from "react-icons/bs"
import "./subjects.scss"
import axios from "axios"
import React, { useEffect, useState } from "react"

//Typedefiniton of subjects
type subject={
  id: number,
  name: string,
  color: string,
  shortForm: string
}

//style of the Griditem for single subjects
const Item = styled(Paper)(() => ({
  backgroundColor: 'white',
  borderRadius: '15px',
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));


//subject site it self
const Subjects: React.FC = () => {
  //Get subjects from DB
  const [subjects, setSubjects] = useState<subject[]>([])
  useEffect(()=>{
    axios.get(`http://localhost:8080/subjects`)
      .then(res => {
        const DBsubjects = res.data
        setSubjects(DBsubjects)
      })
  }, [])
  //Content of the site
  return (
    <Grid container spacing={4} columns={24}>
      <Grid item sm={12} md={6} lg={4} xl={3}>
            <Item className='plusField'>
              <IconButton sx={{ height: '124px' }}>
                <BsPlusLg/>
              </IconButton>
            </Item>
      </Grid>
      {subjects.map((subject) =>
        <SubjectCard key={subject.id} subjectName={subject.name} color={subject.color}/>
      )}
    </Grid>)
}

export default Subjects

