//Imports:
import { Grid, Paper, styled } from '@mui/material';
import {
  DataGrid,
  GridColumns,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridRowSpacingParams,
  getGridStringOperators
} from '@mui/x-data-grid'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './teacher.scss'

//Typedefinition for subjects and teachers
type subject={
  id: number,
  name: string,
  color: string,
  shortForm: string
}
type teacher = {
  "role": string,
  "id": number,
  "lastName": string,
  "firstName": string,
  "salutation": string,
  "street": string,
  "city": string,
  "postalCode": string,
  "email": string,
  "phone": string,
  "jwtValidAfter": string,
  "fee": number,
  "state": string,
  "subjects": subject[]
}

//Styles of the Girditem for the subjects behind the teachers
const Item = styled(Paper)(({ theme }) => ({
  padding: '6px',
  textAlign: 'center',
  borderRadius: '25px',
  paddingLeft: '25px',
  paddingRight: '25px',
  color: 'black',
}));

//customize filter
const filterOperators = getGridStringOperators().filter(
  (operator) => operator.value === 'contains',
);

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
        {params.value.map((subject: subject)=> 
          <Grid item key={subject.id}>
            <Item sx={{backgroundColor: subject.color + 50}}>{subject.name}</Item>
          </Grid>)}
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
  padding: '0px',
  paddingLeft: '30px',
  '& .MuiDataGrid-filterFormOperatorInput': {
    display: 'none',
  },
}));

//customized Toolbar
function CustomToolbar() {
  return (
    <div style={{width: '100%' }}>
    <CustomGridToolbarContainer>
      <GridToolbarFilterButton />
    </CustomGridToolbarContainer>
    </div>
  );
}


//Teacher site it self
const Teachers: React.FC = () => {
  //Get Teachers from DB
  const [teachers, setTeachers] = useState<teacher[]>([])
  useEffect(()=>{
    axios.get(`http://localhost:8080/users/teacher`)
      .then(res => {
        setTeachers(res.data)
      })
  }, [])
  //creating rows out of the teachers
  const rows = teachers.map((teacher: teacher) => {
     return({
      id: teacher.id,
      TeacherName: teacher.firstName + ' ' + teacher.lastName,
      SubjectName: teacher.subjects
    })
  })
  console.log(teachers)
  //space between rows
  const getRowSpacing = React.useCallback((params: GridRowSpacingParams) => ({
    top: params.isFirstVisible ? 16 : 8,
    bottom: params.isLastVisible ? 8 : 8,
  }), [])
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
    </div>
  )
}

export default Teachers
