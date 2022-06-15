import { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import styles from './gridList.module.scss'

import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { Checkbox, FormControl, InputLabel, MenuItem, Select, styled, TextField } from '@mui/material'
import subject from '../types/subject'
import AddTimes from '../components/AddTimes'
import { form } from '../types/form'
import timeAvailable from '../types/timeAvailable'

const Item = styled(Paper)(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
}))

const Profil: React.FC = () => {
  const { API } = useAuth()
  const [disabled, setDisabled] = useState({
    lastName: true,
    firstName: true,
    salutation: true,
    street: true,
    city: true,
    postalCode: true,
    email: true,
    phone: true,
  })
  const [data, setData] = useState<form>({
    firstName: '',
    lastName: '',
    salutation: '',
    city: '',
    postalCode: '',
    street: '',
    email: '',
    phone: '',
    subjects: [] as subject[],
    fee: 0,
    timesAvailable: []
  })

  useEffect(() => {
    API.get('users/me').then((res) => {
      
      setData(data => ({
        ...data, timesAvailable: Object.values(res.data.timesAvailable)
      }))
    })
  }, [])

  return (
    <div className={styles.wrapper}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}
        rowSpacing = '0px'>

          <Grid item xs={12}>
            <h3>Person:</h3>
          </Grid>

          <Grid item xs = {2}>
            <Item>
              <TextField
                fullWidth = {true}
                label = "Anrede"
                sx={{ marginLeft: '10px' }}
                size="small"
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    salutation: event.target.value,
                  }))
                }
                value={data.salutation}
                InputProps={{
                  readOnly: disabled.salutation,
                }}
              />
            </Item>
          </Grid>
          
          <Grid item xs = {3}>
            <Item>
              <TextField
                fullWidth = {true}
                label = "Vorname"
                sx={{ marginLeft: '10px' }}
                size="small"
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    firstName: event.target.value,
                  }))
                }
                value={data.firstName}
                InputProps={{
                  readOnly: disabled.firstName,
                }}
              />
            </Item>
          </Grid>
          
          <Grid item xs = {3}>
            <Item>
              <TextField
                fullWidth = {true}
                label = "Nachname"
                sx={{ marginLeft: '10px' }}
                size="small"
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    lastName: event.target.value,
                  }))
                }
                value={data.lastName}
                InputProps={{
                  readOnly: disabled.lastName,
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={12}>
            <h3>Adresse:</h3>
          </Grid>

          <Grid item xs={4}>
            <Item>
              <TextField
                label = "Straße"
                fullWidth = {true}
                sx={{ marginLeft: '10px' }}
                size="small"
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    street: event.target.value,
                  }))
                }
                value={data.street}
                InputProps={{
                  readOnly: disabled.street,
                }}
              />
              <Checkbox
                onChange={(event) => {
                  setDisabled((disabled) => ({ ...disabled, street: !event.target.checked }))
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={2.2}>
            <Item>
              <TextField
                label = "Postleitzahl"
                fullWidth = {true}
                sx={{ marginLeft: '10px' }}
                size="small"
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    postalCode: event.target.value,
                  }))
                }
                value={data.postalCode}
                InputProps={{
                  readOnly: disabled.postalCode,
                }}
              />
              <Checkbox
                onChange={(event) => {
                  setDisabled((disabled) => ({ ...disabled, postalCode: !event.target.checked }))
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={3}>
            <Item>
              <TextField
                label = "Stadt"
                fullWidth = {true}
                sx={{ marginLeft: '10px' }}
                size="small"
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    city: event.target.value,
                  }))
                }
                value={data.city}
                InputProps={{
                  readOnly: disabled.city,
                }}
              />
              <Checkbox
                onChange={(event) => {
                  setDisabled((disabled) => ({ ...disabled, city: !event.target.checked }))
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={12}>
            <h3>Kontakt:</h3>
          </Grid>

          <Grid item xs = {4}>
            <Item>
              <TextField
                fullWidth = {true}
                label = "Email"
                sx={{ marginLeft: '10px' }}
                size="small"
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    email: event.target.value,
                  }))
                }
                value={data.email}
                InputProps={{
                  readOnly: disabled.email,
                }}
              />
              <Checkbox
                onChange={(event) => {
                  setDisabled((disabled) => ({ ...disabled, email: !event.target.checked }))
                }}
              />
            </Item>
          </Grid>
          
          <Grid item xs = {3}>
            <Item>
              <TextField
                fullWidth = {true}
                label = "Telefonnummer"
                sx={{ marginLeft: '10px' }}
                size="small"
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    phone: event.target.value,
                  }))
                }
                value={data.phone}
                InputProps={{
                  readOnly: disabled.phone,
                }}
              />
              <Checkbox
                onChange={(event) => {
                  setDisabled((disabled) => ({ ...disabled, phone: !event.target.checked }))
                }}
              />
            </Item>
          </Grid>
          
          <Grid item xs={12}>
            <h3>Zeiten:</h3>
          </Grid>

          <Grid item xs = {8}>
            <Paper sx={{padding: '10px'}}>
              <AddTimes
                data={data}
                setData={setData}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default Profil
