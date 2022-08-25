import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { school } from '../../types/user'
import { useAuth } from '../AuthProvider'

const SchoolStarts: React.FC = () => {
  const { API } = useAuth()
  const [schools, setSchools] = useState<Partial<school>[]>([])
  const [refresh, setRefresh] = useState<number>(0)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('users/school/startInFuture').then((res) => {
      setSchools(res.data)
    })
  }, [refresh])

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
