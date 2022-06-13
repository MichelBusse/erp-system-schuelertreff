import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import { BsPlusLg } from 'react-icons/bs'

import { useAuth } from '../components/AuthProvider'
import subject from '../types/subject'
import styles from './subjects.module.scss'

const defaultFormData = {
  color: '#FF0000',
  name: '',
  shortForm: '',
}

const Subjects: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [data, setData] = useState(defaultFormData)
  const [subjects, setSubjects] = useState<subject[]>([])

  const { API } = useAuth()

  //Get subjects from DB
  useEffect(() => {
    API.get('subjects').then((res) => setSubjects(res.data))
  }, [])

  const openDialog = () => {
    setData(defaultFormData)
    setDialogOpen(true)
  }

  //TODO: validate filled fields
  const submitForm = () => {
    API.post('subjects', data).then((res) => {
      setSubjects((s) => [...s, res.data])
      setData(defaultFormData)
      setDialogOpen(false)
    })
  }

  return (
    <Box sx={{ p: 4 }} className={styles.wrapper}>
      <Dialog open={dialogOpen}>
        <DialogTitle>Fach hinzufügen</DialogTitle>
        <DialogContent>
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
    </Box>
  )
}

export default Subjects
