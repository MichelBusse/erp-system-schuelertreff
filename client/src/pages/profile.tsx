import { Button, Stack, styled, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import { form } from '../types/form'
import subject from '../types/subject'
import styles from './gridList.module.scss'

dayjs.extend(customParseFormat)

const Item = styled(Paper)(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
}))

type timesAvailableParsed = {
  start: string
  end: string
  dow: number
}

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
          (time: timesAvailableParsed) => ({
            dow: time.dow,
            start: dayjs(time.start, 'HH:mm'),
            end: dayjs(time.start, 'HH:mm'),
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
        start: time.start?.format('HH:mm'),
        end: time.end?.format('HH:mm'),
      })),
    })
  }

  return (
    <div className={styles.wrapper}>
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          padding: '30px',
          boxSizing: 'border-box',
          borderRadius: '25px',
        }}
      >
        <Stack direction="column" alignItems={"flex-start"}>
          <h3>Person:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              fullWidth={true}
              label="Anrede"
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
            <TextField
              fullWidth={true}
              label="Vorname"
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
            <TextField
              fullWidth={true}
              label="Nachname"
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
          </Stack>
          <h3>Adresse:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              label="Straße"
              fullWidth={true}
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
            <TextField
              label="Postleitzahl"
              fullWidth={true}
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
            <TextField
              label="Stadt"
              fullWidth={true}
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
          </Stack>
          <h3>Kontakt:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              fullWidth={true}
              label="Email"
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

            <TextField
              fullWidth={true}
              label="Telefonnummer"
              size="small"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  phone: event.target.value,
                }))
              }
              value={data.phone}
            />
          </Stack>
          <Stack>
            <h3>Zeiten:</h3>
            <Box sx={{ maxWidth: '600px' }}>
              <AddTimes data={data} setData={setData} />
            </Box>
          </Stack>
          <Button onClick={submitForm} variant="outlined" sx={{marginTop: "10px"}}>
            Speichern
          </Button>
        </Stack>
      </Box>
    </div>
  )
}

export default Profil
