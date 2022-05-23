import {
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  TextField,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { BsPlusLg } from 'react-icons/bs'
import styles from './subjects.module.scss'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import subject from '../types/subject'

const defaultFormData = {
  color: '#FF0000',
  name: '',
  shortForm: '',
}

const Subjects: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [data, setData] = useState(defaultFormData)
  const [subjects, setSubjects] = useState<subject[]>([])

  //Get subjects from DB
  useEffect(() => {
    axios.get(`http://localhost:8080/subjects`).then((res) => {
      const DBsubjects = res.data
      setSubjects(DBsubjects)
    })
  }, [])

  const openDialog = () => {
    setData(defaultFormData)
    setDialogOpen(true)
  }

  //TODO: validate filled fields
  const submitForm = () => {
    axios.post(`http://localhost:8080/subjects`, data).then((res) => {
      setSubjects((s) => [...s, res.data])
      setData(defaultFormData)
      setDialogOpen(false)
    })
  }

  return (
    <>
      <Dialog open={dialogOpen}>
        <DialogTitle>Fach hinzufügen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Geben Sie die Bezeichnung das Faches, dessen Abkürzung für den
            Stundenplan ein und wählen Sie eine Farbe aus.
          </DialogContentText>
          <TextField
            id="subjectName"
            label="Fachbezeichnung"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px' }}
            value={data.name}
            onChange={(event) =>
              setData((data) => ({ ...data, name: event.target.value }))
            }
          />
          <TextField
            id="shortForm"
            label="Abkürzung"
            variant="outlined"
            required={true}
            sx={{ margin: '10px' }}
            value={data.shortForm}
            onChange={(event) =>
              setData((data) => ({ ...data, shortForm: event.target.value }))
            }
          />
          <SketchPicker
            color={data.color}
            onChange={(color) =>
              setData((data) => ({ ...data, color: color.hex }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={submitForm}>Hinzufügen</Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={4} columns={24}>
        <Grid item sm={12} md={6} lg={4} xl={3}>
          <IconButton className={styles.card} onClick={openDialog}>
            <BsPlusLg />
          </IconButton>
        </Grid>
        {subjects.map((subject) => (
          <Grid key={subject.id} item sm={12} md={6} lg={4} xl={3}>
            <Paper className={styles.card}>
              {subject.name}
              <div
                style={{
                  width: '100%',
                  height: 90,
                  backgroundColor: subject.color,
                  opacity: 0.5,
                  marginTop: 10,
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default Subjects
