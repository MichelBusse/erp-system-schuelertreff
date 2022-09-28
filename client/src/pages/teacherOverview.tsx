import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../components/AuthProvider'
import UserDocuments, { UserDocumentsType } from '../components/documents/UserDocuments'
import { degreeToString, teacherSchoolTypeToString } from '../consts'
import styles from '../pages/gridList.module.scss'
import { TeacherSchoolType } from '../types/enums'
import subject from '../types/subject'
import { teacher } from '../types/user'

dayjs.extend(customParseFormat)

const TeacherOverview: React.FC = () => {
  const { API } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState<subject[]>([])
  const [teacher, setTeacher] = useState<teacher | null>(null)

  if (!id) return <></>

  useEffect(() => {
    API.get(`subjects`).then((res) => setSubjects(res.data))
    API.get('users/teacher/' + id).then((res) => setTeacher(res.data))
  }, [])

  return (
    <div className={styles.wrapper}>
      <Box className={styles.contentBox}>
        <Stack direction="column" alignItems="stretch" spacing={2}>
          <Typography variant="h6">Person:</Typography>
          <Stack direction="row" columnGap={2}>
            <TextField
              fullWidth={true}
              label="Vorname"
              value={teacher?.firstName ?? ''}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              fullWidth={true}
              label="Nachname"
              value={teacher?.lastName ?? ''}
              InputProps={{
                readOnly: true,
              }}
            />
          </Stack>
          <Stack direction="row" columnGap={2}>
            <TextField
              fullWidth={true}
              label="Geburtsdatum"
              value={
                teacher?.dateOfBirth
                  ? dayjs(teacher.dateOfBirth).format('DD.MM.YYYY')
                  : ''
              }
              InputProps={{
                readOnly: true,
              }}
            />
          </Stack>
          <Typography variant="h6">Kontakt:</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth={true}
              label="Email"
              value={teacher?.email ?? ''}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              fullWidth={true}
              label="Telefonnummer"
              value={teacher?.phone ?? ''}
              InputProps={{
                readOnly: true,
              }}
            />
          </Stack>
          <Typography variant="h6">Lehrkraftdaten:</Typography>
          <Stack direction={'column'} rowGap={2}>
            <Autocomplete
              fullWidth
              multiple
              readOnly
              id="schoolTypes"
              options={Object.values(TeacherSchoolType)}
              getOptionLabel={(option: TeacherSchoolType) =>
                teacherSchoolTypeToString[option]
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Schularten"
                />
              )}
              value={(teacher?.teacherSchoolTypes as TeacherSchoolType[]) ?? []}
            />
            <Autocomplete
              fullWidth
              readOnly
              multiple
              id="subjects"
              options={subjects}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Fächer"
                />
              )}
              value={teacher?.subjects ?? []}
            />
            <Stack direction={'row'} columnGap={2}>
              <TextField
                fullWidth={true}
                label="Abschluss"
                value={teacher?.degree ? degreeToString[teacher.degree] : ''}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Stack>
          </Stack>
          <h3>Öffentliche Dokumente:</h3>
          <UserDocuments
            userDocumentsType={UserDocumentsType.PUBLIC}
            userId={Number(id)}
          />
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ marginTop: '15px' }}
          >
            {id && (
              <Button onClick={() => navigate(-1)} variant="outlined">
                Zurück
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </div>
  )
}

export default TeacherOverview
