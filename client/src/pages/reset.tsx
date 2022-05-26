import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../components/AuthProvider'

const Reset: React.FC = () => {
  const [dialog, setDialog] = useState<'' | 'error' | 'success'>('')
  const [password, setPassword] = useState({ pw1: '', pw2: '' })

  const navigate = useNavigate()
  const { API, handleLogout } = useAuth()
  const { token } = useParams()

  const pwEqual = password.pw1 === password.pw2
  const errorNotEquals = !pwEqual && password.pw2 !== ''

  const handleSubmit = async () => {
    if (pwEqual && password.pw2 !== '') {
      API.post('/auth/reset', { token: token, password: password.pw1 })
        .then(() => {
          handleLogout()
          setDialog('success')
        })
        .catch((err) => {
          console.error(err)
          setDialog('error')
        })
    }
  }

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ height: '90vh' }}
        rowGap={1}
        component={'form'}
      >
        <Typography variant="h5" gutterBottom>
          Passwort zurücksetzen
        </Typography>
        <TextField
          label="Neues Passwort"
          type="password"
          autoComplete="new-password"
          size="small"
          style={{ width: 200 }}
          onChange={(e) =>
            setPassword((password) => ({ ...password, pw1: e.target.value }))
          }
        />
        <TextField
          label="Passwort wiederholen"
          type="password"
          autoComplete="new-password"
          size="small"
          style={{ width: 200 }}
          error={errorNotEquals}
          helperText={errorNotEquals ? 'Eingabe stimmt nicht überein' : ' '}
          onChange={(e) =>
            setPassword((password) => ({ ...password, pw2: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
        />
        <Button
          variant="outlined"
          size="medium"
          disabled={!pwEqual || password.pw2 === ''}
          onClick={handleSubmit}
        >
          Zurücksetzen
        </Button>
      </Grid>

      <Dialog
        open={dialog !== ''}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialog === 'success'
            ? 'Passwort geändert'
            : 'Ein Fehler ist aufgetreten'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialog === 'success'
              ? 'Weiter zum Login'
              : 'Möglicherweise ist der Link abgelaufen.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/', { replace: true })}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Reset
