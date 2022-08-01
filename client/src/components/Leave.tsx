import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material'
import { Button, IconButton, List, ListItem, ListItemText } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'

import { LeaveState, LeaveType } from '../types/enums'
import { leave } from '../types/user'
import LeaveDialog, { LeaveForm } from './LeaveDialog'

type Props = {
  value: leave[]
  setValue: (newValue: leave[]) => void
  userId: string
}

const defaultFormData: LeaveForm = {
  type: LeaveType.REGULAR,
  state: LeaveState.PENDING,
  startDate: null,
  endDate: null,
  hasAttachment: false,
}

const typeToString = {
  regular: 'Urlaub',
  sick: 'Krankmeldung',
}

const Leave: React.FC<Props> = ({ value, setValue, userId }) => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultFormData)

  return (
    <>
      <LeaveDialog
        userId={userId}
        open={open}
        close={() => setOpen(false)}
        value={form}
        setValue={setForm}
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
            onClick={() => {
              setForm(defaultFormData)
              setOpen(true)
            }}
          >
            Hinzufügen
          </Button>
        </ListItem>
        {value.map((l) => {
          const match = l.dateRange.match(/[[(]([\d-]*),([\d-]*)[\])]/)

          if (match === null)
            return console.error('Error parsing daterange: ' + l.dateRange)

          const [, start, end] = match

          return (
            <ListItem
              key={l.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="bearbeiten"
                  onClick={() => {
                    setForm({
                      id: l.id,
                      type: l.type,
                      state: l.state,
                      startDate: dayjs(start),
                      endDate: dayjs(end),
                      hasAttachment: l.hasAttachment,
                    })
                    setOpen(true)
                  }}
                >
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${typeToString[l.type]}: ${start} - ${end}`}
                secondary={l.state}
              />
            </ListItem>
          )
        })}
      </List>
    </>
  )
}

export default Leave
