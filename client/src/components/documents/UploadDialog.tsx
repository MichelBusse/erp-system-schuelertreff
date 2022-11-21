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

import { UserDocumentsType } from './UserDocuments'

export type UploadDialogForm = {
  fileName: string
  visibleToUser: boolean
  visibleToEverybody: boolean
  protected: boolean
}

type Props = {
  open: boolean
  close: () => void
  loading: boolean
  onSubmit: (form: UploadDialogForm) => void
  file: File
  minimalView?: boolean
  userDocumentsType?: UserDocumentsType
}

const UploadDialog: React.FC<Props> = ({
  open,
  close,
  loading,
  onSubmit,
  file,
  minimalView = false,
  userDocumentsType,
}) => {
  const [form, setForm] = useState<UploadDialogForm>({
    fileName: file.name,
    visibleToUser: true,
    visibleToEverybody: userDocumentsType === UserDocumentsType.PUBLIC,
    protected: userDocumentsType === UserDocumentsType.PUBLIC,
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
                label="Für Nutzer sichtbar"
                disabled={form.visibleToEverybody}
                control={
                  <Checkbox
                    checked={form.visibleToUser}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        visibleToUser: e.target.checked,
                      }))
                    }
                  />
                }
              />
              <FormControlLabel
                label="Für alle Nutzer sichtbar"
                control={
                  <Checkbox
                    checked={form.visibleToEverybody}
                    disabled={userDocumentsType !== undefined}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        visibleToUser: true,
                        visibleToEverybody: e.target.checked,
                      }))
                    }
                  />
                }
              />
              <FormControlLabel
                label="Schreibgeschützt"
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
