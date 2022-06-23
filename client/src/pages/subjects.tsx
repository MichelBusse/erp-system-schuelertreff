import { Box, Grid, IconButton, Paper } from '@mui/material'
import { useEffect, useState } from 'react'
import { BsPlusLg } from 'react-icons/bs'

import { useAuth } from '../components/AuthProvider'
import SubjectDialog from '../components/SubjectDialog'
import subject from '../types/subject'
import styles from './subjects.module.scss'

const Subjects: React.FC = () => {
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState<subject[]>([])
  const { API, decodeToken } = useAuth()

  //Get subjects from DB
  useEffect(() => {
    API.get('subjects')
      .then((res) => setSubjects(res.data))
      .catch((error) => {
        setError('Seite konnte nicht geladen werden.')
      })
  }, [])

  if (error !== '') {
    return <h1>{error}</h1>
  }

  return (
    <Box sx={{ p: 4 }} className={styles.wrapper}>
      <Grid container spacing={4} columns={24}>
        <Grid item sm={12} md={6} lg={4} xl={3}>
          <IconButton className={styles.card} onClick={() => setOpen(true)}>
            <BsPlusLg />
          </IconButton>
        </Grid>
        {subjects.map((subject) => (
          <Grid key={subject.id} item sm={12} md={6} lg={4} xl={3}>
            <Paper className={styles.card}>
              {`${subject.name} (${subject.shortForm})`}
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
      <SubjectDialog open={open} setOpen={setOpen} setSubjects={setSubjects} />
    </Box>
  )
}

export default Subjects
