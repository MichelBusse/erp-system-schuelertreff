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

import { leaveStateToString, leaveTypeToString } from '../../consts'
import { leave } from '../../types/user'
import { useAuth } from '../AuthProvider'
import LeaveDialog, { LeaveForm } from '../LeaveDialog'

const PendingLeaves: React.FC = () => {
  const { API } = useAuth()
  const [pendingLeaves, setPendingLeaves] = useState<leave[]>([])
  const [open, setOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [render, setRender] = useState(0)
  const [form, setForm] = useState({} as LeaveForm)
  const [userId, setUserId] = useState('')

  const openDialog = (id: number, form: LeaveForm) => {
    setUserId(id.toString())
    setForm(form)
    setRender((r) => r + 1)
    setOpen(true)
  }

  useEffect(() => {
    API.get('users/leaves/pending').then((res) => {
      setPendingLeaves(res.data)
      console.log(res.data)
    })
  }, [refresh])

  return (
    <>
      <LeaveDialog
        key={render}
        userId={userId}
        open={open}
        close={() => setOpen(false)}
        value={form}
        setValue={setForm}
        onSuccess={() => setRefresh((r) => r + 1)}
      />
      <Box p={4} sx={{ backgroundColor: '#ffffff', borderRadius: '4px' }}>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6">
            Ausstehende Urlaube/Krankmeldungen
          </Typography>
          <List
            dense={true}
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              margin: '5px 0',
            }}
          >
            {pendingLeaves.length === 0 && (
              <ListItem>
                <ListItemText primary="keine Einträge" />
              </ListItem>
            )}
            {pendingLeaves.map((l) => (
              <ListItem
                key={l.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="bearbeiten"
                    onClick={() =>
                      openDialog(l.user.id, {
                        id: l.id,
                        type: l.type,
                        state: l.state,
                        startDate: dayjs(l.startDate),
                        endDate: dayjs(l.endDate),
                        hasAttachment: l.hasAttachment,
                      })
                    }
                  >
                    <EditIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <span style={{ whiteSpace: 'pre-wrap' }}>
                      {`${l.user.firstName} ${l.user.lastName}\n` +
                        `${leaveTypeToString[l.type]}: ` +
                        `${l.startDate} - ${l.endDate}`}
                    </span>
                  }
                  secondary={leaveStateToString[l.state]}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      </Box>
    </>
  )
}

export default PendingLeaves
