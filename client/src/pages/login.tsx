import { Button, Grid, TextField } from '@mui/material'
import axios from 'axios'
import { useState } from 'react'

import { useAuth } from '../components/AuthProvider'

const Login: React.FC = () => {
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleLogin } = useAuth()

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
          label="E-Mail"
          variant="outlined"
          autoComplete="username"
          size="small"
          style={{ width: 200 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error !== ''}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          size="small"
          style={{ width: 200 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
