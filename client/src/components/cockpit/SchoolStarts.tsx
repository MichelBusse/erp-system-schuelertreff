import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { school } from '../../types/user'
import { useAuth } from '../AuthProvider'

const SchoolStarts: React.FC = () => {
  const { API } = useAuth()
  const [schools, setSchools] = useState<Partial<school>[]>([])
  const navigate = useNavigate()
  const [date, setDate] = useState<Dayjs>(dayjs())

  useEffect(() => {
    API.get('users/school/startInFuture', {
      params: {
        of: date.format('YYYY-MM-DD'),
      },
    }).then((res) => {
      setSchools(res.data)
    })
  }, [date])

  return (
    <>
      <Box p={4} sx={{ backgroundColor: '#ffffff', borderRadius: '4px' }}>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6">Schulen Startdaten</Typography>
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
                  onClick={() => setDate((d) => d.subtract(1, 'week').clone())}
                >
                  <ArrowBackIosIcon fontSize="small" />
                </IconButton>
                <Typography variant="body1">
                  {`Kalenderwoche ${date.week()}`}
                </Typography>
                <IconButton
                  onClick={() => setDate((d) => d.add(1, 'week').clone())}
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Stack>
            </ListItem>
            {schools.length === 0 && (
              <ListItem>
                <ListItemText primary="keine Einträge" />
              </ListItem>
            )}
            {schools.map((school) => (
              <ListItem
                key={school.id}
                onClick={() => navigate('/schools/' + school.id)}
                sx={{
                  cursor: 'pointer',
                }}
              >
                <ListItemText
                  primary={`${school.schoolName}`}
                  secondary={dayjs(school.dateOfStart).format('DD.MM.YYYY')}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      </Box>
    </>
  )
}

export default SchoolStarts
