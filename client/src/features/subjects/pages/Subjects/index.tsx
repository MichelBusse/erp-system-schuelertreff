import { Box, Grid, IconButton, Paper } from '@mui/material'
import { useEffect, useState } from 'react'
import { BsPlusLg } from 'react-icons/bs'

import styles from './styles.module.scss'
import { useAuth } from '../../../auth/components/AuthProvider'
import SubjectDialog from '../../components/SubjectDialog'
import Subject from '../../../../core/types/Subject'

const Subjects: React.FC = () => {
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [initialSubject, setInitialSubject] = useState<Subject | null>(null)
  const { API } = useAuth()

  //Get subjects from DB
  useEffect(() => {
    API.get('subjects')
      .then((res) => setSubjects(res.data))
      .catch(() => {
        setError('Seite konnte nicht geladen werden.')
      })
  }, [])

  if (error !== '') {
    return <h1>{error}</h1>
  }

  const openSubjectDialog = (subject?: Subject) => {
    if (subject) {
      setInitialSubject(subject)
    } else {
      setInitialSubject(null)
    }
    setOpen(true)
  }

  return (
    <Box
      sx={{
        p: 4,
      }}
      className={styles.wrapper}
    >
      <Grid container spacing={{ xs: 2, sm: 3, md: 4, lg: 5 }} columns={24}>
        <Grid item xs={12} sm={8} md={8} lg={6} xl={4}>
          <IconButton
            className={styles.card}
            onClick={() => openSubjectDialog()}
          >
            <BsPlusLg />
          </IconButton>
        </Grid>
        {subjects.map((subject) => (
          <Grid key={subject.id} item xs={12} sm={8} md={8} lg={6} xl={4}>
            <Paper
              className={styles.card}
              sx={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
              onClick={() => openSubjectDialog(subject)}
            >
              {`${subject.name} (${subject.shortForm})`}
              <div
                style={{
                  width: '100%',
                  height: 90,
                  backgroundColor: subject.color + '95',
                  opacity: 0.5,
                  marginTop: 10,
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <SubjectDialog
        open={open}
        setOpen={setOpen}
        setSubjects={setSubjects}
        initialSubject={initialSubject}
      />
    </Box>
  )
}

export default Subjects
