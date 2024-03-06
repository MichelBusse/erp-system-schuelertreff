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
import UserDocumentType from '../../../../../core/enums/UserDocumentType'
import UserDocumentFormState from '../../../../../core/types/Form/UserDocumentFormState'

type Props = {
  open: boolean
  close: () => void
  loading: boolean
  onSubmit: (form: UserDocumentFormState) => void
  file: File
  minimalView?: boolean
  userDocumentsType?: UserDocumentType
}

export default function UserDocumentUploadDialog({
  open,
  close,
  loading,
  onSubmit,
  file,
  minimalView = false,
  userDocumentsType,
}: Props) {
  const [form, setForm] = useState<UserDocumentFormState>({
    fileName: file.name,
    visibleToUser: true,
    visibleToEverybody: userDocumentsType === UserDocumentType.PUBLIC,
    protected: userDocumentsType === UserDocumentType.PUBLIC,
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
