import { Grid, Paper, IconButton, Dialog, DialogActions, Button, DialogContent, TextField, DialogContentText, DialogTitle } from "@mui/material"
import { styled } from "@mui/material/styles"
import SubjectCard from "../components/SubjectCard"
import { BsPlusLg } from "react-icons/bs"
import "./subjects.scss"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { SketchPicker } from 'react-color'

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
  
  //state of the AddSubject Dialog
  const [open, setOpen] = React.useState(false)
  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  //Handels the Colorchange
  const [color, setColor] = React.useState('#FF0000')
  const handleColorChange = (color:any) => setColor(color.hex)
  //subjectName:
  const [subjectName, setSubjectName] = useState('')
  const changeSubjectName = (event:any) => setSubjectName(event.target.value)
  //shortForm:
  const [shortForm, setShortForm] = useState('')
  const changeShortForm = (event:any) => setShortForm(event.target.value)

  //Get subjects from DB
  const [subjects, setSubjects] = useState<subject[]>([])
  useEffect(()=>{
    axios.get(`http://localhost:8080/subjects`)
      .then(res => {
        const DBsubjects = res.data
        setSubjects(DBsubjects)
      })
  }, [])

  //TODO: validate filled fields
  //submit function:
  const submit = () => {
    axios.post(`http://localhost:8080/subjects`, {
      name: subjectName,
	    color: color,
	    shortForm: shortForm
    })
      .then(res => {
        setSubjects(s => [...s, res.data])
        console.log(res)
      })
    setOpen(false);
  }

  //Content of the site
  return (
    <>
      <Dialog open={open}>
        <DialogTitle>Fach hinzufügen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Geben Sie die Bezeichnung das Faches, dessen Abkürzung für den Stundenplan ein und wählen Sie eine Farbe aus.
          </DialogContentText>
          <TextField
            id="subjectName"
            label="Fachbezeichnung"
            variant="outlined"
            required={true}
            sx={{margin: '10px', marginLeft: '0px'}}
            onChange={ changeSubjectName }
          />
          <TextField
            id="shortForm"
            label="Abkürzung"
            variant="outlined"
            required={true}
            sx={{margin: '10px'}}
            onChange={ changeShortForm }
          />
          <SketchPicker
            color={ color }
            onChange={ handleColorChange }
          /> 
        </DialogContent>
        <DialogActions>
          <Button onClick={ handleClose }>Abbrechen</Button>
          <Button onClick={ submit }>Hinzufügen</Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={4} columns={24}>
        <Grid item sm={12} md={6} lg={4} xl={3}>
              <Item className='plusField' onClick={handleClickOpen}>
                <IconButton sx={{ height: '124px' }}>
                  <BsPlusLg/>
                </IconButton>
              </Item>
        </Grid>
        {subjects.map((subject) =>
          <SubjectCard key={subject.id} subjectName={subject.name} color={subject.color}/>
        )}
      </Grid>
    </>)
}

export default Subjects