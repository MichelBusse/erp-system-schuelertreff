import { LoadingButton } from '@mui/lab'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'

export type UploadDialogForm = {
  fileName: string
  hidden: boolean
  protected: boolean
}

type Props = {
  open: boolean
  close: () => void
  loading: boolean
  onSubmit: (form: UploadDialogForm) => void
  file: File
  minimalView?: boolean
}

const UploadDialog: React.FC<Props> = ({
  open,
  close,
  loading,
  onSubmit,
  file,
  minimalView = false,
}) => {
  const [form, setForm] = useState<UploadDialogForm>({
    fileName: file.name,
    hidden: false,
    protected: false,
  })

  const validForm = !!form.fileName

  return (
    <Dialog open={open}>
      <DialogTitle>Dokument hochladen</DialogTitle>
      <DialogContent>
        <Stack spacing={1} marginTop={1}>
          <TextField
            required
            label="Dateiname"
            variant="outlined"
            value={form.fileName}
            onChange={(e) => {
              setForm((f) => ({
                ...f,
                fileName: e.target.value,
              }))
            }}
          />
          {!minimalView && (
            <FormGroup>
              <FormControlLabel
                label="Versteckt"
                control={
                  <Checkbox
                    checked={form.hidden}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        hidden: e.target.checked,
                        protected: e.target.checked,
                      }))
                    }
                  />
                }
              />
              <FormControlLabel
                label="Schreibgeschützt"
                disabled={form.hidden}
                control={
                  <Checkbox
                    checked={form.protected}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        protected: e.target.checked,
                      }))
                    }
                  />
                }
              />
            </FormGroup>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Abbrechen</Button>
        <LoadingButton
          variant="contained"
          onClick={() => onSubmit(form)}
          loading={loading}
          disabled={!validForm}
        >
          Hinzufügen
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default UploadDialog
