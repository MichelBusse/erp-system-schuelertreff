import {
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Edit,
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
import axios from 'axios'
import * as B64ArrayBuffer from 'base64-arraybuffer'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../../auth/components/AuthProvider'
import UploadDialog, { UploadDialogForm } from '../UploadDialog'
import { formatDate } from '../../../../../core/utils/DateUtils'
import DocumentEditDialog from '../DocumentEditDialog'
import UserDocument from '../../../../../core/types/UserDocument'
import UserRole from '../../../../../core/enums/UserRole'
import { SNACKBAR_OPTIONS, SNACKBAR_OPTIONS_ERROR } from '../../../../../core/res/Constants'

export enum UserDocumentsType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

type Props = {
  refresh?: number
  userId?: number
  actions?: React.ReactNode
  userDocumentsType?: UserDocumentsType
}

const UserDocuments: React.FC<Props> = ({
  userId,
  actions,
  refresh: outsideRefresh,
  userDocumentsType,
}) => {
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [refresh, setRefresh] = useState(0)
  const [file, setFile] = useState<File>(new File([], ''))
  const [editDialogDocument, setEditDialogDocument] = useState<
    UserDocument | undefined
  >(undefined)
  const [open, setOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { API, hasRole, decodeToken } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    API.get('documents', { params: { by: userId, type: userDocumentsType } })
      .then((res) => setDocuments(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS)
      })
  }, [refresh, outsideRefresh])

  const openDialog = (file: File) => {
    setFile(file)
    setOpen(true)
  }

  const editDoc = (doc: UserDocument) => {
    setEditDialogDocument(doc)
    setEditDialogOpen(true)
  }

  const saveDoc = async (form: UploadDialogForm) => {
    if (!editDialogDocument) return

    API.post(`documents/` + editDialogDocument.id, {
      fileName: form.fileName,
      visibleToUser: form.visibleToUser,
      visibleToEverybody: form.visibleToEverybody,
      mayDelete: !form.protected,
    })
      .then(() => {
        enqueueSnackbar('Dokument gespeichert.', SNACKBAR_OPTIONS)
        setEditDialogDocument(undefined)
        setEditDialogOpen(false)
        setRefresh((r) => ++r)
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          enqueueSnackbar(
            (error.response.data as { message: string }).message,
            SNACKBAR_OPTIONS_ERROR,
          )
        } else {
          console.error(error)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
        }
      })
  }

  const uploadDoc = async (form: UploadDialogForm) => {
    setLoading(true)

    const buf = await file.arrayBuffer()

    API.post(`documents`, {
      fileName: form.fileName,
      fileType: file.type,
      owner: userId,
      visibleToUser: form.visibleToUser,
      visibleToEverybody: form.visibleToEverybody,
      mayDelete: !form.protected,
      content: B64ArrayBuffer.encode(buf),
    })
      .then(() => {
        enqueueSnackbar('Erfolgreich gespeichert', SNACKBAR_OPTIONS)
        setOpen(false)
        setRefresh((r) => r + 1)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
      })
      .finally(() => setLoading(false))
  }

  const downloadDoc = (doc: UserDocument) => {
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
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
      })
  }

  const deleteDoc = (id: number) => {
    API.delete(`documents/` + id)
      .then(() => {
        enqueueSnackbar('Erfolgreich gelöscht', SNACKBAR_OPTIONS)
        setRefresh((r) => r + 1)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
        setRefresh((r) => r + 1)
      })
  }

  const ListItemDoc: React.FC<{ doc: UserDocument }> = ({ doc }) => {
    const [confirm, setConfirm] = useState(false)

    const editDisabled = !(
      hasRole(UserRole.ADMIN) ||
      ((userId === undefined || userId === decodeToken().sub) && doc.mayDelete)
    )

    return (
      <ListItem
        secondaryAction={
          !confirm ? (
            <>
              <IconButton onClick={() => downloadDoc(doc)}>
                <DownloadIcon />
              </IconButton>
              <IconButton disabled={editDisabled} onClick={() => editDoc(doc)}>
                <Edit />
              </IconButton>
              <IconButton
                disabled={editDisabled}
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
                disabled={editDisabled}
                color="error"
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
            {(hasRole(UserRole.ADMIN) || !userId) && (
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
            )}
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
        userDocumentsType={userDocumentsType}
        open={open}
        close={() => setOpen(false)}
        loading={loading}
        onSubmit={uploadDoc}
        file={file}
        minimalView={!hasRole(UserRole.ADMIN)}
      />
      <DocumentEditDialog
        open={editDialogOpen}
        close={() => {
          setEditDialogOpen(false)
          setEditDialogDocument(undefined)
        }}
        onSubmit={saveDoc}
        document={editDialogDocument}
      />
    </>
  )
}

export default UserDocuments
