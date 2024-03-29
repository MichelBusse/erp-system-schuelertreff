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
import { useAuth } from '../../../auth/components/AuthProvider'
import School from '../../../../core/types/School'
import DashboardProps from '../../../../core/types/DashboardProps'

export default function SchoolStarts({ listSx } : DashboardProps) {
  const { API } = useAuth()
  const [schools, setSchools] = useState<Partial<School>[]>([])
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
      <Box
        p={4}
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
        }}
      >
        <Stack direction="column" spacing={2} height={'100%'}>
          <Typography variant="h6">Schulen Startdaten</Typography>
          <List
            dense={true}
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              margin: '5px 0',
              ...listSx,
            }}
          >
            {schools.length === 0 && (
              <ListItem>
                <ListItemText primary="keine Einträge" />
              </ListItem>
            )}
            {schools.map((school) => (
              <ListItemButton
                key={school.id}
                component={NavLink}
                to={'/schools/' + school.id}
              >
                <ListItemText
                  primary={`${school.schoolName}`}
                  secondary={dayjs(school.dateOfStart).format('DD.MM.YYYY')}
                />
              </ListItemButton>
            ))}
          </List>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={'center'}
            width={'100%'}
          >
            <IconButton onClick={() => setDate((d) => d.subtract(1, 'week'))}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">{`KW ${date.week()}`}</Typography>
            <IconButton onClick={() => setDate((d) => d.add(1, 'week'))}>
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </>
  )
}