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

import document from '../../types/document'
import { Role } from '../../types/user'
import { useAuth } from '../AuthProvider'
import { UploadDialogForm } from './UploadDialog'

type Props = {
  open: boolean
  close: () => void
  onSubmit: (form: UploadDialogForm) => void
  document?: document
}

const DocumentEditDialog: React.FC<Props> = ({
  open,
  close,
  onSubmit,
  document,
}) => {
  if (!document) return <></>

  const [form, setForm] = useState<UploadDialogForm>({
    fileName: document.fileName,
    visibleToUser: document.visibleToUser,
    visibleToEverybody: document.visibleToEverybody,
    protected: !document.mayDelete,
  })

  const {hasRole} = useAuth()

  const validForm = !!form.fileName

  return (
    <Dialog open={open}>
      <DialogTitle>Dokument bearbeiten</DialogTitle>
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
                  disabled={!hasRole(Role.ADMIN)}
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Abbrechen</Button>
        <LoadingButton
          variant="contained"
          onClick={() => onSubmit(form)}
          disabled={!validForm}
        >
          Speichern
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default DocumentEditDialog
