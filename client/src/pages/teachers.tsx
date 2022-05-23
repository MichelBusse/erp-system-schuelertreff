import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material'
import {
  DataGrid,
  getGridStringOperators,
  GridColumns,
  GridRowSpacingParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'

import subject from '../types/subject'
import teacher from '../types/teacher'
import styles from './teachers.module.scss'

//customize filter
const filterOperators = getGridStringOperators().filter(
  (operator) => operator.value === 'contains',
)

//definition of the columns
const cols: GridColumns = [
  {
    field: 'TeacherName',
    headerClassName: 'DataGridHead',
    headerName: 'Teacher',
    width: 200,
    filterOperators: filterOperators,
  },
  {
    field: 'SubjectName',
    headerClassName: 'DataGridHead',
    headerName: 'Subject',
    width: 650,
    renderCell: (params) => (
      <strong>
        <Grid container spacing={3}>
          {params.value.map((subject: subject) => (
            <Grid item key={subject.id}>
              <Paper
                sx={{
                  backgroundColor: subject.color + 50,
                  padding: '6px 25px',
                  textAlign: 'center',
                  borderRadius: '25px',
                  color: 'black',
                }}
              >
                {subject.name}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </strong>
    ),
  },
]

const defaultFormData = {
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
}

const Teachers: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subjects, setSubjects] = useState<subject[]>([])
  const [teachers, setTeachers] = useState<teacher[]>([])
  const [data, setData] = useState(defaultFormData)

  //Get subjects, teachers from DB
  useEffect(() => {
    axios
      .get(`http://localhost:8080/subjects`)
      .then((res) => setSubjects(res.data))
    axios
      .get(`http://localhost:8080/users/teacher`)
      .then((res) => setTeachers(res.data))
  }, [])

  //creating rows out of the teachers
  const rows = teachers.map((teacher) => ({
    id: teacher.id,
    TeacherName: teacher.firstName + ' ' + teacher.lastName,
    SubjectName: teacher.subjects,
  }))

  //space between rows
  const getRowSpacing = useCallback(
    (params: GridRowSpacingParams) => ({
      top: params.isFirstVisible ? 16 : 8,
      bottom: params.isLastVisible ? 8 : 8,
    }),
    [],
  )

  const openDialog = () => {
    setData(defaultFormData)
    setDialogOpen(true)
  }

  //TODO: validate filled fields
  const submitForm = () => {
    axios.post(`http://localhost:8080/users/teacher`, data).then((res) => {
      setTeachers((s) => [...s, res.data])
      setDialogOpen(false)
    })
  }

  return (
    <div className={styles.wrapper}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          headerHeight={0}
          disableSelectionOnClick={true}
          components={{
            Toolbar: () => (
              <div style={{ width: '100%' }}>
                <GridToolbarContainer
                  className={styles.customGridToolbarContainer}
                >
                  <GridToolbarFilterButton />
                </GridToolbarContainer>
              </div>
            ),
          }}
          hideFooter={true}
          rows={rows}
          columns={cols}
          getRowSpacing={getRowSpacing}
        />
      </div>
      <div>
        <IconButton onClick={openDialog}>
          <AddCircleIcon fontSize="large" color="primary" />
        </IconButton>
      </div>
      <Dialog open={dialogOpen}>
        <DialogTitle>Fach hinzufügen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Geben Sie die Daten der Lehrkraft ein. Pflichtfelder sind mit *
            markiert.
          </DialogContentText>
          <FormControl
            fullWidth
            sx={{ width: '25%', marginRight: '75%', marginTop: '15px' }}
          >
            <InputLabel id="SalutationLable">Anrede *</InputLabel>
            <Select
              id="Salutation"
              label="Anrede"
              value={data.salutation}
              onChange={(event) =>
                setData((data) => ({ ...data, salutation: event.target.value }))
              }
            >
              <MenuItem value="Herr">Herr</MenuItem>
              <MenuItem value="Frau">Frau</MenuItem>
            </Select>
          </FormControl>
          <TextField
            id="firstName"
            label="Vorname"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '45%' }}
            value={data.firstName}
            onChange={(event) =>
              setData((data) => ({ ...data, firstName: event.target.value }))
            }
          />
          <TextField
            id="lastName"
            label="Nachname"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', width: '45%' }}
            value={data.lastName}
            onChange={(event) =>
              setData((data) => ({ ...data, lastName: event.target.value }))
            }
          />
          <TextField
            id="city"
            label="Stadt"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '60%' }}
            value={data.city}
            onChange={(event) =>
              setData((data) => ({ ...data, city: event.target.value }))
            }
          />
          <TextField
            id="postalCode"
            label="Postleitzahl"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', width: '30%' }}
            value={data.postalCode}
            onChange={(event) =>
              setData((data) => ({ ...data, postalCode: event.target.value }))
            }
          />
          <TextField
            id="street"
            label="Straße"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '94%' }}
            value={data.street}
            onChange={(event) =>
              setData((data) => ({ ...data, street: event.target.value }))
            }
          />
          <TextField
            id="email"
            label="E-Mail Adresse"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '60%' }}
            value={data.email}
            onChange={(event) =>
              setData((data) => ({ ...data, email: event.target.value }))
            }
          />
          <TextField
            id="phone"
            label="Telefonnummer"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', width: '30%' }}
            value={data.phone}
            onChange={(event) =>
              setData((data) => ({ ...data, phone: event.target.value }))
            }
          />
          <Autocomplete
            multiple
            id="subjects"
            options={subjects}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField {...params} variant="standard" label="Fächer *" />
            )}
            value={data.subjects}
            onChange={(_, value) =>
              setData((data) => ({ ...data, subjects: value }))
            }
          />
          <TextField
            type="number"
            id="fee"
            label="Lohn"
            variant="outlined"
            sx={{ marginTop: '20px', width: '15%' }}
            value={data.fee}
            onChange={(event) =>
              setData((data) => ({ ...data, fee: Number(event.target.value) }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={submitForm}>Hinzufügen</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Teachers
