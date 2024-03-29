import {
  Clear as ClearIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material'
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
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { SNACKBAR_OPTIONS, SNACKBAR_OPTIONS_ERROR } from '../../../../../core/res/Constants'
import { useAuth } from '../../../../auth/components/AuthProvider'
import IconButtonAdornment from '../../../../general/components/IconButtonAdornment'
import LeaveDialogSubstitute from '../LeaveDialogSubstitute'
import LeaveType from '../../../../../core/enums/LeaveType.enum'
import LeaveState from '../../../../../core/enums/LeaveState.enum'
import Leave from '../../../../../core/types/Leave'
import UserRole from '../../../../../core/enums/UserRole.enum'
import { leaveStateToString, leaveTypeToString } from '../../../../../core/utils/EnumToString'
import LeaveFormState from '../../../../../core/types/Form/LeaveFormState'


type Props = {
  userId: string
  open: boolean
  close: () => void
  value: LeaveFormState
  setValue: React.Dispatch<React.SetStateAction<LeaveFormState>>
  onSuccess: (id: number, value: Leave | null) => void
}

const LeaveDialog: React.FC<Props> = ({
  userId,
  open,
  close,
  value,
  setValue,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [renderUpload, setRenderUpload] = useState(0)
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)
  const [initialState] = useState(value.state)

  const { enqueueSnackbar } = useSnackbar()
  const { API, hasRole } = useAuth()

  const clearUpload = () => {
    setRenderUpload((r) => r + 1)
    setUploadFile(null)
  }

  const formValid = !!(value.startDate && value.endDate && value.type)

  // user is not supposed to edit it (would cause lots of issues)
  const editDisabled =
    (typeof value.id !== 'undefined' && userId === 'me') ||
    initialState !== LeaveState.PENDING

  const handleUpload = (id: number, data?: Leave) => {
    if (uploadFile === null) return

    setLoading(true)

    const formData = new FormData()
    formData.append('file', uploadFile)

    API.post(`users/${userId}/leave/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((res) => {
        enqueueSnackbar('Erfolgreich gespeichert', SNACKBAR_OPTIONS)
        onSuccess(id, { ...(data ?? res.data), hasAttachment: true })
        close()
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
        setLoading(false)
      })
  }

  const handleSubmit = () => {
    setLoading(true)

    if (editDisabled && value.id) {
      handleUpload(value.id)
    } else {
      // if id is not set, create new leave
      // userId can be 'me' or a numeric id
      API.post(`users/${userId}/leave/${value.id ?? ''}`, {
        type: value.type,
        state: value.state,
        startDate: value.startDate?.format('YYYY-MM-DD'),
        endDate: value.endDate?.format('YYYY-MM-DD'),
      })
        .then((res) => {
          // after leave is saved, upload attachment (if selected)
          if (uploadFile !== null) {
            handleUpload(res.data.id, res.data)
          } else {
            enqueueSnackbar('Erfolgreich gespeichert', SNACKBAR_OPTIONS)
            onSuccess(res.data.id, res.data)
            close()
          }
        })
        .catch((err) => {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
          setLoading(false)
        })
    }
  }

  const handleDelete = () => {
    if (!deleteConfirmation) {
      setDeleteConfirmation(true)
    } else {
      API.delete(`users/${userId}/leave/${value.id}`)
        .then(() => {
          enqueueSnackbar('Erfolgreich gelöscht', SNACKBAR_OPTIONS)
          onSuccess(value.id ?? 0, null)
          close()
        })
        .catch((err) => {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
        })
    }
  }

  const getAttachment = () => {
    if (typeof value.id === 'undefined') return

    API.get(`users/${userId}/leave/${value.id}`, {
      responseType: 'blob',
      timeout: 30000,
    })
      .then((res) => {
        const url = URL.createObjectURL(res.data)
        window.open(url, '_blank', 'noopener,noreferrer')
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
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
            {!editDisabled ? (
              <>
                <FormControl disabled={editDisabled}>
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
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label="Startdatum"
                    mask="__.__.____"
                    minDate={!editDisabled ? dayjs() : undefined}
                    disabled={editDisabled}
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        variant="outlined"
                      />
                    )}
                    InputAdornmentProps={{
                      position: 'start',
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButtonAdornment
                          icon={ClearIcon}
                          hidden={value.startDate === null || editDisabled}
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
                    minDate={
                      !editDisabled ? value.startDate ?? undefined : undefined
                    }
                    defaultCalendarMonth={value.startDate ?? undefined}
                    disabled={value.startDate === null || editDisabled}
                    value={value.endDate}
                    onChange={(value) => {
                      setValue((data) => ({ ...data, endDate: value }))
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    InputAdornmentProps={{
                      position: 'start',
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButtonAdornment
                          icon={ClearIcon}
                          hidden={value.endDate === null || editDisabled}
                          onClick={() =>
                            setValue((data) => ({ ...data, endDate: null }))
                          }
                        />
                      ),
                    }}
                  />
                </Stack>
              </>
            ) : (
              <>
                <Typography variant="h5">
                  {`${leaveTypeToString[value.type]} (${
                    leaveStateToString[value.state]
                  })`}
                </Typography>
                <Typography>
                  {value.startDate?.format('DD.MM.YYYY') +
                    ' - ' +
                    value.endDate?.format('DD.MM.YYYY')}
                </Typography>
              </>
            )}
            {userId === 'me' || !value.id ? (
              <Box>
                <Typography>
                  Nachweis hochladen: {value.hasAttachment && '(vorhanden)'}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ placeItems: 'center' }}
                >
                  <IconButton
                    color={value.hasAttachment ? 'primary' : 'default'}
                    aria-label="Nachweis hochladen"
                    component="label"
                    disabled={initialState !== LeaveState.PENDING}
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
            ) : (
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  color="primary"
                  disabled={!value.hasAttachment}
                  onClick={getAttachment}
                >
                  Nachweis
                </Button>
              </Box>
            )}

            {hasRole(UserRole.ADMIN) && !editDisabled && (
              <>
                <FormControl disabled={editDisabled}>
                  <RadioGroup
                    row
                    value={value.state}
                    onChange={(event) =>
                      setValue((form) => ({
                        ...form,
                        state: event.target.value as LeaveState,
                      }))
                    }
                  >
                    <FormControlLabel
                      value={LeaveState.ACCEPTED}
                      label="Bestätigt"
                      control={<Radio />}
                    />
                    <FormControlLabel
                      value={LeaveState.DECLINED}
                      label="Abgelehnt"
                      control={<Radio />}
                    />
                  </RadioGroup>
                </FormControl>
              </>
            )}

            {userId !== 'me' && initialState === LeaveState.ACCEPTED && (
              <LeaveDialogSubstitute
                startDate={value.startDate?.format('YYYY-MM-DD') ?? ''}
                endDate={value.endDate?.format('YYYY-MM-DD') ?? ''}
                teacher={parseInt(userId)}
              />
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        {value.id && (
          <Button variant="contained" color="error" onClick={handleDelete}>
            {deleteConfirmation ? 'Bestätigen' : 'Löschen'}
          </Button>
        )}
        {initialState === LeaveState.PENDING ? (
          <>
            <Button onClick={close}>Abbrechen</Button>
            <LoadingButton
              variant="contained"
              onClick={handleSubmit}
              loading={loading}
              disabled={!formValid || loading}
            >
              {value.id ? 'Speichern' : 'Hinzufügen'}
            </LoadingButton>
          </>
        ) : (
          <Button variant="text" onClick={close}>
            Schließen
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default LeaveDialog
