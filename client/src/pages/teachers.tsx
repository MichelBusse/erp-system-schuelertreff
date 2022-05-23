//Imports:
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
  styled,
  TextField,
} from '@mui/material'
import {
  DataGrid,
  GridColumns,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridRowSpacingParams,
  getGridStringOperators,
} from '@mui/x-data-grid'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import './teacher.scss'
import AddCircleIcon from '@mui/icons-material/AddCircle'

//Typedefinition for subjects and teachers
type subject = {
  id: number
  name: string
  color: string
  shortForm: string
}
type FieldData = {
  firstName: string,
  lastName: string,
  salutation: string,
  city: string,
  postalCode: string,
  street: string,
  email: string,
  phone: string,
  subjects: subject[],
  fee: number,
}
type teacher = {
  role: string
  id: number
  lastName: string
  firstName: string
  salutation: string
  street: string
  city: string
  postalCode: string
  email: string
  phone: string
  jwtValidAfter: string
  fee: number
  state: string
  subjects: subject[]
}

//Styles of the Girditem for the subjects behind the teachers
const Item = styled(Paper)(({ theme }) => ({
  padding: '6px',
  textAlign: 'center',
  borderRadius: '25px',
  paddingLeft: '25px',
  paddingRight: '25px',
  color: 'black',
}))

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
              <Item sx={{ backgroundColor: subject.color + 50 }}>
                {subject.name}
              </Item>
            </Grid>
          ))}
        </Grid>
      </strong>
    ),
  },
]

//styles of the Toolbar (containse the e.g. filter)
const CustomGridToolbarContainer = styled(GridToolbarContainer)(() => ({
  borderRadius: '50px',
  height: '52px',
  backgroundColor: 'white',
  padding: '0px 30px',
  display: 'flex',
  justifyContent: 'space-between',
  '& .MuiDataGrid-filterFormOperatorInput': {
    display: 'none',
  },
}))

//customized Toolbar
function CustomToolbar(setOpen: Function) {
  return (
    <div style={{ width: '100%' }}>
      <CustomGridToolbarContainer>
        <GridToolbarFilterButton />
      </CustomGridToolbarContainer>
    </div>
  )
}

//Teacher site it self
const Teachers: React.FC = () => {
  //Get subjects from DB
  const [subjects, setSubjects] = useState<subject[]>([])
  useEffect(()=>{
    axios.get(`http://localhost:8080/subjects`)
      .then(res => {
        const DBsubjects = res.data
        setSubjects(DBsubjects)
      })
  }, [])

  //field Data:
  const [Data, setData] = useState<FieldData>({
    firstName: '',
    lastName: '',
    salutation: '',
    city: '',
    postalCode: '',
    street: '',
    email: '',
    phone: '',
    subjects: [],
    fee: 0,
  })

  //Get Teachers from DB
  const [teachers, setTeachers] = useState<teacher[]>([])
  useEffect(() => {
    axios.get(`http://localhost:8080/users/teacher`).then((res) => {
      setTeachers(res.data)
    })
  }, [])
  //creating rows out of the teachers
  const rows = teachers.map((teacher: teacher) => {
    return {
      id: teacher.id,
      TeacherName: teacher.firstName + ' ' + teacher.lastName,
      SubjectName: teacher.subjects,
    }
  })
  console.log(teachers)
  //open and close dialog
  const [open, setOpen] = React.useState(false)
  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  //space between rows
  const getRowSpacing = React.useCallback(
    (params: GridRowSpacingParams) => ({
      top: params.isFirstVisible ? 16 : 8,
      bottom: params.isLastVisible ? 8 : 8,
    }),
    [],
  )

  //TODO: validate filled s
  //submit function:
  const submit = () => {
    console.log()
    axios.post(`http://localhost:8080/users/teacher`, Data)
      .then(res => {
        setTeachers(s => [...s, res.data])
        console.log(res)
      })
    setOpen(false);
  }

  //content of the site
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          headerHeight={0}
          disableSelectionOnClick={true}
          components={{ Toolbar: CustomToolbar }}
          hideFooter={true}
          rows={rows}
          columns={cols}
          getRowSpacing={getRowSpacing}
        />
      </div>
      <div>
        <IconButton onClick={handleClickOpen}>
          <AddCircleIcon fontSize="large" color="primary" />
        </IconButton>
      </div>
      <Dialog open={open}>
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
              onChange={(event) =>
                setData((data) => ({ ...data, salutation: event.target.value as string }))
              }
              value={Data.salutation}>
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
            onChange={(event) =>
              setData((data) => ({ ...data, firstName: event.target.value }))
            }
            value={Data.firstName}
          />
          <TextField
            id="lastName"
            label="Nachname"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', width: '45%' }}
            onChange={(event) =>
              setData((data) => ({ ...data, lastName: event.target.value }))
            }
            value={Data.lastName}
          />
          <TextField
            id="city"
            label="Stadt"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '60%' }}
            onChange={(event) =>
              setData((data) => ({ ...data, city: event.target.value }))
            }
            value={Data.city}
          />
          <TextField
            id="postalCode"
            label="Postleitzahl"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', width: '30%' }}
            onChange={(event) =>
              setData((data) => ({ ...data, postalCode: event.target.value }))
            }
            value={Data.postalCode}
          />
           <TextField
            id="street"
            label="Straße"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '94%' }}
            onChange={(event) =>
              setData((data) => ({ ...data, street: event.target.value }))
            }
            value={Data.street}
          />
          <TextField
            id="email"
            label="E-Mail Adresse"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '60%' }}
            onChange={(event) =>
              setData((data) => ({ ...data, email: event.target.value }))
            }
            value={Data.email}
          />
          <TextField
            id="phone"
            label="Telefonnummer"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', width: '30%' }}
            onChange={(event) =>
              setData((data) => ({ ...data, phone: event.target.value }))
            }
            value={Data.phone}
          />
          <Autocomplete
            multiple
            id="subjects"
            options={subjects}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField {...params} variant="standard" label="Fächer *" />
            )}
            onChange={(event, value) =>
              setData((data) => ({ ...data, subjects: value }))
            }
            value={Data.subjects}
          />
          <TextField
            type="number"
            id="fee"
            label="Lohn"
            variant="outlined"
            sx={{ marginTop: '20px', width: '15%' }}
            onChange={(event) =>
              setData((data) => ({ ...data, fee: event.target.value as unknown as number }))
            }
            value={Data.fee}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Abbrechen</Button>
          <Button onClick={submit}>Hinzufügen</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Teachers
