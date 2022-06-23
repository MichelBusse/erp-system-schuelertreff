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
import PasswordChecklist from 'react-password-checklist'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../components/AuthProvider'

const Reset: React.FC = () => {
  const [dialog, setDialog] = useState<'' | 'error' | 'success'>('')
  const [password, setPassword] = useState({ pw1: '', pw2: '' })

  //const [containsUL, setContainsUL] = useState(false) // uppercase letter
  //const [containsSC, setContainsSC] = useState(false) // special character
  const [containsN, setContainsN] = useState(false) // number
  const [contains8C, setContains8C] = useState(false) // min 8 characters
  const [passwordMatch, setPasswordMatch] = useState(false) // passwords matches

  const navigate = useNavigate()
  const { API, handleLogout } = useAuth()
  const { token } = useParams()

  const handleSubmit = async () => {
    if (passwordMatch && password.pw2 !== '') {
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

  //check password requirements:
  const validatePassword = () => {
    // has uppercase letter
    //if (password.pw1.toLowerCase() != password.pw1) setContainsUL(true)
    //else setContainsUL(false)
    // has special character
    //if (/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(password.pw1))
    //  setContainsSC(true)
    //else setContainsSC(false)

    // has number
    if (/\d/.test(password.pw1)) setContainsN(true)
    else setContainsN(false)
    // has 8 characters
    if (password.pw1.length >= 8) setContains8C(true)
    else setContains8C(false)
    // passwords match
    if (password.pw1 !== '' && password.pw1 === password.pw2)
      setPasswordMatch(true)
    else setPasswordMatch(false)
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
          onKeyUp={validatePassword}
        />
        <TextField
          label="Passwort wiederholen"
          type="password"
          autoComplete="new-password"
          size="small"
          style={{ width: 200 }}
          error={!passwordMatch}
          onChange={(e) =>
            setPassword((password) => ({ ...password, pw2: e.target.value }))
          }
          onKeyUp={validatePassword}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
        />
        <PasswordChecklist
          rules={['minLength', 'number', 'match']}
          minLength={8}
          value={password.pw1}
          valueAgain={password.pw2}
          messages={{
            minLength: 'Mindestens 8 Zeichen.',
            number: 'Enthält eine Ziffer',
            match: 'Passwörter stimmen überein.',
          }}
        />
        <Button
          variant="outlined"
          size="medium"
          disabled={!(containsN && contains8C && passwordMatch)}
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
