import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material'
import { Button, IconButton, List, ListItem, ListItemText } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'
import LeaveDialog from '../LeaveDialog'
import { formatDate } from '../../../../../core/utils/DateUtils'
import Leave from '../../../../../core/types/Leave'
import { leaveStateToString, leaveTypeToString } from '../../../../../core/utils/EnumToString'
import LeaveFormState from '../../../../../core/types/Form/LeaveFormState'
import { DEFAULT_LEAVE_FORM_STATE } from '../../../../../core/res/Defaults'

type Props = {
  value: Leave[]
  setValue: React.Dispatch<React.SetStateAction<Leave[]>>
  userId: string
}

const LeaveOverview: React.FC<Props> = ({ value, setValue, userId }) => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(DEFAULT_LEAVE_FORM_STATE)
  const [render, setRender] = useState(0)

  const openDialog = (form: LeaveFormState) => {
    setRender((r) => r + 1)
    setForm(form)
    setOpen(true)
  }

  const onSuccess = (id: number, newValue: Leave | null) => {
    // update entries on success
    if (newValue === null) {
      // delete entry
      setValue((v) => v.filter((leave) => leave.id !== id))
    } else {
      setValue((v) => {
        const index = v.findIndex((leave) => leave.id === id)

        if (index === -1) {
          // add entry
          return [...v, newValue]
        } else {
          // update entry
          v[index] = { ...v[index], ...newValue }
          return v
        }
      })
    }
  }

  return (
    <>
      <LeaveDialog
        key={render}
        userId={userId}
        open={open}
        close={() => setOpen(false)}
        value={form}
        setValue={setForm}
        onSuccess={onSuccess}
      />

      <List
        dense={true}
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          margin: '5px 0',
        }}
      >
        <ListItem>
          <Button
            variant="text"
            endIcon={<AddIcon />}
            onClick={() => openDialog(DEFAULT_LEAVE_FORM_STATE)}
          >
            Hinzufügen
          </Button>
        </ListItem>

        {value.map((l) => (
          <ListItem
            key={l.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="bearbeiten"
                onClick={() =>
                  openDialog({
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
                `${leaveTypeToString[l.type]}: ` +
                `${formatDate(l.startDate)} - ${formatDate(l.endDate)}`
              }
              secondary={leaveStateToString[l.state]}
            />
          </ListItem>
        ))}
      </List>
    </>
  )
}

export default LeaveOverview
