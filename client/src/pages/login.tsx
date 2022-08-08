import { Button, Grid, TextField } from '@mui/material'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import { useAuth } from '../components/AuthProvider'
import { snackbarOptionsError } from '../consts'

const Login: React.FC = () => {
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [emailErrorText, setEmailErrorText] = useState('')
  const [password, setPassword] = useState('')
  const { API, handleLogin } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async () => {
    try {
      await handleLogin(email, password)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Ungültige Zugangsdaten')
      } else {
        console.error(error)
        setError('Ein Fehler ist aufgetreten, bitte erneut versuchen')
      }
    }
  }

  const resetPassword = () => {
    if (email === '') {
      setEmailErrorText('Bitte E-Mail angeben')
      return
    }
    API.post('auth/reset/mail', { mail: email })
      .then(() => {
        enqueueSnackbar('Der Passwort-Reset wurde an die E-Mail gesendet')
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
      })
  }

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ height: '100vh' }}
        rowGap={1}
        component={'form'}
      >
        <TextField
          label="E-Mail"
          variant="outlined"
          autoComplete="username"
          size="small"
          value={email}
          style={{ width: '300px', maxWidth: '100%' }}
          onChange={(e) => setEmail(e.target.value)}
          error={error !== '' || emailErrorText !== ''}
          helperText={emailErrorText}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error !== ''}
          helperText={error}
          style={{ width: '300px', maxWidth: '100%' }}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
        />
        <Button
          variant="contained"
          style={{ width: '300px', maxWidth: '100%' }}
          onClick={handleSubmit}
          fullWidth
        >
          Login
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={() => resetPassword()}
          style={{ width: '300px', maxWidth: '100%' }}
        >
          Passwort zurücksetzen
        </Button>
      </Grid>
    </>
  )
}

export default Login
