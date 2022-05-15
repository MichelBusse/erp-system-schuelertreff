import { useState } from 'react'
import axios from 'axios'
import { Button, TextField, Grid } from '@mui/material'
import { useAuth } from '../components/AuthProvider'

const Login: React.FC = () => {
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleLogin } = useAuth()

  const changeEmail: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.target.value)
  }
  const changePassword: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value)
  }

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
        <TextField
          id="outlined-basic"
          label="E-Mail"
          variant="outlined"
          size="small"
          style={{ width: 200 }}
          value={email}
          onChange={changeEmail}
          error={error !== ''}
        />
        <TextField
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
          size="small"
          style={{ width: 200 }}
          value={password}
          onChange={changePassword}
          error={error !== ''}
          helperText={error}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
        />
        <Button
          variant="outlined"
          size="medium"
          style={{ margin: '5px' }}
          onClick={handleSubmit}
        >
          Login
        </Button>
      </Grid>
    </>
  )
}

export default Login
