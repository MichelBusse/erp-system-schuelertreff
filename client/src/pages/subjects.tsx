import { Grid, Paper, IconButton } from "@mui/material"
import { styled } from "@mui/material/styles"
import SubjectCard from "../components/SubjectCard"
import { BsPlusLg } from "react-icons/bs"
import "./subjects.scss"
import axios from "axios"
import React, { useEffect, useState } from "react"

type subject={
  id: number,
  name: string,
  color: string,
  shortForm: string
}

const Item = styled(Paper)(() => ({
  backgroundColor: 'white',
  borderRadius: '15px',
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));

const Subjects: React.FC = () => {

  const [subjects, setSubjects] = useState<subject[]>([])

  useEffect(()=>{
    axios.get(`http://localhost:8080/subjects`)
      .then(res => {
        const DBsubjects = res.data
        setSubjects(DBsubjects)
      })
  }, [])

  return (
    <Grid container spacing={4}>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
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

