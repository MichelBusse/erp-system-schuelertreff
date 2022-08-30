import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos'
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { teacher } from '../../types/user'
import { useAuth } from '../AuthProvider'

const ApplicationMeetings: React.FC = () => {
  const { API } = useAuth()
  const [teachers, setTeachers] = useState<Partial<teacher>[]>([])
  const [date, setDate] = useState<Dayjs>(dayjs())

  useEffect(() => {
    API.get('users/teacher/applicationMeetings', {
      params: {
        of: date.format('YYYY-MM-DD'),
      },
    }).then((res) => {
      setTeachers(res.data)
    })
  }, [date])

  return (
    <>
      <Box p={4} sx={{ backgroundColor: '#ffffff', borderRadius: '4px' }}>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6">Anstehende Bewerbungsgespräche</Typography>
          <List
            dense={true}
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              margin: '5px 0',
            }}
          >
            <ListItem>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent={'center'}
                width={'100%'}
              >
                <IconButton
                  onClick={() => setDate((d) => d.subtract(1, 'week'))}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="body1">
                  {`Kalenderwoche ${date.week()}`}
                </Typography>
                <IconButton onClick={() => setDate((d) => d.add(1, 'week'))}>
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Stack>
            </ListItem>
            {teachers.length === 0 && (
              <ListItem>
                <ListItemText primary="keine Einträge" />
              </ListItem>
            )}
            {teachers.map((teacher) => (
              <ListItemButton
                key={teacher.id}
                component={NavLink}
                to={'/teachers/' + teacher.id}
              >
                <ListItemText
                  primary={`${teacher.firstName} ${teacher.lastName}`}
                  secondary={dayjs(teacher.dateOfApplicationMeeting).format(
                    'DD.MM.YYYY HH:mm',
                  )}
                />
              </ListItemButton>
            ))}
          </List>
        </Stack>
      </Box>
    </>
  )
}

export default ApplicationMeetings