import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { nanoid } from 'nanoid'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import { formValidation } from '../components/FormValidation'
import { defaultClassCustomerFormData, defaultSchoolCustomerFormData } from '../consts'
import styles from '../pages/gridList.module.scss'
import { classCustomerForm, schoolCustomerForm } from '../types/form'
import { schoolCustomer, timesAvailableParsed } from '../types/user'

const SchoolCustomerDetailView: React.FC = () => {
  const { API } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const requestedId = id ? id : 'me'

  const [classCustomers, setClassCustomers] = useState<classCustomerForm[]>([])
  const [schoolCustomer, setSchoolCustomer] = useState<schoolCustomerForm>(defaultSchoolCustomerFormData)
  const [errors, setErrors] = useState(defaultClassCustomerFormData)

  useEffect(() => {
    API.get('users/schoolCustomer/' + requestedId).then((res) => {
      console.log(res.data)
      setSchoolCustomer((data) => ({
        ...data,
        schoolName: res.data.schoolName,
        city: res.data.city,
        postalCode: res.data.postalCode,
        street: res.data.street,
        email: res.data.email,
        phone: res.data.phone,
        schoolTypes: res.data.schoolTypes,
      }
      ))
      
    })
  }, [])

  useEffect(() => {
    API.get('users/classCustomer/' + requestedId).then((res) => {

      res.data.map((classCustomer: any) => {
        const newTimesAvailable =
        classCustomer.timesAvailableParsed.length === 1 &&
        classCustomer.timesAvailableParsed[0].dow === 1 &&
        classCustomer.timesAvailableParsed[0].start === '00:00' &&
        classCustomer.timesAvailableParsed[0].end === '00:00'
          ? []
          : classCustomer.timesAvailableParsed.map((time: timesAvailableParsed) => ({
              dow: time.dow,
              start: dayjs(time.start, 'HH:mm'),
              end: dayjs(time.end, 'HH:mm'),
              id: nanoid(),
            }))

        setClassCustomers((data: classCustomerForm[]) => [
          ...data,
          {
            className: classCustomer.className,
            numberOfStudents: classCustomer.numberOfStudents,
            grade: classCustomer.grade,
            timesAvailable: newTimesAvailable,
          },
        ])
      })
    })
  }, [])

  // const submitForm = () => {
  //   setErrors(formValidation('privateCustomer', data))

  //   if (formValidation('privateCustomer', data).validation) {
  //     API.post('users/privateCustomer/' + requestedId, {
  //       ...data,
  //       timesAvailable: data.timesAvailable.map((time) => ({
  //         dow: time.dow,
  //         start: time.start?.format('HH:mm'),
  //         end: time.end?.format('HH:mm'),
  //       })),
  //     }).then(() => {
  //       enqueueSnackbar(data.firstName + ' ' + data.lastName + ' gespeichert')
  //       if (id) navigate('/privateCustomers')
  //     })
  //   }
  // }

  // const deleteUser = () => {
  //   console.log('deletePrivateCustomer')
  // }

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
        <Stack direction="column" alignItems={'stretch'}>
          <h1>{schoolCustomer.schoolName} ({schoolCustomer.schoolTypes.map((Type) => Type+' ' )})</h1>
          <h3>Adresse:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              label="Straße"
              fullWidth={true}
              value={schoolCustomer.street}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Postleitzahl"
              fullWidth={true}
              value={schoolCustomer.postalCode}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Stadt"
              fullWidth={true}
              value={schoolCustomer.city}
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
              value={schoolCustomer.email}
            />

            <TextField
              fullWidth={true}
              label="Telefonnummer"
              value={schoolCustomer.phone}
            />
          </Stack>
          <h3>Klassen:</h3>
          {classCustomers.map((classCustomer) => (
            <Accordion key={classCustomer.className}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>{classCustomer.className}</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Box>
                <AddTimes data={classCustomer} setData={setClassCustomers} />
              </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Box>
    </div>
  )
}

export default SchoolCustomerDetailView
