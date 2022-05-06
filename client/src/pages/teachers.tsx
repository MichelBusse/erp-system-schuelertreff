import { DataGrid, GridColumns, GridToolbarContainer, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid'

import React from 'react';
import './teacher.scss'

const cols: GridColumns = [{field: 'TeacherName', headerClassName:'DataGridHead', headerName: 'Teacher', width: 200},
                            {field: 'SubjectName', headerClassName:'DataGridHead', headerName: 'Subject', width: 500}]

const rows = [{id: 1, TeacherName: 'Dr. Fugi der Magie', SubjectName: ['Mathe', 'Englisch']},
              {id: 2, TeacherName: 'Michel Boss', SubjectName: ['Deutsch', 'Spanisch', 'Info']},
              {id: 3, TeacherName: 'Shishos Cönos', SubjectName: 'Ethik'},
              {id: 4, TeacherName: 'Dr. Fugi der Magie', SubjectName: ['Mathe', 'Englisch']},
              {id: 5, TeacherName: 'Michel Boss', SubjectName: ['Deutsch', 'Spanisch', 'Info']},
              {id: 6, TeacherName: 'Shishos Cönos', SubjectName: 'Ethik'},
              {id: 7, TeacherName: 'Dr. Fugi der Magie', SubjectName: ['Mathe', 'Englisch']},
              {id: 8, TeacherName: 'Michel Boss', SubjectName: ['Deutsch', 'Spanisch', 'Info']},
              {id: 9, TeacherName: 'Shishos Cönos', SubjectName: 'Ethik'},
              {id: 10, TeacherName: 'Dr. Fugi der Magie', SubjectName: ['Mathe', 'Englisch']},
              {id: 11, TeacherName: 'Michel Boss', SubjectName: ['Deutsch', 'Spanisch', 'Info']},
              {id: 12, TeacherName: 'Shishos Cönos', SubjectName: 'Ethik'}
]

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
}

const getRowSpacing = React.useCallback((params) => {
  return {
    top: params.isFirstVisible ? 0 : 5,
    bottom: params.isLastVisible ? 0 : 5,
  };
}, []);

const Teachers: React.FC = () => {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid 
      disableSelectionOnClick={true}
      components={{ Toolbar: CustomToolbar }}
      hideFooter = {true}
      rows={rows} columns={cols}
      // getRowSpacing={getRowSpacing}
      />
    </div>
  );
}

export default Teachers
