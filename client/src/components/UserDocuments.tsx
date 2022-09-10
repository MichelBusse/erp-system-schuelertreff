import {
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
} from '@mui/material'
import * as B64ArrayBuffer from 'base64-arraybuffer'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import { snackbarOptions, snackbarOptionsError } from '../consts'
import documentType from '../types/document'
import { formatDate } from '../utils/date'
import { useAuth } from './AuthProvider'
import UploadDialog, { UploadDialogForm } from './UploadDialog'

type Props = {
  refresh?: number
  userId?: number
  actions?: React.ReactNode
}

const UserDocuments: React.FC<Props> = ({
  userId,
  actions,
  refresh: outsideRefresh,
}) => {
  const [documents, setDocuments] = useState<documentType[]>([])
  const [refresh, setRefresh] = useState(0)
  const [file, setFile] = useState<File>(new File([], ''))
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    API.get('documents', { params: { by: userId } })
      .then((res) => setDocuments(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }, [refresh, outsideRefresh])

  const openDialog = (file: File) => {
    setFile(file)
    setOpen(true)
  }

  const uploadDoc = async (form: UploadDialogForm) => {
    setLoading(true)

    const buf = await file.arrayBuffer()

    API.post(`documents`, {
      fileName: form.fileName,
      fileType: file.type,
      owner: userId,
      mayRead: !form.hidden,
      mayDelete: !form.protected,
      content: B64ArrayBuffer.encode(buf),
    })
      .then(() => {
        enqueueSnackbar('Erfolgreich gespeichert', snackbarOptions)
        setOpen(false)
        setRefresh((r) => r + 1)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
      .finally(() => setLoading(false))
  }

  const downloadDoc = (doc: documentType) => {
    API.get(`documents/${doc.id}/file`, {
      responseType: 'blob',
      timeout: 30000,
    })
      .then((res) => {
        const url = URL.createObjectURL(res.data)

        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', doc.fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }

  const deleteDoc = (id: number) => {
    API.delete(`documents/` + id)
      .then(() => {
        enqueueSnackbar('Erfolgreich gelöscht', snackbarOptions)
        setRefresh((r) => r + 1)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
        setRefresh((r) => r + 1)
      })
  }

  const ListItemDoc: React.FC<{ doc: documentType }> = ({ doc }) => {
    const [confirm, setConfirm] = useState(false)

    return (
      <ListItem
        secondaryAction={
          !confirm ? (
            <>
              <IconButton onClick={() => downloadDoc(doc)}>
                <DownloadIcon />
              </IconButton>
              <IconButton
                disabled={!userId && !doc.mayDelete}
                onClick={() => setConfirm(true)}
              >
                <DeleteIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton onClick={() => setConfirm(false)}>
                <CloseIcon />
              </IconButton>
              <IconButton
                color="error"
                disabled={!userId && !doc.mayDelete}
                onClick={() => deleteDoc(doc.id)}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )
        }
      >
        <ListItemText
          primary={doc.fileName}
          secondary={formatDate(doc.createdDate)}
        />
      </ListItem>
    )
  }

  return (
    <>
      <List
        dense={true}
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          margin: '5px 0',
        }}
      >
        <ListItem>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ width: '100%' }}>
            <Button variant="text" component="label" endIcon={<AddIcon />}>
              <input
                hidden
                accept="*"
                type="file"
                onChange={(e) => {
                  if (e.target.files) openDialog(e.target.files[0])
                }}
              />
              {'Hinzufügen'}
            </Button>
            {actions}
          </Stack>
        </ListItem>
        {documents.length === 0 && (
          <ListItem>
            <ListItemText primary="Keine Dokumente vorhanden" />
          </ListItem>
        )}
        {documents.map((doc) => (
          <ListItemDoc key={doc.id} doc={doc} />
        ))}
      </List>
      <UploadDialog
        key={file.name}
        open={open}
        close={() => setOpen(false)}
        loading={loading}
        onSubmit={uploadDoc}
        file={file}
        minimalView={typeof userId === 'undefined'}
      />
    </>
  )
}

export default UserDocuments
