import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAuth } from '../components/AuthProvider'

const CancelRegistration: React.FC = () => {
  const [dialog, setDialog] = useState<'' | 'error' | 'success'>('')

  const { API, handleLogout } = useAuth()
  const { token } = useParams()

  const handleSubmit = async () => {
    API.post('/auth/cancelRegistration', { token: token })
      .then(() => {
        handleLogout()
        setDialog('success')
      })
      .catch((err) => {
        console.error(err)
        setDialog('error')
      })
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
          Registrierung abbrechen
        </Typography>
        <Typography gutterBottom>
          Das Konto und sämtliche zugehörigen Daten werden entfernt.
        </Typography>
        <Button variant="outlined" size="medium" onClick={handleSubmit}>
          Bestätigen
        </Button>
      </Grid>

      <Dialog
        open={dialog !== ''}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialog === 'success'
            ? 'Konto erfolgreich gelöscht'
            : 'Ein Fehler ist aufgetreten'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialog === 'success'
              ? 'Du kannst diese Seite nun schließen.'
              : 'Möglicherweise ist der Link abgelaufen.'}
          </DialogContentText>
        </DialogContent>
        {dialog === 'error' && (
          <DialogActions>
            <Button onClick={() => setDialog('')}>OK</Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  )
}

export default CancelRegistration
