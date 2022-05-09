import { Grid, Paper, styled } from '@mui/material';
import {
  DataGrid,
  GridColumns,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridRowSpacingParams,
} from '@mui/x-data-grid'
import React from 'react';
import './teacher.scss'


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1.3),
  textAlign: 'center',
  borderRadius: '25px',
  paddingLeft: '25px',
  paddingRight: '25px',
  color: theme.palette.text.secondary,
}));


const cols: GridColumns = [
  {
    field: 'TeacherName',
    headerClassName: 'DataGridHead',
    headerName: 'Teacher',
    width: 200,
  },
  {
    field: 'SubjectName',
    headerClassName: 'DataGridHead',
    headerName: 'Subject',
    width: 500,
    renderCell: (params) => (
      <strong>
      <Grid container spacing={3}>
        {params.value.map((subject: string)=> 
          <Grid item>
            <Item>{subject}</Item>
          </Grid>)}
        {console.log(params.value)}
        </Grid>
      </strong>
    ),
  },
]

const rows = [
  {id: 1, TeacherName: 'Dr. Fugi der Magie', SubjectName: ['Mathe', 'Englisch']},
  {id: 2, TeacherName: 'Michel Boss', SubjectName: ['Deutsch', 'Spanisch', 'Info']},
  {id: 3, TeacherName: 'Shishos Cönos', SubjectName: ['Ethik']},
  {id: 4, TeacherName: 'Dr. Fugi der Magie', SubjectName: ['Mathe', 'Englisch']},
  {id: 5, TeacherName: 'Michel Boss', SubjectName: ['Deutsch', 'Spanisch', 'Info']},
  {id: 6, TeacherName: 'Shishos Cönos', SubjectName: ['Ethik']},
  {id: 7, TeacherName: 'Dr. Fugi der Magie', SubjectName: ['Mathe', 'Englisch']},
  {id: 8, TeacherName: 'Michel Boss', SubjectName: ['Deutsch', 'Spanisch', 'Info']},
  {id: 9, TeacherName: 'Shishos Cönos', SubjectName: ['Ethik']},
  {id: 10, TeacherName: 'Dr. Fugi der Magie', SubjectName: ['Mathe', 'Englisch']},
  {id: 11, TeacherName: 'Michel Boss', SubjectName: ['Deutsch', 'Spanisch', 'Info']},
  {id: 12, TeacherName: 'Shishos Cönos', SubjectName: ['Ethik']}
]

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
}

const Teachers: React.FC = () => {
  const getRowSpacing = React.useCallback((params: GridRowSpacingParams) => ({
    top: params.isFirstVisible ? 16 : 8,
    bottom: params.isLastVisible ? 8 : 8,
  }), [])

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
