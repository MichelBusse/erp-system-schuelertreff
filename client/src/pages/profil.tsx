import { Button, styled, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import { form } from '../types/form'
import subject from '../types/subject'
import timeAvailable from '../types/timeAvailable'
import styles from './gridList.module.scss'

const Item = styled(Paper)(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
}))

const Profil: React.FC = () => {
  const { API } = useAuth()
  const [teacherId, setTeacherId] = useState<number>(0)
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
    timesAvailable: [],
  })

  useEffect(() => {
    API.get('users/me').then((res) => {
      setTeacherId(res.data.id)
      setData((data) => ({
        ...data,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        salutation: res.data.salutation,
        city: res.data.city,
        postalCode: res.data.postalCode,
        street: res.data.street,
        email: res.data.email,
        phone: res.data.phone,
        timesAvailable: res.data.timesAvailableParsed.map(
          (timeAvailableParsed: timeAvailable) => ({
            ...timeAvailableParsed,
            id: nanoid(),
          }),
        ),
      }))
    })
  }, [])

  const submitForm = () => {
    const url = 'users/' + teacherId
    API.post(url, {
      ...data,
      timesAvailable: data.timesAvailable.map((time) => ({
        dow: time.dow,
        start: time.start,
        end: time.end,
      })),
    })
  }

  return (
    <div className={styles.wrapper}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2} rowSpacing="0px">
          <Grid item xs={12}>
            <h3>Person:</h3>
          </Grid>

          <Grid item xs={2}>
            <Item>
              <TextField
                fullWidth={true}
                label="Anrede"
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
                  readOnly: true,
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={3}>
            <Item>
              <TextField
                fullWidth={true}
                label="Vorname"
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
                  readOnly: true,
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={3}>
            <Item>
              <TextField
                fullWidth={true}
                label="Nachname"
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
                  readOnly: true,
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
                label="Straße"
                fullWidth={true}
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
                  readOnly: false,
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={2.2}>
            <Item>
              <TextField
                label="Postleitzahl"
                fullWidth={true}
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
                  readOnly: false,
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={3}>
            <Item>
              <TextField
                label="Stadt"
                fullWidth={true}
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
                  readOnly: false,
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={12}>
            <h3>Kontakt:</h3>
          </Grid>

          <Grid item xs={4}>
            <Item>
              <TextField
                fullWidth={true}
                label="Email"
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
                  readOnly: true,
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={3}>
            <Item>
              <TextField
                fullWidth={true}
                label="Telefonnummer"
                sx={{ marginLeft: '10px' }}
                size="small"
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    phone: event.target.value,
                  }))
                }
                value={data.phone}
              />
            </Item>
          </Grid>

          <Grid item xs={8}>
            <h3>Zeiten:</h3>
          </Grid>

          <Grid item xs={6}>
            <Paper sx={{ padding: '10px' }}>
              <AddTimes data={data} setData={setData} />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={8}>
          <Button onClick={submitForm} sx={{ margin: '15px' }}>
            Speichern
          </Button>
        </Grid>
      </Box>
    </div>
  )
}

export default Profil
