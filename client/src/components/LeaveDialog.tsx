import { Clear as ClearIcon, Upload as UploadIcon } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import { snackbarOptionsError } from '../consts'
import { LeaveState, LeaveType } from '../types/enums'
import { useAuth } from './AuthProvider'
import EqualStack from './EqualStack'
import IconButtonAdornment from './IconButtonAdornment'

export type LeaveForm = {
  id?: number
  type: LeaveType
  state: LeaveState
  startDate: Dayjs | null
  endDate: Dayjs | null
  hasAttachment: boolean
}

type Props = {
  userId: string
  open: boolean
  close: () => void
  value: LeaveForm
  setValue: React.Dispatch<React.SetStateAction<LeaveForm>>
}

const LeaveDialog: React.FC<Props> = ({
  userId,
  open,
  close,
  value,
  setValue,
}) => {
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [renderUpload, setRenderUpload] = useState(0)

  const { enqueueSnackbar } = useSnackbar()
  const { API } = useAuth()

  const clearUpload = () => {
    setRenderUpload((r) => r + 1)
    setUploadFile(null)
  }

  const formValid = !!(value.startDate && value.endDate && value.type)

  const handleSubmit = () => {
    setLoading(true)

    // if id is not set, create new leave
    API.post(`users/${userId}/leave/${value.id ?? ''}`, {
      type: value.type,
      state: value.state,
      startDate: value.startDate?.format('YYYY-MM-DD'),
      endDate: value.endDate?.format('YYYY-MM-DD'),
    })
      .then((res) => {
        // after leave is saved, upload attachment (if selected)
        if (uploadFile !== null) {
          const formData = new FormData()
          formData.append('file', uploadFile)

          API.post(`users/${userId}/leave/${res.data.id}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
            .then(() => setLoading(false))
            .catch((err) => {
              console.error(err)
              enqueueSnackbar(
                'Ein Fehler ist aufgetreten.',
                snackbarOptionsError,
              )
              setLoading(false)
            })
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
        setLoading(false)
      })
  }

  return (
    <Dialog open={open}>
      <DialogContent
        sx={{
          width: 500,
          '& .MuiStepConnector-root': {
            maxWidth: '100px',
          },
        }}
      >
        <Box sx={{ overflow: 'auto', padding: 0.5 }}>
          <Stack spacing={2}>
            <FormControl>
              <RadioGroup
                row
                value={value.type}
                onChange={(event) =>
                  setValue((form) => ({
                    ...form,
                    type: event.target.value as LeaveType,
                  }))
                }
              >
                <FormControlLabel
                  value={LeaveType.REGULAR}
                  label="Urlaub"
                  control={<Radio />}
                />
                <FormControlLabel
                  value={LeaveType.SICK}
                  label="Krankmeldung"
                  control={<Radio />}
                />
              </RadioGroup>
            </FormControl>
            <EqualStack direction="row" spacing={2}>
              <DatePicker
                label="Startdatum"
                mask="__.__.____"
                minDate={dayjs().add(7, 'd')}
                value={value.startDate}
                onChange={(value) => {
                  setValue((data) => ({
                    ...data,
                    startDate: value,
                    endDate: data.endDate?.isBefore(value)
                      ? null
                      : data.endDate,
                  }))
                }}
                shouldDisableDate={(date) => [0, 6].includes(date.day())}
                renderInput={(params) => (
                  <TextField {...params} required variant="outlined" />
                )}
                InputAdornmentProps={{
                  position: 'start',
                }}
                InputProps={{
                  endAdornment: (
                    <IconButtonAdornment
                      icon={ClearIcon}
                      hidden={value.startDate === null}
                      onClick={() =>
                        setValue((data) => ({
                          ...data,
                          startDate: null,
                          endDate: null,
                        }))
                      }
                    />
                  ),
                }}
              />
              <DatePicker
                label="Enddatum"
                mask="__.__.____"
                minDate={value.startDate ?? undefined}
                defaultCalendarMonth={value.startDate ?? undefined}
                disabled={value.startDate === null}
                value={value.endDate}
                onChange={(value) => {
                  setValue((data) => ({ ...data, endDate: value }))
                }}
                renderInput={(params) => (
                  <TextField {...params} required variant="outlined" />
                )}
                InputAdornmentProps={{
                  position: 'start',
                }}
                InputProps={{
                  endAdornment: (
                    <IconButtonAdornment
                      icon={ClearIcon}
                      hidden={value.endDate === null}
                      onClick={() =>
                        setValue((data) => ({ ...data, endDate: null }))
                      }
                    />
                  ),
                }}
              />
            </EqualStack>
            <Box>
              <Typography>Nachweis hochladen:</Typography>
              <Stack direction="row" spacing={1} sx={{ placeItems: 'center' }}>
                <IconButton
                  color={value.hasAttachment ? 'primary' : 'default'}
                  aria-label="Nachweis hochladen"
                  component="label"
                >
                  <input
                    key={renderUpload}
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) =>
                      setUploadFile(
                        e.target.files !== null ? e.target.files[0] : null,
                      )
                    }
                  />
                  <UploadIcon />
                </IconButton>
                {uploadFile !== null && (
                  <>
                    <Typography sx={{ opacity: 0.75 }}>
                      {uploadFile.name}
                    </Typography>
                    <IconButton
                      size="small"
                      color="default"
                      aria-label="Feld leeren"
                      onClick={clearUpload}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            close()
            clearUpload()
          }}
        >
          Abbrechen
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleSubmit}
          loading={loading}
          disabled={!formValid || loading}
        >
          Hinzufügen
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default LeaveDialog
