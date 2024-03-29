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
import LeaveDialog from '../../../teachers/components/Leaves/LeaveDialog'
import { useAuth } from '../../../auth/components/AuthProvider'
import LeaveState from '../../../../core/enums/LeaveState.enum'
import Leave from '../../../../core/types/Leave'
import { leaveStateToHeadlineString, leaveStateToString, leaveTypeToString } from '../../../../core/utils/EnumToString'
import DashboardProps from '../../../../core/types/DashboardProps'
import LeaveFormState from '../../../../core/types/Form/LeaveFormState'

export default function DashboardLeaves({ state, listSx } : DashboardProps & {state: LeaveState}) {
  const { API } = useAuth()
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [open, setOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [render, setRender] = useState(0)
  const [form, setForm] = useState({} as LeaveFormState)
  const [userId, setUserId] = useState('')
  
  const formatDate = (date: string) => dayjs(date).format('DD.MM.YYYY')

  const openDialog = (id: number, form: LeaveFormState) => {
    setUserId(id.toString())
    setForm(form)
    setRender((r) => r + 1)
    setOpen(true)
  }

  useEffect(() => {
    API.get('users/leaves/' + state).then((res) => setLeaves(res.data))
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
        <Stack direction="column" spacing={2} height={'100%'}>
          <Typography variant="h6">{leaveStateToHeadlineString[state]}</Typography>
          <List
            dense={true}
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              margin: '5px 0',
              ...listSx,
            }}
          >
            {leaves.length === 0 && (
              <ListItem>
                <ListItemText primary="keine Einträge" />
              </ListItem>
            )}
            {leaves.map((l) => (
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
                        `${formatDate(l.startDate)} - ${formatDate(l.endDate)}`}
                    </span>
                  }
                  secondary={
                    leaveTypeToString[l.type] +
                    ' - ' +
                    leaveStateToString[l.state]
                  }
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      </Box>
    </>
  )
}