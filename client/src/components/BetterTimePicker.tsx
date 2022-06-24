import ClearIcon from '@mui/icons-material/Clear'
import { TextField } from '@mui/material'
import { TimePicker } from '@mui/x-date-pickers'
import { Dayjs } from 'dayjs'
import { useState } from 'react'

import IconButtonAdornment from './IconButtonAdornment'

type Props = {
  label?: string
  minutesStep?: number
  value: Dayjs | null
  onChange: (value: Dayjs | null) => void
  clearValue: () => void
  minTime?: Dayjs
  maxTime?: Dayjs
  required?: boolean
  fullWidth?: boolean
}

const BetterTimePicker: React.FC<Props> = ({
  label,
  minutesStep,
  value,
  onChange,
  clearValue,
  minTime,
  maxTime,
  required,
  fullWidth,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <TimePicker
      label={label}
      minTime={minTime}
      maxTime={maxTime}
      value={value}
      onChange={onChange}
      minutesStep={minutesStep}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      InputAdornmentProps={{
        position: 'start',
      }}
      renderInput={(params) => (
        <TextField
          fullWidth={fullWidth}
          {...params}
          variant="outlined"
          required={required}
          inputProps={{
            ...params.inputProps,
            disabled: true,
          }}
          InputProps={{
            ...params.InputProps,
            onClick: () => setOpen(true),
            endAdornment: (
              <IconButtonAdornment
                hidden={value === null}
                icon={ClearIcon}
                onClick={(e) => {
                  clearValue()
                  setOpen(false)
                  e.stopPropagation()
                }}
              />
            ),
            sx: { cursor: 'unset' },
          }}
          InputLabelProps={{
            ...params.InputLabelProps,
            shrink: true,
          }}
        />
      )}
    />
  )
}

export default BetterTimePicker
