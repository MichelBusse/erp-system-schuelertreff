import { Button, TextField, Grid } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleLogin } = useAuth()

  const changeEmail: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.target.value)
  }
  const changePassword: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value)
  }

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ height: '90vh' }}
      >
        <TextField
          id="outlined-basic"
          label="E-Mail"
          variant="outlined"
          size="small"
          style={{ margin: '5px' }}
          value={email}
          onChange={changeEmail}
        />
        <TextField
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
          size="small"
          style={{ margin: '5px' }}
          value={password}
          onChange={changePassword}
        />
        <Button
          variant="outlined"
          size="medium"
          style={{ margin: '5px' }}
          onClick={() => handleLogin(email, password)}
        >
          Login
        </Button>
      </Grid>
    </>
  )
}

export default Login
